import { Injectable, BadRequestException } from '@nestjs/common';
import { ContractType, StakeholderRole } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CsvImportResponseDto,
  CsvExportResponseDto,
  CsvPreviewResponseDto,
} from './dto';
import {
  FIELD_DEFS,
  FieldKey,
  ColumnMapping,
  guessMapping,
  parseContractType,
  parsePrice,
  parseDate,
  parseContacts,
} from './csv-fields';

interface ParsedPropertyRow {
  contractType: ContractType;
  complexName: string;
  buildingName: string;
  unitNo: string;
  typeInfo: string | null;
  depositPrice: bigint;
  monthlyRent: bigint;
  contractDate: Date | null;
  expirationDate: Date | null;
  ownerContacts: string[];
  tenantContacts: string[];
  note: string | null;
}

interface ParseError {
  row: number;
  error: string;
}

@Injectable()
export class CsvService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 파일을 파싱만 해서 헤더 + 자동추측 매핑 + 샘플 몇 행을 돌려준다.
   * 클라이언트 컬럼매핑 화면에서 사용. DB에는 쓰지 않는다.
   */
  preview(file: Express.Multer.File): CsvPreviewResponseDto {
    const rawData = this.readFile(file);
    if (rawData.length === 0) {
      throw new BadRequestException('파일에 데이터가 없습니다.');
    }

    const headers = Object.keys(rawData[0]);

    return {
      headers,
      fields: FIELD_DEFS.map((d) => ({
        key: d.key,
        label: d.label,
        required: d.required,
      })),
      mapping: guessMapping(headers),
      sampleRows: rawData.slice(0, 3).map((r) => this.stringifyRow(r)),
      totalRows: rawData.length,
    };
  }

  async importFile(
    userId: string,
    file: Express.Multer.File,
    columnMappingJson?: string,
  ): Promise<CsvImportResponseDto> {
    const fileName = file.originalname;
    const rawData = this.readFile(file);

    if (rawData.length === 0) {
      throw new BadRequestException('파일에 데이터가 없습니다.');
    }

    const headers = Object.keys(rawData[0]);
    const mapping = this.resolveMapping(columnMappingJson, headers);
    this.validateRequiredMapped(mapping);

    const { parsed, errors } = this.parseRows(rawData, mapping);

    let successCount = 0;
    const failedErrors: ParseError[] = [...errors];

    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      try {
        await this.createPropertyWithContract(userId, row);
        successCount++;
      } catch (error) {
        failedErrors.push({
          row: row.originalRow ?? i + 2,
          error: error instanceof Error ? error.message : 'DB 저장 실패',
        });
      }
    }

    await this.prisma.csvImportLog.create({
      data: {
        userId,
        fileName,
        totalRows: rawData.length,
        successCount,
        failedCount: failedErrors.length,
      },
    });

    return {
      success: failedErrors.length === 0,
      fileName,
      totalRows: rawData.length,
      successCount,
      failedCount: failedErrors.length,
      errors: failedErrors.length > 0 ? failedErrors : undefined,
    };
  }

  async exportFile(userId: string): Promise<CsvExportResponseDto> {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      include: {
        contracts: {
          include: {
            stakeholders: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = properties.map((property) => {
      const contract = property.contracts[0];
      const owners = contract?.stakeholders
        .filter((s) => s.role === 'OWNER')
        .map((s) => s.phone)
        .join(', ');
      const tenants = contract?.stakeholders
        .filter((s) => s.role === 'TENANT')
        .map((s) => s.phone)
        .join(', ');

      return {
        매물: this.contractTypeToKorean(contract?.contractType),
        아파트명: property.complexName,
        동: property.buildingName,
        호수: property.unitNo,
        타입: property.typeInfo || '',
        '매매가(보증금)': contract?.depositPrice?.toString() || '',
        월세: contract?.monthlyRent?.toString() || '',
        '계약일 (예상)': contract?.contractDate
          ? this.formatDate(contract.contractDate)
          : '',
        '만기일 (예상)': contract?.expirationDate
          ? this.formatDate(contract.expirationDate)
          : '',
        '주인 연락처': owners || '',
        '세입자 연락처': tenants || '',
        '특이사항, 비고': property.note || contract?.memo || '',
      };
    });

    const csv = Papa.unparse(rows, {
      quotes: true,
      header: true,
    });

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const exportFileName = `properties_export_${today}.csv`;

    // U+FEFF BOM so Excel detects UTF-8 (Korean). Escape, not a literal
    // invisible char — editors/linters can silently strip the latter.
    const base64Data = Buffer.from('\uFEFF' + csv, 'utf-8').toString('base64');

    return {
      data: `data:text/csv;charset=utf-8;base64,${base64Data}`,
      fileName: exportFileName,
      totalRows: rows.length,
    };
  }

  private readFile(file: Express.Multer.File): Record<string, unknown>[] {
    const extension = file.originalname.split('.').pop()?.toLowerCase();

    if (extension === 'xls' || extension === 'xlsx') {
      return this.parseExcel(file.buffer);
    }
    if (extension === 'csv') {
      return this.parseCsv(file.buffer);
    }
    throw new BadRequestException(
      '지원하지 않는 파일 형식입니다. (xls, xlsx, csv만 지원)',
    );
  }

  private parseExcel(buffer: Buffer): Record<string, unknown>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    const allData: Record<string, unknown>[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        {
          defval: '',
          raw: false,
        },
      );
      allData.push(...jsonData);
    }

    return allData;
  }

  private parseCsv(buffer: Buffer): Record<string, unknown>[] {
    const csvString = buffer.toString('utf-8');
    const result = Papa.parse<Record<string, unknown>>(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      throw new BadRequestException(
        `CSV 파싱 오류: ${result.errors[0].message}`,
      );
    }

    return result.data;
  }

  /** 컬럼값을 문자열로 정규화 (샘플 미리보기용) */
  private stringifyRow(row: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] =
        value === undefined || value === null ? '' : String(value).trim();
    }
    return out;
  }

  /**
   * 클라이언트가 보낸 매핑 JSON을 파싱·검증한다.
   * 없으면 헤더로 자동추측한다(구버전 클라이언트 호환).
   */
  private resolveMapping(
    columnMappingJson: string | undefined,
    headers: string[],
  ): ColumnMapping {
    if (!columnMappingJson) return guessMapping(headers);

    let parsed: unknown;
    try {
      parsed = JSON.parse(columnMappingJson);
    } catch {
      throw new BadRequestException('컬럼 매핑 형식이 올바르지 않습니다.');
    }

    if (typeof parsed !== 'object' || parsed === null) {
      throw new BadRequestException('컬럼 매핑 형식이 올바르지 않습니다.');
    }

    const source = parsed as Record<string, unknown>;
    const mapping: ColumnMapping = {};
    for (const def of FIELD_DEFS) {
      const value = source[def.key];
      if (typeof value === 'string' && value.trim()) {
        mapping[def.key] = value;
      }
    }
    return mapping;
  }

  private validateRequiredMapped(mapping: ColumnMapping): void {
    const missing = FIELD_DEFS.filter((d) => d.required && !mapping[d.key]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `필수 항목의 컬럼을 지정해 주세요: ${missing
          .map((d) => d.label)
          .join(', ')}`,
      );
    }
  }

  private parseRows(
    rawData: Record<string, unknown>[],
    mapping: ColumnMapping,
  ): {
    parsed: (ParsedPropertyRow & { originalRow: number })[];
    errors: ParseError[];
  } {
    const parsed: (ParsedPropertyRow & { originalRow: number })[] = [];
    const errors: ParseError[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const rowNumber = i + 2;
      try {
        const parsedRow = this.parseRow(rawData[i], mapping);
        parsed.push({ ...parsedRow, originalRow: rowNumber });
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : '파싱 오류',
        });
      }
    }

    return { parsed, errors };
  }

  private parseRow(
    row: Record<string, unknown>,
    mapping: ColumnMapping,
  ): ParsedPropertyRow {
    const get = (key: FieldKey): string => this.mappedValue(row, mapping, key);

    const complexName = get('complexName');
    if (!complexName) throw new Error('아파트명은 필수 입력 항목입니다.');

    const buildingName = get('buildingName');
    if (!buildingName) throw new Error('동은 필수 입력 항목입니다.');

    const unitNo = get('unitNo');
    if (!unitNo) throw new Error('호수는 필수 입력 항목입니다.');

    const monthlyRentRaw = get('monthlyRent');

    return {
      contractType: parseContractType(get('contractType')),
      complexName,
      buildingName,
      unitNo,
      typeInfo: get('typeInfo') || null,
      depositPrice: parsePrice(get('depositPrice')),
      monthlyRent: monthlyRentRaw ? parsePrice(monthlyRentRaw) : 0n,
      contractDate: parseDate(get('contractDate')),
      expirationDate: parseDate(get('expirationDate')),
      ownerContacts: parseContacts(get('ownerContact')),
      tenantContacts: parseContacts(get('tenantContact')),
      note: get('note') || null,
    };
  }

  /** 매핑된 컬럼에서 값을 꺼내 문자열로 */
  private mappedValue(
    row: Record<string, unknown>,
    mapping: ColumnMapping,
    key: FieldKey,
  ): string {
    const column = mapping[key];
    if (!column) return '';
    const value = row[column];
    if (value === undefined || value === null || value === '') return '';
    return String(value).trim();
  }

  private async createPropertyWithContract(
    userId: string,
    data: ParsedPropertyRow,
  ): Promise<void> {
    const stakeholders: { role: StakeholderRole; phone: string }[] = [];

    for (const phone of data.ownerContacts) {
      stakeholders.push({ role: StakeholderRole.OWNER, phone });
    }

    for (const phone of data.tenantContacts) {
      stakeholders.push({ role: StakeholderRole.TENANT, phone });
    }

    if (stakeholders.length === 0) {
      stakeholders.push({ role: StakeholderRole.OWNER, phone: '미입력' });
    }

    await this.prisma.property.create({
      data: {
        userId,
        complexName: data.complexName,
        buildingName: data.buildingName,
        unitNo: data.unitNo,
        typeInfo: data.typeInfo,
        note: data.note,
        contracts: {
          create: {
            contractType: data.contractType,
            depositPrice: data.depositPrice,
            monthlyRent: data.monthlyRent,
            contractDate: data.contractDate,
            expirationDate: data.expirationDate,
            status: 'ACTIVE',
            stakeholders: {
              create: stakeholders,
            },
          },
        },
      },
    });
  }

  private contractTypeToKorean(type?: ContractType): string {
    if (!type) return '';
    const map: Record<ContractType, string> = {
      JEONSE: '전세',
      WOLSE: '월세',
      MAEMAE: '매매',
    };
    return map[type] || '';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

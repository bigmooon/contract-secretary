import { Injectable, BadRequestException } from '@nestjs/common';
import { ContractType, StakeholderRole } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { PrismaService } from '../../prisma/prisma.service';
import { CsvImportResponseDto, CsvExportResponseDto } from './dto';

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

  async importFile(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CsvImportResponseDto> {
    const fileName = file.originalname;
    const extension = fileName.split('.').pop()?.toLowerCase();

    let rawData: Record<string, unknown>[];

    if (extension === 'xls' || extension === 'xlsx') {
      rawData = this.parseExcel(file.buffer);
    } else if (extension === 'csv') {
      rawData = this.parseCsv(file.buffer);
    } else {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다. (xls, xlsx, csv만 지원)',
      );
    }

    if (rawData.length === 0) {
      throw new BadRequestException('파일에 데이터가 없습니다.');
    }

    const { parsed, errors } = this.parseRows(rawData);

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

    const base64Data = Buffer.from('\uFEFF' + csv, 'utf-8').toString('base64');

    return {
      data: `data:text/csv;charset=utf-8;base64,${base64Data}`,
      fileName: exportFileName,
      totalRows: rows.length,
    };
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

  private parseRows(rawData: Record<string, unknown>[]): {
    parsed: (ParsedPropertyRow & { originalRow: number })[];
    errors: ParseError[];
  } {
    const parsed: (ParsedPropertyRow & { originalRow: number })[] = [];
    const errors: ParseError[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 2;

      try {
        const parsedRow = this.parseRow(row);
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

  private parseRow(row: Record<string, unknown>): ParsedPropertyRow {
    const contractTypeRaw = this.getField(row, [
      '매물',
      '계약유형',
      '유형',
      'type',
    ]);
    const contractType = this.parseContractType(contractTypeRaw);

    const complexName = this.getField(row, [
      '아파트명',
      '단지명',
      '건물명',
      'complexName',
    ]);
    if (!complexName) {
      throw new Error('아파트명은 필수 입력 항목입니다.');
    }

    const buildingName = this.getField(row, ['동', 'building', 'buildingName']);
    if (!buildingName) {
      throw new Error('동은 필수 입력 항목입니다.');
    }

    const unitNo = this.getField(row, ['호수', '호', 'unit', 'unitNo']);
    if (!unitNo) {
      throw new Error('호수는 필수 입력 항목입니다.');
    }

    const typeInfo =
      this.getField(row, ['타입', '평수', '평형', 'typeInfo']) || null;

    const depositRaw = this.getField(row, [
      '매매가(보증금)',
      '보증금',
      '매매가',
      'deposit',
      'depositPrice',
    ]);
    const depositPrice = this.parsePrice(depositRaw);

    const monthlyRentRaw = this.getField(row, ['월세', 'monthlyRent', 'rent']);
    const monthlyRent = monthlyRentRaw ? this.parsePrice(monthlyRentRaw) : 0n;

    const contractDateRaw = this.getField(row, [
      '계약일 (예상)',
      '계약일',
      'contractDate',
    ]);
    const contractDate = this.parseDate(contractDateRaw);

    const expirationDateRaw = this.getField(row, [
      '만기일 (예상)',
      '만기일',
      'expirationDate',
    ]);
    const expirationDate = this.parseDate(expirationDateRaw);

    const ownerContactRaw = this.getField(row, [
      '주인 연락처',
      '주인연락처',
      '임대인',
      'ownerContact',
    ]);
    const ownerContacts = this.parseContacts(ownerContactRaw);

    const tenantContactRaw = this.getField(row, [
      '세입자 연락처',
      '세입자연락처',
      '임차인',
      'tenantContact',
    ]);
    const tenantContacts = this.parseContacts(tenantContactRaw);

    const note =
      this.getField(row, ['특이사항, 비고', '특이사항', '비고', 'note']) ||
      null;

    return {
      contractType,
      complexName,
      buildingName,
      unitNo,
      typeInfo,
      depositPrice,
      monthlyRent,
      contractDate,
      expirationDate,
      ownerContacts,
      tenantContacts,
      note,
    };
  }

  private getField(
    row: Record<string, unknown>,
    possibleKeys: string[],
  ): string {
    for (const key of possibleKeys) {
      const value = row[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value).trim();
      }
    }
    return '';
  }

  private parseContractType(value: string): ContractType {
    const normalized = value.toLowerCase().trim();

    if (normalized.includes('전세') || normalized === 'jeonse') {
      return ContractType.JEONSE;
    }
    if (normalized.includes('월세') || normalized === 'wolse') {
      return ContractType.WOLSE;
    }
    if (normalized.includes('매매') || normalized === 'maemae') {
      return ContractType.MAEMAE;
    }

    return ContractType.JEONSE;
  }

  private parsePrice(value: string): bigint {
    if (!value) return 0n;

    const cleanValue = value.replace(/[^0-9.]/g, '');
    if (!cleanValue) return 0n;

    const num = parseFloat(cleanValue);
    if (isNaN(num)) return 0n;

    return BigInt(Math.round(num));
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;

    const datePatterns = [
      /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/,
      /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/,
      /^(\d{4})(\d{2})(\d{2})$/,
    ];

    for (const pattern of datePatterns) {
      const match = value.match(pattern);
      if (match) {
        let year: number, month: number, day: number;

        if (pattern === datePatterns[1]) {
          month = parseInt(match[1], 10);
          day = parseInt(match[2], 10);
          year = parseInt(match[3], 10);
        } else {
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10);
          day = parseInt(match[3], 10);
        }

        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  private parseContacts(value: string): string[] {
    if (!value) return [];

    return value
      .split(/[,;/\n]/)
      .map((contact) => contact.replace(/[^0-9-]/g, '').trim())
      .filter((contact) => contact.length >= 8);
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

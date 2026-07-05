import { ContractType } from '@prisma/client';

/**
 * 우리가 저장하는 필드 ← 사용자 엑셀 컬럼 매핑의 단일 출처(single source of truth).
 * - aliases: 자동추측(guess)에 쓰는 흔한 컬럼 이름들
 * - required: 매핑이 반드시 있어야 하는 필드
 */
export type FieldKey =
  | 'contractType'
  | 'complexName'
  | 'buildingName'
  | 'unitNo'
  | 'typeInfo'
  | 'depositPrice'
  | 'monthlyRent'
  | 'contractDate'
  | 'expirationDate'
  | 'ownerContact'
  | 'tenantContact'
  | 'note';

/** 필드 → 사용자 파일의 실제 컬럼명 */
export type ColumnMapping = Partial<Record<FieldKey, string>>;

export interface FieldDef {
  key: FieldKey;
  label: string;
  aliases: string[];
  required: boolean;
}

export const FIELD_DEFS: FieldDef[] = [
  {
    key: 'contractType',
    label: '매물(계약유형)',
    aliases: ['매물', '계약유형', '유형', 'type'],
    required: false,
  },
  {
    key: 'complexName',
    label: '아파트명',
    aliases: ['아파트명', '단지명', '건물명', 'complexName'],
    required: true,
  },
  {
    key: 'buildingName',
    label: '동',
    aliases: ['동', 'building', 'buildingName'],
    required: true,
  },
  {
    key: 'unitNo',
    label: '호수',
    aliases: ['호수', '호', 'unit', 'unitNo'],
    required: true,
  },
  {
    key: 'typeInfo',
    label: '타입',
    aliases: ['타입', '평수', '평형', 'typeInfo'],
    required: false,
  },
  {
    key: 'depositPrice',
    label: '매매가(보증금)',
    aliases: ['매매가(보증금)', '보증금', '매매가', 'deposit', 'depositPrice'],
    required: false,
  },
  {
    key: 'monthlyRent',
    label: '월세',
    aliases: ['월세', 'monthlyRent', 'rent'],
    required: false,
  },
  {
    key: 'contractDate',
    label: '계약일',
    aliases: ['계약일 (예상)', '계약일', 'contractDate'],
    required: false,
  },
  {
    key: 'expirationDate',
    label: '만기일',
    aliases: ['만기일 (예상)', '만기일', 'expirationDate'],
    required: false,
  },
  {
    key: 'ownerContact',
    label: '주인 연락처',
    aliases: ['주인 연락처', '주인연락처', '임대인', 'ownerContact'],
    required: false,
  },
  {
    key: 'tenantContact',
    label: '세입자 연락처',
    aliases: ['세입자 연락처', '세입자연락처', '임차인', 'tenantContact'],
    required: false,
  },
  {
    key: 'note',
    label: '특이사항/비고',
    aliases: ['특이사항, 비고', '특이사항', '비고', 'note'],
    required: false,
  },
];

const normalize = (s: string): string => s.trim().toLowerCase();

/**
 * 파일 헤더에서 각 필드의 컬럼을 자동추측한다.
 * 별칭과 대소문자·공백 무시하고 정확히 일치하는 첫 헤더를 고른다.
 */
export function guessMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const normHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));

  for (const def of FIELD_DEFS) {
    const aliasNorms = def.aliases.map(normalize);
    const hit = normHeaders.find((h) => aliasNorms.includes(h.norm));
    if (hit) mapping[def.key] = hit.raw;
  }

  return mapping;
}

/** 계약유형 문자열 → enum (기본값 전세) */
export function parseContractType(value: string): ContractType {
  const n = value.toLowerCase().trim();
  if (n.includes('전세') || n === 'jeonse') return ContractType.JEONSE;
  if (n.includes('월세') || n === 'wolse') return ContractType.WOLSE;
  if (n.includes('매매') || n === 'maemae') return ContractType.MAEMAE;
  return ContractType.JEONSE;
}

/** '1억 5,000' 같은 문자열에서 숫자만 뽑아 BigInt로 */
export function parsePrice(value: string): bigint {
  if (!value) return 0n;
  const clean = value.replace(/[^0-9.]/g, '');
  if (!clean) return 0n;
  const num = parseFloat(clean);
  if (isNaN(num)) return 0n;
  return BigInt(Math.round(num));
}

/** 다양한 날짜 형식 파싱 (yyyy-mm-dd, yyyy.m.d, yyyymmdd, m/d/yyyy) */
export function parseDate(value: string): Date | null {
  if (!value) return null;

  const patterns = [
    /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/,
    /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;

    const isMdy = pattern === patterns[1];
    const year = parseInt(isMdy ? match[3] : match[1], 10);
    const month = parseInt(isMdy ? match[1] : match[2], 10);
    const day = parseInt(isMdy ? match[2] : match[3], 10);

    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }

  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** 구분자(, ; / 줄바꿈)로 연락처 여러 개 분리, 8자리 이상만 유지 */
export function parseContacts(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[,;/\n]/)
    .map((c) => c.replace(/[^0-9-]/g, '').trim())
    .filter((c) => c.length >= 8);
}

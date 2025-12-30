# 모듈 구조

클라이언트 코드는 기능별로 모듈화되어 관리됩니다. 각 모듈은 독립적으로 관리되며, 서버의 모듈 구조와 일치합니다.

## 모듈 구조

```
modules/
├── auth/              # 인증 모듈
│   ├── components/    # 인증 관련 컴포넌트 (향후 추가)
│   ├── hooks/         # useNaverAuth 등
│   ├── services/      # AuthService (API 호출)
│   ├── types/         # 타입 정의
│   └── index.ts       # 모듈 export
│
├── properties/        # 매물 모듈
│   ├── components/    # 매물 관련 컴포넌트 (향후 추가)
│   ├── hooks/         # useProperties, useProperty 등
│   ├── services/      # PropertiesService (API 호출)
│   ├── types/         # 타입 정의
│   └── index.ts       # 모듈 export
│
├── contracts/         # 계약 모듈
│   ├── components/    # 계약 관련 컴포넌트 (향후 추가)
│   ├── hooks/         # useContracts, useContract 등
│   ├── services/      # ContractsService (API 호출)
│   ├── types/         # 타입 정의
│   └── index.ts       # 모듈 export
│
├── users/             # 사용자 모듈
│   ├── components/    # 사용자 관련 컴포넌트 (향후 추가)
│   ├── hooks/         # useCurrentUser, useUpdateUser 등
│   ├── services/      # UsersService (API 호출)
│   ├── types/         # 타입 정의
│   └── index.ts       # 모듈 export
│
└── common/            # 공통 모듈
    ├── api-client.ts  # API 클라이언트 (인증 헤더, 요청 유틸리티)
    └── index.ts       # 모듈 export
```

## 사용 방법

### 모듈 Import

```typescript
// 전체 모듈에서 import
import { useNaverAuth, useProperties, useContracts } from '@/modules';

// 특정 모듈에서만 import
import { useNaverAuth } from '@/modules/auth';
import { useProperties } from '@/modules/properties';
import { useContracts } from '@/modules/contracts';
```

### 인증 모듈

```typescript
import { useNaverAuth } from '@/modules/auth';

function LoginScreen() {
  const { isAuthenticated, user, login, logout, isLoading } = useNaverAuth();

  // ...
}
```

### 매물 모듈

```typescript
import { useProperties, useCreateProperty } from '@/modules/properties';

function PropertiesScreen() {
  const { properties, isLoading, fetchProperties } = useProperties();
  const { createProperty } = useCreateProperty();

  useEffect(() => {
    fetchProperties();
  }, []);

  // ...
}
```

### 계약 모듈

```typescript
import { useContracts, useCreateContract } from '@/modules/contracts';

function ContractsScreen() {
  const { contracts, isLoading, fetchContracts } = useContracts({
    expiringInDays: 7, // D-7 계약만 조회
  });

  // ...
}
```

### API 클라이언트

```typescript
import { apiGet, apiPost, getAuthHeaders } from '@/modules/common';

// 직접 API 호출
const data = await apiGet('/properties');
const newProperty = await apiPost('/properties', { name: '...' });

// 인증 헤더만 필요할 때
const headers = await getAuthHeaders();
```

## 모듈별 기능

### Auth 모듈

- 네이버 OAuth 인증 (PKCE 플로우)
- 토큰 관리 (저장, 갱신, 삭제)
- 인증 상태 관리

### Properties 모듈

- 매물 CRUD 작업
- 매물 목록 조회 및 필터링
- 매물 상세 정보 관리

### Contracts 모듈

- 계약 CRUD 작업
- 계약 목록 조회 및 필터링
- 만료 임박 계약 조회 (D-7, D-30, D-90)

### Users 모듈

- 사용자 정보 조회
- 사용자 정보 수정

### Common 모듈

- 공통 API 클라이언트
- 인증 헤더 관리
- API 요청 유틸리티 (GET, POST, PUT, PATCH, DELETE)

## 모듈 확장 가이드

새로운 모듈을 추가할 때는 다음 구조를 따르세요:

1. `modules/[module-name]/` 폴더 생성
2. 하위 폴더 구조 생성:
   - `types/` - 타입 정의
   - `services/` - API 서비스 클래스
   - `hooks/` - React 훅
   - `components/` - 컴포넌트 (필요시)
3. `index.ts` 파일에서 모든 export 정리
4. `modules/index.ts`에 새 모듈 추가

## 서버 모듈과의 일치

클라이언트 모듈 구조는 서버의 `server/src/modules/` 구조와 일치합니다:

- `auth/` ↔ `modules/auth/`
- `properties/` ↔ `modules/properties/`
- `contracts/` ↔ `modules/contracts/`
- `users/` ↔ `modules/users/`

이를 통해 프론트엔드와 백엔드 간의 일관성을 유지하고, 코드 탐색과 유지보수가 용이합니다.

# Contract Secretary - Client

계약서 비서 모바일 애플리케이션 (React Native + Expo)

## 🚀 시작하기

### 의존성 설치

루트 디렉토리에서:

```bash
pnpm install
```

또는 이 디렉토리에서 직접:

```bash
cd client
pnpm install
```

### 개발 서버 실행

```bash
# 루트 디렉토리에서
pnpm client:start

# 또는 이 디렉토리에서
pnpm start
```

### 플랫폼별 실행

```bash
# Android 에뮬레이터
pnpm client:android
# 또는
pnpm android

# iOS 시뮬레이터 (macOS만)
pnpm client:ios
# 또는
pnpm ios

# 웹 브라우저
pnpm client:web
# 또는
pnpm web
```

## 📱 기술 스택

- **React Native** 0.81.5
- **Expo** ~54
- **Expo Router** 6 (파일 기반 라우팅)
- **TypeScript** 5.9
- **React** 19.1

## 📁 프로젝트 구조

```
client/
├── app/                    # 📍 라우팅 (Expo Router)
│   ├── (tabs)/            # 탭 네비게이션 그룹
│   │   ├── index.tsx      # 홈 화면
│   │   ├── explore.tsx    # 탐색 화면
│   │   └── settings.tsx   # 설정 화면
│   ├── _layout.tsx        # 루트 레이아웃
│   └── modal.tsx          # 모달 화면
│
├── components/            # 🧩 React 컴포넌트
│   ├── common/           # 공통 컴포넌트 (badge, card, divider)
│   ├── detail/           # 상세 페이지 컴포넌트
│   ├── home/             # 홈 화면 컴포넌트
│   ├── list/             # 리스트 컴포넌트
│   ├── settings/         # 설정 화면 컴포넌트
│   └── ui/               # UI 기본 컴포넌트
│
├── design-system/        # 🎨 디자인 시스템
│   ├── components/       # 디자인 시스템 컴포넌트 (Text, View)
│   ├── theme/            # 테마 설정 및 훅
│   └── tokens/           # 디자인 토큰 (colors, spacing, typography)
│
├── assets/               # 🖼️ 정적 파일
│   ├── fonts/            # 폰트 파일 (Pretendard)
│   ├── icons/            # 아이콘
│   └── images/           # 이미지
│
├── constants/            # 📝 상수
├── hooks/                # 🪝 커스텀 훅
├── scripts/              # 🔧 유틸리티 스크립트
│
└── 설정 파일
    ├── app.json          # Expo 앱 설정
    ├── package.json      # 의존성 및 스크립트
    ├── tsconfig.json     # TypeScript 설정
    └── eslint.config.js  # ESLint 설정
```

## 🎨 디자인 시스템

이 프로젝트는 커스텀 디자인 시스템을 포함하고 있습니다.

### 사용 예시

```tsx
import { Text, View } from '@/design-system';
import { useTheme } from '@/design-system/theme';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View padding="md" backgroundColor="surface">
      <Text variant="heading1" color="primary">
        안녕하세요
      </Text>
      <Text variant="body" color="secondary">
        Contract Secretary입니다.
      </Text>
    </View>
  );
}
```

### 디자인 토큰

- **Colors**: `design-system/tokens/colors.ts`
- **Spacing**: `design-system/tokens/spacing.ts`
- **Typography**: `design-system/tokens/typography.ts`
- **Shadows**: `design-system/tokens/shadows.ts`

자세한 내용은 [design-system/README.md](design-system/README.md)를 참조하세요.

## 🧭 라우팅 (Expo Router)

이 프로젝트는 파일 기반 라우팅을 사용합니다:

- `app/(tabs)/index.tsx` → `/` (홈)
- `app/(tabs)/explore.tsx` → `/explore` (탐색)
- `app/(tabs)/settings.tsx` → `/settings` (설정)
- `app/modal.tsx` → `/modal` (모달)

### 네비게이션

```tsx
import { router } from 'expo-router';

// 화면 이동
router.push('/explore');

// 뒤로 가기
router.back();

// 모달 열기
router.push('/modal');
```

## 🔌 API 연동

서버 API와 통신하려면:

```typescript
const API_URL = 'http://localhost:3000';

async function fetchData() {
  const response = await fetch(`${API_URL}/api/endpoint`);
  const data = await response.json();
  return data;
}
```

**Note**: 
- Android 에뮬레이터에서는 `http://10.0.2.2:3000`
- iOS 시뮬레이터에서는 `http://localhost:3000`
- 실제 기기에서는 컴퓨터의 로컬 IP 주소 사용

## 🧪 개발 가이드

### 새로운 화면 추가

`app/` 디렉토리에 파일을 추가하면 자동으로 라우트가 생성됩니다:

```bash
# 예: app/profile.tsx를 만들면 /profile 라우트 생성
touch app/profile.tsx
```

### 새로운 컴포넌트 추가

```bash
# 적절한 디렉토리에 컴포넌트 생성
touch components/common/new-component.tsx
```

### 린팅

```bash
pnpm lint
```

### 프로젝트 초기화

```bash
pnpm reset-project
```

## 📦 빌드

### 개발 빌드

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### 프로덕션 빌드

```bash
# Android APK
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

**Note**: EAS Build를 사용하려면 Expo 계정이 필요합니다.

## 🔧 환경 변수

필요한 경우 `.env` 파일을 생성하고 환경 변수를 설정하세요:

```bash
API_URL=http://localhost:3000
```

## 📚 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [React Native 문서](https://reactnative.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/)

## 🐛 문제 해결

### Metro bundler 캐시 지우기

```bash
pnpm start --clear
```

### node_modules 재설치

```bash
rm -rf node_modules
pnpm install
```

### iOS 시뮬레이터가 열리지 않을 때

```bash
# Xcode Command Line Tools 확인
xcode-select --install
```

### Android 에뮬레이터 연결 문제

Android Studio에서 에뮬레이터가 실행 중인지 확인하세요.


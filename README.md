# 오르내 (OREUNAE)

토큰·파생상품 기반 참고가격과 글로벌 경제지표를 살펴보는 React 웹 프런트엔드입니다.

현재 화면의 수치·차트·뉴스·토론은 합성 예시이며 실제 시세가 아닙니다.
Spring Boot API는 별도 저장소에서 관리하고, 이 프런트엔드에는 아직 연결하지 않았습니다.

## 실행

Node.js 22.12 이상이 필요합니다. 이 저장소 루트에서 실행합니다.

```sh
npm ci
npm run dev
```

개발 주소는 http://127.0.0.1:5174 입니다.
React·TypeScript·Vite·Tailwind CSS 4를 사용하며 한/영, 라이트/다크,
관심목록과 시간대 설정을 지원합니다. 로그인·광고·실제 주문 기능은 없습니다.

## 검증

```sh
npm run typecheck
npm run lint
npm run build
npx playwright install chromium webkit
npm test
```

Playwright는 Chromium·WebKit E2E를 실행합니다. 현재 일부 기존 테스트의
카드·상세 통계 개수 기대값이 화면과 일치하지 않아 전체 E2E는 통과 상태가 아닙니다.
빌드 성공과 실제 기기 QA·서비스 배포는 별도로 확인합니다.

## 데이터와 자산

- `src/data/`: 합성 예시 데이터. 실제 공급처 수치나 운영 DB 자료가 아닙니다.
- `public/licenses/`, `public/assets/icons/LUCIDE-LICENSE.txt`,
  `public/assets/market-icons/LICENSE.txt`: 포함된 제3자 자산의 라이선스 고지입니다.
- 로고·상표와 각 자산의 권리는 해당 권리자에게 있습니다. 저장소 공개만으로
  프로젝트 전체에 MIT 등 별도 오픈소스 라이선스를 부여하지 않습니다.

비밀키·DB 접속정보·운영 로그·백업을 커밋하지 않습니다.
브라우저에 전달되는 환경변수에는 비밀값을 넣지 않습니다.

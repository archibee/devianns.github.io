# 현재 사이트 구성

이 문서는 현재 저장소에 구현된 사이트의 목적, 페이지 구성, 데이터 흐름, 상호작용과 운영 범위를 정리합니다. 새 기능이나 향후 아이디어가 아니라 현재 코드의 동작을 기준으로 합니다. 데이터 파일의 세부 규칙은 [`database/README.md`](../database/README.md), 수집 자료의 범위와 한계는 [`docs/imports/`](imports/)의 배치별 문서를 참고하세요.

## 목적과 범위

Dahlia Archive는 SOOP, YouTube, X, Naver Cafe에 남은 활동의 흔적을 링크와 텍스트 메타데이터로 보존하고 찾아볼 수 있게 하는 개인 정적 웹사이트입니다. 기록에는 제목, 날짜, 본문, 태그, 수집 시점에 확인한 지표, 원본 링크 등이 들어갈 수 있습니다. 원본 콘텐츠 자체를 사이트에 복제하지 않습니다. 방문자는 기록을 검색·분류·열람한 뒤 해당 플랫폼의 실제 항목으로 이동합니다.

사이트는 GitHub Pages 정적 파일 호스팅을 대상으로 합니다. 프레임워크 빌드, 서버/API, 런타임 플랫폼 API 호출, 브라우저 데이터 저장, GitHub Actions 배포 로직은 사용하지 않습니다. `archive-app.js`가 정적 `database/catalog.json`을 `fetch()`하므로 `file://`로 HTML을 직접 여는 대신 GitHub Pages 또는 로컬 HTTP 서버에서 열어야 합니다. 내부 링크와 파일 경로는 저장소가 도메인 루트가 아닌 하위 경로에 배포되는 상황도 고려해 상대 경로를 사용합니다.

## 페이지와 탐색

| 페이지 | 역할 | 제공 기능 및 데이터 |
| --- | --- | --- |
| `index.html` | 메인 큐브 허브 | SOOP, YouTube, X, Community, Projects, 프로필 링크 여섯 면이 각 전용 페이지로 이동합니다. 초기 회전은 yaw -24°, pitch -20°로 윗면이 보이는 시점입니다. |
| `archive.html` | 전체 기록 | 플랫폼별 합계와 비중, 통합 검색, SOOP·YouTube·X 플랫폼 필터를 제공합니다. |
| `memories.html` | SOOP 기록 | 캐치·클립·VOD 통합 목록, 유형별 수, 캐치의 월별 추이와 요일·시간대 집계, 검색과 유형 필터를 제공합니다. |
| `youtube.html` | YouTube Shorts·동영상 | 형식별 기록 수, 저장된 조회수 상위 5개, 태그 검색, Shorts·동영상 필터를 제공합니다. 게시 날짜가 없는 항목에 날짜를 임의로 붙이지 않습니다. |
| `x-archive.html` | X 게시물 | 날짜가 확인된 월별 게시 흐름, 태그 요약과 검색을 제공합니다. 현재 확인된 항목이 적거나 비어 있는 경우에도 수집 한계를 페이지에서 안내합니다. |
| `community.html` | 카페별 커뮤니티 기록 | 카페 선택으로 전체 카페 또는 한 카페의 글을 보여줍니다. 월별·닉네임별 게시 수, 수집 당시 목록 조회 수 상위 5개, 제목·작성자·카페 검색과 원문 링크를 제공합니다. 현재 등록된 카페 데이터는 VLUP 한 곳입니다. |
| `media.html` | SOOP 클립·VOD | 유형별 기록 수, 저장된 조회수 상위 5개, 검색과 클립·다시보기 필터를 제공합니다. 별도 원본 목록 링크도 둡니다. |
| `about.html` | 활동 기록 요약 | SOOP 캐치 월별 추이와 반복 제목·태그 등 플랫폼 간 요약 인사이트를 보여줍니다. |
| `projects.html` | 프로젝트 소개 | `database/projects/catalog.json`을 읽어 프로젝트별 JSON 소개 카드와 배포·GitHub 링크를 표시합니다. |
| `platforms.html` | 플랫폼 계정 링크 | YouTube, X, SOOP의 계정 페이지로 이동합니다. 활동별 기록 링크와는 별도입니다. |
| `404.html` | 없는 주소 안내 | 정적 호스팅용 오류 페이지이며 검색 색인 대상에서 제외합니다. |

메인 큐브 면 연결은 앞면 → SOOP, 오른쪽 → YouTube, 뒷면 → X, 왼쪽 → Projects, 윗면 → 프로필 링크, 아랫면 → Community입니다. `archive.html`, `media.html`, `about.html`은 직접 접근 가능한 참고 화면으로 남지만 큐브의 별도 면은 차지하지 않습니다. 메인 페이지는 뷰포트 높이에 맞춘 한 화면 구성이고, 기록 페이지는 스크롤하여 통계, 시각화, 기록 목록을 차례로 봅니다.

## 파일 구성

```text
index.html, memories.html, youtube.html, x-archive.html, community.html, projects.html,
archive.html, media.html, about.html, platforms.html, 404.html
styles.css                 공통 레이아웃, 메인 큐브, 반응형/3D 시각 효과
subpages.css               기록 페이지 배경, 내비게이션, 패널, 목록 및 차트 스타일
script.js                  모바일 메뉴, 큐브 조작, 현재 연도 표기
archive-app.js             정적 카탈로그 로드, 페이지별 집계·시각화·검색·필터·카드
community.html             VLUP 카페 게시글 메타데이터 아카이브
projects-app.js            프로젝트 소개 JSON 로드 및 카드 렌더링
database/                  개별 활동 JSON, 계정 JSON, 프로젝트 JSON, 화면용 카탈로그
dahlia-images/             큐브와 상세 페이지에서 쓰는 사용자 제공 이미지
docs/                      사이트 구조, 스크랩 관찰, 배치별 수집 메모
robots.txt, sitemap.xml    검색 로봇 접근 및 공개 페이지 안내
favicon.*, apple-touch-icon.png, icon-*.png, site.webmanifest
                            브라우저/기기 아이콘과 웹 앱 표시 정보
.nojekyll                  GitHub Pages에서 Jekyll 변환을 사용하지 않음을 표시
```

`source/`는 원시 스크랩을 보관하는 로컬 입력 폴더이며 Git과 Pages 배포에서 제외합니다. 플랫폼이 소유한 로고, 썸네일, 영상, 페이지 HTML은 아카이브 데이터에 복제하지 않습니다. 글꼴은 Google Fonts에서 불러오며, 나머지 화면 동작과 차트는 기본 HTML/CSS/JavaScript로 처리합니다.

## 정적 데이터 흐름

```text
사용자가 제공한 스크랩/링크
        ↓ 수동 확인·정리
database/<platform>/<type>/<date>/ 활동 JSON 한 파일
        ↓ 화면에 필요한 필드 반영
database/catalog.json 정적 검색·표시 카탈로그
        ↓ archive-app.js의 fetch('./database/catalog.json')
필터링 → 카드/통계/시각화 → 원본 플랫폼 링크

community.html (data-view="community") → catalog의 cafeId/cafeName으로 선택 목록 구성
                                      → 전체 또는 선택 카페 필터
                                      → 월별/카페/닉네임/목록 조회수 시각화

database/projects/catalog.json → 프로젝트 JSON 파일 → projects-app.js → 소개 카드
```

- 활동 JSON 한 파일은 활동 흔적 하나를 나타냅니다. 원본 미디어 파일이 아닙니다.
- `database/platforms/*.json`은 사용자가 제공한 계정 링크와 프로필 정보를 보관하고 활동 레코드와 구분합니다.
- `database/catalog.json`은 저장소 디렉터리를 브라우저에서 열거할 수 없는 정적 호스팅 환경을 위한 화면용 색인입니다. 개별 활동 JSON의 모든 상세 필드를 복제하는 별도 데이터베이스가 아닙니다.
- `database/projects/catalog.json`은 프로젝트 소개 JSON 경로를 나열합니다. 프로젝트마다 별도 파일을 두며, 페이지가 각 파일을 읽어 소개 카드를 만듭니다. 등록된 각 프로젝트에는 목적, 구현 방식, 사용 방법과 링크가 담깁니다.
- Community 페이지는 카탈로그에 있는 Naver Cafe 기록의 `cafeId`·`cafeName`에서 선택 목록을 만들고 전체 또는 한 카페로 필터합니다. 현재 카탈로그 데이터는 ID `30653039`인 VLUP 기록뿐입니다. 작성자 닉네임별 건수와 게시월 추이, 수집 당시 목록 조회 수 상위 항목을 실제 저장값으로 그립니다.
- 지금은 사이트 실행이나 배포 과정에서 카탈로그를 생성하지 않습니다. 활동 파일을 추가·수정하면 해당 정적 카탈로그도 함께 갱신해야 합니다. 자동화는 향후 로컬 보조 스크립트로 고려할 수 있으나 현재 동작에는 포함되지 않습니다.
- 활동별 원본 URL이 제공 자료에 있거나 수집 시점에 확인 가능했다면 레코드와 카탈로그에 보존합니다. 계정/목록 링크는 활동 링크를 대신하지 않습니다. 당시 개별 링크를 확인할 수 없으면 `url: null`로 남기고 추측으로 만들지 않습니다.
- 날짜, 시간대, 지표 이름, 중복 여부가 불명확하면 원문과 출처 위치를 보존하고 사실처럼 추정하지 않습니다. 상대 날짜를 절대 날짜로 환산하려면 신뢰할 만한 수집 시각이 필요합니다. 자세한 규칙은 [`database/README.md`](../database/README.md)에 있습니다.

## 화면 로직

`script.js`는 모든 페이지에서 메뉴 열기/닫기와 푸터 연도를 처리하고, 메인 페이지에 큐브가 있을 때만 큐브 이벤트를 연결합니다.

- 포인터 드래그와 터치 스와이프로 yaw/pitch 두 축을 연속 회전합니다. 움직임은 `requestAnimationFrame`으로 묶고, 놓은 뒤에는 감속 관성으로 이어집니다.
- 큐브를 움직이지 않고 면을 탭/클릭하면 해당 HTML 페이지로 이동합니다. 방향키는 90° 간격으로 회전시킵니다. 면 이름과 면 번호가 현재 보이는 방향에 맞춰 갱신됩니다.
- 드래그 뒤 합성 클릭, 브라우저 컨텍스트 메뉴, 텍스트 선택, 이미지 기본 드래그를 막습니다. OS `prefers-reduced-motion` 설정은 애니메이션 제어에 쓰지 않습니다. 키보드 포커스는 `:focus-visible`로 구분합니다.
- 큐브는 CSS transform으로 드래그 회전과 관성만 처리합니다. 상시 부유/반짝임 애니메이션과 포인터 조명은 쓰지 않습니다. 큐브 면에는 backdrop blur를 적용하지 않고 투명한 그라데이션, 얇은 테두리, 정적인 반사광으로 유리 외관을 만듭니다.

`archive-app.js`는 `body[data-view]` 값으로 화면 종류를 구분하고 정적 카탈로그를 한 번 읽습니다. 기록 카드는 날짜 내림차순으로 정렬하고 최초 24개를 표시하며, 더 보기 버튼은 다음 24개를 추가합니다. 검색은 제목·본문·태그를 대상으로 하며, Community 페이지에서는 작성자 닉네임과 카페 이름도 검색합니다. 플랫폼/형식 버튼과 상위 태그 버튼으로 결과를 좁힙니다. 원본 URL이 있는 항목에는 새 탭의 원본 링크를, 없는 항목에는 “원본 링크 없음” 표시를 냅니다.

Community 화면은 동일 앱에서 Naver Cafe 플랫폼과 선택된 `cafeId`를 기준으로 범위를 제한합니다. 카페 선택은 정적 catalog에서 발견한 카페 ID와 이름으로 구성하고, URL의 `?cafe=` 값으로 선택 상태를 유지합니다. 목록 조회·좋아요·댓글 수는 단일 수집 시점의 관측값이며, 별도 안내를 통해 현재 값으로 오인하지 않게 합니다.

차트는 현재 자료에 실제로 있는 메타데이터에서 계산합니다. 전체 플랫폼 비중, SOOP 캐치 월별·요일별·시간대별 분포, YouTube/클립·VOD 유형별 수와 조회수 순위, X 월별 게시 흐름, Community 월별·닉네임별 글 수와 수집 당시 조회 수 순위, 반복 제목·태그 요약이 해당합니다. 날짜나 수치가 없는 기록을 가상의 데이터로 채우지 않습니다. 수치 순위는 기록에 남은 관측값을 사용하며 현재 플랫폼 값을 조회하지 않습니다.

## 시각·반응형·접근성

- `dahlia-images/dahlia.jpg`는 큐브 앞면 프로필 이미지, `dahlia-images/dahlia-background.jpg`는 큐브 정반대 면과 상세 페이지 고정 배경에 사용합니다. 다른 큐브 면에는 이미지 대신 텍스트와 CSS 도형을 씁니다.
- 모든 페이지의 상단바는 배경, backdrop blur, 경계선, 그림자 없이 완전히 투명합니다. 메인과 상세 페이지에서 상단바 높이, 좌우 여백, 메뉴 간격, 모바일 메뉴 전환 기준을 맞춥니다. 상세 페이지의 고정 배경 레이어는 배경 이미지를 `cover`로 표시하고 `center 20%`에 맞춰 어두운 색/별빛 오버레이와 겹칩니다. 본문 패널은 투명한 유리 스타일을 씁니다.
- PC·태블릿·모바일 미디어 쿼리는 `styles.css`와 `subpages.css`에 있습니다. 기록 카드 그리드, 탐색 메뉴, 차트가 좁은 화면에서 재배치됩니다.
- 페이지에는 한국어 문서 언어, 제목/설명, canonical, Open Graph/Twitter 공유 메타데이터가 있습니다. 메인에는 `WebSite`, 하위 컬렉션에는 `CollectionPage` JSON-LD가 있습니다. 오류 페이지는 `noindex`입니다.
- 공개 URL 목록은 `sitemap.xml`, 크롤러 접근은 `robots.txt`에서 관리합니다. favicon, Apple 아이콘, manifest도 정적 파일입니다. manifest는 홈 화면 이름/아이콘 정보를 제공하며 서비스 워커나 오프라인 캐시는 구현되어 있지 않습니다. 사이트 검증 토큰, analytics, 사용자 추적은 구성하지 않았습니다.

## 문서의 역할

- [`README.md`](../README.md): 방문자/기여자에게 사이트 목적과 현재 페이지 구성을 소개합니다.
- [`AGENTS.md`](../AGENTS.md): 이후 구현자가 지켜야 하는 배포·데이터·비주얼 원칙 및 코드 작업 지침입니다.
- [`database/README.md`](../database/README.md): 활동 파일 경로와 메타데이터·URL 처리 규칙입니다.
- [`docs/social-scrape-observations.md`](social-scrape-observations.md), [`docs/imports/`](imports/): 스크랩 관찰과 개별 데이터 수집 배치의 범위·한계입니다.

## VLUP Naver Cafe 데이터 현황

2026-11-01 기준으로 사용자가 같은 Dahlia 계정의 닉네임 변경 이력이라고 확인한 `꼬리리`, `망초써`, `망초`, `힝구링이` 작성자 검색에서 공개 목록 메타데이터 177건을 저장했습니다. 개별 JSON은 `database/naver-cafe/vlup/posts/YYYY/MM/`에 있고, 화면용 투영본은 `database/catalog.json`에 있습니다. 수집 배치와 페이지 수, 범위, 필드 제한은 [`docs/imports/naver-cafe-vlup-2026-11-01.md`](imports/naver-cafe-vlup-2026-11-01.md)를 참고하세요.

이 177건은 `community.html`과 큐브 아랫면에 연결되어 있습니다. 페이지는 여러 카페로 확장 가능한 선택 UI를 제공하지만 현재 정적 카탈로그에는 카페 ID `30653039`인 VLUP 자료만 있습니다. 저장한 것은 목록에 공개된 제목·작성자·날짜·지표와 개별 게시물 링크이며, 본문·요약·첨부 미디어는 저장하지 않았습니다.

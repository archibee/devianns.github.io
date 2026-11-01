# VLUP Naver Cafe 작성자 검색 수집

## 수집 범위

- 카페: VLUP, cafe ID `30653039`
- 수집일: 2026-11-01 (Asia/Seoul)
- 검색 기준: 사용자가 제공한 `ta=WRITER` 작성자 검색, 목록형 `viewType=L`
- 별명: `꼬리리`, `망초써`, `망초`, `힝구링이`
- 저장한 내용: 게시물 ID와 직접 링크, 제목, 게시 날짜/원문 시각, 작성자 별명, 목록 API의 읽음·공감·댓글 수치
- 초기 목록 수집에서 저장하지 않은 내용: 게시물 본문, 검색 API 요약문, 댓글 본문, 첨부 파일·이미지·동영상, 플랫폼 로고·썸네일 (이후 공개 본문 확인 배치는 아래 참조)
- 검색 목록에서 확인한 메타데이터는 `database/naver-cafe/vlup/posts/YYYY/MM/`에 게시물 ID별 JSON으로 저장하고 `database/catalog.json`에도 반영했습니다. 초기 목록 수집 당시에는 전용 화면이 없었으나, 이후 공개 본문 텍스트 수집과 Community 화면 연결을 마쳤습니다.

## 검색 결과와 페이지

| 작성자 검색어 | 페이지 | 결과 수 | 기록 날짜 범위 |
| --- | ---: | ---: | --- |
| `꼬리리` | 1–2 | 28 | 2026-02-07 — 2026-11-01 |
| `망초써` | 1–7 | 98 | 2024-04-04 — 2025-03-04 |
| `망초` | 1–3 | 36 | 2025-03-10 — 2025-09-18 |
| `힝구링이` | 1 | 15 | 2025-10-12 — 2026-02-01 |
| **합계** | **13페이지** | **177** | **2024-04-04 — 2026-11-01** |

모든 항목의 API 작성자 별명은 검색어와 일치했습니다. 177개 플랫폼 게시물 ID는 모두 고유했습니다. 동일 인물의 네 별명이라는 정보는 사용자가 확인해 준 내용이며, 각 게시물의 `authorNickname`은 당시 화면에 표시된 별명을 그대로 보존합니다. 위 날짜 범위는 별명별 검색 결과에서 관찰한 범위일 뿐, 닉네임을 바꾼 정확한 날짜를 뜻하지 않습니다.

수집에 사용한 검색 페이지는 아래와 같습니다. 페이지 값은 표의 마지막 페이지까지 순차적으로 넘겼습니다.

- [`꼬리리` 검색](https://cafe.naver.com/f-e/cafes/30653039/menus/0?viewType=L&ta=WRITER&page=1&q=%EA%BC%AC%EB%A6%AC%EB%A6%AC) — 2페이지
- [`망초써` 검색](https://cafe.naver.com/f-e/cafes/30653039/menus/0?viewType=L&ta=WRITER&page=1&q=%EB%A7%9D%EC%B4%88%EC%8D%A8) — 7페이지
- [`망초` 검색](https://cafe.naver.com/f-e/cafes/30653039/menus/0?viewType=L&ta=WRITER&page=1&q=%EB%A7%9D%EC%B4%88) — 3페이지
- [`힝구링이` 검색](https://cafe.naver.com/f-e/cafes/30653039/menus/0?viewType=L&ta=WRITER&page=1&q=%ED%9E%9D%EA%B5%AC%EB%A7%81%EC%9D%B4) — 1페이지

## 저장 필드

- `platformId`: Naver Cafe 게시물 ID
- `url`: 게시물 단위 링크 `https://cafe.naver.com/f-e/cafes/30653039/articles/{articleId}`
- `title`: 검색 결과의 게시물 제목
- `authorNickname`: 검색 결과의 원문 작성자 별명
- `authorGroup`: 동일 계정으로 묶기 위한 사용자 확인 그룹 `dahlia`. 별도 회원 식별자/회원 키는 저장하지 않았습니다.
- `publishedAt`: API `addDate`에서 그대로 확인한 `YYYY-MM-DD` 부분
- `publishedTimeRaw`: API `addDate` 원문 문자열
- `sourceTimezone`: API 날짜에 시간대가 포함되지 않아 `null`
- `listingMetrics`: API 필드명 그대로인 `readCount`, `likeItCount`, `commentCount` 값. 관찰 시점의 목록 값이며 현재 값으로 간주하지 않습니다.
- `sourceQueryAlias`, `sourceSearchUrl`, `sourcePage`, `sourcePosition`: 수집 검색어와 목록 위치
- `observedAt`: 이번 목록 수집 시각 `2026-11-01T14:27:10+09:00`

공개 검색 API가 반환한 요약문 필드는 레코드로 복사하지 않았습니다. 제공된 검색 URL에서 사용한 작성자 검색 조건은 API의 `searchBy=3`으로 전달하고, `viewType=L`에 맞춰 페이지당 15개씩 조회했습니다. 검색 결과의 게시물 상세 페이지 내용을 열람하거나 수집하지 않았습니다.

게시물 직접 링크 경로는 별명별로 한 건씩 HEAD 요청하여 4개 표본 모두 HTTP 200 응답을 확인했습니다. 이 확인은 URL 경로가 응답한다는 뜻이며, Cafe의 게시물 공개 범위나 로그인/가입 필요 여부까지 보증하지는 않습니다. 세부 게시물 접근 권한은 사이트에서 확인하지 않았습니다.

## 공개 본문 텍스트 수집 (2026-11-01)

초기 목록 수집 후 개별 게시물 API가 로그인 없이 공개 본문을 반환하는지 확인하고, 검색 목록의 게시물 ID와 API 응답의 제목을 대조해 177건을 처리했습니다. 제목의 HTML 엔티티 표기만 달랐던 7건은 엔티티를 해석한 뒤 일치함을 확인했습니다. 대상 ID나 제목이 맞지 않거나 열람 불가인 항목은 저장하지 않도록 확인 과정을 거쳤습니다.

- API 경로: `https://article.cafe.naver.com/gw/v4/cafes/{cafeId}/articles/{articleId}?query=&useCafeId=true&menuId=0`
- 본문 문단은 일반 텍스트로 추출해 각 JSON의 `text`에 저장했습니다. 원본 HTML, 스크립트, 플랫폼 소유 시각 자산은 저장하지 않았습니다.
- 본문에서 찾은 일반 링크와 이미지·미디어 주소는 `bodyLinks`에 `{label, url, kind}`로 남겼습니다. 이미지·영상·첨부 파일 자체는 가져오지 않았습니다.
- 177건 모두 본문 조회 처리를 마쳤습니다. 169건은 비어 있지 않은 본문 텍스트가 있고, 8건은 저장 가능한 텍스트가 비어 있어 화면에서 별도 안내합니다.
- 본문 참조 주소는 일반 링크 108개, 이미지 URL 624개이며 미디어 URL은 0개였습니다. 이는 발견된 URL 참조 수이지, 서로 다른 파일 수나 게시물 수가 아닙니다.
- 각 레코드의 `bodyCaptureStatus`, `bodyCapturedAt`, `bodySourceEndpoint`는 수집 상태·시각·API 출처를 기록합니다. 저장된 본문 보기와 카페 원문 보기는 Community 카드에서 각각 선택할 수 있습니다.

이 수집은 해당 시점에 공개 응답으로 열람된 자료만 반영합니다. 이후 원문이 수정·삭제되거나 접근 범위가 달라질 수 있으며, 저장본은 그 시점에 확인한 텍스트 기록입니다.

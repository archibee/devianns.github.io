# VLUP Naver Cafe 작성자 검색 수집

## 수집 범위

- 카페: VLUP, cafe ID `30653039`
- 수집일: 2026-11-01 (Asia/Seoul)
- 검색 기준: 사용자가 제공한 `ta=WRITER` 작성자 검색, 목록형 `viewType=L`
- 별명: `꼬리리`, `망초써`, `망초`, `힝구링이`
- 저장한 내용: 게시물 ID와 직접 링크, 제목, 게시 날짜/원문 시각, 작성자 별명, 목록 API의 읽음·공감·댓글 수치
- 보존하지 않는 내용: 게시물 본문, 본문 내 링크, 검색 API 요약문, 댓글 본문, 첨부 파일·이미지·동영상, 플랫폼 로고·썸네일
- 검색 목록에서 확인한 메타데이터와 개별 원문 URL은 `database/naver-cafe/vlup/posts/YYYY/MM/`에 게시물 ID별 JSON으로 저장하고 `database/catalog.json`에도 반영했습니다.

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

## 보존 범위

초기 목록 메타데이터 수집 때는 게시물 본문을 저장하지 않았습니다. 이후 확인 작업으로 본문 텍스트와 본문 링크를 임시로 수집했으나, 보존 범위를 메타데이터 전용으로 정리하면서 JSON 원본과 정적 카탈로그에서 해당 내용을 삭제했습니다. 현재 Community 화면은 제목, 작성자, 날짜, 목록 지표와 개별 원문 URL만 사용합니다. 원본 HTML이나 미디어 파일은 저장하지 않습니다.

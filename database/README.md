# 데이터베이스 파일 규칙

`database/`는 정적 텍스트·메타데이터 아카이브입니다. 활동 JSON 파일 하나에 게시물, 동영상 목록 항목, SOOP 캐치 등 활동 흔적 하나를 저장합니다. 개별 URL이나 플랫폼 ID가 없어 같은 제목이 반복되어도 중복으로 합치지 않습니다.

## 경로

- `platforms/*.json`: 계정 링크와 변동 가능한 프로필 스냅샷
- `x/posts/YYYY/MM/`: 날짜가 명시된 X 게시물
- `youtube/shorts/undated/`: YouTube Shorts 목록 항목
- `youtube/videos/undated/`: YouTube 일반 동영상 목록 항목
- `soop/catches/YYYY/MM/`: 날짜가 명시된 SOOP 캐치
- `soop/catches/relative-or-unknown-date/`: 상대 시각만 확인되는 캐치
- `soop/clips/YYYY/MM/`, `soop/vods/YYYY/MM/`: SOOP 방송국 목록의 클립 및 일반 VOD
- `naver-cafe/<cafe-slug>/posts/YYYY/MM/`: 카페별 공개 목록에서 확인한 게시물 메타데이터. 현재 `vlup/`만 있으며 게시물 하나당 JSON 파일 하나
- `projects/`: `catalog.json`에 나열된 프로젝트 카드 데이터. 프로젝트 설명 파일 하나당 프로젝트 하나이며, 공유 가이드라인은 `projects/guidelines/`에 별도 정적 JSON으로 둡니다.
- `catalog.json`: 기록 파일에서 화면에 필요한 필드만 모은 정적 검색·시각화 색인

## 필드 처리

- `sourceBatch`, `sourceLine`은 가능한 경우 원본 자료와 행 위치를 가리킵니다.
- Naver Cafe 기록은 `cafeId`, `platformId`, 게시 당시 표시된 `authorNickname`, 사용자 확인 별칭 그룹 `authorGroup`, 제목, 날짜, `listingMetrics`, 실제 게시물 `url`을 보존합니다. `publishedTimeRaw`에는 검색 API의 `addDate` 문자열을 그대로 넣고, 시간대가 원문에 없으면 `sourceTimezone: null`로 둡니다.
- 카페별 JSON 경로의 slug는 저장소 파일 경로 구분에 사용하고, 사이트의 표시·필터 구분에는 `cafeId`와 `cafeName`을 사용합니다. 카페별 계정/수집 범위 메타데이터는 `platforms/naver-cafe-<cafe-slug>.json`에 별도로 보관할 수 있습니다. `catalog.json`에는 해당 카페의 활동 레코드만 추가합니다.
- Naver Cafe는 공개 열람이 확인된 게시물의 본문을 HTML에서 일반 텍스트로 추출해 `text`에 저장할 수 있습니다. 본문에 포함된 외부 링크와 이미지·미디어 주소는 `bodyLinks` 배열에 `{label, url, kind}`로 기록하고, 파일 자체나 원본 HTML은 저장하지 않습니다. `bodyCaptureStatus`, `bodyCapturedAt`, `bodySourceEndpoint`는 수집 상태와 출처를 남깁니다. `listingMetrics`는 수집 당시 목록 스냅샷입니다.
- Naver Cafe 본문 필드는 `text`(정리된 일반 텍스트), `bodyLinks`(본문에서 확인한 `{label, url, kind}` 목록), `bodyCaptureStatus`, `bodyCapturedAt`, `bodySourceEndpoint`를 사용합니다. 본문이 비어 있어도 수집 완료 여부는 `bodyCaptureStatus`로 구분합니다. 검색 API의 요약문·댓글은 본문으로 간주하지 않으며, 원본 HTML과 미디어 파일은 보존하지 않습니다.
- Naver Cafe 원본 링크는 카페 ID와 게시물 ID로 해당 게시물을 직접 가리킵니다. 작성자 검색 URL은 출처 확인용 `sourceSearchUrl`로 별도 보존하며, 이를 활동 링크 대신 쓰지 않습니다.
- 수집 자료에 활동별 원본 URL이 있거나 수집 시점에 실제 항목에서 링크를 확인할 수 있었다면 `url`에 보존합니다. 계정/목록 링크는 개별 활동 링크를 대신하지 않습니다. 당시 개별 링크를 확인할 수 없었던 경우에만 `url: null`로 두며, 제목이나 추정한 ID로 URL을 만들어내지 않습니다. 확보한 원본 URL은 `catalog.json`에도 반영해 방문자가 해당 항목으로 이동할 수 있게 합니다.
- YouTube 조회수는 원래 화면에 보인 문자열을 보존합니다. `2.4천회` 같은 값의 `approximateValue`는 대략 환산값입니다.
- X/YouTube의 `hashtags`는 제목/본문에서 원문 표기를 추출한 목록입니다. X 활동 데이터는 공개 프로필에서 개별 게시물 URL과 내용을 확인한 경우에만 저장하며, 수동 발췌라도 게시물 링크/ID가 확인되지 않으면 데이터베이스와 화면용 카탈로그에 보존하지 않습니다. X 계정 파일에는 확인된 계정 링크만 두고 검증되지 않은 프로필 수치를 보관하지 않습니다. SOOP은 `title`에 원문을 보존하고, `titleText`에 선행 `[캐치]` 라벨을 뺀 문구, `seriesLabels`에 나머지 대괄호 라벨을 따로 둡니다.
- SOOP 캐치 뒤 숫자는 원문에 지표 이름이 없어 `type: unknown`으로 저장합니다. 조회수나 좋아요 수로 부르지 않습니다.
- 상대 날짜는 `publishedTimeRaw`에 그대로 남깁니다. 신뢰할 만한 캡처 시각 없이는 절대 날짜로 환산하지 않습니다.
- `observedAt: null`은 수집 시각을 알 수 없다는 뜻입니다. 프로필/조회수 수치는 현재 값이 아닌 관찰 당시 스냅샷입니다.
- 활동 데이터에는 플랫폼 로고, 썸네일, 영상, HTML 복사본, 플랫폼 소유 이미지를 저장하지 않습니다.
- YouTube 레코드는 공개 목록에서 읽은 ID와 링크를 원래 제목 기록에 연결합니다. `latestListingObservation`은 조회수 원문, 대략 환산값, 가능한 상대 게시 시각과 길이를 수집 당시 스냅샷으로 보존합니다.
- 카탈로그를 새로 만들 때는 `database/platforms/` 계정 스냅샷 및 기존 `catalog.json`을 입력으로 다시 포함하지 않습니다. 활동 JSON만 대상으로 하며 플랫폼별 / 유형별 분류를 유지합니다.

## Projects 데이터

- `database/projects/catalog.json`은 Projects 페이지에서 보여줄 프로젝트 JSON 경로를 나열합니다. `projects-app.js`가 각 경로를 읽어 카드로 렌더링합니다.
- 각 프로젝트 파일에는 소개, 기능, 제작 방식, 실행 주소와 GitHub 저장소 링크 등 확인된 정보를 둡니다. Projects 페이지에는 아카이브에 소개하기 적절한 자체 도구와 프로젝트만 등록합니다.
- 타인의 IP를 활용한 팬게임 자료는 Projects 데이터에 포함하지 않습니다. 프로젝트 소개 데이터는 Community 게시글 활동 기록과 별개로 관리합니다.

첫 번째 자료 배치 및 추출 범위는 [source/1 가져오기 요약](../docs/imports/source-1-summary.md)에 기록했습니다.

## 추가 수집 배치

- 공개 SOOP 캐치 목록 API에서 2026-10-31에 수집한 항목 및 페이지 수 차이는 [SOOP 공개 캐치 목록 수집 기록](../docs/imports/soop-api-collection-2026-10-31.md)에 정리했습니다.
- 이번 배치는 캐치 1,576개를 `soop/catches/`, 혼합 응답 중 클립 43개와 일반 VOD 7개를 `soop/clips/`, `soop/vods/`에 저장했습니다. 원본 영상 및 썸네일은 저장하지 않았습니다.

- SOOP 방송국 VOD 목록(`/station/rose5369/vod`)은 공개 API `vods/all`로 50개(클립 43, 일반 VOD 7)를 확인했습니다. `soop/clips/`와 `soop/vods/`에 기록하며, 상세는 [SOOP 수집 보고서](../docs/imports/soop-api-collection-2026-10-31.md)에 있습니다.

- YouTube 공개 Shorts 목록 45개와 동영상 목록 15개는 기존 원문 기반 60개 레코드와 제목이 모두 일치해, 중복 파일 대신 각 레코드에 플랫폼 ID·링크·최신 목록 관측값을 보강했습니다. Shorts 기록은 `youtube/shorts/undated/`, 동영상 기록은 `youtube/videos/undated/`에 있습니다. 세부 범위와 한계는 [YouTube 목록 수집 기록](../docs/imports/youtube-tabs-2026-10-31.md)을 참고하세요.

- X 공개 프로필 응답에서 확인한 게시물 5개만 유지합니다. 초기 수동 입력 9개는 개별 URL/ID로 확인할 수 없어 2026-11-01에 개별 JSON과 카탈로그에서 제거했습니다. 계정 프로필 JSON에는 사용자가 제공한 URL과 핸들만 남겼습니다. 접근 범위와 제거 내역은 [X 수집 기록](../docs/imports/x-profile-2026-10-31.md)에 정리했습니다.

- 2026-11-01에 VLUP Naver Cafe의 작성자 검색 별칭 4개에서 게시물 177개를 `naver-cafe/vlup/posts/`에 추가했고, 공개 본문 API로 다시 확인해 텍스트와 링크 참조를 보강했습니다. 169건은 본문 텍스트가 있고 8건은 저장할 수 있는 텍스트가 비어 있습니다. 본문 링크는 일반 링크 108건과 이미지 URL 참조 624건이며, 미디어 파일은 내려받지 않았습니다. Community 카드에서 카페 원문과 저장된 본문을 각각 열 수 있습니다. 수집 경위와 검색 범위는 [VLUP Naver Cafe 수집 기록](../docs/imports/naver-cafe-vlup-2026-11-01.md)을 참고하세요.

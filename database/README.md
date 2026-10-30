# 데이터베이스 파일 규칙

`database/`는 정적 텍스트·메타데이터 아카이브입니다. 활동 JSON 파일 하나에 게시물, 동영상 목록 항목, SOOP 캐치 등 활동 흔적 하나를 저장합니다. 개별 URL이나 플랫폼 ID가 없어 같은 제목이 반복되어도 중복으로 합치지 않습니다.

## 경로

- `platforms/*.json`: 계정 링크와 변동 가능한 프로필 스냅샷
- `x/posts/YYYY/MM/`: 날짜가 명시된 X 게시물
- `youtube/videos/undated/`: 절대 게시일과 개별 링크를 확인할 수 없는 YouTube 목록 항목
- `soop/catches/YYYY/MM/`: 날짜가 명시된 SOOP 캐치
- `soop/catches/relative-or-unknown-date/`: 상대 시각만 확인되는 캐치

## 필드 처리

- `sourceBatch`, `sourceLine`은 가능한 경우 원본 자료와 행 위치를 가리킵니다.
- 개별 링크가 없는 경우 `url: null`로 두며, 제목에서 URL을 만들어내지 않습니다.
- YouTube 조회수는 원래 화면에 보인 문자열을 보존합니다. `2.4천회` 같은 값의 `approximateValue`는 대략 환산값입니다.
- X/YouTube의 `hashtags`는 제목/본문에서 원문 표기를 추출한 목록입니다. SOOP은 `title`에 원문을 보존하고, `titleText`에 선행 `[캐치]` 라벨을 뺀 문구, `seriesLabels`에 나머지 대괄호 라벨을 따로 둡니다.
- SOOP 캐치 뒤 숫자는 원문에 지표 이름이 없어 `type: unknown`으로 저장합니다. 조회수나 좋아요 수로 부르지 않습니다.
- 상대 날짜는 `publishedTimeRaw`에 그대로 남깁니다. 신뢰할 만한 캡처 시각 없이는 절대 날짜로 환산하지 않습니다.
- `observedAt: null`은 수집 시각을 알 수 없다는 뜻입니다. 프로필/조회수 수치는 현재 값이 아닌 관찰 당시 스냅샷입니다.
- 활동 데이터에는 플랫폼 로고, 썸네일, 영상, HTML 복사본, 플랫폼 소유 이미지를 저장하지 않습니다.

첫 번째 자료 배치 및 추출 범위는 [source/1 가져오기 요약](../docs/imports/source-1-summary.md)에 기록했습니다.

## 추가 수집 배치

- 공개 SOOP 캐치 목록 API에서 2026-10-31에 수집한 항목 및 페이지 수 차이는 [SOOP 공개 캐치 목록 수집 기록](../docs/imports/soop-api-collection-2026-10-31.md)에 정리했습니다.
- 이번 배치는 캐치 1,576개를 `soop/catches/`, 혼합 응답 중 클립 43개와 일반 VOD 7개를 `soop/clips/`, `soop/vods/`에 저장했습니다. 원본 영상 및 썸네일은 저장하지 않았습니다.

- SOOP 방송국 VOD 목록(`/station/rose5369/vod`)은 공개 API `vods/all`로 50개(클립 43, 일반 VOD 7)를 확인했습니다. `soop/clips/`와 `soop/vods/`에 기록하며, 상세는 [SOOP 수집 보고서](../docs/imports/soop-api-collection-2026-10-31.md)에 있습니다.

- YouTube 공개 Shorts 목록 45개와 동영상 목록 15개는 기존 원문 기반 60개 레코드와 제목이 모두 일치해, 중복 파일 대신 각 레코드에 플랫폼 ID·링크·최신 목록 관측값을 보강했습니다. Shorts 기록은 `youtube/shorts/undated/`, 동영상 기록은 `youtube/videos/undated/`에 있습니다. 세부 범위와 한계는 [YouTube 목록 수집 기록](../docs/imports/youtube-tabs-2026-10-31.md)을 참고하세요.

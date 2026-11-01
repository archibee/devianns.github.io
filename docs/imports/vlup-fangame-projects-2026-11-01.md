# V-LUP 팬게임 프로젝트 자료 정리

2026-11-01에 Projects 화면용으로 정리한 팬게임 자료입니다. 두 팬게임은 Community 게시물 목록에 새 활동으로 중복 등록하지 않고, 각각 프로젝트 JSON 하나로 관리합니다. 카페 소개 게시글은 프로젝트 안내와 배포본을 찾는 출처 링크로 사용합니다.

## 프로젝트

| 프로젝트 | 카페 소개 게시글 | 게시글 날짜 | GitHub 저장소 | 프로젝트 JSON |
| --- | --- | --- | --- | --- |
| 스타 세이비어 시트리 | [시트리 팬게임 소개](https://cafe.naver.com/f-e/cafes/30653039/articles/39757?menuid=153&referrerAllArticles=false) | 2026-08-02 | [devianns/vlup-savior-sitry](https://github.com/devianns/vlup-savior-sitry) | [`star-savior-sitry.json`](../../database/projects/star-savior-sitry.json) |
| 차미 당도 연구소 | [시트리 팬게임 소개](https://cafe.naver.com/f-e/cafes/30653039/articles/40609?menuid=153&referrerAllArticles=false) | 2026-10-15 | [devianns/sugarchami](https://github.com/devianns/sugarchami) | [`sugar-chami-lab.json`](../../database/projects/sugar-chami-lab.json) |

첫 프로젝트의 카페 소개 게시글은 15분 생존, WASD/방향키 조작, 1·2·3 증강 선택, 스테이지·무기·몬스터와 하드/헬 모드를 안내합니다. 두 번째는 당도 측정 및 수집, 연구 카드와 미니게임 8종, 랭킹 및 모바일 지원을 안내합니다. 두 소개와 저장소 안내에서 AI 생성 이미지 사용 표시를 확인해 프로젝트 자료에 반영했습니다.

## 배포 지침과 화면 표시

가이드라인 게시글은 [V-LUP 카페 원문 #36148](https://cafe.naver.com/f-e/cafes/30653039/articles/36148?menuid=153&referrerAllArticles=false)입니다. Projects 화면은 두 카드 모두에 다음 핵심 안내를 상시 표시합니다.

> 게임 실행과 배포본은 V-LUP 공식 카페 게시글을 통해 확인해 주세요. 이 페이지에서는 외부 호스팅의 게임 실행 주소로 직접 연결하지 않습니다.

가이드라인의 세부 요약은 [`guidelines/vlup-fangame-guideline.json`](../../database/projects/guidelines/vlup-fangame-guideline.json)에 있습니다. 이 요약은 [Sugarchami 저장소에 포함된 지침 사본](https://github.com/devianns/sugarchami/blob/main/VLUP_GUIDELINE.md)을 바탕으로 작성했습니다. 이 환경에서는 카페 원문을 직접 열어 현재 판본과 대조하지 못했으므로, 사전 공개 통보, 비영리·배포 경로 제한, 표기 의무 등 구체 조건은 배포 전에 카페 원문에서 다시 확인해야 합니다. 요약은 허가나 준수 보증이 아닙니다.

프로젝트 카드에는 GitHub 저장소와 카페 소개 게시글, 지침 원문 링크를 제공하며 Vercel 등 별도 호스팅의 게임 실행 주소는 두지 않습니다. 배포 안내가 있는 경우 공식 카페 게시글을 통해 배포본을 찾도록 합니다. 저장소에 배포 명령이나 배포 주소가 있더라도 이를 공개 배포 허가로 해석하지 않습니다.

## 축적 원칙

- 프로젝트 소개 데이터는 `database/projects/`에서 프로젝트별 JSON으로 관리하고 `database/projects/catalog.json`에 등록합니다.
- 팬게임 소개 게시글은 프로젝트의 출처/안내 링크로 참조합니다. 이 작업에서 동일 게시글의 Community 레코드를 새로 만들거나 기존 활동 레코드를 교체하지 않았습니다.
- 원본 게임 파일, 이미지, 미디어는 이 아카이브에 복제하지 않습니다. 작품 정보와 텍스트 메타데이터, 출처 링크만 기록합니다.
- 가이드라인은 공통 JSON 하나를 두 프로젝트에 연결해 안내 문구가 서로 달라지지 않게 합니다.

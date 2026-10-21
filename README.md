# 말씀톡 웹 프로토타입 (PWA형, 배포 안 함)
실행: `cd /workspace/christian/bible-chat-app && python3 -m http.server 8792` → http://127.0.0.1:8792/ (모바일 화면 기준)
- 성경 본문: data/krv(개역한글, github.com/thiagobodruk/bible ko_krv.json — 성경전서 개역한글판 © 대한성서공회 (저작재산권 보호기간 만료); 주요 32구절을 bskorea.or.kr 개역한글과 대조해 일치 확인), data/kjv(KJV, 퍼블릭 도메인). 66권 책별 JSON.
- 모든 답변 구절은 참조만 지정 → parseRef로 장/절 범위 검증 → DB 본문 삽입. `node validate_refs.js` 로 데모 참조 전수 검사.
- 데모 모드(기본, 오프라인): chars.js의 키워드 매칭 답변. AI 모드: ⚙에서 OpenAI 호환 URL/모델/키 입력(브라우저 저장 — 프로토타입 전용).
- 구독 화면은 모의(결제 없음). 이미지: IMAGES_NEEDED.txt (images/<id>-<smile|worry|talk|flustered>.jpg). 없으면 이니셜 플레이스홀더.

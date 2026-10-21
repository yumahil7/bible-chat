// 함께 돕기: 공식 후원 페이지로 링크만 연결 (앱 안에서 결제·금전 처리 없음). 2026-10-21 접속 확인.
window.DONATE=[
 {org:"월드비전",desc:"기독교 국제구호개발 NGO",links:[
  ["해외아동 결연 (아프리카 포함, 대륙 선택)","https://www.worldvision.or.kr/supportGuide/overseaChildSearch"],
  ["긴급구호 후원","https://www.worldvision.or.kr/supportGuide/emergency"]]},
 {org:"한국컴패션",desc:"그리스도의 사랑으로 어린이를 양육하는 국제어린이양육기구",links:[
  ["1:1 어린이양육","https://www.compassion.or.kr/sponsor/children"],
  ["주제별 양육보완 (긴급재난 돕기 등)","https://www.compassion.or.kr/sponsor/special/"]]},
 {org:"희망친구 기아대책",desc:"기독교 국제구호개발 NGO (해외아동결연·긴급구호)",links:[
  ["공식 홈페이지 (후원 › 해외아동결연)","https://www.kfhi.or.kr/"]]},
 {org:"굿네이버스",desc:"국제구호개발 NGO",links:[
  ["해외아동 1:1 결연","https://www.goodneighbors.kr/support/relationship/one20.gn"],
  ["인도적지원·긴급구호","https://www.goodneighbors.kr/business/global_relief/emergency.gn"]]}];
window.donateHTML=(short)=>`<div class="card help"><b>🤝 함께 돕기</b><p class="note">후원은 각 단체 공식 사이트에서 진행됩니다. 이 앱은 결제나 후원금을 다루지 않으며, 링크만 연결합니다.</p>
 ${DONATE.map(o=>`<div class="org"><b>${o.org}</b> <span class="note">${o.desc}</span>${o.links.slice(0,short?1:9).map(([t,u])=>`<a class="dl" href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a>`).join('')}</div>`).join('')}</div>`;

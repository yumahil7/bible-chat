// 재난 기도 모드: 수동 alerts.json + 공식 무료 피드(GDACS 주황/적색, USGS 지진) 자동 감지. 선정적 표현 없이, 검증된 말씀 + 기도.
window.ALERT_CFG={days:7,usgsMin:5.5,krBox:[32,40,123,132],krMin:3.5};
window.ALERT_VERSES={EQ:["시 46:1-2","사 54:10"],TC:["시 107:29","사 43:2"],FL:["사 43:2","시 46:1"],VO:["시 46:1-2","나 1:7"],WF:["사 43:2","시 46:1"],DR:["사 41:17","시 23:1"],default:["시 34:18","롬 12:15"]};
const KO_TYPE={EQ:"지진",TC:"태풍",FL:"홍수",VO:"화산 분화",WF:"산불",DR:"가뭄",TS:"쓰나미"};
const KO_C={"Turkey":"튀르키예","Türkiye":"튀르키예","Japan":"일본","China":"중국","Taiwan":"대만","Philippines":"필리핀","Indonesia":"인도네시아","Vanuatu":"바누아투","Russia":"러시아","Pakistan":"파키스탄","India":"인도","Nepal":"네팔","Afghanistan":"아프가니스탄","Iran":"이란","Iraq":"이라크","Syria":"시리아","Greece":"그리스","Italy":"이탈리아","Mexico":"멕시코","Chile":"칠레","Peru":"페루","Ecuador":"에콰도르","Colombia":"콜롬비아","Guatemala":"과테말라","United States":"미국","Alaska":"미국 알래스카","California":"미국 캘리포니아","Hawaii":"미국 하와이","Canada":"캐나다","New Zealand":"뉴질랜드","Papua New Guinea":"파푸아뉴기니","Solomon Islands":"솔로몬 제도","Tonga":"통가","Fiji":"피지","Myanmar":"미얀마","Thailand":"태국","Vietnam":"베트남","Viet Nam":"베트남","Bangladesh":"방글라데시","Morocco":"모로코","Algeria":"알제리","Haiti":"아이티","Cuba":"쿠바","Guam":"괌","Northern Mariana Islands":"북마리아나 제도","South Korea":"대한민국","Korea":"한국","North Korea":"북한","Mongolia":"몽골","Australia":"호주","Argentina":"아르헨티나","Bolivia":"볼리비아","Kenya":"케냐","Ethiopia":"에티오피아","Sudan":"수단","Spain":"스페인","Portugal":"포르투갈","France":"프랑스","Germany":"독일","Ukraine":"우크라이나","Tajikistan":"타지키스탄","Kyrgyzstan":"키르기스스탄","Kazakhstan":"카자흐스탄","Malaysia":"말레이시아","Sri Lanka":"스리랑카","Mozambique":"모잠비크","Madagascar":"마다가스카르","Honduras":"온두라스","Nicaragua":"니카라과","El Salvador":"엘살바도르","Costa Rica":"코스타리카","Panama":"파나마","Dominican Republic":"도미니카 공화국","Puerto Rico":"푸에르토리코","Iceland":"아이슬란드"};
const koC=c=>{c=(c||"").trim();return KO_C[c]||c;};
const koList=s=>{const a=String(s||"").split(",").map(x=>x.trim()).filter(Boolean);const k=a.slice(0,2).map(koC).join("·");return a.length>2?k+` 등 ${a.length}개국`:k;};
const within=t=>Date.now()-t<ALERT_CFG.days*864e5;
async function j(u){const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(r.status);return r.json();}
async function fManual(){try{const d=await j("alerts.json");return(d.alerts||[]).filter(a=>a.active).map(a=>({...a,src:"manual"}));}catch{return[];}}
async function fGDACS(){const d=await j("https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP");
 return d.features.map(f=>f.properties).filter(p=>["Orange","Red"].includes(p.alertlevel)&&(p.eventtype!=="DR"||p.alertlevel==="Red")&&(p.iscurrent==="true"||p.iscurrent===true||within(Date.parse(p.todate||p.fromdate))))
 .map(p=>{const t=p.eventtype,where=koList(p.country||p.name),mag=t==="EQ"&&p.severitydata?.severity;
  const title=t==="EQ"&&mag?`${where} 규모 ${(+mag).toFixed(1)} 지진`:t==="TC"?`${where} 태풍 ${p.eventname||""}`.trim():`${where} ${KO_TYPE[t]||"재난"}`;
  return{id:`gdacs-${p.eventid}`,type:t,title,level:p.alertlevel,date:p.fromdate,source:"GDACS",url:p.url?.report||"https://www.gdacs.org",country:p.country,src:"gdacs",score:p.alertlevel==="Red"?3:2};});}
const usgsTitle=p=>{const pl=p.place||"";const c=pl.includes(",")?pl.split(",").pop():pl.replace(/^.* of /,"");return`${koC(c)} 규모 ${(+p.mag).toFixed(1)} 지진`;};
async function fUSGS(){const [sig,m45]=await Promise.all([j("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"),j("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson")]);
 const m=new Map();[...sig.features,...m45.features.filter(f=>f.properties.mag>=ALERT_CFG.usgsMin)].forEach(f=>m.set(f.id,f));
 return[...m.values()].map(f=>({id:`usgs-${f.id}`,type:"EQ",title:usgsTitle(f.properties),mag:f.properties.mag,date:new Date(f.properties.time).toISOString(),source:"USGS",url:f.properties.url,src:"usgs",place:f.properties.place,score:f.properties.mag>=7?3:f.properties.mag>=6?2:1}));}
async function fKorea(){const[a,b,c,d]=ALERT_CFG.krBox,st=new Date(Date.now()-ALERT_CFG.days*864e5).toISOString().slice(0,10);
 const r=await j(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${st}&minlatitude=${a}&maxlatitude=${b}&minlongitude=${c}&maxlongitude=${d}&minmagnitude=${ALERT_CFG.krMin}`);
 return r.features.map(f=>({id:`usgs-${f.id}`,type:"EQ",title:`한반도 인근 규모 ${(+f.properties.mag).toFixed(1)} 지진`,mag:f.properties.mag,date:new Date(f.properties.time).toISOString(),source:"USGS",url:f.properties.url,src:"usgs-kr",score:4,near:true}));}
window.FEED_STATUS={};
async function loadAlerts(){const feeds={manual:fManual,gdacs:fGDACS,usgs:fUSGS,korea:fKorea};let all=[];
 await Promise.all(Object.entries(feeds).map(async([k,f])=>{try{const r=await f();FEED_STATUS[k]=`OK ${r.length}`;all.push(...r);}catch(e){FEED_STATUS[k]="실패 "+e.message;}}));
 // 중복 제거: USGS 지진과 같은 날 GDACS 지진은 USGS 우선
 const seen=new Map();for(const a of all){seen.set(a.id,a);}all=[...seen.values()];
 all=all.filter(a=>!(a.src==="gdacs"&&a.type==="EQ"&&all.some(u=>u.src.startsWith("usgs")&&Math.abs(Date.parse(u.date)-Date.parse(a.date))<864e5)));
 all.sort((x,y)=>(y.score||0)-(x.score||0)||Date.parse(y.date)-Date.parse(x.date));return all;}
async function alertBanner(el){const dis=LS.get('alert_dismiss',[]);let list;try{list=(await loadAlerts()).filter(a=>!dis.includes(a.id));}catch{return false;}
 if(!list.length||!el)return false;const a=list[0],refs=ALERT_VERSES[a.type]||ALERT_VERSES.default;const v=await verse(refs[0]),jv=await verse(DISASTER_JESUS);
 const pray=`하나님, ${a.title.replace(/ 규모.*$/,'')} 소식 앞에 마음을 모읍니다. 다친 이들과 가족을 잃은 이들을 위로하시고, 구조하는 손길에 힘을 더하시며, 갈 곳 잃은 이들에게 피난처가 되어 주세요. 예수님의 이름으로 기도합니다. 아멘.`;
 if(!el.isConnected)return false;el.innerHTML=`<div class="alertb"><div class="ah" id="ah">🕊 함께 기도해요 · <b>${esc(a.title)}</b> <span class="note">▾</span></div>
 <div class="ab" id="ab" hidden><p class="note">${esc(a.source)} 공식 정보 기준 · ${new Date(a.date).toLocaleDateString('ko-KR')} · <a href="${esc(a.url)}" target="_blank" rel="noopener">자세히</a></p>
 ${v?verseCard(v):''}<p class="pray">🙏 ${pray}</p><div class="jline">${pic("jesus","smile","av reverent","예")}<span class="note">복음서가 전하는 예수님의 말씀</span></div>${jv?verseCard(jv):""}
 ${list.length>1?`<details><summary class="note">다른 기도 제목 ${list.length-1}건</summary>${list.slice(1,6).map(x=>`<div class="note">· ${esc(x.title)} (${esc(x.source)})</div>`).join('')}</details>`:''}
 <a class="btn g" href="#help">🤝 함께 돕기</a> <button class="btn" id="adis">이 알림 닫기</button></div></div>`;
 $('#ah').onclick=()=>{$('#ab').hidden=!$('#ab').hidden;};$('#adis').onclick=()=>{dis.push(a.id);LS.set('alert_dismiss',dis);el.innerHTML='';if(window.onAlertClosed)onAlertClosed();};return true;}

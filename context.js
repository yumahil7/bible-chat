// 날씨·시간대·주일 맥락 배너: Open-Meteo(키 불필요) + 위치(이미 허용된 경우만, 아니면 서울). 재난 배너가 우선.
window.CTX={
 rain:{label:"비 오는 날",c:"elijah",t:"비가 오네요. 가뭄 끝에 큰 비를 보았던 날이 생각나요.",ref:"시 147:8",p:"비 오는 길 위의 모든 이들을 안전하게 지켜 주세요."},
 cloudy:{label:"흐린 날",c:"moses",t:"구름이 낀 하늘을 보면, 광야에서 우리를 인도하던 구름 기둥이 떠오른다네.",ref:"출 13:21",p:"흐린 날에도 우리 길을 인도하심을 믿게 해 주세요."},
 clear:{label:"맑은 날",c:"david-boy",t:"하늘이 정말 맑아요! 들판에서 이런 하늘을 보며 노래했어요.",ref:"시 19:1",p:"오늘의 맑은 하늘처럼 마음도 밝게 해 주세요."},
 hot:{label:"무더운 날 (30℃ 이상)",c:"jonah",t:"햇볕이 뜨겁죠… 저도 박넝쿨 그늘 아래서 더위를 피했어요.",ref:"시 121:5-6",p:"무더위 속에 일하는 이들과 약한 이들을 지켜 주세요."},
 cold:{label:"추운 날 (0℃ 미만)",c:"job",t:"날이 차네요. 눈과 비를 다스리시는 분을 생각해 봐요.",ref:"욥 37:6",p:"추위 속에 머물 곳 없는 이웃들에게 따뜻한 손길이 닿게 해 주세요."},
 morning:{label:"아침",c:"daniel",t:"좋은 아침이에요. 저는 하루를 기도로 시작했어요.",ref:"시 5:3",p:"오늘 하루의 첫 마음을 주님께 드립니다."},
 night:{label:"밤",c:"david-boy",t:"밤이 깊었어요. 오늘 하루도 수고했어요.",ref:"시 4:8",p:"오늘의 걱정을 내려놓고 평안히 잠들게 해 주세요."},
 sunday:{label:"주일",c:"peter",t:"오늘은 주일이에요! 주님이 부활하신 첫날을 기억하는 날이죠.",ref:"시 118:24",p:"오늘 예배하는 모든 교회와 성도들에게 은혜를 더해 주세요."}};
const SEOUL=[37.5665,126.978];
async function ctxPos(){try{const st=await navigator.permissions?.query({name:'geolocation'});if(st&&st.state==='granted')return await new Promise(r=>navigator.geolocation.getCurrentPosition(p=>r([p.coords.latitude,p.coords.longitude,'내 위치']),()=>r([...SEOUL,'서울']),{timeout:3000,maximumAge:6e5}));}catch{}return[...SEOUL,'서울'];}
async function ctxWeather(){const[la,lo,where]=await ctxPos();const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code,is_day&timezone=auto`);const d=(await r.json()).current;return{...d,where};}
function ctxTriggers(w,now=new Date()){const t=[],c=w?.weather_code,T=w?.temperature_2m,h=now.getHours();
 if(w){if([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(c))t.push('rain');if(T>30)t.push('hot');if(T<0)t.push('cold');}
 if(now.getDay()===0)t.push('sunday');if(h>=5&&h<10)t.push('morning');if(h>=21||h<4)t.push('night');
 if(w){if([2,3,45,48,71,73,75,77,85,86].includes(c))t.push('cloudy');else if([0,1].includes(c))t.push('clear');}return t;}
async function contextBanner(el){if(!el)return;let w=null;try{w=await ctxWeather();}catch{}
 const force=new URLSearchParams(location.search).get('ctx');const seen=JSON.parse(sessionStorage.getItem('ctx_seen')||'[]');
 const k=force&&CTX[force]?force:ctxTriggers(w).find(x=>!seen.includes(x));if(!k)return;const x=CTX[k],ch=CHARS.find(c=>c.id===x.c),v=await verse(x.ref),jv=await verse(CTX_JESUS[k]);
 const wx=w?` · ${w.where} ${Math.round(w.temperature_2m)}℃`:'';
 if(!el.isConnected)return;el.innerHTML=`<div class="ctxb"><button class="cx" id="cx" aria-label="닫기">✕</button><div class="ctop">${pic(ch.id,'smile','av',ch.name)}<div><span class="note">${x.label}${wx}</span><br><b>${ch.name}</b> ${esc(x.t)}</div></div>${v?verseCard(v):''}<p class="pray">🙏 ${esc(x.p)} 아멘.</p><div class="jline">${pic("jesus","smile","av reverent","예")}<span class="note">복음서가 전하는 예수님의 말씀</span></div>${jv?verseCard(jv):""}</div>`;
 $('#cx').onclick=()=>{seen.push(k);sessionStorage.setItem('ctx_seen',JSON.stringify(seen));el.innerHTML='';};window.__ctx={k,w};}

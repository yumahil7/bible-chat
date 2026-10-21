// 말씀톡 프로토타입 — 성경 본문은 오직 data/<번역본>/<책>.json 에서만 가져옴 (LLM 생성 금지)
const $=s=>document.querySelector(s), V=$('#view');
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const TR={krv:'개역한글',kjv:'KJV'};
const ATTR={krv:'성경전서 개역한글판 © 대한성서공회 (저작재산권 보호기간 만료)',kjv:'KJV: Public Domain'};
const attrAll=`<p class="note">📜 ${ATTR.krv}<br>📜 ${ATTR.kjv}<br>성경 본문은 원문 그대로이며 수정하지 않았습니다.</p>`; let BOOKS=[], SH={}, cache={};
const EXPR={smile:'웃음',worry:'고민',talk:'말하기',flustered:'당황'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---- 성경 DB ----
function parseRef(r){const m=String(r).trim().match(/^(\S+)\s*(\d+):(\d+)(?:-(\d+))?$/);if(!m)return null;
 const b=SH[m[1]];if(b==null)return null;const c=+m[2],v1=+m[3],v2=m[4]?+m[4]:v1,bk=BOOKS[b];
 if(c<1||c>bk.chs.length||v1<1||v2<v1||v2>bk.chs[c-1])return null;return{b,c,v1,v2};}
async function book(b,tr){const k=tr+b;if(!cache[k])cache[k]=await (await fetch(`data/${tr}/${b}.json`)).json();return cache[k];}
async function verse(ref,tr=LS.get('tr','krv')){const p=parseRef(ref);if(!p)return null;const bk=await book(p.b,tr);
 const t=[];for(let v=p.v1;v<=p.v2;v++)t.push(bk[p.c-1][v-1]);return{ref:`${BOOKS[p.b].ko} ${p.c}:${p.v1}${p.v2>p.v1?'-'+p.v2:''}`,short:ref,text:t.join(' '),tr:TR[tr],p};}
function verseCard(v){return `<div class="verse" data-ref="${esc(v.short)}"><b>📖 ${esc(v.ref)} (${v.tr})</b><p>${esc(v.text)}</p></div>`;}
document.addEventListener('click',e=>{const d=e.target.closest('.verse');if(d)openChapter(d.dataset.ref);});

async function openChapter(ref){const p=parseRef(ref),tr=LS.get('tr','krv'),bk=await book(p.b,tr),ch=bk[p.c-1];const v=await verse(ref);
 sheet(`<h3>${BOOKS[p.b].ko} ${p.c}장 <small class="note">${TR[tr]}</small></h3>
 <button class="btn g" id="sv">🔖 저장</button><button class="btn" id="sh">공유</button><button class="btn" onclick="closeSheet()">닫기</button>
 <p class="note">📜 ${ATTR[tr]}</p><div class="cv">${ch.map((t,i)=>`<p id="v${i+1}" class="${i+1>=p.v1&&i+1<=p.v2?'hl':''}"><sup>${i+1}</sup>${esc(t)}</p>`).join('')}</div>`);
 $('#v'+p.v1).scrollIntoView({block:'center'});if(window.cameo)cameo(ref);
 $('#sv').onclick=()=>{const s=LS.get('saved',[]);if(!s.includes(ref)){s.unshift(ref);LS.set('saved',s);}$('#sv').textContent='✔ 저장됨';};
 $('#sh').onclick=()=>share(v);}
async function share(v){const t=`${v.text}\n— ${v.ref} (${v.tr})\n#말씀톡`;try{if(navigator.share)await navigator.share({text:t});else{await navigator.clipboard.writeText(t);alert('복사했어요');}}catch{}}
function sheet(h){$('#sheet').innerHTML=`<div class="in">${h}</div>`;$('#sheet').hidden=false;}
window.closeSheet=()=>{$('#sheet').hidden=true;};$('#sheet').onclick=e=>{if(e.target.id==='sheet')closeSheet();};

// ---- 화면 ----
const img=(id,ex,small=true)=>{if(id==='host')return`images/host-${ex}${small?'-sm':''}.webp`;const P=window.PORTRAIT&&PORTRAIT[id];if(P)return`images/c/${P.expr&&id!=='jesus'?id+'-'+ex:id}${small?'-sm':''}.webp`;return`images/${id}-${ex}.jpg`;};
const nid=n=>{const k=String(n).replace(/[\s()]/g,'');return Object.keys(window.PORTRAIT||{}).find(i=>(PORTRAIT[i].name||'').replace(/[\s()]/g,'')===k);};
const pic=(id,ex,cls,name)=>`<img class="${cls||''}" src="${img(id,ex,/\b(av|cav)\b/.test(cls||''))}" onerror="this.outerHTML='<div class=\\'ph ${cls||''}\\'>${name?name[0]:'✝'}</div>'">`;
function title(t,back){$('#title').textContent=t;$('#back').hidden=!back;}
$('#back').onclick=()=>go(location.hash.startsWith('#help')?'home':'chars');document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#setBtn').onclick=settings;

async function daily(){const day=Math.floor((Date.now()+9*36e5)/864e5),J=day%2===1,ref=J?JESUS_DAILY[(day>>1)%JESUS_DAILY.length]:DAILY[(day>>1)%DAILY.length],v=await verse(ref),who=cameoWho(ref);
 return{html:`<div class="card"><div class="dtop">${who?pic(who.id,'smile','av'+(who.id==='jesus'?' reverent':''),'?'):pic('host','smile','av','빛')}<div><b>☀ 오늘의 말씀</b>${J?' <span class="note">· 복음서가 전하는 예수님의 말씀</span>':''}</div></div>${verseCard(v)}<button class="btn g" id="dsv">🔖 저장</button><button class="btn" id="dsh">공유</button></div>
 <div class="card"><b>✝ ${JESUS.name}</b><p class="note">${JESUS.intro}</p><button class="btn" onclick="go('chat','jesus')">말씀 듣기</button></div>
 <div class="card"><b>🎬 쇼츠 「성경, 개봉박두」 ep1 다윗과 골리앗</b><p class="note">쇼츠에서 본 다윗과 직접 이야기해 보세요.</p><button class="btn" onclick="go('chat','david-boy')">다윗과 대화하기</button></div>`,bind(){$('#dsv').onclick=()=>{const s=LS.get('saved',[]);if(!s.includes(ref))s.unshift(ref);LS.set('saved',s);$('#dsv').textContent='✔ 저장됨';};$('#dsh').onclick=()=>share(v);}};}
const cc=c=>`<div class="ch" onclick="go('chat','${c.id}')">${pic(c.id,'smile','',c.name)}<div class="n">${c.name}<small>${c.age} · ${c.tags.join(' ')}</small></div></div>`;
const disc=()=>`<p class="note">⚠ AI가 만든 대화입니다. 성경 본문은 번역본 원문을 그대로 표시하며, 신앙 상담은 섬기는 교회 목회자와 함께하세요.</p>${attrAll}`;
async function chars(){title('인물');const prem=LS.get('premium',false);const d=await daily();
 V.innerHTML=d.html+`<h3>무료</h3><div class="grid">${CHARS.map(cc).join('')}</div><h3>프리미엄 ${prem?'(체험 중)':'🔒'}</h3>
 <div class="grid">${LOCKED.map(n=>`<div class="ch" onclick="${prem?"alert('프로토타입: 대화 데이터 준비 중인 인물입니다')":"go('premium')"}">${nid(n)?pic(nid(n),'smile','',n):`<div class="ph">${n[0]}</div>`}${prem?'':'<span class="lock">🔒</span>'}<div class="n">${n}</div></div>`).join('')}</div>${disc()}`;d.bind();}
async function saved(){title('내 말씀함');const s=LS.get('saved',[]);let h='';for(const r of s){const v=await verse(r);if(v)h+=`<div class="card">${verseCard(v)}<button class="btn" data-del="${esc(r)}">삭제</button></div>`;}
 V.innerHTML=h||'<p class="note">아직 저장한 말씀이 없어요. 구절 카드를 눌러 장 전체를 열고 🔖 저장하세요.</p>';
 V.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{LS.set('saved',s.filter(x=>x!==b.dataset.del));saved();});}
function premium(){title('프리미엄');const p=LS.get('premium',false);
 V.innerHTML=`<div class="card"><h2>⭐ 말씀톡 프리미엄</h2><p class="note">⚠ 모의 화면입니다. 실제 결제는 일어나지 않습니다. (가격은 기획안의 제안가)</p>
 <ul><li>49명 전체 인물과 대화</li><li>대화 무제한 (공정 사용 한도)</li><li>인물별 읽기 플랜·묵상 노트</li><li>공유 카드 워터마크 제거</li></ul>
 <p><b>월 4,900원</b> 또는 <b>연 39,000원</b> (제안) · 7일 무료 체험</p>
 <p class="note">성경 읽기·오늘의 말씀·예수님 말씀 듣기는 언제나 무료입니다.</p>
 <button class="btn g" id="tg">${p?'체험 해제':'모의 체험 시작'}</button></div>`;
 $('#tg').onclick=()=>{LS.set('premium',!p);premium();};}

// ---- 채팅 ----
let cur=null;
function chat(id){const J=id==='jesus';cur=J?JESUS:CHARS.find(c=>c.id===id);title(J?JESUS.name:cur.name,true);
 const hist=[],G=window.ROUTE_GEN;
 V.innerHTML=`<div class="chatTop">${J?pic('jesus','smile','portrait reverent','예'):pic(id,'talk','portrait',cur.name)}<div><b>${J?JESUS.name:cur.name}</b><div class="note">${J?JESUS.intro:cur.intro}</div><div class="note" id="mode">${llm()?'🤖 AI 모드':'🎭 데모 모드(오프라인)'}</div></div></div>
 <div class="msgs" id="msgs"></div><div class="chips">${(J?['너무 지쳤어요','내일이 걱정돼요','두려워요']:['두려워요','실패했어요','혼자인 것 같아요','기도가 힘들어요']).map(x=>`<button>${x}</button>`).join('')}</div>${disc()}
 <div class="inp"><input id="q" placeholder="메시지를 입력하세요"><button id="sd">보내기</button></div>`;
 const M=$('#msgs');if(!hist.length)hist.push({r:'c',t:J?'복음서에 기록된 예수님의 말씀을 그대로 전해 드립니다. 마음을 나눠 주세요.':cur.greet});
 hist.forEach(h=>addMsg(h,false));
 const send=async t=>{t=t.trim();if(!t)return;$('#q').value='';const u={r:'u',t};hist.push(u);addMsg(u);
  if(!LS.get('premium',false)){const k='cnt_'+new Date().toDateString(),n=LS.get(k,0)+1;LS.set(k,n);if(n>20){addMsg({r:'c',t:'오늘 무료 대화 20회를 모두 사용했어요. (모의) 프리미엄에서 계속할 수 있어요.'});return;}}
  const rep=await reply(t,hist);if(G!==window.ROUTE_GEN)return;hist.push(rep);addMsg(rep);};
 $('#sd').onclick=()=>send($('#q').value);$('#q').onkeydown=e=>{if(e.key==='Enter')send(e.target.value);};
 V.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>send(b.textContent));}
async function addMsg(h,scroll=true){const M=$('#msgs');const d=document.createElement('div');d.className='m '+h.r;d.textContent=h.t;M.appendChild(d);
 if(h.ref){const v=await verse(h.ref);if(v)d.insertAdjacentHTML('beforeend',verseCard(v));}
 if(h.e&&cur&&cur.id!=='jesus'){const p=document.querySelector('.portrait');if(p&&p.tagName==='IMG')p.src=img(cur.id,h.e,false);}
 if(scroll)d.scrollIntoView({block:'end'});}

function demoReply(t){const hit=cur.demo.find(d=>d.k.some(k=>t.includes(k))),m=hit||cur.def;
 if(cur.id==='jesus'){const mm=matchMood(t),pool=[m.ref,...((mm&&MOOD_JPOOL[mm.id])||[]),...(hit?[]:JESUS_DAILY)];return{r:'c',t:'복음서는 예수님의 말씀을 이렇게 전합니다.',ref:pickRefs('jesus_'+(mm?mm.id:'def'),pool,1)[0]||m.ref};}
 const P=CHAR_POOL[cur.id]||[];let R={};try{R=JSON.parse(localStorage.getItem('recentRefs'))||{}}catch{}const key='c_'+cur.id,rec=(R[key]||[]).slice(-3);
 if(m.ref&&!rec.includes(m.ref)&&(hit?Math.random()<0.6:Math.random()<0.3)){pickRefs(key,[m.ref],1);return{r:'c',t:m.t,ref:m.ref,e:m.e};}
 const r=pickRefs(key,P.length?P:[m.ref],1,[])[0]||m.ref;const L=['이번엔 이 말씀을 나눠 드릴게요.','제 마음에 오래 남아 있는 말씀이에요.','지금 당신에게 이 말씀이 닿았으면 해요.','저도 이 말씀을 붙잡고 걸었어요.'];
 return{r:'c',t:(hit?m.t.split(/[.?!]/)[0]+'. ':'')+L[Math.floor(Math.random()*L.length)],ref:r,e:m.e};}
function llm(){const c=LS.get('llm',{});return c.key&&c.url?c:null;}
async function reply(t,hist){const c=llm();if(!c||cur.id==='jesus')return demoReply(t);
 try{const sys=`${cur.sys}\n규칙: 1) 한국어로 2~4문장, 따뜻하게. 2) 성경 본문을 절대 직접 쓰거나 인용부호로 옮기지 마라. 3) 관련 구절의 참조만 refs에 1개 넣어라(형식 예: "삼상 17:45", 책 약어는 한국어 약어). 우선 범위: ${cur.scope.join(', ')}. 4) 새 교리·개인 예언·성경에 없는 사건을 사실처럼 말하지 마라. 5) 자해/위기 언급 시 롤플레이를 멈추고 자살예방상담전화 109를 안내하라. 6) 출력은 JSON만: {"reply":"...","refs":["..."],"emotion":"smile|worry|talk|flustered"}`;
  const msgs=[{role:'system',content:sys},...hist.slice(-10).map(h=>({role:h.r==='u'?'user':'assistant',content:h.t}))];
  const r=await fetch(c.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify({model:c.model,messages:msgs,response_format:{type:'json_object'}})});
  const j=await r.json(),o=JSON.parse(j.choices[0].message.content.replace(/^```json|```$/g,''));
  let ref=(o.refs||[]).find(x=>parseRef(x));let note='';if(!ref){ref=cur.fallback;note='';console.warn('invalid refs',o.refs);}
  const txt=String(o.reply||'').replace(/[“"「『][^”"」』]{12,}[”"」』]/g,'(아래 말씀)'); // 인용된 본문 제거 → DB 본문만 표시
  return{r:'c',t:txt,ref,e:EXPR[o.emotion]?o.emotion:'talk'};}
 catch(e){console.warn(e);const d=demoReply(t);d.t+='\n(AI 연결 실패 → 데모 답변)';return d;}}

function settings(){const c=LS.get('llm',{}),tr=LS.get('tr','krv');
 sheet(`<h3>설정</h3><p>번역본 <select id="tr"><option value="krv">개역한글</option><option value="kjv">KJV (English)</option></select></p>
 <p><a href="#help" onclick="closeSheet()">🤝 함께 돕기 (공식 후원 페이지)</a></p><h4>성경 본문 저작권</h4>${attrAll}<p class="note">개역한글 데이터: github.com/thiagobodruk/bible (ko_krv.json), 대한성서공회 개역한글 본문과 주요 구절 대조 확인.</p>
 <h4>AI 모드 (선택)</h4><p class="note">비워 두면 오프라인 데모 모드. OpenAI 호환 /chat/completions 엔드포인트. ⚠ 프로토타입은 키를 브라우저에 저장합니다 — 실서비스는 서버에서 호출해야 합니다.</p>
 <input id="u" placeholder="https://api.openai.com/v1/chat/completions" value="${esc(c.url||'')}" style="width:100%;margin:3px 0"><input id="m" placeholder="모델명" value="${esc(c.model||'')}" style="width:100%;margin:3px 0"><input id="k" type="password" placeholder="API 키" value="${esc(c.key||'')}" style="width:100%;margin:3px 0">
 <button class="btn g" id="ok">저장</button><button class="btn" id="rs">대화기록 초기화</button><button class="btn" onclick="closeSheet()">닫기</button>`);
 $('#tr').value=tr;$('#ok').onclick=()=>{LS.set('tr',$('#tr').value);LS.set('llm',{url:$('#u').value.trim(),model:$('#m').value.trim(),key:$('#k').value.trim()});closeSheet();go(location.hash.slice(1)||'home');};
 $('#rs').onclick=()=>{Object.keys(localStorage).filter(k=>k.startsWith('h_')).forEach(k=>localStorage.removeItem(k));alert('초기화했어요');};}

// ---- 진행자 빛나와 함께하는 단체 대화 (홈) ----
const nameOf=id=>id==='host'?HOST.name:id==='jesus'?'예수님':id==='u'?'나':(CHARS.find(c=>c.id===id)||{}).name;
function matchMood(t){let best=null,bs=0;for(const m of MOODS){const sc=m.k.filter(k=>t.includes(k)).length;if(sc>bs){bs=sc;best=m;}}return best;}
async function home(){title('말씀톡');cur=null;const d=await daily();const today=d.html.split('<div class="card"><b>✝')[0];
 V.innerHTML=`<div class="bitna compact"><div class="bwrap"><img id="bimg" src="images/host-smile.webp" alt="빛나"><div class="shine"></div></div><div class="btxt"><b>빛나</b> <span class="note">진행자</span><div class="bsay" id="bstat">오늘 마음은 어때? 하나 골라 주면 칠판에 말씀을 써 줄게 🙂</div></div></div>
 <section class="sec main"><h3 class="st">오늘의 마음</h3><div class="chips moods" id="moods">${MOODS.map(m=>`<button data-m="${m.id}">${m.label}</button>`).join('')}</div>
 <div class="inp2"><input id="q" placeholder="직접 적어도 돼요 · 예: 요즘 너무 지쳤어요"><button id="sd">말씀 보기</button></div></section>
 <div id="alertbox"></div><div id="ctxbox"></div>
 <section class="sec"><h3 class="st">오늘의 말씀</h3>${today}</section>
 <section class="sec"><h3 class="st">더 둘러보기</h3><div class="tiles">
  <button class="tile" onclick="go('chat','jesus')">${pic('jesus','smile','tav reverent','예')}<span>✝ 예수님 말씀 듣기</span></button>
  <button class="tile" id="story">${pic('david-boy','smile','tav','다')}<span>🎬 이야기 극장<small>다윗과 골리앗</small></span></button></div>
  <div class="charrow">${CHARS.map(c=>`<button onclick="go('chat','${c.id}')">${pic(c.id,'smile','av',c.name)}<small>${c.name}</small></button>`).join('')}<button onclick="go('chars')"><div class="ph av">+</div><small>전체</small></button></div>
  <div class="msgs" id="msgs"></div></section>
 <p class="links"><a href="#help">🤝 함께 돕기 (후원 단체 링크)</a></p>${disc()}`;d.bind();
 bitnaStart();alertBanner($('#alertbox')).then(shown=>{if(shown&&!location.search.includes('ctx='))window.onAlertClosed=()=>contextBanner($('#ctxbox'));else contextBanner($('#ctxbox'));});
 const say=async(e,t)=>{bitnaExpr(e);await bitnaTalk(t);};
 const pick=async(t,m)=>{m=m||matchMood(t);$('#q').value='';if(!m){await say('worry','조금 더 자세히 말해 줄래? 위의 마음 버튼 중에서 골라도 좋아.');return;}
  await say(['thanks','joy'].includes(m.id)?'smile':'empathy','칠판에 말씀을 써 볼게…');openChalk(m);};
 $('#sd').onclick=()=>pick($('#q').value.trim());$('#q').onkeydown=e=>{if(e.key==='Enter')pick(e.target.value.trim());};
 V.querySelectorAll('#moods [data-m]').forEach(b=>b.onclick=()=>pick('',MOODS.find(x=>x.id===b.dataset.m)));
 $('#story').onclick=async()=>{const M=$('#msgs');M.innerHTML='';M.scrollIntoView({block:'start'});try{const G=window.ROUTE_GEN;for(const h of STORY_DAVID){if(G!==window.ROUTE_GEN)return;if(h.who==='host'){bitnaExpr(h.e||'smile');await bitnaTalk(h.t);}await gMsg(h);await new Promise(r=>setTimeout(r,600));}}catch(e){console.warn(e);}};}
// ---- 빛나 생동감: 표정·눈 깜빡임·말하기 ----
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;const BT={expr:'smile',talking:false,blinks:0,timer:null};window.__bitna=BT;
['base','smile','worry','talk','flustered','empathy','blink'].forEach(e=>{const i=new Image();i.src=`images/host-${e}.webp`;});
const bsrc=e=>{const b=$('#bimg');if(b)b.src=`images/host-${e}.webp`;};
function bitnaExpr(e){BT.expr=e;if(!BT.talking)bsrc(e);}
function bitnaStart(){clearTimeout(BT.timer);BT.expr='smile';if(RM)return;const loop=()=>{BT.timer=setTimeout(()=>{if(!$('#bimg'))return;if(!BT.talking){bsrc('blink');BT.blinks++;setTimeout(()=>{if(!BT.talking)bsrc(BT.expr);},150);}loop();},3000+Math.random()*3000);};loop();}
async function bitnaTalk(t){const st=$('#bstat');if(st)st.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';const ms=Math.min(1400,300+t.length*18);
 if(RM||!$('#bimg')){await new Promise(r=>setTimeout(r,200));if(st)st.textContent=t.slice(0,60);return;}
 BT.talking=true;$('.bwrap')?.classList.add('talking');let f=0;const iv=setInterval(()=>bsrc(++f%2?'talk':'base'),140);
 await new Promise(r=>setTimeout(r,ms));clearInterval(iv);BT.talking=false;$('.bwrap')?.classList.remove('talking');bsrc(BT.expr);if(st)st.textContent=t.length>60?t.slice(0,60)+'…':t;}
async function gMsg(h,scroll=true){const M=$('#msgs');if(!M)return;const w=document.createElement('div');w.className='g '+(h.who==='u'?'gu':'');
 if(h.who!=='u')w.innerHTML=(h.who==='jesus'?pic('jesus','smile','av reverent','예'):pic(h.who,h.e||'smile','av'+(h.who!=='host'?' big':''),nameOf(h.who)))+`<div class="gb"><div class="gn">${esc(nameOf(h.who))}</div><div class="m c"></div></div>`;
 else w.innerHTML='<div class="m u"></div>';M.appendChild(w);const d=w.querySelector('.m');d.textContent=h.t;
 for(const r of [h.ref,...(h.refs||[])].filter(Boolean)){const v=await verse(r);if(v)d.insertAdjacentHTML('beforeend',verseCard(v));}
 if(scroll)w.scrollIntoView({block:'end'});}

window.go=(v,a)=>{location.hash=v+(a?'/'+a:'');};
function route(){window.ROUTE_GEN=(window.ROUTE_GEN||0)+1;clearTimeout(BT.timer);BT.talking=false;try{cBusy=false;}catch{}closeSheet();if(window.closeChalk)closeChalk();document.querySelectorAll('.cameo').forEach(e=>e.remove());try{CQ.length=0;}catch{}const[v,a]=(location.hash.slice(1)||'home').split('/');window.scrollTo(0,0);({home,chars,saved,premium,help:()=>{title('함께 돕기',true);V.innerHTML=`<button class="btn homeb" onclick="go('home')">← 홈으로</button>`+donateHTML(false)+`<button class="btn homeb" onclick="go('home')">← 홈으로 돌아가기</button>`+disc();},chat:()=>chat(a)}[v]||home)();}
Object.keys(localStorage).filter(k=>k.startsWith('h_')).forEach(k=>localStorage.removeItem(k));
(async()=>{BOOKS=await (await fetch('data/books.json')).json();BOOKS.forEach(b=>SH[b.sh]=b.i);window.addEventListener('hashchange',route);route();
 if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});})();

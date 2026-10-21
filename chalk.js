// 칠판 말씀: 마음 버튼 → 칠판에 한 글자씩 쓰고, 읽을 시간 뒤 지우개로 지우고 다음 말씀. 본문은 DB(verse())에서만.
const CK={steps:[],i:0,tok:0,paused:false};
const ckSleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ckWait(ms,tok){let t=0;while(t<ms){await ckSleep(50);if(CK.tok!==tok)throw 'stop';if(!CK.paused)t+=50;}}
window.closeChalk=()=>{CK.tok++;document.getElementById('chalk')?.remove();document.body.classList.remove('noscroll');};
window.openChalk=async function(m){closeChalk();document.querySelectorAll('.cameo').forEach(e=>e.remove());
 const pool=[...m.refs,...(MOOD_POOL[m.id]||[])],pk=pickRefs('m_'+m.id,pool,3);
 const jp=[m.j,...(MOOD_JPOOL[m.id]||[])].filter(Boolean),jr=jp.length?pickRefs('j_'+m.id,jp,1)[0]:null;
 const c=CHARS.find(x=>x.id===m.c);
 const st=[{who:m.c,label:`${c.name}${(c.name.charCodeAt(c.name.length-1)-44032)%28?"이":"가"} 전하는 말씀`,ref:pk[0]},...pk.slice(1).map(r=>({who:'host',label:'빛나가 고른 말씀',ref:r}))];
 if(jr)st.push({who:'jesus',label:'예수님의 말씀 · 복음서',ref:jr,gold:true});
 for(const s of st){s.v=await verse(s.ref);if(s.who==='host'){const w=cameoWho(s.ref);if(w&&w.id!=='jesus'&&window.PORTRAIT&&PORTRAIT[w.id]){s.rel=w.id;s.relName=PORTRAIT[w.id].name;}}}
 CK.steps=st.filter(s=>s.v);CK.paused=false;const tr=LS.get('tr','krv');
 const el=document.createElement('div');el.id='chalk';el.className='chalk';
 el.innerHTML=`<div class="cktop"><b>${esc(m.label)}</b><button id="ckx" aria-label="닫기">✕ 홈으로</button></div>
 <p class="ckcap">${esc(m.h)}</p>
 <div class="frame"><div class="board" id="board"><div class="ckwho" id="ckwho"></div><div class="cktext" id="cktext"></div><div class="ckref" id="ckref"></div><div class="eraser" id="eraser"></div></div><div class="tray"><i></i><i class="y"></i></div></div>
 <div class="ckdots" id="ckdots">${CK.steps.map((s,i)=>`<span data-i="${i}" class="${s.gold?'gd':''}"></span>`).join('')}</div>
 <div class="ckctl"><button id="ckp">⏸ 멈춤</button><button id="ckr">↻ 다시</button><button id="ckn">다음 ⏭</button></div>
 <p class="ckattr">📜 ${esc(ATTR[tr])} · 본문은 원문 그대로입니다. 칠판을 누르면 장 전체를 읽을 수 있어요.</p>`;
 document.body.appendChild(el);document.body.classList.add('noscroll');
 el.querySelector('#ckx').onclick=()=>{closeChalk();};
 el.querySelector('#ckp').onclick=()=>{CK.paused=!CK.paused;el.classList.toggle('paused',CK.paused);el.querySelector('#ckp').textContent=CK.paused?'▶ 계속':'⏸ 멈춤';};
 el.querySelector('#ckn').onclick=()=>ckPlay(Math.min(CK.i+1,CK.steps.length));
 el.querySelector('#ckr').onclick=()=>ckPlay(CK.i>=CK.steps.length?0:CK.i);
 el.querySelector('#board').onclick=()=>{const s=CK.steps[CK.i];if(s){CK.paused=true;el.classList.add('paused');el.querySelector('#ckp').textContent='▶ 계속';openChapter(s.ref);}};
 ckPlay(0);};
function ckPlay(i){CK.i=i;const tok=++CK.tok;ckRun(tok).catch(()=>{});}
async function ckRun(tok){const box=document.getElementById('chalk');if(!box)return;
 const T=box.querySelector('#cktext'),R=box.querySelector('#ckref'),W=box.querySelector('#ckwho'),E=box.querySelector('#eraser');
 box.querySelectorAll('#ckdots span').forEach((d,k)=>d.className=(CK.steps[k].gold?'gd ':'')+(k<CK.i?'done':k===CK.i?'on':''));
 T.className='cktext';R.className='ckref';E.className='eraser';T.innerHTML='';R.textContent='';
 if(CK.i>=CK.steps.length){W.innerHTML=`${pic('host','smile','ckav','빛')}<div><b>빛나</b><small>오늘의 칠판 끝</small></div>`;
  await ckWrite(T,'오늘도 말씀과 함께해 줘서 고마워. 🙏',tok);box.querySelector('#ckn').disabled=true;return;}
 box.querySelector('#ckn').disabled=false;const s=CK.steps[CK.i],J=s.who==='jesus';
 const pid=s.rel||s.who,pname=s.rel?s.relName:(J?'예수님':nameOf(s.who));
 W.innerHTML=`${J?pic('jesus','smile','ckav reverent','예'):pic(pid,'smile','ckav',pname)}<div><b>${esc(pname)}</b><small>${esc(s.rel?'빛나가 고른 말씀 · '+(cameoWho(s.ref)?.line||''):s.label)}</small></div>`;
 if(J)T.classList.add('gold');
 await ckWrite(T,s.v.text,tok);R.textContent='— '+s.v.ref+' ('+s.v.tr+')';R.classList.add('show');
 await ckWait(RM?Math.max(6000,s.v.text.length*110):Math.max(3500,s.v.text.length*75),tok);
 if(RM){T.innerHTML='';R.textContent='';}else{E.classList.add('go');T.classList.add('erasing');R.classList.add('erasing');box.querySelector('#board').classList.add('smudge');await ckWait(1500,tok);box.querySelector('#board').classList.remove('smudge');}
 ckPlay(CK.i+1);}
async function ckWrite(T,text,tok){if(RM){T.textContent=text;return;}
 for(const ch of [...text]){const sp=document.createElement('span');sp.textContent=ch;T.appendChild(sp);await ckWait(ch===' '?20:42,tok);}}

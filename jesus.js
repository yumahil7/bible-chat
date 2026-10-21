// 예수님 말씀(복음서 붉은 글씨 구절만, DB 원문). 모든 참조는 예수님이 직접 하신 말씀인지 확인함.
window.MOOD_JESUS={tired:"마 11:28",fear:"요 14:27",anxious:"마 6:34",lonely:"마 28:20",guilt:"눅 5:32",fail:"눅 22:32",sad:"마 5:4",angry:"마 5:9",thanks:"마 6:26",joy:"요 15:11",future:"마 6:33",decide:"마 7:7",worth:"마 10:31",forgive:"마 6:14",wait:"요 13:7",doubt:"요 20:29",sick:"마 9:12",runaway:"요 6:37",calling:"마 4:19",sleep:"마 11:29",love:"요 13:34"};
window.MOODS.forEach(m=>m.j=MOOD_JESUS[m.id]||m.j);
window.CTX_JESUS={rain:"마 5:45",cloudy:"요 8:12",clear:"마 5:14",hot:"요 4:14",cold:"요 14:18",morning:"마 6:11",night:"마 11:28",sunday:"요 11:25"};
window.DISASTER_JESUS="요 16:33";
window.JESUS_DAILY=["마 11:28","요 14:27","요 8:12","요 15:5","마 6:33","요 14:6","마 5:16","요 10:11","마 22:37","요 13:34","마 7:7","요 6:35","마 28:20","요 11:25"];
window.JESUS.demo.forEach(d=>{if(d.ref==="요 3:16")d.ref="요 15:9";});
window.JESUS_SAY=new Set([...Object.values(MOOD_JESUS),...Object.values(CTX_JESUS),DISASTER_JESUS,...JESUS_DAILY,...JESUS.demo.map(d=>d.ref),JESUS.def.ref,"요 15:9","마 6:34","요 20:29","마 5:4","요 15:11"]);

// ---- 구절 → 관련 인물 카메오 ----
function cameoWho(ref){const p=parseRef(ref);if(!p)return null;const b=p.b,c=p.c,bk=BOOKS[b].ko;
 if(JESUS_SAY.has(ref))return{id:"jesus",host:true,line:"복음서가 전하는 예수님의 말씀이에요."};
 const R=(id,line)=>({id,line});
 if(b===0){if(c<=3)return R("adam","태초의 이야기, 창세기예요.");if(c<=9)return R("noah","방주와 무지개의 이야기예요.");if(c<=25)return R("abraham","믿음으로 길을 떠났던 이야기예요.");if(c<=36)return R("jacob","제 인생의 이야기가 담긴 창세기예요.");return R("joseph-ot","형들에게 팔렸던 제 이야기예요.");}
 if(b>=1&&b<=4)return R("moses","광야에서 받은 말씀이라네.");
 if(b===5)return R("joshua","가나안을 향해 나아갈 때의 말씀이에요.");
 if(b===6)return c>=13&&c<=16?R("samson","제 이야기가 담긴 사사기예요."):null;
 if(b===7)return R("ruth","제 이야기, 룻기예요.");
 if(b===8)return c<=15?R("samuel","제가 기록을 남긴 시대의 이야기예요."):R("david-boy","제가 목동이던 시절의 이야기예요.");
 if(b===9)return R("david-king","왕이 된 뒤의 제 이야기예요.");
 if(b===10)return c<=11?R("solomon","지혜를 구했던 제 시대의 이야기요."):c>=17&&c<=21?R("elijah","갈멜산과 로뎀나무의 이야기예요."):null;
 if(b===11)return c<=2?R("elijah","제가 하늘로 올라간 이야기예요."):null;
 if(b===16)return R("esther","제 이야기, 에스더서예요.");
 if(b===17)return R("job","고난 속에서 드린 제 고백이에요.");
 if(b===18)return R("david-king","시편의 노래예요. 저도 이렇게 노래했어요.");
 if(b>=19&&b<=21)return R("solomon","지혜의 말씀이오.");
 if(b===22)return c===53?R("isaiah","오실 메시아, 고난받는 종의 이야기예요."):R("isaiah","제가 전한 위로와 소망의 말씀이에요.");
 if(b===26)return R("daniel","바벨론에서의 이야기예요.");
 if(b===31)return R("jonah","제가 도망쳤다 돌아온 이야기예요.");
 if(b===39)return R("matthew","제가 기록한 마태복음이에요.");
 if(b===41)return c<=2?R("mary","제가 마음에 담아 둔 이야기예요."):null;
 if(b===42)return R("john","제가 기록한 요한복음이에요.");
 if(b===43)return c<=12?R("peter","초대교회가 시작될 때 이야기예요."):R("paul","제 선교 여행 이야기예요.");
 if(b>=44&&b<=56)return R("paul","제가 교회에 보낸 편지예요.");
 if(b===59||b===60)return R("peter","제가 쓴 편지예요.");
 if(b>=61&&b<=63||b===65)return R("john",b===65?"밧모섬에서 본 환상이에요.":"제가 쓴 편지예요.");
 return null;}
const CQ=[];let cBusy=false,cLast={};window.__cameos=[];
function cameo(ref){const w=cameoWho(ref)||{id:"host",line:`${BOOKS[parseRef(ref)?.b]?.ko||"성경"}의 말씀이에요.`};
 if(cLast[w.id]&&Date.now()-cLast[w.id]<8000)return;cLast[w.id]=Date.now();if(CQ.length>=2)CQ.pop();CQ.push(w);runCameo();}
async function runCameo(){if(cBusy||!CQ.length)return;cBusy=true;const w=CQ.shift();window.__cameos.push(w.id);
 const el=document.createElement('div');el.className='cameo';const isJ=w.id==='jesus',name=isJ?'빛나':w.id==='host'?'빛나':(PORTRAIT[w.id]?.name||nameOf(w.id));
 el.innerHTML=`${isJ?pic('jesus','smile','cav reverent','예'):pic(w.id,'talk','cav',name)}<div><b>${esc(name)}</b><div>${esc(w.line)}</div></div>`;document.body.appendChild(el);
 const im=el.querySelector('img');let iv=null;if(im&&!isJ&&!RM&&(w.id==='host'||PORTRAIT[w.id]?.expr)){let f=0;iv=setInterval(()=>{im.src=img(w.id,++f%2?'talk':'smile',true);},160);setTimeout(()=>clearInterval(iv),1600);}
 await new Promise(r=>setTimeout(r,RM?2500:2800));clearInterval(iv);el.classList.add('out');await new Promise(r=>setTimeout(r,RM?0:400));el.remove();cBusy=false;runCameo();}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;const v=n.matches?.('.verse,.mboard:not([data-manual])')?[n]:[...n.querySelectorAll?.('.verse,.mboard:not([data-manual])')||[]];if(v[0]&&!v[0].closest('#sheet'))cameo(v[0].dataset.ref);else if(v[0])cameo(v[0].dataset.ref);}}).observe(document.body,{childList:true,subtree:true});

// node validate_refs.js — 모든 데모/오늘의말씀 참조가 DB에 존재하는지 검사
global.window={};require('./chars.js');require('./moods.js');window.ALERT_VERSES=eval("("+require('fs').readFileSync('alerts.js','utf8').match(/window.ALERT_VERSES=(\{.*?\});/s)[1]+")");const fs=require('fs');const B=JSON.parse(fs.readFileSync('data/books.json'));const SH={};B.forEach(b=>SH[b.sh]=b.i);
const refs=[...window.DAILY,...window.JESUS.demo.map(d=>d.ref),window.JESUS.def.ref];window.CHARS.forEach(c=>{refs.push(c.fallback,c.def.ref,...c.demo.map(d=>d.ref))});
window.MOODS.forEach(m=>{refs.push(...m.refs);if(m.j)refs.push(m.j)});window.STORY_DAVID.forEach(x=>x.ref&&refs.push(x.ref));
Object.values(window.ALERT_VERSES).forEach(a=>refs.push(...a));
{const C=eval('('+require('fs').readFileSync('context.js','utf8').match(/window.CTX=(\{.*?\}\});/s)[1]+')');Object.values(C).forEach(x=>refs.push(x.ref));}
let bad=0;for(const r of refs){const m=r.match(/^(\S+)\s*(\d+):(\d+)(?:-(\d+))?$/);const b=m&&SH[m[1]];const ok=m&&b!=null&&B[b].chs[m[2]-1]>=(+m[4]||+m[3]);
 for(const tr of['krv','kjv']){const d=ok&&JSON.parse(fs.readFileSync(`data/${tr}/${b}.json`))[m[2]-1][m[3]-1];if(!d){bad++;console.log('BAD',tr,r)}}
 if(ok&&process.argv[2])console.log(r,JSON.parse(fs.readFileSync(`data/krv/${b}.json`))[m[2]-1][m[3]-1].slice(0,50))}
console.log(refs.length,'refs checked, bad:',bad);

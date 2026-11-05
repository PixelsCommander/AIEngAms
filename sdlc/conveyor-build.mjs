import {writeFileSync} from 'node:fs';
import * as k from '../.agents/skills/anatomy/kit/iso-kit.mjs';
import {kitScript} from '../.agents/skills/anatomy/scripts/inline-kit.mjs';
const light=process.argv.includes('--light');
const stages=[
['Plan','Choose the right problem.','Agree on the users, business value, scope, risks, and resources.','Prioritized roadmap and a feasible release goal.','A team chooses password reset as the next improvement.'],
['Requirements','Make success testable.','Describe user needs, constraints, security expectations, and acceptance criteria.','An agreed set of requirements.','A reset link must expire after 15 minutes and work only once.'],
['Design','Decide how it will work.','Shape the user experience, architecture, data model, interfaces, and threat protections.','A technical design and interface prototype.','Design the reset screen, token storage, and email flow.'],
['Implement','Turn the design into software.','Write and review code, integrate changes, and run automated checks continuously.','Reviewed code and a reproducible build.','Build the reset endpoint, form, and email template.'],
['Test','Check behavior against expectations.','Use automated and exploratory tests to verify functionality, security, performance, and usability.','Evidence of readiness; defects return for correction.','Verify expired and reused links fail, and valid links succeed.'],
['Deploy','Put the release into use.','Release through a controlled pipeline, validate production behavior, and prepare rollback.','A running release with a recovery plan.','Roll out password reset gradually and watch error rates.'],
['Maintain','Learn from real use.','Observe reliability, fix incidents, patch dependencies, and collect user feedback.','Operational fixes and input for the next plan.','Users report delayed emails; the next cycle improves delivery.']];
// Concept: a pallet travels around a closed seven-stop indexing conveyor.
// Parts: 8 feet/isolators, base, inset, 7 rail beds + 14 rail edges,
// 7 station plinths + 14 mounting shoes + 7 columns + 7 tool heads,
// 7 inspection windows + 28 fasteners + 21 vents, central controller,
// 3 controller keys, nameplate, pallet and its release cartridge.
const W=860,H=520,base={x:-153,y:-153,w:306,d:306,r:12};
const P=k.fitProjection(k.boxCorners(base,-19,64),W,H,{pad:65,azimuth:40,elevation:38});
const xy=(r,i)=>[Math.cos(i*2*Math.PI/7-2.25)*r,Math.sin(i*2*Math.PI/7-2.25)*r];
const stops=stages.map((_,i)=>xy(77,i));
const solid=(plan,z,h,tone='mid',lit=false)=>k.solidSvg(k.slabOf(plan,z,h,P,5,.6),{tone,lit});
const box=(x,y,w,d)=>({x:x-w/2,y:y-d/2,w,d,r:1.8});
const line=(plan,z,tone='lo')=>k.lineSvg(k.planOutline(plan,z,P),{tone});
let out=[];
for(const [x,y] of k.corners(base,25))out.push(solid(box(x,y,19,19),-19,5,'lo'),solid(box(x,y,15,15),-14,5,'mid'));
out.push(solid(base,-9,9,'lo'),line(k.insetPlan(base,5),0,'faint'));
for(let i=0;i<7;i++){
 const a=xy(63,i),b=xy(63,i+1),c=xy(91,i+1),d=xy(91,i);
 out.push(k.solidSvg(k.extrude([a,b,c,d],0,7,P),{tone:'lo'}));
 for(const [r1,r2] of [[63,65],[89,91]])out.push(k.solidSvg(k.extrude([xy(r1,i),xy(r1,i+1),xy(r2,i+1),xy(r2,i)],7,3,P),{tone:'mid'}));
}
// Station stacks are disjoint in world space and painted by floor depth.
const assemblies=[];
for(let i=0;i<7;i++){
 const [x,y]=xy(117,i);let s=[];
 s.push(solid(box(x,y,35,35),0,6,'lo'));
 for(const dx of [-11,11])s.push(solid(box(x+dx,y,6,26),6,3));
 s.push(solid(box(x,y,26,25),9,22));
 s.push(line(k.insetPlan(box(x,y,26,25),3),31));
 for(const dx of [-9,9])for(const dy of [-8,8])s.push(k.dotsSvg([k.iso([x+dx,y+dy,31],P)],{size:.65,tone:'hi'}));
 for(let j=0;j<3;j++)s.push(line(box(x-6+j*6,y,2,12),31,'faint'));
 const heights=[7,11,8,13,10,6,9];
 s.push(solid(box(x,y,18,18),31,heights[i],'hi'));
 s.push(solid(box(x,y,12,12),31+heights[i],1,'lo'));
 s.push(`<g data-lamp="${i}">${solid(box(x,y,5,5),32+heights[i],1,'hi',i===0)}</g>`);
 assemblies.push({depth:k.depthOf([x,y,0],P),svg:`<g data-station="${i}" style="cursor:pointer">${s.join('')}<title>${i+1}. ${stages[i][0]}</title></g>`});
}
let center=solid(box(0,0,42,42),0,15,'mid')+solid(box(0,0,35,35),15,2,'lo');
for(let i=0;i<3;i++)center+=solid(box(-10+i*10,0,5,15),17,2,'mid');
center+=line(box(0,0,29,28),19,'faint');
assemblies.push({depth:k.depthOf([0,0,0],P),svg:center});
const packet=solid(box(0,0,17,17),10,3,'hi')+solid(box(0,0,11,11),13,8,'hi',true)+line(box(0,0,7,7),21,'mid');
// Pallet sits on the rail bed. Its layer is sorted with the station stacks per frame.
assemblies.sort((a,b)=>a.depth-b.depth);out.push(`<g id="assemblies">${assemblies.map(a=>a.svg).join('')}<g id="packet" transform="${k.translateAlong(P,[...stops[0],0])}">${packet}</g></g>`);
const svg=k.figureSvg({width:W,height:H,label:'An isometric seven-station indexing conveyor. A bright release cartridge travels a closed track: plan, requirements, design, implement, test, deploy, maintain. Feedback begins another cycle.',body:out});
const nav=stages.map((s,i)=>`<button class="step" data-index="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${s[0]}</button>`).join('');
const body=`<header class="intro"><div class="eyebrow">SOFTWARE ENGINEERING / AN INTERACTIVE FIELD GUIDE</div><h1>Software is a cycle.</h1><p>From the first question to the next improvement.<br>Follow one release through the software development life cycle.</p></header>`+k.plateHtml({fig:'FIG. 01',title:'The release conveyor',hint:'Select a stage · ← → to move',readout:'01 / 07 · Plan',keys:[{mark:'lit',label:'One release, moving through the cycle'},{mark:'raised',label:'Seven stages, each with a useful output'}],caption:'A common seven-stage view of SDLC. Real teams overlap stages and revisit earlier decisions. Testing, security, and feedback continue throughout; station spacing does not represent time.',body:`<div class="iso-stage" tabindex="0" aria-label="Release conveyor. Use left and right arrow keys to select a stage.">${svg}</div>`})+`<nav aria-label="SDLC stages">${nav}</nav><article aria-live="polite"><div class="eyebrow" id="number">STAGE 01 / 07</div><h2 id="name"></h2><h3 id="purpose"></h3><p id="description"></p><div class="details"><div><label>WHAT YOU LEAVE WITH</label><p id="output"></p></div><div><label>EXAMPLE · PASSWORD RESET</label><p id="example"></p></div></div></article><footer><span>Feedback closes the loop. Every stage can send work back.</span><button id="play">Pause tour</button><button id="theme">${light?'Dark':'Light'} theme</button></footer>`;
const live=`
const projection=${JSON.stringify(P)}, data=${JSON.stringify(stages)}, positions=${JSON.stringify(stops)};
const packet=document.querySelector('#packet'),root=document.querySelector('.iso-stage'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
let selected=0,progress=0,target=0,playing=!reduce.matches,visible=true,frame=0,last=0,dwell=0;
function show(i){selected=(i+7)%7;const s=data[selected];document.querySelectorAll('.step').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===selected)));for(const [id,value] of Object.entries({name:s[0],purpose:s[1],description:s[2],output:s[3],example:s[4],number:'STAGE 0'+(selected+1)+' / 07'}))document.getElementById(id).textContent=value;document.querySelector('[data-readout]').textContent='0'+(selected+1)+' / 07 · '+s[0];document.querySelector('#play').textContent=playing?'Pause tour':'Play tour';}
function paint(){const n=((progress%7)+7)%7,a=Math.floor(n),t=n-a;const p=positions[a],q=positions[(a+1)%7],x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t;packet.setAttribute('transform',translateAlong(projection,[x,y,0]));const depth=depthOf([x,y,10],projection);const stacks=[...document.querySelector('#assemblies').children].filter(el=>el!==packet);const depths=${JSON.stringify(assemblies.map(a=>a.depth))};const next=stacks.find((_,j)=>depths[j]>depth);document.querySelector('#assemblies').insertBefore(packet,next||null);}
function tick(now){frame=0;if(!visible)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(playing){dwell+=dt;if(dwell>5){target++;show(Math.round(target)%7);dwell=0;}}progress=reduce.matches?target:progress+(target-progress)*(1-Math.exp(-dt/0.28));if(Math.abs(progress-target)<.0001)progress=target;paint();if(playing||progress!==target)frame=requestAnimationFrame(tick);}
function run(){if(!frame&&visible){last=0;frame=requestAnimationFrame(tick);}}
function choose(i){playing=false;target=Math.floor(progress/7)*7+i;show(i);dwell=0;run();}
document.querySelectorAll('.step').forEach((b,i)=>b.onclick=()=>choose(i));document.querySelectorAll('[data-station]').forEach((el,i)=>el.onclick=()=>choose(i));root.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();choose(e.key==='Home'?0:e.key==='End'?6:(selected+(e.key==='ArrowRight'?1:6))%7);};
document.querySelector('#play').onclick=()=>{playing=!playing;dwell=0;show(selected);run();};document.querySelector('#theme').onclick=()=>{const light=document.body.dataset.theme!=='light';document.body.dataset.theme=light?'light':'dark';document.querySelector('#theme').textContent=light?'Dark theme':'Light theme';};new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)run();}).observe(root);reduce.addEventListener('change',()=>{if(reduce.matches){playing=false;progress=target;show(selected);paint();}});show(0);paint();run();
`;
const css=`<style>body{padding:56px 24px!important}.iso{--anatomy-page: #101113}body[data-theme=light]{--anatomy-page:#f5f3ef} .intro,nav,article,footer{max-width:860px;margin:0 auto}.intro{margin-bottom:30px}.eyebrow,label{font:10px/1.6 ui-monospace,monospace;letter-spacing:1.5px;opacity:.6}h1{font:500 clamp(34px,6vw,58px)/1.08 system-ui;letter-spacing:-2.5px;margin:20px 0}p{font:15px/1.65 system-ui;opacity:.72}.iso-plate{max-width:860px!important;margin:auto}.iso-stage:focus-visible{outline:1px solid currentColor;outline-offset:-4px}nav{display:grid;grid-template-columns:repeat(7,1fr);margin-top:25px;gap:5px}button{color:inherit;background:transparent;border:1px solid #7774;cursor:pointer;border-radius:5px;font:12px system-ui;padding:12px 9px}.step{text-align:left}.step span{display:block;font:10px ui-monospace,monospace;opacity:.4;margin-bottom:8px}.step[aria-pressed=true]{background:#8882;border-color:#aaa8}.step:hover{background:#8881}article{box-sizing:border-box;padding:30px 0 12px;min-height:290px}h2{font:500 30px system-ui;letter-spacing:-1px;margin:8px 0}h3{font:400 19px system-ui;margin:9px 0}article>p{max-width:650px}.details{display:grid;grid-template-columns:1fr 1fr;gap:32px;border-top:1px solid #8883;padding-top:18px;margin-top:23px}.details p{font-size:13px;margin-top:7px}footer{border-top:1px solid #8883;padding-top:20px;display:flex;align-items:center;gap:10px;font:12px/1.6 system-ui}footer span{margin-right:auto;opacity:.55}footer button{white-space:nowrap}@media(max-width:600px){body{padding:30px 16px!important}nav{grid-template-columns:repeat(4,1fr)}.step{font-size:11px;padding:10px 6px}.details{grid-template-columns:1fr;gap:10px}footer{flex-wrap:wrap}footer span{width:100%}.iso-plate-top,.iso-plate-bottom{font-size:9px!important}h1{letter-spacing:-1.5px}}</style>`;
writeFileSync(`sdlc/${light?'index-light':'index'}.html`,k.pageHtml({title:'SDLC — The release conveyor',theme:light?'light':'dark',width:860,body,script:kitScript()+live}).replace('</head>',css+'</head>'));
console.log('Built SDLC',light?'light':'dark');

import {writeFileSync} from 'node:fs';
import * as k from '../.agents/skills/anatomy/kit/iso-kit.mjs';
import {kitScript} from '../.agents/skills/anatomy/scripts/inline-kit.mjs';
import {cycleState,stages,stationAngles,START,CYCLE_SECONDS} from './cycle-model.mjs';
import {GEAR_MESH,involuteProfile,gearSideFaces} from './gear-mesh.mjs';
import {machineGeometry} from './cycle-geometry.mjs';
const light=process.argv.includes('--light');
// Hero parts: independent station plinths, central bearing and pedestal;
// two meshing gears, motor housing, four cooling fins and shaft bearings;
// single toothed disc face, 14 index marks and carrier clamps;
// seven single-layer station plates, seven single upright supports;
// seven open cantilever frames and tool guides; feeder magazine,
// three-pin acceptance gauge, X/Y plotter, guided press, sprung test probe
// and dial, opposed release jaws, and a production monitoring head.
const W=1120,H=770;
const P=k.fitProjection(k.boxCorners({x:-145,y:-145,w:320,d:290},-19,82),W,H,{pad:50,azimuth:42,elevation:41});
const G=machineGeometry(k,P,stationAngles),initial=cycleState(0);
const depths=stationAngles.map((a,i)=>k.depthOf(G.local(i,5,0,28),P));
const order=stationAngles.map((_,i)=>i).sort((a,b)=>depths[a]-depths[b]);
// Station frames and inward-reaching tools occupy different depths. Keep
// them as separate render items so the carrier can pass beneath each tool.
const stationItems=order.flatMap(i=>[
 {depth:depths[i],svg:`<g data-station="${i}" data-fixed="true" class="machine-station"><title>${stages[i][0]} — ${stages[i][1]}</title><g class="station-body">${G.station(i)}</g></g>`},
 {depth:G.toolDepth(i,initial),svg:`<g data-tool="${i}" class="machine-tool">${G.tool(i,initial)}</g>`}
]);
stationItems.push({depth:G.testWheelDepth(),svg:`<g id="test-wheel" data-test-wheel>${G.testWheel(initial)}</g>`});
stationItems.push({depth:k.depthOf([...initial.point,29],P),svg:`<g id="workpiece">${G.workpiece(initial)}</g>`});
stationItems.sort((a,b)=>a.depth-b.depth);
const stations=stationItems.map(item=>item.svg).join('');
const svg=k.figureSvg({width:W,height:H,label:'An isometric rotary SDLC machine. Seven stationary machines surround a rotating work disc. A motor and two meshing gears drive one carrier through planning, requirements, design, implementation, testing, deployment, and maintenance.',body:[G.supports(),`<g id="foundations">${order.map(i=>G.foundation(i)).join('')}</g>`,`<g id="drive-train"><g id="gear-sides">${G.gearSides(initial)}</g><g id="disc">${G.disc(initial.angle)}</g><g id="gears" data-gear-count="2">${G.gears(initial)}</g></g>`,`<g id="station-layer">${stations}</g>`]});
const labelPositions=[[41.4,19.8],[57.5,21],[77,44.8],[75,62.5],[47.1,81],[22,63],[20,43.5]];
const labelNames=['Planning','Requirements','Design','Implementation','Testing','Deployment','Maintenance'];
const stageLabels=stages.map((s,i)=>`<button class="station-label" data-stage-label="${i}" aria-pressed="${i===0}" style="left:${labelPositions[i][0]}%;top:${labelPositions[i][1]}%"><span>0${i+1}</span> ${labelNames[i]}</button>`).join('');
const body=`<figure class="iso-figure"><div class="iso-plate"><div class="iso-stage" tabindex="0" role="group" aria-label="Rotary SDLC machine. Arrow keys visit stages; Space pauses.">${svg}${stageLabels}<h3 class="cycle-heading">The whole SDLC cycle<br>covered</h3></div></div></figure><div class="controls"><div class="transport"><button id="play" class="play-button" aria-pressed="true">Pause machine</button><button id="next">Next stage →</button></div><label class="scrub"><input id="cycle-position" type="range" min="0" max="49" step="0.01" value="0" aria-label="Position within the SDLC cycle"><output id="position">0°</output></label><button id="theme">${light?'Dark':'Light'} theme</button></div><span class="sr-only" data-readout aria-live="polite"></span>`;
const script=`
const P=${JSON.stringify(P)},stationAngles=${JSON.stringify(stationAngles)},stages=${JSON.stringify(stages)};
const k={solidSvg,slabOf,cylinder,extrude,ring,lineSvg,pathOf,dotsSvg,iso,depthOf,haloOf,corners,planOutline,insetPlan};
const GEAR_MESH={profile:${involuteProfile.toString()},sides:${gearSideFaces.toString()}};
const cycleState=${cycleState.toString()},G=(${machineGeometry.toString()})(k,P,stationAngles),START=${START};
const root=document.querySelector('.iso-stage'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),stationDepths=${JSON.stringify(depths)};
let seconds=reduce.matches?2.25:0,target=null,playing=!reduce.matches,visible=true,frame=0,last=0,paintTime=0,shown=-1,sceneOrder='',renderedDriveAngle=null;
const els={gearSides:document.querySelector('#gear-sides'),disc:document.querySelector('#disc'),gears:document.querySelector('#gears'),work:document.querySelector('#workpiece'),layer:document.querySelector('#station-layer'),play:document.querySelector('#play'),slider:document.querySelector('#cycle-position'),testWheel:document.querySelector('#test-wheel')};
const bodies=[...document.querySelectorAll('[data-station]')],tools=[...document.querySelectorAll('[data-tool]')];
function updateText(m){
 const s=stages[m.stage];
 if(shown!==m.stage){shown=m.stage;document.querySelectorAll('[data-stage-label]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stageLabel)===m.stage)));}
 document.querySelector('[data-readout]').textContent='0'+(m.stage+1)+' / 07 · '+s[0]+' · '+(m.working?'working':'transfer');
 const mod=((seconds%49)+49)%49;els.slider.value=mod;els.slider.setAttribute('aria-valuetext',s[0]+', '+m.status);document.querySelector('#position').textContent=Math.round(((m.angle-START)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)*180/Math.PI)+'°';
 els.play.textContent=playing?'Pause machine':'Run machine';els.play.setAttribute('aria-pressed',String(playing));root.dataset.stage=m.stage;root.dataset.status=m.status;root.dataset.angle=m.angle.toFixed(5);root.dataset.stroke=m.stroke.toFixed(4);
}
function paint(){const m=cycleState(seconds);if(renderedDriveAngle!==m.angle){els.gearSides.innerHTML=G.gearSides(m);els.disc.innerHTML=G.disc(m.angle);els.gears.innerHTML=G.gears(m);renderedDriveAngle=m.angle;}els.work.innerHTML=G.workpiece(m);els.testWheel.innerHTML=G.testWheel(m);els.testWheel.dataset.rotation=m.testRotation.toFixed(5);tools.forEach(el=>{const i=Number(el.dataset.tool);el.innerHTML=G.tool(i,m);});
 const items=[...bodies.map(el=>({el,key:'body'+el.dataset.station,depth:stationDepths[Number(el.dataset.station)]})),...tools.map(el=>({el,key:'tool'+el.dataset.tool,depth:G.toolDepth(Number(el.dataset.tool),m)})),{el:els.testWheel,key:'test-wheel',depth:G.testWheelDepth()},{el:els.work,key:'workpiece',depth:depthOf([...m.point,29],P)}].sort((a,b)=>a.depth-b.depth);
 const signature=items.map(item=>item.key).join(',');if(signature!==sceneOrder){els.layer.append(...items.map(item=>item.el));sceneOrder=signature;}updateText(m);}
function tick(now){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
 if(target!==null){seconds=reduce.matches?target:seconds+(target-seconds)*(1-Math.exp(-dt/0.42));if(Math.abs(seconds-target)<.002){seconds=target;target=null;}}
 else if(playing&&!reduce.matches)seconds+=dt;
 if(now-paintTime>55||target===null&&!playing){paint();paintTime=now;}
 if(target!==null||playing&&!reduce.matches)frame=requestAnimationFrame(tick);
}
function run(){if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
function choose(i){playing=false;const current=cycleState(seconds);i=((i%7)+7)%7;target=Math.floor(seconds/49)*49+i*7+2.25;if(target<seconds-1)target+=49;if(reduce.matches||!visible){seconds=target;target=null;paint();}run();}
document.querySelectorAll('.step,[data-stage-label]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.index??b.dataset.stageLabel)));bodies.forEach(b=>b.onclick=()=>choose(Number(b.dataset.station)));tools.forEach(b=>b.onclick=()=>choose(Number(b.dataset.tool)));
function toggle(){target=null;playing=!playing&&!reduce.matches;paint();run();}
els.play.onclick=toggle;document.querySelector('#next').onclick=()=>choose(cycleState(seconds).stage+1);
els.slider.oninput=e=>{playing=false;target=null;seconds=Number(e.target.value);paint();};
root.onkeydown=e=>{if(['ArrowRight','ArrowLeft','Home','End',' '].includes(e.key)){e.preventDefault();if(e.key===' ')toggle();else choose(e.key==='Home'?0:e.key==='End'?6:cycleState(seconds).stage+(e.key==='ArrowRight'?1:-1));}};
document.querySelector('#theme').onclick=()=>{const light=document.body.dataset.theme!=='light';document.body.dataset.theme=light?'light':'dark';document.querySelector('#theme').textContent=light?'Dark theme':'Light theme';};
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)run();}).observe(root);document.addEventListener('visibilitychange',run);reduce.addEventListener('change',()=>{if(reduce.matches){playing=false;target=null;paint();}else run();});paint();run();
`;
const css=`<style>
.iso{--anatomy-page:#101113;--anatomy-card:#151618;--anatomy-paper:#151618;--anatomy-top:#24262a;--anatomy-shade-0:#111214;--anatomy-shade-1:#181a1d;--anatomy-shade-2:#1c1e21;--anatomy-shade-3:#202226;--anatomy-mid:#85888d;--anatomy-hi:#d6d7db;--anatomy-lo:#51545a;--anatomy-faint:#34373c}.iso[data-theme=light]{--anatomy-page:#f1f0ec;--anatomy-card:#fafaf7;--anatomy-paper:#fafaf7;--anatomy-top:#fff;--anatomy-shade-0:#d4d4cf;--anatomy-shade-1:#dfdfd9;--anatomy-shade-2:#e9e9e3;--anatomy-shade-3:#f2f2ed;--anatomy-mid:#787b80;--anatomy-hi:#282b30;--anatomy-lo:#a1a4a7;--anatomy-faint:#cdcfce}

.iso{--stage-label-ink:#fff}.iso[data-theme=light]{--stage-label-ink:#111}
*{box-sizing:border-box}.iso-page{width:min(1120px,100% - 40px);margin:24px auto 32px}.iso-figure{margin:0}.iso-plate{border:0;box-shadow:none;background:transparent;padding:0}.iso-stage,.voyage{position:relative;touch-action:pan-y}.cycle-heading{position:absolute;left:48.33%;top:46.7%;transform:translate(-50%,-50%);margin:0;font:800 clamp(8px,1.55vw,18px)/1.22 system-ui,sans-serif;letter-spacing:-.035em;text-align:center;white-space:nowrap;color:var(--stage-label-ink);pointer-events:none;text-shadow:0 1px 5px var(--anatomy-card)}.voyage .cycle-heading{left:50%;top:54.2%}.station-label,.harbor-label{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;font:700 11px/1.4 ui-monospace,monospace;background:var(--anatomy-card);color:var(--stage-label-ink);padding:5px 8px;border:1px solid transparent;border-radius:3px}.station-label span,.harbor-label span{font-size:9px;color:#ff4a1d;margin-right:4px}.station-label[aria-pressed=true],.harbor-label[aria-pressed=true]{border-color:var(--anatomy-lo)}#drive-train :is(.iso-fill,.iso-top,.iso-shade){fill:var(--anatomy-page)}#drive-train{--anatomy-hi:#41474d;--anatomy-mid:#343a40;--anatomy-lo:#292f35}.iso[data-theme=light] #drive-train{--anatomy-hi:#b7bdbb;--anatomy-mid:#c7ccca;--anatomy-lo:#d4d8d5}.stage-frame{--anatomy-hi:#41474d;--anatomy-mid:#343a40;--anatomy-lo:#292f35;--anatomy-faint:#262c31}.iso[data-theme=light] .stage-frame{--anatomy-hi:#b7bdbb;--anatomy-mid:#c7ccca;--anatomy-lo:#d4d8d5;--anatomy-faint:#dde0dd}.stage-accent{--anatomy-top:#ff4a1d;--anatomy-paper:#ff4a1d;--anatomy-face:#ff4a1d;--anatomy-hi:#ff4a1d;--anatomy-mid:#ff4a1d;--anatomy-lo:#d43a16;--anatomy-shade-0:#a52b12;--anatomy-shade-1:#c43515;--anatomy-shade-2:#e33f19;--anatomy-shade-3:#f4471c}.machine-station,.machine-tool,.harbor{cursor:pointer}button{background:transparent;color:inherit;border:1px solid var(--anatomy-faint);border-radius:3px;padding:10px 12px;font:12px/1.4 system-ui;cursor:pointer}button:hover{border-color:var(--anatomy-mid)}button:focus-visible,input:focus-visible,.iso-stage:focus-visible,.voyage:focus-visible{outline:2px solid var(--anatomy-hi);outline-offset:4px}.controls{display:flex;align-items:center;gap:20px;padding:14px 0 0;max-width:650px;margin:auto}.transport{display:flex;gap:8px}.play-button,.primary{background:var(--anatomy-hi);color:var(--anatomy-page);min-width:120px}.scrub,.timeline{display:flex;align-items:center;gap:10px;flex:1}.scrub input,.timeline input{width:100%;min-width:40px;accent-color:var(--anatomy-hi)}.scrub output,.timeline output{font:10px ui-monospace,monospace;min-width:30px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.wave-ink{fill:var(--anatomy-mid);stroke:var(--anatomy-mid);stroke-width:.5;stroke-linejoin:round;vector-effect:non-scaling-stroke}.wave-ripple{pointer-events:none}[data-theme=dark] #boat{--anatomy-lit-top:#73818b;--anatomy-lit-shade:#414e58;--anatomy-face:#46535d}[data-theme=dark] #workpiece{--anatomy-lit-top:#62666d;--anatomy-lit-shade:#3a3e44;--anatomy-face:#42464c}
@media(max-width:760px){.iso-page{width:calc(100% - 24px);margin:12px auto 24px}.cycle-heading{font-size:clamp(8px,2vw,14px)}.iso-stage .cycle-heading{top:48.5%;font-size:clamp(7.5px,1.95vw,14px)}.station-label,.harbor-label{font-size:9px;padding:3px 4px}.station-label span,.harbor-label span{font-size:8px;margin-right:2px}.station-label[data-stage-label="0"]{left:30%!important;top:17.5%!important}.station-label[data-stage-label="1"]{left:67%!important;top:17.5%!important}.station-label[data-stage-label="2"]{left:80.5%!important}.station-label[data-stage-label="3"]{left:82%!important}.station-label[data-stage-label="4"]{top:85%!important}.station-label[data-stage-label="5"]{left:17%!important}.station-label[data-stage-label="6"]{left:14%!important}.harbor-label[data-stop="0"]{left:30%!important;top:28%!important}.harbor-label[data-stop="1"]{left:67%!important;top:28%!important}.harbor-label[data-stop="2"]{left:83%!important}.harbor-label[data-stop="3"]{left:85%!important}.harbor-label[data-stop="4"]{top:80%!important}.harbor-label[data-stop="5"]{left:18%!important}.harbor-label[data-stop="6"]{left:14%!important}.controls{flex-wrap:wrap;gap:10px}.transport{flex:1}.scrub,.timeline{order:3;flex-basis:100%}button{padding:9px 10px;font-size:11px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>`;
writeFileSync(`sdlc/${light?'index-light':'index'}.html`,k.pageHtml({title:'SDLC — The rotary cycle machine',theme:light?'light':'dark',width:1120,body,script:kitScript()+script}).replace('</head>',css+'</head>'));
console.log(`Built rotary SDLC machine / ${light?'light':'dark'} / 7 fixed stations / 2 gears`);

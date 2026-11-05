import assert from 'node:assert/strict';
import * as k from '../.agents/skills/anatomy/kit/iso-kit.mjs';
import {involuteProfile,gearSideFaces} from './gear-mesh.mjs';
import {machineGeometry} from './cycle-geometry.mjs';
import {stationAngles,cycleState} from './cycle-model.mjs';
const P=k.fitProjection(k.boxCorners({x:-145,y:-145,w:320,d:290},-19,82),1120,770,{pad:50,azimuth:42,elevation:41});
const G=machineGeometry(k,P,stationAngles),alpha=20*Math.PI/180,c=Math.cos(alpha),s=Math.sin(alpha);
const turn=p=>[p[0]*c+p[1]*s,-p[0]*s+p[1]*c];
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
const crossing=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<-1e-12&&cross(c,d,a)*cross(c,d,b)<-1e-12;
const segments=ring=>ring.map((p,i)=>[p,ring[(i+1)%ring.length]]);
const pointDistance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
const inside=(p,poly)=>{let hit=false;for(const[a,b]of segments(poly))if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;return hit;};
const pathPoints=d=>[...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
// Compare the actual foundation silhouettes with a conservative cylinder
// enclosing the gear at every rotation, rather than comparing center keys.
const envelope=pathPoints(k.cylinder(0,0,99,18,6,P,180,0).fill);
for(let i=0;i<7;i++){
 const svg=G.foundation(i),path=svg.match(/class="iso-fill" d="([^"]+)"/)[1],base=pathPoints(path);
 assert(!base.some(p=>inside(p,envelope))&&!envelope.some(p=>inside(p,base)),`Foundation ${i} overlaps disc envelope`);
 for(const[a,b]of segments(base))for(const[c,d]of segments(envelope))assert(!crossing(a,b,c,d),`Foundation ${i} crosses disc envelope`);
}
const phase=(78*alpha+13*Math.PI)/14;let maximumGap=0,constraints=0;
for(let i=0;i<=180;i++){
 const angle=i/180*Math.PI*2/64,rings=[involuteProfile({teeth:64,angle}),involuteProfile({teeth:14,angle:-angle*64/14+phase,x:G.gearCenters[1][0],y:G.gearCenters[1][1]})];
 const A=segments(rings[0].map(turn)).filter(([p,q])=>Math.max(p[0],q[0])>=92.8),B=segments(rings[1].map(turn)).filter(([p,q])=>Math.min(p[0],q[0])<=99.2);
 let gap=Infinity;
 for(const[p,q]of A)for(const[r,t]of B){assert(!crossing(p,q,r,t),`Gear teeth intersect at sample ${i}`);gap=Math.min(gap,pointDistance(p,r,t),pointDistance(q,r,t),pointDistance(r,p,q),pointDistance(t,p,q));}
 assert(gap<.02,`Gear teeth lose contact: ${gap}`);maximumGap=Math.max(maximumGap,gap);
 const result=gearSideFaces(k,P,rings);assert.equal(result.order.length,result.faces);constraints+=result.constraints;
}
for(let i=0;i<98;i++){const m=cycleState(i/2);assert.equal(m.gears.length,2);assert(Math.abs(m.gears[0]*64+m.gears[1]*14)<1e-8);}
console.log(`Geometry verified: 7 foundations clear the full disc envelope; 181 gear poses have no tooth crossings; maximum flank gap ${maximumGap.toFixed(4)} world units; ${constraints} side-face depth constraints are acyclic.`);

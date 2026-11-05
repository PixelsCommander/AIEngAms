export function nauticalGeometry(k,P,harbors){
 const rect=(x,y,w,d,z,h,a=0,tone='mid',lit=false)=>{const c=Math.cos(a),s=Math.sin(a);const ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*c-v*s,y+u*s+v*c]);return k.solidSvg(k.extrude(ring,z,h,P),{tone,lit});};
 const round=(x,y,r,z,h,tone='mid',lit=false)=>k.solidSvg(k.cylinder(x,y,r,z,h,P,48,.3),{tone,lit});
 const line=(d,tone='lo')=>k.lineSvg(d,{tone});
 const ring=(x,y,r,z,tone='lo')=>line(k.ring(x,y,r,z,P,64),tone);
 const dot=(x,y,z,size=.4,tone='hi')=>k.dotsSvg([k.iso([x,y,z],P)],{size,tone});
 const polar=(a,r,v=0)=>[Math.cos(a)*r-Math.sin(a)*v,Math.sin(a)*r+Math.cos(a)*v];
 // Sparse tapered wave ribbons, drawn directly in the water plane.
 // Their positions are fixed world coordinates, not a rotating platform.
 function waves(){let out='<g id="waves" aria-hidden="true">';let n=0;
  for(let row=-5;row<=5;row++)for(let col=-6;col<=6;col++){
   const x=col*23+(row%2)*10+3*Math.sin(row*2.1+col),y=row*24+4*Math.cos(col*1.7-row);
   const radius=Math.hypot(x,y);if(radius<42||radius>158)continue;
   if(harbors.some(a=>Math.hypot(x-117*Math.cos(a),y-117*Math.sin(a))<21))continue;
   const width=7+2.5*(1+Math.sin(row*3+col*1.8)),a=.2,ca=Math.cos(a),sa=Math.sin(a),top=[],bottom=[];
   for(let j=0;j<=24;j++){const t=j/24,u=(t-.5)*width,v=.85*Math.sin(t*Math.PI*3),thickness=.17*Math.sin(Math.PI*t);for(const [list,offset]of[[top,thickness],[bottom,-thickness]])list.push(k.iso([x+u*ca-(v+offset)*sa,y+u*sa+(v+offset)*ca,-2],P));}
   const opacity=.22+.25*Math.max(0,1-radius/180),phase=((n++*2.399963)%(Math.PI*2));
   out+=`<g class="wave-ripple" data-wave-phase="${phase.toFixed(5)}" data-wave-opacity="${opacity.toFixed(3)}" opacity="${opacity.toFixed(3)}"><path class="wave-ink" d="${k.pathOf([...top,...bottom.reverse()],true)}"/></g>`;
  }
  return out+'</g>';
 }
 function island(){let s=round(0,0,31,-2,4,'lo')+round(0,0,28,2,2,'mid')+round(0,0,16,4,1,'lo');
  // An octagonal lighthouse, gallery, glazed lantern and pitched cap.
  const oct=Array.from({length:8},(_,j)=>[Math.cos(j*Math.PI/4)*8,Math.sin(j*Math.PI/4)*8]);
  s+=k.solidSvg(k.extrude(oct,5,22,P),{tone:'mid'});
  s+=round(0,0,11,27,2,'hi')+round(0,0,6,29,9,'hi');
  for(let j=0;j<8;j++){const a=j*Math.PI/4,x=9.3*Math.cos(a),y=9.3*Math.sin(a);s+=round(x,y,.45,29,5,'mid');}
  s+=ring(0,0,9.3,34,'mid')+round(0,0,8,38,1.5,'mid')+round(0,0,5,39.5,2,'hi')+round(0,0,1,41.5,2,'hi');
  s+=rect(6.2,-3,3,5,5,8,0,'lo');
  for(let j=0;j<4;j++)s+=rect(12+j*2,0,2,8,4,4-j,0,'mid');
  return s;
 }
 function harbor(i){const a=harbors[i],at=(r,v=0)=>polar(a,r,v);let s='';
  const B=(r,v,w,d,z,h,tone='mid')=>rect(...at(r,v),w,d,z,h,a,tone);
  const C=(r,v,rr,z,h,tone='mid')=>round(...at(r,v),rr,z,h,tone);
  // Quay cap, four piles, deck planks, bollards and two hanging fenders.
  for(const r of [107,128])for(const v of [-9,9])s+=C(r,v,1.6,-5,10,'lo');
  s+=B(117,0,30,24,5,1.5,'mid');
  for(let j=0;j<7;j++)s+=B(104+j*4,0,3.5,23,6.5,.3,'lo');
  for(const v of [-9,9]){s+=C(105,v,1.2,6.8,2,'hi')+C(105,v,1.8,8.8,.6,'hi');s+=C(101,v,1.7,1,3,'lo');}
  // One recognizable piece of working harbor equipment per phase.
  if(i===0){s+=B(123,0,8,13,6.8,8,'mid')+B(121,0,11,15,14.8,.8,'hi');s+=B(120,0,7,10,15.6,.3,'lo');}
  if(i===1){s+=B(121,0,12,14,6.8,1.5,'mid');for(let j=0;j<3;j++)s+=B(121,-4+j*4,8,2.5,8.3,2,'hi');}
  if(i===2){s+=B(124,0,4,13,6.8,7,'mid')+B(121,0,13,17,13.8,1,'hi');for(const v of [-5,0,5])s+=B(121,v,10,.4,14.8,.2,'lo');}
  if(i===3){s+=B(125,6,8,8,6.8,3,'lo')+C(125,6,1.5,9.8,20,'mid')+B(115,6,23,3,29.8,2,'hi')+C(105,6,.5,18,11.8,'hi')+B(105,6,4,4,16,2,'hi');for(const v of [-5,2])s+=B(119,v,6,6,6.8,5,'hi');}
  if(i===4){for(const v of [-8,8])s+=C(120,v,1,6.8,12,'mid');s+=B(120,0,3,20,18.8,2,'hi')+C(120,0,1,12,6.8,'hi')+C(126,0,4,7,2,'hi');}
  if(i===5){for(let j=0;j<2;j++)s+=B(119,j*8-4,9,7,6.8,6,'hi');s+=B(127,0,2,18,6.8,9,'mid');}
  if(i===6){s+=B(122,0,12,14,6.8,5,'mid')+B(122,0,13,15,11.8,1,'hi');for(const v of [-4,0,4])s+=C(122,v,.8,12.8,1,'hi');s+=C(127,8,1,6.8,15,'mid')+C(127,8,3,21.8,1,'hi');}
  return s;
 }
 function boat(m){const [x,y]=m.point,a=m.heading,c=Math.cos(a),s=Math.sin(a),pt=(u,v,z=0)=>[x+u*c-v*s,y+u*s+v*c,z];
  const B=(u,v,w,d,z,h,tone='hi',lit=false)=>rect(...pt(u,v).slice(0,2),w,d,z,h,a,tone,lit);
  const C=(u,v,r,z,h,tone='mid')=>round(...pt(u,v).slice(0,2),r,z,h,tone);
  const hull=[[-17,-6],[-13,-8],[9,-8],[20,0],[9,8],[-13,8],[-17,6]];
  const hullRing=hull.map(([u,v])=>pt(u,v).slice(0,2));
  let out=k.solidSvg(k.extrude(hullRing,-2,5.5,P),{tone:'hi',lit:true});
  const deck=hull.map(([u,v])=>pt(u*.94,v*.88).slice(0,2));
  out+=k.solidSvg(k.extrude(deck,3.5,1.1,P),{tone:'hi',lit:true});
  // Low coachroof and cockpit leave the deck recognizably sail-powered.
  out+=B(-6,0,10,9,4.6,2.8,'hi',true)+B(-6,0,11,10,7.4,.6,'hi',true);
  for(const v of [-4.6,4.6])if(k.depthOf(pt(0,v),P)>k.depthOf(pt(0,0),P))for(const u of [-8,-4])out+=B(u,v,2.5,.35,5.7,1.2,'lo');
  out+=B(-13,0,4,6,4.6,.5,'lo')+B(-12,0,.4,5,5.1,1.4,'mid');
  for(const v of [-6.8,6.8])for(const u of [-13,5,10])out+=C(u,v,.5,4.6,2.7,'hi');
  for(const v of [-6.8,6.8])out+=B(-1.5,v,23,.35,7.3,.35,'hi');out+=B(-13,0,.35,13.6,7.3,.35,'hi');
  for(const v of [-8.1,8.1])for(const u of [-11,0,7])out+=C(u,v,1.2,1.1,2,'lo');
  for(const u of [-13,12])out+=B(u,0,2,5,4.6,.7,'mid');
  // Cargo grows as the release is specified, built, verified, and delivered.
  if(m.stage>=1)out+=B(7,0,9,9,4.6,1,'lo');
  if(m.stage>=3)for(const v of [-2.5,2.5])out+=B(7,v,7,4,5.6,3.7,'hi',true);
  if(m.stage>=4)out+=C(7,0,.8,9.3,.4,'hi');
  if(m.stage>=5)out+=B(7,0,8,9,9.7,.7,'mid');
  // A sloop rig: foretriangle jib, aft mainsail, boom and standing rigging.
  // Sails are opaque cloth faces; seams meet their true edges.
  const sail=(points,tone='top')=>`<path class="sail-cloth" d="${k.pathOf(points.map(p=>k.iso(pt(...p),P)),true)}" style="fill:var(--anatomy-lit-${tone});stroke:var(--anatomy-hi);stroke-width:.65;stroke-linejoin:round"/>`;
  const rig=(from,to)=>line(k.pathOf([k.iso(pt(...from),P),k.iso(pt(...to),P)]),'mid')+k.dotsSvg([k.iso(pt(...from),P),k.iso(pt(...to),P)],{size:.28,tone:'mid'});
  out+=rig([0,-7,4.6],[0,0,38.5])+rig([18,0,4.6],[0,0,40])+rig([-16,0,4.6],[0,0,40]);
  const main=[[-.45,0,38],[-.45,0,13],[-14,3.4,13]];
  out+=sail(main);
  const lerp=(a,b,t)=>a.map((q,i)=>q+(b[i]-q)*t);
  for(const t of [.28,.52,.76]){const l=lerp(main[0],main[1],t),r=lerp(main[0],main[2],t);out+=line(k.pathOf([k.iso(pt(...l),P),k.iso(pt(...r),P)]),'lo');}
  out+=sail([[.6,0,37],[16,-1.3,11],[.6,0,13]],'shade');
  out+=rig([0,0,39],[.6,0,37]);
  out+=C(0,0,.48,4.6,35.4,'hi')+C(0,0,.8,40,.6,'hi');
  // The boom follows the foot of the mainsail and meets the mast at its gooseneck.
  const boom=[pt(-.45,0,12.65),pt(-14,3.4,12.65)];
  out+=line(k.pathOf(boom.map(p=>k.iso(p,P))),'hi')+k.dotsSvg(boom.map(p=>k.iso(p,P)),{size:.45,tone:'hi'});
  out+=rig([0,7,4.6],[0,0,38.5]);
  // Short gangway is deployed only while moored, meeting the quay's inner edge.
  if(!m.moving){const opacity=Math.max(0,Math.min(1,m.phase/.5,(3.5-m.phase)/.5));out+=`<g opacity="${opacity.toFixed(3)}">${rect(...polar(m.angle,98.5),9,3,5.7,.8,m.angle,'hi')}</g>`;}
  return out;
 }
 function wake(m){if(!m.moving)return '';let s='';for(let j=1;j<=5;j++){const a=m.angle-j*.035,p=polar(a,86);s+=`<g opacity="${(.24*(1-j/6)*Math.min(m.speed/8,1)).toFixed(3)}">${ring(...p,1+j*.5,-1.7,'mid')}</g>`;}return s;}
 return {waves,island,harbor,boat,wake};
}

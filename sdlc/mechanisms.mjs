// Each mechanism is drawn in world coordinates. Its moving parts share one
// crank angle; the mechanism is an analogy, not a simulation of project time.
export const mechanisms=[
 ['Priority selector','A spring-loaded selector raises three candidate trays in sequence. Planning chooses what deserves the next release.'],
 ['Acceptance gate','Three sprung pins probe a specification card. Explicit acceptance criteria determine what can pass.'],
 ['Drafting plotter','A lead screw moves a cross-slide and stylus over a ruled drawing bed. Design resolves structure before assembly.'],
 ['Assembly press','A crank and connecting rod lower a tool head onto a clamped workpiece. Implementation turns the design into a working build.'],
 ['Verification rig','A reciprocating probe loads a specimen while a dial tracks the stroke. Testing produces evidence and exposes defects.'],
 ['Release lift','A guided platform moves a release cartridge between a staging dock and a production dock. Deployment controls the handover.'],
 ['Monitoring governor','A spinning flyweight governor changes its collar height. Maintenance responds to operating conditions and feeds the next plan.']
];
export function mechanism(k,P,index,time=0,lit=true){
 const items=[];let serial=0;
 const add=(x,y,z,svg)=>items.push({d:k.depthOf([x,y,z],P),n:serial++,svg});
 const B=(x,y,w,d,z,h,tone='mid',accent=false)=>{add(x,y,z+h/2,k.solidSvg(k.slabOf({x:x-w/2,y:y-d/2,w,d,r:.7},z,h,P,3,.3),{tone,lit:accent}));};
 const C=(x,y,r,z,h,tone='mid',accent=false)=>add(x,y,z+h/2,k.solidSvg(k.cylinder(x,y,r,z,h,P,32,.25),{tone,lit:accent}));
 const beam=(a,b,w,z,h,tone='mid')=>{const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy),u=-dy/n*w/2,v=dx/n*w/2;add((a[0]+b[0])/2,(a[1]+b[1])/2,z+h/2,k.solidSvg(k.extrude([[a[0]+u,a[1]+v],[b[0]+u,b[1]+v],[b[0]-u,b[1]-v],[a[0]-u,a[1]-v]],z,h,P),{tone}));};
 const screw=(x,y,z)=>{C(x,y,.75,z,.6,'hi');};
 const scale=(x,y,w,d,z)=>{B(x,y,w,d,z,.35,'lo');const pts=[];for(let j=0;j<=10;j++){const xx=x-w/2+j*w/10;pts.push(k.lineOnTop([xx,y-d/2],[xx,y-d/2+(j%5?d*.45:d)],z+.35,P));}add(x,y,z+.4,k.lineSvg(pts.join(''),{tone:'lo'})+k.dotsSvg(Array.from({length:11},(_,j)=>k.iso([x-w/2+j*w/10,y-d/2+(j%5?d*.45:d),z+.35],P)),{size:.16,tone:'lo'}));};
 const spring=(x,y,z,h)=>{for(let j=0;j<7;j++)C(x,y,1.35,z+j*h/7,.4,'lo');};
 // Solid connecting rod, with caps; the cross section is perpendicular to its axis.
 const rod=(a,b,r,tone='mid')=>{const v=b.map((q,j)=>q-a[j]),len=Math.hypot(...v),n=v.map(q=>q/len),ref=Math.abs(n[2])<.9?[0,0,1]:[1,0,0],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let u=cross(n,ref),ul=Math.hypot(...u);u=u.map(q=>q/ul);const w=cross(n,u),rings=[a,b].map(c=>Array.from({length:12},(_,j)=>c.map((q,l)=>q+r*(u[l]*Math.cos(j*Math.PI/6)+w[l]*Math.sin(j*Math.PI/6)))));const faces=[];for(let j=0;j<12;j++){const q=[rings[0][j],rings[0][(j+1)%12],rings[1][(j+1)%12],rings[1][j]];faces.push({d:q.reduce((n,p)=>n+k.depthOf(p,P),0)/4,q,shade:j%4});}for(const q of rings)faces.push({d:q.reduce((n,p)=>n+k.depthOf(p,P),0)/12,q,shade:3});const svg=faces.sort((a,b)=>a.d-b.d).map(f=>`<path d="${k.pathOf(f.q.map(q=>k.iso(q,P)),true)}" fill="var(--anatomy-shade-${f.shade})" stroke="var(--anatomy-${tone})" stroke-width=".45" stroke-linejoin="round"/>`).join('');add(...a.map((q,j)=>(q+b[j])/2),svg);};
 const u=(Math.sin(time)+1)/2;
 B(0,0,37,35,0,3,'lo');B(0,0,34,32,3,1,'mid');
 for(const x of [-14,14])for(const y of [-13,13])screw(x,y,4);
 // Mounting rails, drive pedestal, knurled crank and bearing collars.
 for(const y of [-10,10]){B(0,y,30,2,4,1.5);for(const x of [-13,13])screw(x,y,5.5);}
 B(-12,0,7,9,4,4);C(-12,0,3.7,8,2,'hi');
 for(let j=0;j<16;j++){const a=j*Math.PI/8;C(-12+Math.cos(a)*3.1,Math.sin(a)*3.1,.3,10,.4,'lo');}
 C(-12+Math.cos(time)*2,Math.sin(time)*2,.7,10.4,2,'hi');
 if(index===0){
  for(let j=0;j<3;j++){const y=-7+j*7,h=2+Math.max(0,Math.sin(time-j*2.094))*6;B(3,y,19,5,5.5,1);for(const x of [-5,11])C(x,y,.7,6.5,10);B(3,y,17,4,6.5+h,1.7,'hi',lit&&j===Math.floor((time%(Math.PI*2))/(Math.PI*2/3)));B(4,y,8,2,8.2+h,1,'mid');}
  for(const y of [-12,12]){B(15,y,3,3,5.5,16);screw(15,y,21.5);}B(15,0,2,26,21.5,2);scale(15,0,2,23,23.5);
  for(let j=0;j<3;j++){const y=-7+j*7;spring(3,y,7,2+Math.max(0,Math.sin(time-j*2.094))*6);C(3,y,2,5.5,1.5,'hi');}
 }else if(index===1){
  B(3,0,19,25,5.5,2);for(const x of [-6,12])for(const y of [-9,9]){C(x,y,1,7.5,15);C(x,y,1.8,20.5,2);}for(const y of [-9,9])B(3,y,22,3,22.5,2);B(3,0,22,4,22.5,2);for(const x of [-6,12])B(x,0,3,20,22.5,2);
  B(3,-2+u*4,16,12,7.5,1.2,'hi',lit);
  for(const x of [-3,3,9]){C(x,0,2.3,24.5,1);C(x,0,.8,10+u*4,19-u*4,'hi');spring(x,0,25.5,4);C(x,0,1.7,29.5,1);}
 }else if(index===2){
  B(3,0,22,23,5.5,1);scale(3,0,19,20,6.5);
  for(const y of [-11,11]){B(3,y,25,1.4,7,2);for(const x of [-8,14])B(x,y,3,3,6.5,4);}
  const x=-5+u*16;B(x,0,3,25,9,2,'hi');B(x,Math.cos(time)*7,7,6,11,3);C(x,Math.cos(time)*7,.65,6.9,7.1,'hi',lit);
  for(let j=0;j<18;j++)C(-7+j*1.15,-11,.65,9,.5,'lo');
 }else if(index===3){
  for(const x of [-7,12])for(const y of [-8,8]){B(x,y,4,4,5.5,3);C(x,y,1,8.5,20);C(x,y,2,28.5,1);}
  for(const y of [-8,8])B(2,y,27,3,29.5,3);for(const x of [-7,12])B(x,0,3,19,29.5,3);B(2,0,5,7,29.5,3);const cx=2+3*Math.cos(time),cz=36+3*Math.sin(time),slider=cz-Math.sqrt(100-9*Math.cos(time)**2),h=slider-6;rod([2,-2,36],[2,2,36],3.8,'hi');rod([cx,2,cz],[2,2,slider],.65,'hi');rod([cx,1.6,cz],[cx,2.4,cz],1.2,'hi');C(2,0,3,32.5,1.5);rod([2,0,h+3],[2,0,slider],1.2,'hi');B(2,0,20,17,h,3,'hi');for(const x of [-7,12])for(const y of [-8,8]){C(x,y,2,h,3,'mid');screw(x,y,32.5);}C(2,0,1.8,h+3,32.5-h-3);B(2,0,7,7,h-3,3,'hi',lit);
  B(2,0,13,12,5.5,2);B(2,0,7,6,7.5,2,'hi');for(const x of [-7,11]){B(x,0,3,10,7.5,3);screw(x,0,10.5);}
 }else if(index===4){
  B(2,0,17,15,5.5,3);B(2,0,9,8,8.5,3,'hi');
  for(const y of [-9,9]){B(2,y,23,3,5.5,3);C(11,y,1.2,8.5,20);C(11,y,2,28.5,1);}
  B(11,0,5,21,29.5,3);B(2,0,20,4,29.5,3);C(2,0,2.6,20+u*5,9.5-u*5);C(2,0,.9,12+u*5,8,'hi',lit);spring(2,0,25,4);
  C(-5,8,5.3,13,2,'hi');add(-5,8,15.1,k.lineSvg(k.ring(-5,8,4.4,15,P,40),{tone:'lo'}));for(let j=0;j<12;j++){const a=j*Math.PI/6;beam([-5+Math.cos(a)*4.4,8+Math.sin(a)*4.4],[-5+Math.cos(a)*3.8,8+Math.sin(a)*3.8],.16,15.05,.12,'lo');}const a=-2+u*4;beam([-5,8],[-5+Math.cos(a)*3.7,8+Math.sin(a)*3.7],.5,15.15,.3,'hi');C(-5,8,.8,15.45,.4);
 }else if(index===5){
  for(const x of [-7,12])for(const y of [-8,8]){B(x,y,4,4,5.5,2);C(x,y,1,7.5,25);C(x,y,2,32.5,1);}
  for(const y of [-8,8])B(2,y,25,3,33.5,2);for(const x of [-7,12])B(x,0,3,19,33.5,2);for(const [y,z] of [[13,8],[-13,25]]){B(2,y,18,6,z,1);for(const x of [-5,9])C(x,y,.8,5.5,z-5.5);}const z=8+u*17;B(2,0,22,19,z,2,'hi');for(const x of [-7,12])for(const y of [-8,8])C(x,y,2,z,2,'mid');B(2,0,10,8,z+2,5,'hi',lit);B(2,0,7,5,z+7,.7);
  for(const y of [-8,8])B(2,y,20,1,z+2,3);C(2,0,1,5.5,z-5.5);for(let j=0;j<12;j++)C(2,0,1.5,6+j*2,.4,'lo');
 }else{
  B(3,0,19,18,5.5,3);C(3,0,5,8.5,2);C(3,0,1.4,10.5,23,'hi');C(3,0,4,30.5,2);
  const spread=4+u*4,drop=Math.sqrt(100-spread*spread),z=31-drop,collar=31-2*drop;C(3,0,3,collar-1,2,'hi',lit);
  for(const side of [-1,1]){const a=time+(side===1?0:Math.PI),p=[3+Math.cos(a)*spread,Math.sin(a)*spread];rod([3,0,31],[...p,z],.65,'hi');rod([...p,z],[3,0,collar],.65,'hi');C(...p,2.7,z-2,4,'hi');C(...p,.9,z+2,.7);}
  B(13,0,3,20,5.5,2);scale(13,0,2,18,7.5);B(13,-7+u*14,5,2,7.85,2,'hi');
 }
 return items.sort((a,b)=>a.d-b.d||a.n-b.n).map(p=>p.svg).join('');
}

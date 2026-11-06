import {GEAR_MESH} from './gear-mesh.mjs';
// World units: millimetre-like construction dimensions. All stations are
// anchored to the bed; only the disc, workpiece, gears and tools move.
export function machineGeometry(k,P,stationAngles,mesh=GEAR_MESH){
 let parts=null;
 const record=(svg,points)=>{
  if(!parts)return svg;
  const id=parts.length;
  parts.push({svg,points,depth:k.depthOf(points.reduce((a,p)=>a.map((v,j)=>v+p[j]/points.length),[0,0,0]),P)});
  return `<!--part:${id}-->`;
 };
 function assembly(i,m){
  parts=[];
  const markup=station(i)+tool(i,m),items=parts;parts=null;
  // Preserve each solid's material while allowing fixed and moving parts to interleave.
  const stack=[];
  for(const token of markup.matchAll(/<g\b[^>]*>|<\/g>|<!--part:(\d+)-->/g)){
   if(token[1]!==undefined)items[Number(token[1])].svg=stack.join('')+items[Number(token[1])].svg+'</g>'.repeat(stack.length);
   else if(token[0]==='</g>')stack.pop();else stack.push(token[0]);
  }
  // Deployment's opposed guides are separated in the station's own axes.
  // World-aligned boxes overlap after rotation and lose that stable ordering.
  const angle=i===5?stationAngles[i]:0,cos=Math.cos(angle),sin=Math.sin(angle);
  const axes=[[cos,sin,0],[-sin,cos,0],[0,0,1]];
  const bounds=items.map(item=>axes.map(axis=>{
   const values=item.points.map(p=>p.reduce((sum,v,j)=>sum+v*axis[j],0));
   return [Math.min(...values),Math.max(...values)];
  }));
  const silhouettes=i===5?items.map(item=>{
   const points=item.points.map(p=>k.iso(p,P)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
   const half=points=>{const out=[];for(const p of points){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}return out;};
   return [...half(points).slice(0,-1),...half([...points].reverse()).slice(0,-1)];
  }):[];
  const overlaps=(A,B)=>{
   for(const polygon of [A,B])for(let j=0;j<polygon.length;j++){
    const p=polygon[j],q=polygon[(j+1)%polygon.length],axis=[p[1]-q[1],q[0]-p[0]];
    const project=points=>points.map(p=>p[0]*axis[0]+p[1]*axis[1]);
    const a=project(A),b=project(B);
    if(Math.max(...a)<=Math.min(...b)+1e-6||Math.max(...b)<=Math.min(...a)+1e-6)return false;
   }
   return true;
  };
  const edges=items.map(()=>[]),indegree=items.map(()=>0);
  for(let a=0;a<items.length;a++)for(let b=a+1;b<items.length;b++){
   if(i===5&&!overlaps(silhouettes[a],silhouettes[b]))continue;
   // A separating world plane decides which complete solid is nearer.
   // Opposed deployment guides separate laterally; stacked contacts separate vertically.
   for(const axis of (i===5?[0,1,2]:[2,0,1])){
    const A=bounds[a][axis],B=bounds[b][axis];
    const sign=A[1]<=B[0]+1e-6?1:B[1]<=A[0]+1e-6?-1:0;
    if(!sign)continue;
    const normal=axes[axis].map(v=>v*sign);
    const [back,front]=k.depthOf(normal,P)>0?[a,b]:[b,a];
    edges[back].push(front);indegree[front]++;break;
   }
  }
  const result=[],remaining=new Set(items.map((_,j)=>j));
  while(remaining.size){
   const ready=[...remaining].filter(j=>!indegree[j]).sort((a,b)=>items[a].depth-items[b].depth);
   const j=ready[0]??[...remaining].sort((a,b)=>items[a].depth-items[b].depth)[0];
   remaining.delete(j);result.push(items[j].svg);for(const next of edges[j])indegree[next]--;
  }
  return result.join('');
 }
 const B=(x,y,w,d,z,h,tone='mid',lit=false,a=0)=>{
  const c=Math.cos(a),s=Math.sin(a),ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*c-v*s,y+u*s+v*c]);
  return record(k.solidSvg(k.extrude(ring,z,h,P),{tone,lit}),ring.flatMap(([x,y])=>[[x,y,z],[x,y,z+h]]));
 };
 const C=(x,y,r,z,h,tone='mid',lit=false)=>record(k.solidSvg(k.cylinder(x,y,r,z,h,P,48,.35),{tone,lit}),Array.from({length:48},(_,j)=>{const a=j*Math.PI/24;return [[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z+h]];}).flat());
 const plainDisc=(x,y,r,z,h,tone='mid')=>k.solidSvg(k.cylinder(x,y,r,z,h,P,48,0),{tone,crease:'none'});
 const L=(d,tone='lo')=>k.lineSvg(d,{tone});
 const ring=(x,y,r,z,tone='lo')=>record(L(k.ring(x,y,r,z,P,80),tone),[[x-r,y-r,z],[x+r,y+r,z]]);
 const dot=(x,y,z,size=.5,tone='hi')=>k.dotsSvg([k.iso([x,y,z],P)],{size,tone});
 const screw=(x,y,z)=>ring(x,y,1.25,z,'lo')+dot(x,y,z,.45);
 const local=(i,u,v,z=0)=>{const a=stationAngles[i],c=Math.cos(a),s=Math.sin(a);return [(134+u)*c-v*s,(134+u)*s+v*c,z];};
 const b=(i,u,v,w,d,z,h,tone='mid',lit=false)=>{const [x,y]=local(i,u,v);return B(x,y,w,d,z,h,tone,lit,stationAngles[i]);};
 const c=(i,u,v,r,z,h,tone='mid',lit=false)=>{const [x,y]=local(i,u,v);return C(x,y,r,z,h,tone,lit);};
 const bolts=(i,u,v,w,d,z)=>[-1,1].map(j=>[-1,1].map(l=>{const [x,y]=local(i,u+j*w/2,v+l*d/2);return screw(x,y,z);}).join('')).join('');
 const trainAngle=20*Math.PI/180;
 const gearCenters=[[0,0],[117*Math.cos(trainAngle),117*Math.sin(trainAngle)]];
 const pinionPhase=(78*trainAngle+13*Math.PI)/14;
 let profileAngle=null,profileCache;
 const profiles=angle=>{if(profileAngle!==angle){profileAngle=angle;profileCache=[mesh.profile({teeth:64,angle}),mesh.profile({x:gearCenters[1][0],y:gearCenters[1][1],teeth:14,angle:-angle*64/14+pinionPhase})];}return profileCache;};
 function gearTop(points){return `<g class="iso-solid"><path class="iso-top" d="${k.pathOf(points.map(([x,y])=>k.iso([x,y,24],P)),true)}"/><path class="iso-line iso-edge" data-tone="hi" d="${k.pathOf(points.map(([x,y])=>k.iso([x,y,24],P)),true)}"/></g>`;}
 function gearSides(model){return mesh.sides(k,P,profiles(model.angle)).svg;}
 function gears(model){const [x,y]=gearCenters[1];let s=gearTop(profiles(model.angle)[1]);
  const angle=model.gears[1]+pinionPhase;for(let j=0;j<3;j++){const a=angle+j*Math.PI*2/3;s+=ring(x+Math.cos(a)*9.66,y+Math.sin(a)*9.66,2.1,24,'lo');}
  return `<g data-drive-gear="pinion">${s+plainDisc(x,y,3.36,24,3,'mid')}</g>`;}
 function supports(){let s='';
  s+=C(0,0,41,0,4,'lo')+C(0,0,27,4,6,'mid')+plainDisc(0,0,5,10,8,'mid');
  const [px,py]=gearCenters[1];s+=B(px,py,25,25,0,3,'lo')+C(px,py,7,3,15,'mid');
  return s;
 }
 // The turntable and its teeth are one solid with one uninterrupted top.
 function disc(angle){let s=gearTop(profiles(angle)[0]);
  for(let j=0;j<14;j++){const a=angle+j*Math.PI/7,x=Math.cos(a)*89,y=Math.sin(a)*89;s+=dot(x,y,24,.35,j%2?'lo':'mid');}
  return `<g data-drive-gear="main">${s}</g>`;
 }
 function foundation(i){return `<g data-stage-foundation="${i}" class="stage-frame">${b(i,5,0,23,23,0,3,'lo')}</g>`;}
 function station(i){let s='';
  // A single centered mast supports each stationary cantilever arm.
  s+=`<g data-stage-upright="${i}" class="stage-frame">${c(i,5,0,3.2,3,52,'mid')}</g>`;
  s+=`<g class="stage-frame">${b(i,-21.5,0,66,8,55,6,'hi')}</g>`;
  // Keep the beam junction open; the stage-specific tool explains the operation.
  s+=c(i,-54,0,i===6?8:5.5,52,3,'mid')+c(i,-54,0,4,61,2,'hi');
  s+=`<g class="stage-accent" data-stage-accent="${i}">${b(i,6,0,3,6,61,.6,'hi')}</g>`;
  // Distinct fixed attachments belonging to the station's operation.
  if(i===0){for(const v of [-6,6])s+=b(i,-5,v,17,1.6,15,17,'mid');for(let j=0;j<3;j++)s+=b(i,-5,0,13,10,16+j*3,1,'mid');s+=b(i,-23,0,23,5,28,2,'hi');}
  if(i===1){s+=b(i,-54,0,7,27,51,3,'hi');for(const v of [-8,0,8])s+=c(i,-54,v,2.7,54,2,'mid');}
  if(i===2){for(const v of [-10,10])s+=b(i,-49,v,21,2,48,2,'hi');for(let j=0;j<3;j++)s+=c(i,-58+j*6,-10,.6,50,.7,'lo');s+=b(i,-54,0,2,23,50,2,'hi');}
  if(i===3){s+=b(i,-45,0,13,24,58,3,'hi');for(const v of [-9,9])s+=c(i,-54,v,1.3,38,17,'hi')+c(i,-54,v,2.2,51,3,'mid');s+=c(i,-40,0,7,61,3,'hi');}
  if(i===4)s+=b(i,-29,7,4,15,55,2,'mid');
  if(i===5){for(const v of [-11,11])s+=b(i,-54,v,16,3,47,6,'hi')+c(i,-54,v,2,53,2,'mid');s+=b(i,-8,0,16,14,14,3,'lo');for(let j=0;j<3;j++)s+=b(i,-8,0,11,10,17+j*2,1,'hi');}
  if(i===6)s+=b(i,-25,8,14,10,38,11,'mid');
  return s;
 }
 // The monitoring head tops out at z=52, flush below its fixed guide.
 // Its seven-unit stroke keeps the two cylinders from intersecting.
 function toolPose(i,m){const amount=i===m.stage?m.stroke:0,contact=[29.5,31,31,35,35.5,37,39][i];const lift=i===6?7:12;return {amount,z:contact+lift-amount*lift};}
 function toolDepth(i,m){const {z}=toolPose(i,m);return k.depthOf(local(i,-54,0,(z+63)/2),P);}
 function tool(i,m){const {amount,z}=toolPose(i,m);
  const rodBase=z+(i===6?6:4);
  let s=(i!==1&&rodBase<52?c(i,-54,0,1.6,rodBase,52-rodBase,'hi'):'')+c(i,-54,0,1.6,63,1,'hi');
  if(i===0){s+=b(i,-54,0,10,14,z+2,3,'hi');for(const v of [-6,6])s+=b(i,-54,v,8,2,z,4,'hi',i===m.stage);}
  // Split the gauge rods at the crossbar faces: no whole rod can switch
  // painter order across the rectangular part it passes through.
  if(i===1){for(const v of [-6,0,6]){s+=c(i,-54,v,.7,z,3,'hi',i===m.stage)+c(i,-54,v,.7,z+5,51-(z+5),'hi',i===m.stage);for(let j=0;j<3;j++)s+=c(i,-54,v,1.5,49+j*1.4,.5,'mid');}s+=b(i,-54,0,4,19,z+3,2,'mid');}
  if(i===2){const shift=i===m.stage?Math.sin(m.phase*2)*3:0;s+=b(i,-54,shift,6,7,z+3,4,'hi')+c(i,-54,shift,.65,z,3,'hi',i===m.stage);}
  if(i===3){s+=b(i,-54,0,13,23,z+3,4,'hi')+b(i,-54,0,12,13,z,3,'hi',i===m.stage);for(const v of [-9,9])s+=c(i,-54,v,2.5,z+3,4,'mid');}
  if(i===4)s+=c(i,-54,0,3,z+3,5,'mid')+c(i,-54,0,.8,z,3,'hi',i===m.stage);
  if(i===5){const gap=7-amount*2;for(const v of [-gap,gap])s+=b(i,-54,v,11,2,z,6,'hi',i===m.stage);s+=b(i,-54,0,14,18,z+6,3,'hi');}
  if(i===6){s+=c(i,-54,0,6,z+2,4,'hi')+c(i,-54,0,4.2,z,2,'hi',i===m.stage)+ring(...local(i,-54,0).slice(0,2),3,z,'hi');}
  return s;
 }
 // The test wheel is a separate render item: its real position is farther
 // out than the probe, so it must not inherit the probe's painter order.
 function testWheelDepth(){return k.depthOf(local(4,-29,11,45),P);}
 function testWheel(m){const [x,y]=local(4,-29,11),a=m.testRotation,p=[x+Math.cos(a)*4.5,y+Math.sin(a)*4.5];
  let s=C(x,y,8,40,4,'hi')+ring(x,y,7.2,44,'lo')+plainDisc(x,y,6.6,44,.6,'mid');
  for(const offset of [Math.PI*2/3,Math.PI*4/3])s+=ring(x+Math.cos(a+offset)*4.5,y+Math.sin(a+offset)*4.5,1,44.6,'lo');
  s+=L(k.pathOf([k.iso([x,y,44.65],P),k.iso([...p,44.65],P)]),'hi')+dot(x,y,44.65,.3)+dot(...p,44.65,.3);
  s+=C(x,y,1.3,44.6,.8,'hi')+C(x,y,.65,45.4,9.6,'mid');
  s+=C(...p,1.2,44.6,3,'hi')+C(...p,.7,47.6,.4,'hi');
  return s;
 }
 function workpiece(m){const [x,y]=m.point,a=m.angle;let s=B(x,y,20,19,24,2,'hi',false,a)+B(x,y,15,14,26,3,'hi',true,a);
  for(const v of [-8,8])s+=B(x-Math.sin(a)*v,y+Math.cos(a)*v,13,2,26,2,'mid',false,a);
  if(m.completed>=0){
   const at=(u,v,z=29.5)=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a),z];
   const paper=[[-5.5,-4.5],[4,-4.5],[5.5,-3],[5.5,4.5],[-5.5,4.5]];
   const paths=[[[4,-4.5],[4,-3],[5.5,-3]], [[-3.8,-2.8],[-.5,-2.8],[-.5,2.8],[-3.8,2.8]], [[.5,-2.8],[3.8,-2.8],[3.8,.1],[.5,.1]]];
   if(m.completed>=2)paths.push([[.5,1],[3.8,1],[3.8,2.8],[.5,2.8]]);
   s+='<g data-blueprint="true">'+k.solidSvg(k.extrude(paper.map(([u,v])=>at(u,v).slice(0,2)),29,.5,P),{tone:'hi',lit:true})+L(paths.map(path=>k.pathOf(path.map(([u,v])=>k.iso(at(u,v),P)),true)).join(''),'mid')+'</g>';
  }
  if(m.completed>=1&&m.completed<3)for(const v of [-3,0,3])s+=C(x-Math.sin(a)*v,y+Math.cos(a)*v,1,29.5,1.5,'hi');
  if(m.completed>=3)for(let j=0;j<3;j++){const u=-3+j*3;s+=B(x+Math.cos(a)*u,y+Math.sin(a)*u,2.4,7,29.5,5.5,'hi',false,a);}
  if(m.completed>=4)s+=C(x,y,1.3,35,.5,'hi',true);
  if(m.completed>=5)s+=B(x,y,13,11,35.5,1.5,'hi',false,a);
  if(m.completed>=6)s+=C(x,y,2.2,37,.7,'hi',true);
  return s;
 }
 return {assembly,supports,gears,gearSides,disc,foundation,station,tool,toolDepth,testWheel,testWheelDepth,workpiece,gearCenters,local};
}

// A conjugate spur-gear pair: module 3, 25° pressure angle, 64 / 14 teeth.
// Both wheels use the same addendum, dedendum and flank construction.
export function involuteProfile({x=0,y=0,module=3,teeth,angle=0,pressureAngle=25,segments=7}){
 const pitch=module*teeth/2,base=pitch*Math.cos(pressureAngle*Math.PI/180);
 const root=pitch-1.25*module,tip=pitch+module;
 const involute=r=>{const t=Math.sqrt(Math.max(0,(r/base)**2-1));return t-Math.atan(t);};
 const half=r=>Math.PI/(2*teeth)+involute(pitch)-involute(Math.max(r,base));
 const point=(r,a)=>[x+r*Math.cos(a),y+r*Math.sin(a)];
 const pts=[],start=Math.max(root,base),pitchAngle=Math.PI*2/teeth;
 for(let j=0;j<teeth;j++){
  const a=angle+j*pitchAngle;
  pts.push(point(root,a-pitchAngle/2),point(root,a-half(start)));
  if(root<base)pts.push(point(base,a-half(base)));
  for(let q=0;q<=segments;q++){const r=start+(tip-start)*q/segments;pts.push(point(r,a-half(r)));}
  for(let q=1;q<=3;q++)pts.push(point(tip,a-half(tip)+2*half(tip)*q/3));
  for(let q=segments-1;q>=0;q--){const r=start+(tip-start)*q/segments;pts.push(point(r,a+half(r)));}
  if(root<base)pts.push(point(root,a+half(base)));
  else pts.push(point(root,a+half(root)));
 }
 // Discard repeated vertices at flank / base-circle joins.
 return pts.filter((p,i)=>!i||Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1])>1e-9);
}

// Exact painter constraints for the visible vertical walls of disjoint gears.
// At a common screen x, each wall has a linear floor-depth function. The
// nearer function cannot swap order without the physical edges intersecting.
// Top faces are coplanar at z=24 and are painted after every wall.
export function gearSideFaces(k,P,rings,z=18,height=6){
 const a=P.azimuth*Math.PI/180,view=[Math.cos(a),Math.sin(a)],light=[-Math.sin(a),Math.cos(a)];
 const faces=[];
 for(let gear=0;gear<rings.length;gear++){
  const ring=rings[gear];
  for(let j=0;j<ring.length;j++){
   const p=ring[j],q=ring[(j+1)%ring.length],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);
   if(length<1e-9)continue;
   const nx=dy/length,ny=-dx/length;if(nx*view[0]+ny*view[1]<=1e-9)continue;
   const A=k.iso([...p,z],P),B=k.iso([...q,z],P),C=k.iso([...q,z+height],P),D=k.iso([...p,z+height],P);
   const x0=Math.min(A[0],B[0]),x1=Math.max(A[0],B[0]);if(x1-x0<1e-8)continue;
   const slope=(B[1]-A[1])/(B[0]-A[0]),intercept=A[1]-slope*A[0];
   const shade=Math.min(3,Math.max(0,Math.floor(((nx*light[0]+ny*light[1]+1)/2)*4)));
   const facing=index=>{const p=ring[(index+ring.length)%ring.length],q=ring[(index+1+ring.length)%ring.length];return (q[1]-p[1])*view[0]-(q[0]-p[0])*view[1]>1e-9;};
   const silhouette=[];if(!facing(j-1))silhouette.push([D,A]);if(!facing(j+1))silhouette.push([C,B]);
   faces.push({gear,edge:j,silhouette,points:[A,B,C,D],bottom:[A,B],x0,x1,slope,intercept,depth:(A[1]+B[1])/2,shade});
  }
 }
 const to=faces.map(()=>[]),indegree=faces.map(()=>0),wallHeight=Math.abs(k.iso([0,0,z],P)[1]-k.iso([0,0,z+height],P)[1]);
 let constraints=0;
 for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++){
  const A=faces[i],B=faces[j],lo=Math.max(A.x0,B.x0),hi=Math.min(A.x1,B.x1);if(hi-lo<1e-7)continue;
  const gap=x=>(B.slope-A.slope)*x+B.intercept-A.intercept,g0=gap(lo+1e-7),g1=gap(hi-1e-7);
  if(Math.min(Math.abs(g0),Math.abs(g1))>=wallHeight-1e-7)continue;
  if(g0*g1< -1e-7)throw Error('Intersecting gear-wall edges');
  const d=gap((lo+hi)/2);if(Math.abs(d)<1e-7)continue;
  const back=d>0?i:j,front=d>0?j:i;to[back].push(front);indegree[front]++;constraints++;
 }
 const ready=[];indegree.forEach((n,i)=>{if(!n)ready.push(i);});
 const order=[];
 while(ready.length){ready.sort((a,b)=>faces[b].depth-faces[a].depth);const i=ready.pop();order.push(i);for(const j of to[i])if(--indegree[j]===0)ready.push(j);}
 if(order.length!==faces.length)throw Error('Cyclic gear-wall painter order');
 const svg=order.map(i=>{const f=faces[i];return `<g class="gear-wall" data-gear-wall="${f.gear}"><path class="iso-shade" data-shade="${f.shade}" d="${k.pathOf(f.points,true)}"/><path class="iso-line iso-edge" data-tone="hi" d="${k.pathOf(f.bottom)+f.silhouette.map(edge=>k.pathOf(edge)).join('')}"/></g>`;}).join('');
 return {svg,faces:faces.length,constraints,order};
}
export const GEAR_MESH={profile:involuteProfile,sides:gearSideFaces};

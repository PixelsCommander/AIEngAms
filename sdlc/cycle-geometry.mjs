// World units: millimetre-like construction dimensions. All stations are
// anchored to the bed; only the disc, workpiece, gears and tools move.
export function machineGeometry(k,P,stationAngles){
 const B=(x,y,w,d,z,h,tone='mid',lit=false,a=0)=>{
  const c=Math.cos(a),s=Math.sin(a),ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*c-v*s,y+u*s+v*c]);
  return k.solidSvg(k.extrude(ring,z,h,P),{tone,lit});
 };
 const C=(x,y,r,z,h,tone='mid',lit=false)=>k.solidSvg(k.cylinder(x,y,r,z,h,P,48,.35),{tone,lit});
 const L=(d,tone='lo')=>k.lineSvg(d,{tone});
 const ring=(x,y,r,z,tone='lo')=>L(k.ring(x,y,r,z,P,80),tone);
 const dot=(x,y,z,size=.5,tone='hi')=>k.dotsSvg([k.iso([x,y,z],P)],{size,tone});
 const screw=(x,y,z)=>ring(x,y,1.25,z,'lo')+dot(x,y,z,.45);
 const local=(i,u,v,z=0)=>{const a=stationAngles[i],c=Math.cos(a),s=Math.sin(a);return [(112+u)*c-v*s,(112+u)*s+v*c,z];};
 const b=(i,u,v,w,d,z,h,tone='mid',lit=false)=>{const [x,y]=local(i,u,v);return B(x,y,w,d,z,h,tone,lit,stationAngles[i]);};
 const c=(i,u,v,r,z,h,tone='mid',lit=false)=>{const [x,y]=local(i,u,v);return C(x,y,r,z,h,tone,lit);};
 const bolts=(i,u,v,w,d,z)=>[-1,1].map(j=>[-1,1].map(l=>{const [x,y]=local(i,u+j*w/2,v+l*d/2);return screw(x,y,z);}).join('')).join('');
 function gear(x,y,r,n,angle,z=10){
  const pts=[];for(let j=0;j<n;j++)for(const [f,rr] of [[-.5,r-1.8],[-.32,r-1.8],[-.18,r+2.1],[.18,r+2.1],[.32,r-1.8]]){const a=(j+f)*Math.PI*2/n+angle;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}
  let out=k.solidSvg(k.extrude(pts,z,5,P,{convex:false}),{tone:'hi'});
  out+=C(x,y,r*.72,z+5,.4,'lo')+ring(x,y,r*.64,z+5.4,'faint');
  for(let j=0;j<6;j++){const a=angle+j*Math.PI/3;out+=ring(x+Math.cos(a)*r*.46,y+Math.sin(a)*r*.46,r*.1,z+5.4,'lo');}
  return out+C(x,y,r*.22,z+5.4,3,'mid')+C(x,y,r*.09,z+8.4,1.5,'hi');
 }
 const trainAngle=20*Math.PI/180;
 const gearCenters=[[0,0],[99*Math.cos(trainAngle),99*Math.sin(trainAngle)],[135*Math.cos(trainAngle),135*Math.sin(trainAngle)]];
 const idlerPhase=(66*trainAngle+13*Math.PI)/14;
 const gearPhases=[0,idlerPhase,(24*trainAngle+9*Math.PI-14*idlerPhase)/10];
 function gears(model){return [[78,52],[21,14],[15,10]].map(([r,n],i)=>gear(...gearCenters[i],r,n,model.gears[i]+gearPhases[i])).join('');}
 function supports(){let s='';
  s+=C(0,0,41,0,4,'lo')+C(0,0,27,4,6,'mid');
  for(const [x,y] of gearCenters.slice(1)){s+=B(x,y,25,25,0,5,'lo')+C(x,y,7,5,5,'mid');for(const dx of [-9,9])for(const dy of [-9,9])s+=screw(x+dx,y+dy,5);}
  // A compact finned motor and its shaft bearing sit beside the last pinion.
  const [gx,gy]=gearCenters[2];s+=B(gx+31,gy,22,25,0,18,'mid')+B(gx+31,gy,25,28,18,2,'hi');
  for(let j=0;j<6;j++)s+=B(gx+23+j*3,gy,1,25,3,15,'lo');
  s+=B(gx+13.5,gy,13,3,6,3,'hi');
  s+=C(gx,gy,3.3,5,17,'hi')+C(gx,gy,5,22,2,'mid');
  return s;
 }
 function disc(angle){let s=C(0,0,76,18,6,'mid')+ring(0,0,73,24,'hi')+ring(0,0,68,24,'faint')+ring(0,0,49,24,'faint');
  for(let j=0;j<56;j++){const a=angle+j*Math.PI/28,x=Math.cos(a)*71,y=Math.sin(a)*71;s+=dot(x,y,24,.35,j%8?'lo':'hi');}
  for(let j=0;j<7;j++){const a=angle+j*Math.PI*2/7;s+=screw(Math.cos(a)*37,Math.sin(a)*37,24);}
  s+=C(0,0,21,24,3,'lo')+C(0,0,12,27,3,'mid')+C(0,0,5,30,2,'hi');
  for(let j=0;j<8;j++){const a=j*Math.PI/4;s+=screw(Math.cos(a)*16,Math.sin(a)*16,27);}
  return s;
 }
 function station(i){let s=b(i,0,0,31,31,0,4,'lo')+b(i,0,0,27,27,4,3,'mid')+bolts(i,0,0,23,23,7);
  // Outboard twin uprights leave the rotating disc and its carrier unobstructed.
  for(const v of [-10,10]){s+=b(i,0,v,8,8,7,5,'mid')+c(i,0,v,2.1,12,43,'mid')+c(i,0,v,3.4,48,5,'hi')+c(i,0,v,3.5,55,2,'mid');}
  s+=b(i,-24,0,61,8,55,6,'hi')+b(i,-5,0,7,26,53,3,'mid')+bolts(i,-5,0,3,21,56);
  s+=b(i,-12,0,20,15,45,10,'mid')+b(i,-12,0,16,11,55,1,'lo');
  for(let j=0;j<4;j++)s+=b(i,-18+j*4,0,1,11,56,.5,'lo');
  s+=c(i,-54,0,5.5,52,3,'mid')+c(i,-54,0,4,61,2,'hi');
  // Distinct fixed attachments belonging to the station's operation.
  if(i===0){for(const v of [-6,6])s+=b(i,-5,v,17,1.6,15,17,'mid');for(let j=0;j<5;j++)s+=b(i,-5,0,13,10,16+j*2,1,'hi');s+=b(i,-23,0,23,5,28,2,'hi');}
  if(i===1){s+=b(i,-54,0,7,27,51,3,'hi');for(const v of [-8,0,8])s+=c(i,-54,v,2.7,54,2,'mid');}
  if(i===2){for(const v of [-10,10])s+=b(i,-49,v,21,2,48,2,'hi');for(let j=0;j<12;j++)s+=c(i,-58+j*1.5,-10,.6,50,.7,'lo');s+=b(i,-54,0,2,23,50,2,'hi');}
  if(i===3){s+=b(i,-45,0,13,24,58,3,'hi');for(const v of [-9,9])s+=c(i,-54,v,1.3,38,17,'hi')+c(i,-54,v,2.2,51,3,'mid');s+=c(i,-40,0,7,61,3,'hi');}
  if(i===4){const [x,y]=local(i,-29,11);s+=c(i,-29,11,8,40,4,'hi')+ring(x,y,6.8,44,'mid');for(let j=0;j<12;j++){const a=j*Math.PI/6;s+=dot(x+Math.cos(a)*5.7,y+Math.sin(a)*5.7,44,.32,'mid');}s+=c(i,-29,11,1,44,.7,'hi');}
  if(i===5){for(const v of [-11,11])s+=b(i,-54,v,16,3,47,6,'hi')+c(i,-54,v,2,53,2,'mid');s+=b(i,-8,0,16,14,14,3,'lo');for(let j=0;j<3;j++)s+=b(i,-8,0,11,10,17+j*2,1,'hi');}
  if(i===6){s+=b(i,-25,8,16,11,38,11,'mid')+b(i,-25,8,12,7,49,1,'lo');for(let j=0;j<3;j++)s+=b(i,-28+j*3,8,1,5,50,.5,'hi');s+=c(i,-54,0,8,48,4,'hi');}
  return s;
 }
 function tool(i,m){const amount=i===m.stage?m.stroke:0,contact=[29,31,31,35,35,37,39][i],z=contact+12-amount*12;
  let s=c(i,-54,0,1.6,z+4,63-(z+4),'hi');
  if(i===0){s+=b(i,-54,0,10,14,z+2,3,'hi');for(const v of [-6,6])s+=b(i,-54,v,8,2,z,4,'hi',i===m.stage);}
  if(i===1){for(const v of [-6,0,6]){s+=c(i,-54,v,.7,z,52-z,'hi',i===m.stage);for(let j=0;j<6;j++)s+=c(i,-54,v,1.5,49+j*.7,.35,'mid');}s+=b(i,-54,0,4,19,z+3,2,'mid');}
  if(i===2){const shift=i===m.stage?Math.sin(m.phase*2)*3:0;s+=b(i,-54,shift,6,7,z+3,4,'hi')+c(i,-54,shift,.65,z,3,'hi',i===m.stage);}
  if(i===3){s+=b(i,-54,0,13,23,z+3,4,'hi')+b(i,-54,0,12,13,z,3,'hi',i===m.stage);for(const v of [-9,9])s+=c(i,-54,v,2.5,z+3,4,'mid');}
  if(i===4){s+=c(i,-54,0,3,z+3,5,'mid')+c(i,-54,0,.8,z,3,'hi',i===m.stage);const [x,y]=local(i,-29,11),a=-2+amount*4,p=[x+Math.cos(a)*5.5,y+Math.sin(a)*5.5];s+=L(k.pathOf([k.iso([x,y,44.2],P),k.iso([...p,44.2],P)]),'hi')+dot(...p,44.2,.3);}
  if(i===5){const gap=7-amount*2;for(const v of [-gap,gap])s+=b(i,-54,v,11,2,z,6,'hi',i===m.stage);s+=b(i,-54,0,14,18,z+6,3,'hi');}
  if(i===6){s+=c(i,-54,0,6,z+2,4,'hi')+c(i,-54,0,4.2,z,2,'hi',i===m.stage)+ring(...local(i,-54,0).slice(0,2),3,z,'hi');}
  return s;
 }
 function workpiece(m){const [x,y]=m.point,a=m.angle;let s=B(x,y,20,19,24,2,'hi',false,a)+B(x,y,15,14,26,3,'hi',true,a);
  for(const v of [-8,8])s+=B(x-Math.sin(a)*v,y+Math.cos(a)*v,13,2,26,2,'mid',false,a);
  if(m.completed>=1)for(const v of [-4,0,4])s+=C(x-Math.sin(a)*v,y+Math.cos(a)*v,1,29,2,'hi');
  if(m.completed>=2)s+=B(x,y,11,10,29,.5,'lo',false,a);
  if(m.completed>=3)for(let j=0;j<3;j++){const u=-3+j*3;s+=B(x+Math.cos(a)*u,y+Math.sin(a)*u,2.4,7,29.5,5.5,'hi',false,a);}
  if(m.completed>=4)s+=C(x,y,1.3,35,.5,'hi',true);
  if(m.completed>=5)s+=B(x,y,13,11,35.5,1.5,'hi',false,a);
  if(m.completed>=6)s+=C(x,y,2.2,37,.7,'hi',true);
  return s;
 }
 return {supports,gears,disc,station,tool,workpiece,gearCenters,local};
}

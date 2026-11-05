export const START=-160*Math.PI/180;
export const harbors=Array.from({length:7},(_,i)=>START+i*Math.PI*2/7);
export const stages=[
 ['Plan','Chart the voyage','Choose a worthwhile destination, assess risk, and agree on the scope and resources.','A prioritized release goal and a feasible plan.','The chart office chooses the next useful voyage.','Choose password reset as the next improvement.'],
 ['Requirements','Agree on the manifest','Describe user needs, constraints, and measurable acceptance criteria.','An agreed specification that the team can verify.','The manifest records what the voyage must deliver.','Reset links expire after 15 minutes and work only once.'],
 ['Design','Draw the shipyard plans','Resolve the user experience, architecture, interfaces, and security approach.','A design and a clear implementation approach.','The drafting quay turns the manifest into a buildable blueprint.','Design token storage, the email flow, and the reset screen.'],
 ['Implement','Build and load','Write, review, and integrate code into a reproducible build.','Reviewed code and a working build.','The loading crane assembles the cargo for delivery.','Build the endpoint, reset form, and email template.'],
 ['Test','Pass the sea trials','Use automated checks and exploratory testing to evaluate behavior, reliability, and security.','Test evidence, defects to fix, and a readiness decision.','The inspection berth checks that the cargo is fit for the voyage.','Verify valid links work and expired or reused links fail.'],
 ['Deploy','Deliver to the destination','Release through a controlled pipeline, validate production behavior, and prepare rollback.','A production release and a recovery plan.','The delivery quay receives the release for real use.','Roll out gradually while watching production errors.'],
 ['Maintain','Listen, repair, return','Monitor production, respond to incidents, patch dependencies, and collect feedback.','Operational fixes and new priorities for the next iteration.','The service harbor and lighthouse guide the next trip.','Delayed reset emails become a delivery improvement in the next plan.']
];
export function voyageState(time){
 const leg=Math.floor(time/8),phase=time-leg*8,stage=((leg%7)+7)%7;
 const t=Math.max(0,Math.min(1,(phase-3.5)/4.5)),travel=t*t*(3-2*t);
 const angle=-160*Math.PI/180+(leg+travel)*Math.PI*2/7;
 return {time,stage,phase,angle,heading:angle+Math.PI/2,moving:phase>3.5,
  point:[86*Math.cos(angle),86*Math.sin(angle)],
  progress:((time%56)+56)%56/56,
  speed:t>0&&t<1?86*(Math.PI*2/7)*6*t*(1-t)/4.5:0,
  status:phase<=3.5?'moored':'under way'};
}

export const TAU=Math.PI*2;
export const CYCLE_SECONDS=49;
export const START=-160*Math.PI/180;
export const stationAngles=Array.from({length:7},(_,i)=>START+i*TAU/7);
export const stages=[
 ['Plan','Priority feeder','Choose the problem worth solving.','The feeder selects a blank release carrier and seats it on the disc.','A prioritized goal, a scope, and a feasible plan.','Choose password reset as the next improvement.'],
 ['Requirements','Specification gate','Define what success must mean.','Three sprung gauges check the workpiece against explicit constraints.','User needs, constraints, and testable acceptance criteria.','Reset links expire after 15 minutes and work only once.'],
 ['Design','Coordinate plotter','Resolve the structure before building.','A cross-slide moves a stylus over the carrier and traces the intended layout.','A technical design, interfaces, and a user experience.','Design token storage, the email flow, and the reset screen.'],
 ['Implement','Assembly press','Turn the design into working software.','A guided ram seats three components onto the prepared carrier.','Reviewed code and a reproducible build.','Build the endpoint, reset form, and email template.'],
 ['Test','Verification probe','Collect evidence that the build works.','A spring probe loads the assembly while a dial follows its stroke.','Test results, defects, and evidence of release readiness.','Check valid, expired, and reused reset links.'],
 ['Deploy','Release clamp','Put the release into controlled use.','Opposed jaws hold the finished assembly while a release cap is seated.','A production release, health checks, and a rollback plan.','Roll out gradually and watch production error rates.'],
 ['Maintain','Monitoring head','Learn from production and feed the next cycle.','A scanning head inspects the sealed release; its findings return to planning.','Operational fixes and new work for the backlog.','Delayed emails become a delivery improvement in the next plan.']
];
export function cycleState(seconds){
 const absoluteStep=Math.floor(seconds/7),phase=seconds-absoluteStep*7;
 const stage=((absoluteStep%7)+7)%7;
 const travel=Math.max(0,Math.min(1,(phase-4.5)/2.5));
 const eased=travel*travel*(3-2*travel);
 const angle=START+(absoluteStep+eased)*Math.PI*2/7;
 const working=phase<4.5;
 const stroke=working?Math.sin(Math.PI*phase/4.5)**2:0;
 const completed=phase>=2.25?stage:stage-1;
 return {seconds,stage,phase,travel,angle,stroke,working,completed,
  point:[58*Math.cos(angle),58*Math.sin(angle)],
  status:working?(stroke>.75?'working':phase<2.25?'lowering tool':'retracting tool'):'indexing disc',
  gears:[angle,-angle*52/14,angle*52/10]};
}

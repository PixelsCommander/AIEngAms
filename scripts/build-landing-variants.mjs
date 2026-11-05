import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Reuse the standalone SVG scenes and their working controls/animation model.
// Isolated documents keep the illustration's kit CSS out of the landing page.
const landing=readFileSync('index.html','utf8');
const diagram=/<svg class="the-event-svg-2"[\s\S]*?<\/svg>/;
if(!diagram.test(landing))throw new Error('Landing SDLC diagram not found');
for(const variant of ['sdlc','sdlc-boat']){
  execFileSync(process.execPath,[`${variant}/build.mjs`],{stdio:'inherit'});
  const boat=variant==='sdlc-boat';
  // Crop unused projection margins; preserve the SVG's isometric proportions.
  const crop=boat?{x:150,y:160,w:820,h:530}:{x:150,y:120,w:820,h:580};
  const embedCss=`<style>
html,body{margin:0;overflow:hidden;background:#181714}
body.iso{--anatomy-page:#181714;--anatomy-card:#181714;--anatomy-paper:#181714}
.iso-page{position:absolute;width:${1120/crop.w*100}vw;max-width:none;margin:0;left:${-crop.x/crop.w*100}vw;top:${-crop.y/crop.w*100}vw}
.iso-plate{padding:0;background:transparent}.controls{display:none}
.station-label,.harbor-label{font-family:ui-monospace,monospace;font-size:clamp(7px,1.55vw,12px);padding:3px 4px;background:#181714}
.station-label span,.harbor-label span{font-size:.8em}
.iso-stage .cycle-heading,.voyage .cycle-heading{font-family:Archivo,system-ui,sans-serif;font-size:clamp(11px,2.89vw,26px);font-weight:700;line-height:1.23;letter-spacing:-.025em;color:#f4f2ec;text-shadow:none}
@media(max-width:760px){.station-label[data-stage-label="0"]{left:41.4%!important;top:19.8%!important}.station-label[data-stage-label="1"]{left:57.5%!important;top:21%!important}.station-label[data-stage-label="2"]{left:78.2%!important}.station-label[data-stage-label="3"]{left:77%!important}.station-label[data-stage-label="4"]{top:81%!important}.station-label[data-stage-label="5"]{left:22%!important}.station-label[data-stage-label="6"]{left:22%!important}.harbor-label[data-stop="0"]{left:39.9%!important;top:30.4%!important}.harbor-label[data-stop="1"]{left:62.3%!important;top:31.1%!important}.harbor-label[data-stop="2"]{left:77.7%!important}.harbor-label[data-stop="3"]{left:75%!important}.harbor-label[data-stop="4"]{top:79%!important}.harbor-label[data-stop="5"]{left:24.3%!important}.harbor-label[data-stop="6"]{left:20.7%!important}.iso-stage .cycle-heading{top:46.7%}}
${boat?'':'.station-label[data-stage-label="4"]{top:calc(81% - 32px)!important}'}
</style>`;
  const source=readFileSync(`${variant}/index.html`,'utf8').replace('</head>',embedCss+'</head>');
  writeFileSync(`${variant}/landing.html`,source);
  const frame=`<iframe class="landing-cycle" src="${variant}/landing.html" title="${boat?'Sailing boat':'Mechanical'} SDLC cycle — select a stage to explore" loading="lazy" style="aspect-ratio:${crop.w}/${crop.h}"></iframe>`;
  const result=landing.replace(diagram,frame).replace('</head>','  <link rel="stylesheet" href="css/landing-variants.css">\n</head>').replace('<body>',`<body class="landing-${variant}">`);
  writeFileSync(`index-${variant}.html`,result);
}

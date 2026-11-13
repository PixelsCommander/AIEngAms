import {readFileSync,writeFileSync} from 'node:fs';

// Reuse the standalone SVG scenes and their working controls/animation model.
// Inline srcdoc keeps scene settings in each landing file and isolates kit CSS.
const landing=readFileSync('index.html','utf8');
const diagram=/<svg class="the-event-svg-2"[\s\S]*?<\/svg>/;
if(!diagram.test(landing))throw new Error('Landing SDLC diagram not found');
for(const variant of ['sdlc','sdlc-boat']){
  const boat=variant==='sdlc-boat';
  // Crop unused projection margins; preserve the SVG's isometric proportions.
  const crop=boat?{x:215,y:205,w:665,h:420}:{x:225,y:120,w:670,h:490};
  const embedCss=`<style>
html,body{margin:0;overflow:hidden;background:${boat?'#181714':'transparent'}}
${boat?'':'html{color-scheme:normal}'}
body.iso{--anatomy-page:#181714;--anatomy-card:#181714;--anatomy-paper:#181714}
.iso-page{position:absolute;width:${1120/crop.w*100}vw;max-width:none;margin:0;left:${-crop.x/crop.w*100}vw;top:${-crop.y/crop.w*100}vw}
.iso-plate{padding:0;background:transparent}.controls{display:none}
.station-label,.harbor-label{font-family:ui-monospace,monospace;font-size:clamp(7px,1.55vw,12px);padding:3px 4px;background:#181714}
.station-label span,.harbor-label span{font-size:.8em}
.iso-stage .cycle-heading,.voyage .cycle-heading{font-family:Archivo,system-ui,sans-serif;font-size:clamp(11px,2.89vw,26px);font-weight:700;line-height:1.23;letter-spacing:-.025em;color:#f4f2ec;text-shadow:none}
@media(max-width:760px){.station-label[data-stage-label="0"]{left:41.4%!important;top:19.8%!important}.station-label[data-stage-label="1"]{left:57.5%!important;top:21%!important}.station-label[data-stage-label="2"]{left:78.2%!important}.station-label[data-stage-label="3"]{left:77%!important}.station-label[data-stage-label="4"]{top:81%!important}.station-label[data-stage-label="5"]{left:22%!important}.station-label[data-stage-label="6"]{left:22%!important}.harbor-label[data-stop="0"]{left:39.9%!important;top:30.4%!important}.harbor-label[data-stop="1"]{left:62.3%!important;top:31.1%!important}.harbor-label[data-stop="2"]{left:77.7%!important}.harbor-label[data-stop="3"]{left:75%!important}.harbor-label[data-stop="4"]{top:79%!important}.harbor-label[data-stop="5"]{left:24.3%!important}.harbor-label[data-stop="6"]{left:20.7%!important}.iso-stage .cycle-heading{top:46.7%}}
${boat?'.harbor-label[data-stop="5"]{left:28%!important}.harbor-label[data-stop="6"]{left:25%!important}.harbor-label[data-stop="2"]{left:74%!important}.harbor-label[data-stop="3"]{left:71.5%!important}':'.station-label[data-stage-label="4"]{top:calc(81% - 64px)!important}.station-label[data-stage-label="6"],.station-label[data-stage-label="5"]{left:26%!important}.station-label[data-stage-label="2"]{left:74%!important}.station-label[data-stage-label="3"]{left:73%!important}'}
</style>`;
  let source=readFileSync(`${variant}/index.html`,'utf8').replace('</head>',embedCss+'</head>');
  if(boat){
    // Crop the SVG coordinate system itself, rather than offsetting an oversized page.
    source=source.replace('viewBox="0 0 1120 760"',`viewBox="${crop.x} ${crop.y} ${crop.w} ${crop.h}" preserveAspectRatio="xMidYMid meet"`);
    const labels=[[39.9,30.4],[62.3,31.1],[74,47],[71.5,67],[48.7,79],[28,65],[25,46]];
    const labelCss=labels.map(([x,y],i)=>`.harbor-label[data-stop="${i}"]{left:${(1120*x/100-crop.x)/crop.w*100}%!important;top:${(760*y/100-crop.y)/crop.h*100}%!important}`).join('');
    const nativeCss=`<style>.iso-page{position:static;width:100%;max-width:none;margin:0}.voyage>.iso-svg{display:block;width:100%;height:auto;aspect-ratio:${crop.w}/${crop.h}}${labelCss}.voyage .cycle-heading{left:${(560-crop.x)/crop.w*100}%;top:${(760*.542-crop.y)/crop.h*100}%}</style>`;
    source=source.replace('</head>',nativeCss+'</head>');
  }
  const srcdoc=source.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const placement='width:100%';
  const frame=`<iframe class="landing-cycle" srcdoc="${srcdoc}" title="${boat?'Sailing boat':'Mechanical'} SDLC cycle — select a stage to explore" loading="lazy" style="aspect-ratio:${crop.w}/${crop.h};${placement}"></iframe>`;
  const result=landing.replace('<div class="the-event-div-3"></div>','').replace('The event where three good things come together:','The event where <span class="event-highlight">three good things</span> come together:').replace(diagram,frame).replace('</head>','  <link rel="stylesheet" href="css/landing-variants.css">\n</head>').replace('<body>',`<body class="landing-${variant}">`);
  writeFileSync(`index-${variant}.html`,result);
}

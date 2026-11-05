/* AI Engineering Amsterdam · landing page
   - "How does your team ship with AI?" fleet: hover/click a ship or a stage to inspect it
   - tickets slider arrows
   - hero video autoplay (respects prefers-reduced-motion) */
'use strict';
(function () {
  var data = [
    {
      "id": "curiosity",
      "number": "01",
      "name": "Curiosity",
      "tagline": "Ad hoc AI experimentation",
      "description": "Individual engineers occasionally experiment with AI tools. Useful discoveries have yet to become repeatable team practices.",
      "characteristics": [
        "Occasional, individual use",
        "No established workflows or guidance",
        "Results depend on the person"
      ],
      "nextStep": "Choose one recurring engineering task and document what makes AI useful for it."
    },
    {
      "id": "individual-adoption",
      "number": "02",
      "name": "Individual adoption",
      "tagline": "AI-powered productivity",
      "description": "Engineers regularly use AI for coding, debugging, research, and documentation. Workflows and results still vary across the team.",
      "characteristics": [
        "Regular coding and debugging assistance",
        "Personal prompts and tool preferences",
        "Limited visibility into shared impact"
      ],
      "nextStep": "Turn your strongest individual workflows into practices the team can test and improve."
    },
    {
      "id": "team-workflows",
      "number": "03",
      "name": "Team workflows",
      "tagline": "Shared AI practices",
      "description": "The team shares working methods, agrees on conventions, standardizes tools, and brings AI into code review.",
      "characteristics": [
        "Shared workflows and tool conventions",
        "Explicit review and quality expectations",
        "Reusable instructions and team knowledge"
      ],
      "nextStep": "Connect one shared workflow to your delivery pipeline. Measure its effect on quality and flow."
    },
    {
      "id": "integrated-engineering",
      "number": "04",
      "name": "Integrated engineering",
      "tagline": "AI across the development lifecycle",
      "description": "AI connects development, testing, review, automation, and delivery. Teams measure productivity and quality together.",
      "characteristics": [
        "AI embedded across the delivery lifecycle",
        "Automated checks and clear human ownership",
        "Evidence guiding where AI adds value"
      ],
      "nextStep": "Build a reliable operating model for agents, permissions, evaluation, and accountability."
    },
    {
      "id": "ai-native-organization",
      "number": "05",
      "name": "AI-native organization",
      "tagline": "AI as a core engineering capability",
      "description": "AI fundamentally shapes engineering workflows, team structures, delivery processes, and organizational strategy.",
      "characteristics": [
        "Team structures built around AI capabilities",
        "Continuous evaluation and organizational learning",
        "Strategy informed by new delivery possibilities"
      ],
      "nextStep": "Keep evolving the operating model. Use customer value and engineering reliability as your measures."
    }
  ];
  var hulls = [[53,152],[237,370],[432,574],[605,756],[785,997]];
  var stage = -1;
  var group = document.getElementById('stage-buttons');
  var intro = document.getElementById('corner-intro');
  var detail = document.getElementById('corner-detail');
  var title = document.getElementById('cur-title');
  var next = document.getElementById('cur-next');
  var chars = document.getElementById('cur-chars');
  var underline = document.getElementById('active-underline');
  var vessels = document.querySelectorAll('[data-vessel]');
  var btns = [];
  data.forEach(function (d, k) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'stage-btn' + (k < 3 ? ' stage-btn--col' : '');
    b.innerHTML = '<span class="stage-num">' + d.number + '</span><span class="stage-name">' + d.name + '</span><span class="stage-tag">' + d.tagline + '</span>';
    b.addEventListener('click', function () { setStage(k); });
    b.addEventListener('mouseenter', function () { setStage(k); });
    group.appendChild(b); btns.push(b);
  });
  function setStage(i) {
    stage = i;
    btns.forEach(function (b, k) {
      var sel = k === i;
      b.setAttribute('aria-pressed', sel ? 'true' : 'false');
      b.classList.toggle('is-active', sel);
    });
    for (var k = 0; k < vessels.length; k++) {
      var v = vessels[k], n = +v.getAttribute('data-vessel');
      v.setAttribute('class', 'vessel' + (n === i ? ' is-active' : (i >= 0 && n < i ? ' is-progress' : '')));
    }
    underline.setAttribute('d', i >= 3 ? 'M' + hulls[i][0] + ' 401H' + hulls[i][1] : 'M-9999 0H-9998');
    if (i >= 0) {
      var d = data[i];
      title.textContent = d.number + ' · ' + d.name;
      next.textContent = d.nextStep;
      chars.innerHTML = d.characteristics.map(function (t) {
        return '<li class="corner-item"><span aria-hidden="true" class="corner-plus">+</span><span>' + t + '</span></li>';
      }).join('');
      intro.hidden = true; detail.hidden = false;
    } else {
      intro.hidden = false; detail.hidden = true;
    }
  }
  document.querySelectorAll('[data-pick]').forEach(function (r) {
    var k = +r.getAttribute('data-pick');
    r.addEventListener('click', function () { setStage(k); });
    r.addEventListener('mouseenter', function () { setStage(k); });
  });
  document.querySelectorAll('[data-clear]').forEach(function (el) {
    el.addEventListener('mouseleave', function () { setStage(-1); });
  });
  setStage(-1);
  function scrollTickets(dir) {
    var r = document.querySelector('.tickets-row');
    if (r) r.scrollBy({ left: dir * 416, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-tickets]').forEach(function (b) {
    b.addEventListener('click', function () { scrollTickets(b.getAttribute('data-tickets') === 'next' ? 1 : -1); });
  });
  try {
    var vids = document.querySelectorAll('.hero-video');
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i]; v.muted = true;
      if (still) { v.removeAttribute('autoplay'); v.pause(); continue; }
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    }
  } catch (e) {}
})();

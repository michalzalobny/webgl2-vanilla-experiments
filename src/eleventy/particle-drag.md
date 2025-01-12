---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>

<img src="/public/assets/touch.svg" alt="touch" style="position:fixed; z-index:5; height:60px; color:white; opacity:0.5; top:50%; transform:translateY(-50%); right:25px;" class="hide-on-mobile" />

<!-- Scripts -->
<script type="module" defer src="/js/particle-drag/App.js"></script>

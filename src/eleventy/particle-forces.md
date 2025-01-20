---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>

<div style="position:fixed; z-index:5; top:50%; transform:translateY(-50%); right:25px;">
<img src="/public/assets/wasd.svg" alt="wasd" style=" height:60px; color:white; opacity:0.5;" class="hide-on-mobile bounceIn" />
</div>

<!-- Scripts -->
<script type="module" defer src="/js/particle-forces/App.js"></script>

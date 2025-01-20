---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>

<div class="enter-info-icon">
<img src="/public/assets/wasd.svg" alt="wasd" class="info-icon bounceIn" />
</div>

<!-- Scripts -->
<script type="module" defer src="/js/attraction/App.js"></script>

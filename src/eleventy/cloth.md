---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>

<div class="enter-info-icon">
<img src="/public/assets/touch.svg" alt="touch" class="info-icon bounceIn" />
</div>

<p  class="extra-info">Right mouse button to tear ✂️</p>
<!-- Scripts -->
<script type="module" defer src="/js/cloth/App.js"></script>

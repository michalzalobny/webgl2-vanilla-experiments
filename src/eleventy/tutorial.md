---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas width="450" height="250" style="border:1px solid black; position:fixed; top:50%; left:50%; transform: translate(-50%,-50%);"></canvas>

<!-- <div class="enter-info-icon">
<img src="/public/assets/wasd.svg" alt="wasd" class="info-icon bounceIn" />
</div> -->

<!-- Scripts -->
<script type="module" defer src="/js/tutorial/App.js"></script>

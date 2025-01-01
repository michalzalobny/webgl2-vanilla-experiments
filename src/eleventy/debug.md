---
layout: 'layouts/base.njk'
---

<div class="c-large">
  <h1 style="font-size:100px; color:red;">Debug</h1>
  <a style="position:fixed; left:50%; transform:translateX(-50%); top:5px; color:white" href="/">Landing</a>
  {% include "components/footer.njk" %}
</div>

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>
<!-- Scripts -->
<script type="module" defer src="/js/debug/App.js"></script>

---
layout: 'layouts/base.njk'
---

<div class="c-large">
  <a style="position:fixed; left:50%; transform:translateX(-50%); top:5px; color:white" href="/debug">Debug3</a>
  {% include "components/footer.njk" %}
</div>

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>
<!-- Scripts -->
<script type="module" defer src="/js/initial-test/App.js"></script>

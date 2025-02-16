// Add new project dynamically by calling: `node add-project project-name what-to-copy`

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra'); // Ensure fs-extra is imported
const { execSync } = require('child_process');

const X = process.argv[2]; // Get the string X from command-line arguments
if (!X) {
  console.error('Please provide a string X argument.');
  process.exit(1);
}

const Y = process.argv[3]; // Get the string Y from command-line arguments
if (!Y) {
  console.error('Please provide a string Y argument.');
  process.exit(1);
}

// 1. Update rollup.config.js
const rollupConfigPath = path.join(__dirname, 'rollup.config.js');
if (fs.existsSync(rollupConfigPath)) {
  let content = fs.readFileSync(rollupConfigPath, 'utf8');
  const regex = /(const FILE_NAMES\s*=\s*\[)([^\]]*)(\])/;
  const match = content.match(regex);

  if (match) {
    const fileNamesContent = match[2];
    const updatedArray = `${fileNamesContent} '${X}',`; // Adding new value to the array
    content = content.replace(regex, `$1${updatedArray}$3`);
    fs.writeFileSync(rollupConfigPath, content, 'utf8');
    console.log(`Updated FILE_NAMES array in rollup.config.js`);
  } else {
    console.error('Could not find FILE_NAMES array in rollup.config.js');
  }
} else {
  console.error('rollup.config.js not found');
}

// 2. Create X.md inside ./src/eleventy/
const eleventyDir = path.join(__dirname, './src/eleventy');
const newFilePath = path.join(eleventyDir, `${X}.md`);
const mdContent = `---
layout: 'layouts/base.njk'
---

<div class="debug-holder">debug</div>
<div class="fps">fps: <span id="fps"></span></div>
<canvas id="canvas"></canvas>

<div class="enter-info-icon">
<img src="/public/assets/wasd.svg" alt="wasd" class="info-icon bounceIn" />
</div>

<!-- Scripts -->
<script type="module" defer src="/js/${X}/App.js"></script>
`;
fs.writeFileSync(newFilePath, mdContent, 'utf8');
console.log(`Created ${X}.md inside eleventy/`);

// 3. Update base.njk
const baseNjkPath = path.join(eleventyDir, '_includes', 'layouts', 'base.njk');
if (fs.existsSync(baseNjkPath)) {
  let content = fs.readFileSync(baseNjkPath, 'utf8');
  const divRegex = /(<div[^>]*class=["'][^"']*\blinks-container\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/;
  const newLink = `\n    <a class="underline" href="/${X}">${X}</a>`;

  if (divRegex.test(content)) {
    content = content.replace(divRegex, (match, start, links, end) => `${start}${links.trim()}${newLink}\n${end}`);
    fs.writeFileSync(baseNjkPath, content, 'utf8');
    console.log(`Added link to base.njk`);
  } else {
    console.error('Could not find div with class containing "links-container" in base.njk');
  }
} else {
  console.error('base.njk not found');
}

// 4. Copy folder from ./src/js-pages/Y to ./src/js-pages/X
const srcDir = path.join(__dirname, 'src', 'js-pages', Y);
const destDir = path.join(__dirname, 'src', 'js-pages', X);

if (fs.existsSync(srcDir)) {
  fse.copySync(srcDir, destDir);
  console.log(`Copied Y folder to '${X}' inside ./src/js-pages/`);
} else {
  console.error("Source folder './src/js-pages/spring' not found");
}

// 5. Run Prettier using npm script
try {
  execSync('npm run format', { stdio: 'inherit' });
  console.log('Prettier formatting applied via npm script.');
} catch (error) {
  console.error('Error running Prettier:', error);
}

console.log('Script execution completed.');

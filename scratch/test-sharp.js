const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svg = `<svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" rx="40" fill="#15803d"/>
  <text x="195" y="422" fill="white" font-size="24" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Tongric Mobile</text>
</svg>`;

const outDir = path.resolve(process.cwd(), 'public/grant-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

sharp(Buffer.from(svg))
  .resize(780, 1688)
  .png()
  .toFile(path.join(outDir, 'test-grant.png'))
  .then(() => console.log('SHARP PNG CREATED SUCCESSFULLY!'))
  .catch(console.error);


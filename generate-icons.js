const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Blue background (#3b82f6)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // White court area
  const padding = size / 8;
  const lineWidth = Math.max(2, size / 64);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(padding, padding, size - padding * 2, size - padding * 3, size / 32);
  ctx.fill();
  ctx.stroke();
  
  // Center line
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = Math.max(2, size / 128);
  ctx.beginPath();
  ctx.moveTo(size / 2, padding);
  ctx.lineTo(size / 2, size - padding * 3);
  ctx.stroke();
  
  // Center circle
  const circleRadius = Math.min(size / 12, 30);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 - size / 32, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Save PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buffer);
  
  console.log(`✓ icon-${size}x${size}.png`);
}

console.log(`\n✅ Generated ${sizes.length} icons successfully!`);

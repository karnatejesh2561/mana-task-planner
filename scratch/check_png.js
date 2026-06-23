const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

const workspaceDir = path.join(__dirname, '..');
const darkBg = path.join(workspaceDir, 'assets', 'background-dark.png');
const lightBg = path.join(workspaceDir, 'assets', 'background-light.png');
const logo = path.join(workspaceDir, 'assets', 'logo.png');

console.log('Dark BG:', getPngDimensions(darkBg));
console.log('Light BG:', getPngDimensions(lightBg));
console.log('Logo:', getPngDimensions(logo));

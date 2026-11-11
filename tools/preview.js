// 미리보기: node tools/preview.js <모듈> <출력.png> [배율]
// 예) node tools/preview.js witch out.png 8
const fs = require('fs');
const path = require('path');
const [, , name, out, scale = '8'] = process.argv;
const mod = require(path.join(__dirname, 'art', name + '.js'));
const px = (mod.preview || mod.sheet)();
fs.writeFileSync(out, px.toPNG(Number(scale), '#fdf0f5'));
console.log('saved', out, px.w + 'x' + px.h);

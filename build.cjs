const fs=require('node:fs'),path=require('node:path');
let html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(__dirname,'style.css'),'utf8')+'</style>');
for(const file of ['game-core.js','engine.js','planet-surfaces.js','tts.js','audio.js','game.js','sofia.js','effects.js','duck.js','bedtime.js','teeth.js','routines.js','planet-play.js','house-quiz.js'])html=html.replace('<script src="'+file+'"></script>',()=>'<script>\n'+fs.readFileSync(path.join(__dirname,file),'utf8')+'\n</script>');
fs.mkdirSync(path.join(__dirname,'dist'),{recursive:true});fs.writeFileSync(path.join(__dirname,'dist/index.html'),html);console.log('Built dist/index.html: '+Buffer.byteLength(html)+' bytes. No external dependencies.');
// Den nye norske stemmen lastes for seg (ikke inne i index.html): bare filene nettleseren trenger, pluss lisensene.
const ttsOut=path.join(__dirname,'dist/tts');fs.rmSync(ttsOut,{recursive:true,force:true});let bytes=0;
for(const name of TTS_FILES()){const from=path.join(__dirname,'tts',name),to=path.join(ttsOut,name);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);bytes+=fs.statSync(from).size;}
console.log('Copied voice to dist/tts: '+(bytes/1e6).toFixed(1)+' MB (downloaded once by the browser, then cached).');
function TTS_FILES(){return fs.readdirSync(path.join(__dirname,'tts'),{recursive:true}).filter(f=>/^(licenses\/.*|[^/]+\.(mjs|wasm|data|onnx|json|f16))$/.test(f.split(path.sep).join('/')));}

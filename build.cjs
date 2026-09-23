const fs=require('node:fs'),path=require('node:path');
let html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(__dirname,'style.css'),'utf8')+'</style>');
for(const file of ['game-core.js','engine.js','planet-surfaces.js','audio.js','game.js','effects.js','planet-play.js','house-quiz.js'])html=html.replace('<script src="'+file+'"></script>',()=>'<script>\n'+fs.readFileSync(path.join(__dirname,file),'utf8')+'\n</script>');
fs.mkdirSync(path.join(__dirname,'dist'),{recursive:true});fs.writeFileSync(path.join(__dirname,'dist/index.html'),html);console.log('Built dist/index.html: '+Buffer.byteLength(html)+' bytes. No external dependencies.');

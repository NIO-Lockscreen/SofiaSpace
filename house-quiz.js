/* Planetspillet: a planet floats up in Sofia's room, and she reads the names to find the right one. */
const quiz={round:null,score:0,tries:0,locked:false,recent:[],pop:0,happy:0,spin:0,wait:0,done:false,doneTime:0};
const QUIZ_GOAL=5;
// The first sentence of each fact makes a short clue: «Jupiter er den største planeten!»
function clueOf(p){return (p.fact.match(/^[^.!]*[.!]/)||[p.fact])[0];}
function startQuiz(){if(!['inside','quiz'].includes(state.mode))return;gameAudio.stopSpeech();resetFx();state.mode='quiz';Object.assign(quiz,{score:0,recent:[],done:false,doneTime:0,wait:0});
 showConsole('quiz');$('quiz-again').hidden=true;$('world-hint').hidden=true;title('PLANETSPILLET','Hva heter denne?','Les navnene, og trykk på det riktige!','🔭 Lesespill');
 scene.setAttribute('aria-label','Planetspillet. En planet svever midt i rommet. Hvilket navn er riktig?');renderQuizStars();nextQuiz(true);}
function endQuiz(){if(state.mode!=='quiz')return;gameAudio.stopSpeech();enterHouse();}
function nextQuiz(first=false){quiz.round=quizRound(state.quizCorrect,quiz.recent);quiz.recent=[quiz.round.answer.id,...quiz.recent].slice(0,3);Object.assign(quiz,{tries:0,locked:false,pop:0,happy:0,spin:0});
 $('quiz-question').textContent='Hva heter denne?';$('quiz-feedback').textContent='';const box=$('quiz-choices');box.replaceChildren();box.classList.toggle('many',quiz.round.choices.length>2);
 for(const p of quiz.round.choices){const b=document.createElement('button');b.className='quiz-choice';b.dataset.planet=p.id;b.setAttribute('aria-label',p.word);const head=document.createElement('span');head.className='first';head.textContent=p.word[0];b.append(head,p.word.slice(1));b.onclick=()=>answerQuiz(p,b);box.append(b);}
 gameAudio.effect('pop');gameAudio.say(first?'Hva heter denne, Sofia? Les navnene, og trykk på det riktige!':'Hva heter denne?',{id:'fact-quiz',queue:!first});}
function renderQuizStars(){const box=$('quiz-stars');box.replaceChildren();for(let i=0;i<QUIZ_GOAL;i++){const s=document.createElement('span');s.className=i<quiz.score?'got':'';s.textContent=i<quiz.score?'★':'☆';box.append(s);}box.setAttribute('aria-label',`${quiz.score} av ${QUIZ_GOAL} riktige`);}
function answerQuiz(p,btn){if(quiz.locked||quiz.done||state.mode!=='quiz'||btn.disabled)return;const a=quiz.round.answer;
 if(p.id===a.id){quiz.locked=true;quiz.happy=1;quiz.score++;state.quizCorrect++;btn.classList.add('right');for(const b of $('quiz-choices').children)if(b!==btn)b.disabled=true;
  confetti([0,1.8,-.6],.8,30);gameAudio.effect('correct');renderQuizStars();saveProgress();$('quiz-feedback').textContent=`Ja! Det er ${a.name}! ${clueOf(a)}`;
  if(quiz.score>=QUIZ_GOAL)return finishQuiz(a);gameAudio.say(`Ja! Det er ${a.name}! ${clueOf(a)}`,{id:'fact-quiz'});quiz.wait=3.2;return;}
 // A wrong name is read out loud, so every tap teaches a word. After two misses the first letter lights up.
 quiz.tries++;btn.disabled=true;btn.classList.add('wrong');gameAudio.effect('oops');const hint=quiz.tries>=2;
 if(hint)[...$('quiz-choices').children].find(b=>b.dataset.planet===a.id)?.classList.add('hint');
 $('quiz-feedback').textContent=hint?`Der står det ${p.word}. Finn navnet som begynner på ${a.word[0]}!`:`Der står det ${p.word}. Prøv igjen!`;
 gameAudio.say(hint?`Der står det ${p.name}. Finn navnet som begynner på ${LETTER_NAMES[a.word[0]]}!`:`Der står det ${p.name}. Prøv igjen!`,{id:'fact-quiz'});}
function finishQuiz(a){quiz.done=true;quiz.doneTime=0;state.quizStars++;saveProgress();updatePassport();confetti([0,1.8,-.6],1.3,70);gameAudio.effect('fanfare');
 $('quiz-question').textContent='Du fikk en lesestjerne! ⭐';$('quiz-feedback').textContent=`Du leste ${QUIZ_GOAL} navn. Stjernen henger på veggen over senga.`;$('quiz-again').hidden=false;
 title('HURRA, SOFIA!','Du er en planetleser!','Stjernen henger på veggen over senga.',`⭐ ${state.quizStars} ${state.quizStars===1?'lesestjerne':'lesestjerner'}`);
 gameAudio.say(`Ja! Det er ${a.name}! Du leste fem navn, Sofia! Du fikk en lesestjerne. Den henger på veggen over senga di.`,{id:'fact-quiz'});}
function updateQuiz(dt){quiz.pop=Math.min(1,quiz.pop+dt*1.8);quiz.spin+=dt*quiz.happy*7;quiz.happy=Math.max(0,quiz.happy-dt*.45);if(quiz.done)quiz.doneTime+=dt;
 if(quiz.wait>0&&(quiz.wait-=dt)<=0)nextQuiz();}
// Tapping the floating planet only makes it spin: the name has to be read.
function tapQuiz(x,y){if(pickTarget([0],x,y,()=>[0,1.8,-.6],()=>.75)!==null){quiz.happy=Math.max(quiz.happy,.5);gameAudio.effect('pop');}}
const QUIZ_VIEW={saturn:[.45,.3],uranus:[.3,1.45]};
function quizScene(t){const aspect=scene.clientWidth/Math.max(1,scene.clientHeight),dist=Math.max(1.45,1.75/aspect)*FOCAL,look=[0,1.8,-.6];let eye=[state.reduced?0:Math.sin(t*.3)*.12,2.15,look[2]+dist],at=look;
 // After the fifth name the camera glides back so Sofia sees her new star on the wall.
 if(quiz.done){const k=Math.min(1,quiz.doneTime/1.6),e=k*k*(3-2*k),a=-.45,far=aspect<.85?12.6:aspect<1.35?10.8:aspect<2.4?9.4:7.6,eye2=[Math.sin(a)*far,2.35,Math.cos(a)*far],at2=[.6,1.7,-1.2];eye=eye.map((v,i)=>v+(eye2[i]-v)*e);at=at.map((v,i)=>v+(at2[i]-v)*e);}
 renderer.begin(eye,at,'#241a18');room(t);
 d('cylinder',[0,.2,-.6],[.46,.2,.46],'#39406a');d('cylinder',[0,.41,-.6],[.38,.02,.38],'#79e4e2',[],1);
 if(!state.reduced)for(let i=0;i<4;i++){const k=(t*.45+i/4)%1,r=.38+k*.25;d('ringlet',[0,.45+k*.75,-.6],[r,1,r],'#79e4e2',[],1);}
 group([-1.45,0,-1],[.8,.8,.8],[0,.6,0],()=>character(t));
 const p=quiz.round?.answer;if(!p)return;const k=quiz.pop-1,grow=1+2.70158*k*k*k+1.70158*k*k,size=(p.id==='saturn'?.5:p.id==='uranus'?.55:p.id==='sun'?.72:.64)/p.size*grow,view=QUIZ_VIEW[p.id],tilt={earth:.409,mars:.44}[p.id]||0,hop=quiz.happy>0&&!state.reduced?Math.abs(Math.sin(quiz.happy*9))*.2:0;
 // The planet rocks gently round its best-known face: Africa and Europe, the Red Spot, Pluto's heart.
 planet(p,t,[0,1.8+hop,-.6],Math.max(.01,size),false,[view?view[0]:.25,quiz.spin,view?view[1]:tilt],state.reduced?0:Math.sin(t*.35)*.5);
 if(!state.reduced)for(let i=0;i<5;i++){const a=t*.8+i*1.26,r=.95;d('star',[Math.cos(a)*r,1.8+Math.sin(a*1.3)*.25,-.6+Math.sin(a)*r*.5],[.05,.05,.05],'#ffe9a8',[0,0,a],1);}}
$('open-quiz').onclick=startQuiz;$('quiz-again').onclick=startQuiz;$('quiz-done').onclick=endQuiz;
$('quiz-speak').onclick=()=>gameAudio.say(quiz.done?'Du fikk en lesestjerne!':'Hva heter denne? Les navnene, og trykk på det riktige!',{force:true,id:'fact-quiz'});
// The last script is in: every scene and game exists, so the loop can start.
requestAnimationFrame(tick);

(function(){
'use strict';
const D=window.BUDGET_DATA||{};
const SEQ=D.SEQ||[];
const $=(id)=>document.getElementById(id);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const text=(el,v)=>{if(el)el.textContent=v};
const html=(el,v)=>{if(el)el.innerHTML=v};
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const shuffle=(arr)=>{arr=arr.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr};

const fresh=()=>({
 current:'g-contrat',lastMain:'g-contrat',completed:{},visited:{'g-contrat':1},badges:[false,false,false,false,false],
 pre:[null,null,null,null,null,null],post:[null,null,null,null,null,null],preIndex:0,postIndex:0,
 repSeen:[],repCurrent:1,actorsSeen:[],cyclePlaced:[],cycleOrder:[],cycleMode:'explore',plan:[],
 docNeedIndex:0,docNeedDone:[false,false,false,false],docNeedOrder:[],
 evolIndex:0,evolDone:[false,false,false,false],evolOrder:[],
 dossierPiece:'rapport',dossierSelected:{},dossierDone:{rapport:false,maquette:false,trajectoire:false,invest:false},dossierTry:{rapport:0,maquette:0,trajectoire:0,invest:0},dossierOrder:{},
 sections:{},calcStep:0,calcShown:[false,false,false],constats:[],reflexDone:false,
 flips:[],hypotheses:[],scenarios:[],simFinance:'mixte',simRevenue:1,simControl:false,vigilances:[],
 priorities:[],interlocDone:false,questions:[],exchangeStep:0,precision:0,instruction:0,exchangeChoices:[],exchangeNotes:[],exchangeDone:false,
 finished:false
});
let state=fresh();
let hydratedPage=null;

function compactModule(){
 return {v:5,b:state.badges,rs:state.repSeen,rc:state.repCurrent,as:state.actorsSeen,cp:state.cyclePlaced,co:state.cycleOrder,cm:state.cycleMode,pl:state.plan,
  dni:state.docNeedIndex,dnd:state.docNeedDone,dno:state.docNeedOrder,evi:state.evolIndex,evd:state.evolDone,evo:state.evolOrder,dsp:state.dossierPiece,
  dss:state.dossierSelected,dsd:state.dossierDone,dst:state.dossierTry,dso:state.dossierOrder,se:state.sections,ci:state.calcStep,
  cs:state.calcShown,ct:state.constats,rf:state.reflexDone,fl:state.flips,hy:state.hypotheses,sc:state.scenarios,
  sf:state.simFinance,sr:state.simRevenue,sx:state.simControl,vi:state.vigilances,pa:state.priorities,qu:state.questions,
  ex:state.exchangeStep,ep:state.precision,ei:state.instruction,ec:state.exchangeChoices,en:state.exchangeNotes,ed:state.exchangeDone};
}
function restoreModule(c){if(!c||![3,4,5].includes(c.v))return;const seen=(c.rs||state.repSeen).filter(x=>Number(x)>=1&&Number(x)<=4);Object.assign(state,{badges:c.b||state.badges,repSeen:seen,repCurrent:c.rc??state.repCurrent,actorsSeen:c.as||state.actorsSeen,cyclePlaced:c.cp||state.cyclePlaced,cycleOrder:c.co||state.cycleOrder,cycleMode:c.cm||(c.cp&&c.cp.length?'build':state.cycleMode),plan:c.pl||state.plan,docNeedIndex:c.dni??state.docNeedIndex,docNeedDone:c.dnd||state.docNeedDone,docNeedOrder:c.dno||state.docNeedOrder,evolIndex:c.evi??state.evolIndex,evolDone:c.evd||state.evolDone,evolOrder:c.evo||state.evolOrder,dossierPiece:c.dsp||state.dossierPiece,dossierSelected:c.dss||state.dossierSelected,dossierDone:c.dsd||state.dossierDone,dossierTry:c.dst||state.dossierTry,dossierOrder:c.dso||state.dossierOrder,sections:c.se||state.sections,calcStep:c.ci??state.calcStep,calcShown:c.cs||state.calcShown,constats:c.ct||state.constats,reflexDone:c.rf??state.reflexDone,flips:c.fl||state.flips,hypotheses:c.hy||state.hypotheses,scenarios:c.sc||state.scenarios,simFinance:c.sf||state.simFinance,simRevenue:c.sr??state.simRevenue,simControl:c.sx??state.simControl,vigilances:c.vi||state.vigilances,priorities:c.pa||state.priorities,questions:c.qu||state.questions,exchangeStep:c.ex??state.exchangeStep,precision:c.ep??state.precision,instruction:c.ei??state.instruction,exchangeChoices:c.ec||state.exchangeChoices,exchangeNotes:c.en||state.exchangeNotes,exchangeDone:c.ed??state.exchangeDone});}
function save(){GABARIT.donnee('budget',compactModule());updateBadges();}
function complete(id){GABARIT.terminer(id);updateBadges();if(typeof updateMacroMenuState==='function')updateMacroMenuState();}
function isComplete(id){return !!((GABARIT.etat.terminees||{})[id]);}
function seqIndex(id){return SEQ.indexOf(id)}
function go(id,opts={}){if(!$(id))return;state.current=id;if(SEQ.includes(id))state.lastMain=id;GABARIT.aller(id);hydrateScreen(id);hydratedPage=id;save();if(typeof updateMacroMenuState==='function')updateMacroMenuState();}
function nextOf(id){const i=seqIndex(id);return i>=0&&i<SEQ.length-1?SEQ[i+1]:null}
function prevOf(id){const i=seqIndex(id);return i>0?SEQ[i-1]:null}
function goNext(id=state.current){const n=nextOf(id);if(n)go(n)}
function feedback(id,type,msg){const e=$(id);if(!e)return;e.className='feedback show '+(type||'');e.innerHTML=msg}
function clearFeedback(id){const e=$(id);if(e){e.className='feedback';e.innerHTML=''}}
function selectedText(container,sel='.choice.selected'){return qa(sel,$(container)).map(b=>b.textContent.trim())}

function navMission(target){return {'m1-intro':1,'m2-intro':2,'m3-intro':3,'m4-intro':4,'m5-intro':5}[target]||0}
function canAccessNav(target){if(state.finished||target===state.current)return true;if(target==='g-contrat')return true;if(target==='g-pre')return isComplete('g-contrat')||state.visited['g-pre'];const m=navMission(target);if(m)return m===1?isComplete('g-pre'):!!state.badges[m-2];if(target==='g-post')return !!state.badges[4];if(target==='g-fin')return isComplete('g-post');if(target==='bud-ressources')return isComplete('g-fin');if(target==='bud-credits')return isComplete('bud-ressources');return true}
function isNavDone(target){if(target==='g-contrat')return isComplete('g-contrat');if(target==='g-pre')return isComplete('g-pre');const m=navMission(target);if(m)return !!state.badges[m-1];if(target==='g-post')return isComplete('g-post');if(target==='g-fin')return isComplete('g-fin');if(target==='bud-ressources')return isComplete('bud-ressources');if(target==='bud-credits')return isComplete('bud-credits');return false}
function updateChrome(){updateBadges();}
function updateBadges(){
 qa('[data-mission-card]').forEach(card=>{const m=+card.dataset.missionCard,done=!!state.badges[m-1],items=qa('[data-check-id]',card),acq=items.filter(li=>isComplete(li.dataset.checkId)).length;card.classList.toggle('done',done);card.classList.toggle('inprogress',!done&&acq>0);const b=card.querySelector('.badge');if(b)b.classList.toggle('locked',!done);const s=card.querySelector('.repere-state');if(s)s.textContent=done?'Acquis':acq>0?`En cours · ${acq}/${items.length}`:'À acquérir';items.forEach(li=>li.classList.toggle('acquired',isComplete(li.dataset.checkId)));});
 if($('repere-progress-bar'))$('repere-progress-bar').style.width=(state.badges.filter(Boolean).length*20)+'%';
 if($('final-badges'))$('final-badges').innerHTML=state.badges.map((d,i)=>`<span class="note-tag">${d?'✓':'○'} Badge M${i+1}</span>`).join('');
}

/* Radars */
function drawRadar(canvas,pre,post){
 if(!canvas||!canvas.getContext)return;const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,r=Math.min(W,H)*.31,n=6;
 ctx.clearRect(0,0,W,H);ctx.save();ctx.font='700 13px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
 const labels=['Documents','Acteurs','Équilibres','Indicateurs','Vigilances','Questions'];
 for(let ring=1;ring<=4;ring++){ctx.beginPath();for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n,rr=r*ring/4,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.strokeStyle='#DDE5EA';ctx.lineWidth=1;ctx.stroke()}
 for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle='#DDE5EA';ctx.stroke();const lx=cx+Math.cos(a)*(r+54),ly=cy+Math.sin(a)*(r+34);ctx.fillStyle='#2F4354';ctx.fillText(labels[i],lx,ly)}
 function poly(vals,stroke,fill){if(!vals||vals.some(v=>v==null))return;ctx.beginPath();vals.forEach((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,rr=r*(v/4),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=4;ctx.fill();ctx.stroke()}
 poly(pre,'#58788F','rgba(88,120,143,.13)');if(post)poly(post,'#B98600','rgba(248,187,0,.18)');ctx.restore();
}
function renderRadarText(id,pre,post){const box=$(id);if(!box)return;const labels=D.COMP||[];const lvl=v=>v?`${v}/4 · ${D.LEVELS[v-1]}`:'—';if(post){box.innerHTML=`<div class="radar-row head"><span>Compétence</span><span>Départ</span><span>Aujourd’hui</span></div>`+labels.map((lab,i)=>{const d=(post[i]||0)-(pre[i]||0),cl=d>0?'up':d<0?'down':'',sym=d>0?'▲':d<0?'▼':'=';return `<div class="radar-row"><b>${esc(lab)}</b><span>${esc(lvl(pre[i]))}</span><span>${esc(lvl(post[i]))} <span class="delta ${cl}" aria-label="Évolution ${d>0?'positive':d<0?'négative':'stable'}">${sym}</span></span></div>`}).join('')}else{box.innerHTML=`<div class="radar-row head"><span>Compétence</span><span>Niveau</span><span></span></div>`+labels.map((lab,i)=>`<div class="radar-row pre-only"><b>${esc(lab)}</b><span>${esc(lvl(pre[i]))}</span><span></span></div>`).join('')}}
function initPosition(phase){
 const arr=state[phase],idxKey=phase+'Index',idx=Math.max(0,Math.min(state[idxKey]||0,5)),prefix=phase,box=$(prefix+'-options'),back=$(prefix+'-back');
 text($(prefix+'-counter'),`Compétence ${idx+1} sur 6`);text($(prefix+'-title'),D.COMP[idx]);if(!box)return;box.innerHTML='';
 D.LEVELS.forEach((lab,i)=>{const b=document.createElement('button');b.className='choice'+(arr[idx]===i+1?' selected':'');b.innerHTML=`<b>${i+1}</b><br><span>${esc(lab)}</span>`;b.onclick=()=>{arr[idx]=i+1;recordPosition(phase,idx,i+1);if(idx<5){state[idxKey]=idx+1;save();initPosition(phase)}else{state[idxKey]=5;complete(phase==='pre'?'g-pre':'g-post');showPositionRadar(phase);save()}};box.appendChild(b)});
 if(back){back.hidden=idx===0;back.onclick=()=>{state[idxKey]=Math.max(0,idx-1);box.parentElement.style.display='block';$(prefix+'-radar-zone').hidden=true;initPosition(phase);save()}}
 const done=arr.every(v=>v!=null);if(done&&state[idxKey]>=5){showPositionRadar(phase)}else{box.parentElement.style.display='block';$(prefix+'-radar-zone').hidden=true}
}
function showPositionRadar(phase){const prefix=phase,box=$(prefix+'-options');box.parentElement.style.display='none';$(prefix+'-radar-zone').hidden=false;drawRadar($(prefix+'-radar'),state.pre,phase==='post'?state.post:null);renderRadarText(prefix+'-radar-text',state.pre,phase==='post'?state.post:null);$(prefix+'-go').disabled=false;const edit=$(prefix+'-edit');if(edit)edit.onclick=()=>{state[phase+'Index']=5;box.parentElement.style.display='block';$(prefix+'-radar-zone').hidden=true;initPosition(phase)}}


/* M1 repères */
const REP_CONTENT={
 1:`<div class="grid2"><div><h3>Six principes pour structurer la lecture</h3><div class="tags"><span class="note-tag">Annualité</span><span class="note-tag">Unité</span><span class="note-tag">Universalité</span><span class="note-tag">Spécialité</span><span class="note-tag">Équilibre</span><span class="note-tag">Antériorité</span></div><p class="muted">Ils donnent un cadre de lecture. Dans le module, ils servent de repères opérationnels avant d’entrer dans les chiffres.</p></div><div class="card gold"><h4>Réflexe</h4><p>Avant d’interpréter un chiffre, vérifiez dans quel cadre budgétaire et à quel moment du cycle il se situe.</p></div></div>`,
 2:`<div class="flow"><div class="block"><div class="icon">F</div><h4>Fonctionnement</h4><p>Recettes et dépenses courantes.</p></div><div class="arrow">→</div><div class="block gold"><div class="icon gold">É</div><h4>Épargne</h4><p>La marge dégagée en fonctionnement.</p></div><div class="arrow">→</div><div class="block"><div class="icon">I</div><h4>Investissement</h4><p>Équipements et financement.</p></div></div>`,
 3:`<div class="timeline"><div class="timeline-step"><div class="dot">1</div><b>Orienter</b><small>Débat</small></div><div class="timeline-step"><div class="dot">2</div><b>Préparer</b><small>Projet</small></div><div class="timeline-step"><div class="dot">3</div><b>Examiner</b><small>Commission</small></div><div class="timeline-step"><div class="dot">4</div><b>Voter</b><small>Décision</small></div><div class="timeline-step"><div class="dot">5</div><b>Exécuter</b><small>Mise en œuvre</small></div><div class="timeline-step"><div class="dot">6</div><b>Contrôler</b><small>Comptes</small></div></div>`,
 4:`<div class="grid4"><div class="card"><h4>Épargne brute</h4><p>Quelle marge reste après les intérêts ?</p></div><div class="card gold"><h4>Besoin à financer</h4><p>Quelle part de l’investissement reste à couvrir ?</p></div><div class="card"><h4>Désendettement</h4><p>Quelle trajectoire de dette au regard de l’épargne ?</p></div><div class="card gold"><h4>Autofinancement</h4><p>Quelle part de l’investissement est couverte par l’épargne ?</p></div></div>`
};
function renderRepere(n){n=Math.max(1,Math.min(4,+n||1));state.repCurrent=n;state.repSeen=Array.from(new Set([...(state.repSeen||[]).filter(x=>x>=1&&x<=4),n]));qa('.repere-select').forEach(b=>{const active=+b.dataset.repere===n;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active?'true':'false')});html($('repere-stage'),REP_CONTENT[n]);text($('repere-counter'),`${state.repSeen.length}/4 ${state.repSeen.length>1?'consultés':'consulté'}`);$('repere-next').disabled=state.repSeen.length<4;if(state.repSeen.length===4)complete('bud-m1-reperes');save()}

/* M1 actors */
const ACTORS={
 gov:{stages:['prepare','execute'],title:'Gouvernement',body:'Il prépare le projet de budget et met en œuvre les autorisations adoptées. Pour l’élu, cela aide à distinguer la préparation/exécution de l’examen et du vote.'},
 congres:{stages:['exam','vote','control'],title:'Congrès',body:'Il examine et vote le budget puis exerce son rôle de contrôle à travers l’examen de l’exécution et des comptes.'},
 commission:{stages:['exam'],title:'Commission compétente',body:'Elle organise l’examen préparatoire du dossier et permet de demander les informations utiles à l’instruction.'},
 services:{stages:['prepare'],title:'Services financiers',body:'Ils produisent et consolident les données, hypothèses et documents techniques qui alimentent la préparation budgétaire.'},
 controle:{stages:['control'],title:'Organisme de contrôle',body:'Il intervient dans le champ de ses missions de contrôle et peut apporter des constats utiles à l’analyse de l’exécution.'}
};
function chooseActor(key){state.actorsSeen=Array.from(new Set([...(state.actorsSeen||[]),key]));qa('.actor').forEach(b=>b.classList.toggle('active',b.dataset.actor===key));const a=ACTORS[key];qa('#actor-cycle [data-stage]').forEach(s=>{const related=a.stages.includes(s.dataset.stage);s.classList.toggle('related',related);s.classList.toggle('dim',!related)});html($('actor-detail'),`<h4>${esc(a.title)}</h4><p>${esc(a.body)}</p><p class="muted"><strong>Étapes mises en évidence :</strong> ${a.stages.map(s=>({prepare:'Préparer',execute:'Exécuter',exam:'Examiner',vote:'Voter',control:'Contrôler'}[s]||s)).join(' · ')}</p>`);text($('actor-counter'),`${state.actorsSeen.length}/5 acteurs explorés`);$('actor-next').disabled=state.actorsSeen.length<5;if(state.actorsSeen.length===5)complete('bud-m1-acteurs');save()}

/* cycle */
const CYCLE=['Orientations','Préparation','Examen','Vote','Exécution','Comptes'];
function ensureCycleOrder(){
 const valid=Array.isArray(state.cycleOrder)&&state.cycleOrder.length===CYCLE.length&&new Set(state.cycleOrder).size===CYCLE.length&&state.cycleOrder.every(x=>CYCLE.includes(x));
 if(!valid)state.cycleOrder=shuffle(CYCLE);
}
function renderCyclePlaced(){
 const box=$('cycle-placed');if(!box)return;
 if(!state.cyclePlaced.length){box.innerHTML='<p class="muted" style="margin:0 0 8px"><strong>Votre cycle :</strong> aucune étape placée pour le moment.</p>';return}
 box.innerHTML='<p class="muted" style="margin:0 0 8px"><strong>Votre cycle :</strong></p><div class="tags">'+state.cyclePlaced.map((x,i)=>'<span class="note-tag">'+(i+1)+' · '+esc(x)+'</span>').join('')+'</div>';
}
function renderCycleBank(){
 const bank=$('cycle-bank');if(!bank)return;ensureCycleOrder();
 const remaining=state.cycleOrder.filter(x=>!state.cyclePlaced.includes(x));bank.innerHTML='';
 remaining.forEach(label=>{const b=document.createElement('button');b.className='btn secondary';b.textContent=label;b.onclick=()=>placeCycle(label);bank.appendChild(b)});
 renderCyclePlaced();text($('cycle-build-counter'),`${state.cyclePlaced.length}/6 étapes placées`);$('cycle-next').disabled=state.cyclePlaced.length<6;
 if(!remaining.length&&state.cyclePlaced.length<6){console.error('[BUDGET] Etat cycle incohérent : banque vide avant 6/6. Réinitialisation sûre.');state.cycleOrder=shuffle(CYCLE);renderCycleBank();}
}
function renderCycleScreen(){
 const explore=$('cycle-explore'),build=$('cycle-build');if(!explore||!build)return;
 const mode=state.cycleMode==='build'?'build':'explore';explore.classList.toggle('hidden',mode==='build');build.classList.toggle('active',mode==='build');
 if(mode==='build')renderCycleBank();
}
function placeCycle(label){const expected=CYCLE[state.cyclePlaced.length];if(label!==expected){feedback('cycle-feedback','bad',`<strong>Pas encore.</strong> Cherchez l’étape qui vient ${state.cyclePlaced.length?'après « '+esc(state.cyclePlaced[state.cyclePlaced.length-1])+' »':'en premier dans le cycle'}.`);return}state.cyclePlaced.push(label);feedback('cycle-feedback','ok',`<strong>${esc(label)}</strong> est bien placé${state.cyclePlaced.length<6?'. Poursuivez la séquence.':' : vous avez reconstitué le cycle.'}`);if(state.cyclePlaced.length===6)complete('bud-m1-cycle');renderCycleBank();save()}
function resetCycle(){state.cycleMode='build';state.cyclePlaced=[];state.cycleOrder=shuffle(CYCLE);clearFeedback('cycle-feedback');renderCycleScreen();save()}

/* selection helper */
function toggleLimited(btn,limit){const parent=btn.parentElement;const selected=qa('.choice.selected',parent);if(btn.classList.contains('selected'))btn.classList.remove('selected');else if(selected.length<limit)btn.classList.add('selected');return qa('.choice.selected',parent)}
function clearTransientWrong(root){qa('.choice.wrong',root).forEach(x=>x.classList.remove('wrong'))}
function releaseWrongSelections(container,attr,stateKey,limit,counterId,saveId,label){const root=$(container);const wrong=qa('.choice.selected',root).filter(b=>b.dataset.ok==='0'||(stateKey==='plan'&&+b.dataset.plan===3));wrong.forEach(b=>{b.classList.remove('selected');b.classList.add('wrong')});state[stateKey]=qa('.choice.selected',root).map(b=>+b.dataset[attr]);text($(counterId),`${state[stateKey].length}/${limit} ${label}`);$(saveId).disabled=state[stateKey].length!==limit;save();return wrong}

/* Plan */
function initPlan(){qa('#plan-choices .choice').forEach(b=>{b.classList.toggle('selected',state.plan.includes(+b.dataset.plan));b.onclick=()=>{clearTransientWrong($('plan-choices'));clearFeedback('plan-feedback');toggleLimited(b,3);state.plan=qa('#plan-choices .choice.selected').map(x=>+x.dataset.plan);text($('plan-counter'),`${state.plan.length}/3 sélectionnées`);$('plan-save').disabled=state.plan.length!==3;save()}});text($('plan-counter'),`${state.plan.length}/3 sélectionnées`);$('plan-save').disabled=state.plan.length!==3}
function savePlan(){if(state.plan.length!==3)return;let fb=$('plan-feedback');if(!fb){fb=document.createElement('div');fb.id='plan-feedback';fb.setAttribute('aria-live','polite');fb.setAttribute('role','status');$('plan-choices').insertAdjacentElement('afterend',fb)}if(state.plan.includes(3)){releaseWrongSelections('plan-choices','plan','plan',3,'plan-counter','plan-save','sélectionnées');feedback('plan-feedback','bad','<strong>À ajuster.</strong> Le choix « lire chaque ligne dans l’ordre sans prioriser » a été retiré de votre sélection. Conservez vos choix pertinents et sélectionnez simplement une action de remplacement.');return}feedback('plan-feedback','ok','<strong>Plan enregistré.</strong> Vos trois premières actions rejoignent votre carnet de mission.');complete('bud-m1-plan');renderCarnet();$('plan-save').textContent='Voir le point d’étape';$('plan-save').onclick=()=>go('m1-close');save()}

/* M2 documents */
function ensureOrders(){if(!state.docNeedOrder||state.docNeedOrder.length!==4)state.docNeedOrder=D.DOC_NEEDS.map(()=>shuffle([0,1]));if(!state.evolOrder||state.evolOrder.length!==4)state.evolOrder=D.EVOL_CASES.map(()=>shuffle([0,1]));for(const k of Object.keys(D.DOSSIER||{})){if(!state.dossierOrder[k])state.dossierOrder[k]=shuffle([0,1,2,3,4])}}
function renderNeed(){ensureOrders();const i=state.docNeedIndex||0,row=D.DOC_NEEDS[i];text($('doc-need-counter'),`Besoin ${i+1} sur 4`);text($('doc-need-title'),row[0]);clearFeedback('doc-feedback');const box=$('doc-options');box.innerHTML='';state.docNeedOrder[i].forEach(idx=>{const lab=idx===0?row[1]:row[2],b=document.createElement('button');b.className='choice'+(state.docNeedDone[i]&&idx===0?' correct':'');b.textContent=lab;b.disabled=!!state.docNeedDone[i];b.onclick=()=>{qa('.choice',box).forEach(x=>x.classList.remove('selected','correct','wrong'));b.classList.add(idx===0?'correct':'wrong');if(idx===0){state.docNeedDone[i]=true;feedback('doc-feedback','ok',`<strong>Oui.</strong> ${esc(row[4])}`)}else feedback('doc-feedback','bad',`<strong>Pas pour ce besoin.</strong> ${esc(row[4])} Choisissez directement l’autre proposition : vous n’avez rien à désélectionner auparavant.`);save();renderNeedButtons()};box.appendChild(b)});if(state.docNeedDone[i])feedback('doc-feedback','ok',`<strong>Besoin traité.</strong> ${esc(row[4])}`);renderNeedButtons()}
function renderNeedButtons(){const i=state.docNeedIndex;$('doc-prev').disabled=i===0;$('doc-nextneed').disabled=i===3||!state.docNeedDone[i];$('doc-nextneed').textContent=i===3?'Dernier besoin':`Besoin suivant →`;$('doc-screen-next').disabled=!state.docNeedDone.every(Boolean);if(state.docNeedDone.every(Boolean))complete('bud-m2-documents')}

function initLogic(){qa('#logic-choices .choice').forEach(b=>b.onclick=()=>{qa('#logic-choices .choice').forEach(x=>x.classList.remove('correct','wrong','selected'));if(b.dataset.logic==='proper'){b.classList.add('correct');feedback('logic-feedback','ok','<strong>Oui.</strong> Pour apprécier l’effet d’un projet sur les moyens d’une politique portée directement par la Nouvelle-Calédonie, commencez par le budget propre.');$('logic-next').disabled=false;complete('bud-m2-logiques')}else{b.classList.add('wrong');feedback('logic-feedback','bad','<strong>Logique différente.</strong> Le budget de répartition répond d’abord à une logique de distribution des recettes entre collectivités. Revenez au flux que vous cherchez à analyser.')}save()})}

function renderEvol(){ensureOrders();const i=state.evolIndex||0,row=D.EVOL_CASES[i];text($('evol-counter'),`Cas ${i+1} sur 4`);text($('evol-title'),row[0]);clearFeedback('evol-feedback');const box=$('evol-options');box.innerHTML='';state.evolOrder[i].forEach(idx=>{const lab=idx===0?row[1]:row[2],b=document.createElement('button');b.className='choice'+(state.evolDone[i]&&idx===0?' correct':'');b.textContent=lab;b.disabled=!!state.evolDone[i];b.onclick=()=>{qa('.choice',box).forEach(x=>x.classList.remove('selected','correct','wrong'));if(idx===0){b.classList.add('correct');state.evolDone[i]=true;feedback('evol-feedback','ok',`<strong>Oui.</strong> « ${esc(row[1])} » correspond à ce besoin dans le cycle budgétaire.`)}else{b.classList.add('wrong');feedback('evol-feedback','bad',`<strong>À revoir.</strong> Ce document répond à une autre fonction. Choisissez directement l’autre proposition pour corriger votre réponse.`)}save();renderEvolButton()};box.appendChild(b)});if(state.evolDone[i])feedback('evol-feedback','ok',`<strong>Cas traité.</strong> « ${esc(row[1])} » correspond à ce besoin dans le cycle budgétaire.`);renderEvolButton()}
function renderEvolButton(){const i=state.evolIndex||0;$('evol-next').disabled=!state.evolDone[i];$('evol-next').textContent=i<3?'Cas suivant →':'Continuer vers le dossier'}
function evolNext(){if(!state.evolDone[state.evolIndex])return;if(state.evolIndex<3){state.evolIndex++;renderEvol();save()}else{complete('bud-m2-evolution');go('bud-dossier')}}

/* dossier */
function renderDossier(){ensureOrders();const key=state.dossierPiece||'rapport',d=D.DOSSIER[key];qa('.doc-tab').forEach(b=>{b.classList.toggle('active',b.dataset.piece===key);if(state.dossierDone[b.dataset.piece]){b.classList.add('done');const strong=b.querySelector('b');if(strong&&!strong.textContent.startsWith('✓'))strong.textContent='✓ '+strong.textContent}});let metrics=d.metrics.map(m=>`<div class="kpi"><small>${esc(m[0])}</small><b>${esc(m[1])}</b><small>${esc(m[2]||'')}</small></div>`).join('');html($('piece-content'),`<h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p><div class="kpi-grid">${metrics}</div>`);const box=$('signal-choices');box.innerHTML='';const selected=state.dossierSelected[key]||[];state.dossierOrder[key].forEach(idx=>{const [lab,ok]=d.options[idx];const b=document.createElement('button');b.className='choice'+(selected.includes(idx)?' selected':'');b.dataset.idx=idx;b.textContent=lab;b.onclick=()=>{if(state.dossierDone[key])return;qa('#signal-choices .choice').forEach(x=>x.classList.remove('wrong','correct'));clearFeedback('signal-feedback');let s=state.dossierSelected[key]||[];if(s.includes(idx))s=s.filter(x=>x!==idx);else if(s.length<3)s=s.concat(idx);state.dossierSelected[key]=s;renderDossierSelection();save()};box.appendChild(b)});renderDossierSelection();updateDossierProgress()}
function renderDossierSelection(){const key=state.dossierPiece||'rapport',sel=state.dossierSelected[key]||[];qa('#signal-choices .choice').forEach(b=>b.classList.toggle('selected',sel.includes(+b.dataset.idx)));text($('signal-counter'),`${sel.length}/3 sélectionnés`);$('signal-check').disabled=sel.length!==3;if(state.dossierDone[key]){$('signal-check').disabled=false;$('signal-check').textContent=Object.values(state.dossierDone).every(Boolean)?'Voir mon carnet d’analyse':'Pièce analysée · choisir une autre pièce'}else $('signal-check').textContent='Vérifier mon analyse'}
function checkDossier(){const key=state.dossierPiece||'rapport';if(state.dossierDone[key]){if(Object.values(state.dossierDone).every(Boolean))go('m2-close');return}const d=D.DOSSIER[key],sel=state.dossierSelected[key]||[];if(sel.length!==3)return;const ok=sel.every(i=>d.options[i][1]===1)&&d.options.filter(x=>x[1]===1).every(x=>sel.includes(d.options.indexOf(x)));if(ok){state.dossierDone[key]=true;qa('#signal-choices .choice.selected').forEach(b=>b.classList.add('correct'));feedback('signal-feedback','ok','<strong>Analyse validée.</strong> Vous avez épinglé les trois signaux structurants de cette pièce. Ils rejoignent votre carnet.');if(Object.values(state.dossierDone).every(Boolean)){complete('bud-dossier');$('signal-check').textContent='Voir mon carnet d’analyse'}else $('signal-check').textContent='Pièce analysée · choisir une autre pièce'}else{state.dossierTry[key]=(state.dossierTry[key]||0)+1;const wrong=sel.filter(i=>d.options[i][1]===0);state.dossierSelected[key]=sel.filter(i=>d.options[i][1]===1);renderDossierSelection();wrong.forEach(i=>{const b=$('signal-choices').querySelector(`[data-idx="${i}"]`);if(b)b.classList.add('wrong')});const hint=d.hints[Math.min(state.dossierTry[key]-1,d.hints.length-1)];feedback('signal-feedback','bad',`<strong>Pas encore.</strong> Le ou les choix incorrects ont été retirés ; vos bons signaux restent sélectionnés. Choisissez uniquement ce qui manque pour revenir à trois.<br><strong>Indice :</strong> ${esc(hint)}`)}updateDossierProgress();save()}
function updateDossierProgress(){const n=Object.values(state.dossierDone).filter(Boolean).length;text($('dossier-progress'),`${n}/4 pièces correctement analysées`)}

/* M3 */
function initSections(){qa('.section-row').forEach(row=>{const id=row.dataset.sectionItem,chosen=state.sections[id];const sync=()=>{const current=state.sections[id];row.toggleAttribute('data-chosen',!!current);qa('.section-pick',row).forEach(b=>{const on=current===b.dataset.pick,ok=on&&current===row.dataset.correct;b.classList.toggle('selected',on);b.classList.toggle('correct',ok);b.classList.toggle('wrong',on&&!ok);b.setAttribute('aria-pressed',on?'true':'false')})};qa('.section-pick',row).forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>{state.sections[id]=b.dataset.pick;sync();if(b.dataset.pick===row.dataset.correct)feedback('section-feedback','ok','<strong>Oui.</strong> Votre choix « '+b.textContent+' » est correct. Poursuivez avec l’élément suivant.');else feedback('section-feedback','bad','<strong>À revoir.</strong> Vous avez choisi « '+b.textContent+' ». Demandez-vous si l’élément relève du fonctionnement courant ou du financement/équipement d’investissement. Vous pouvez changer de choix directement.');updateSections();save()}});sync()});updateSections()}
function updateSections(){const rows=qa('.section-row'),n=rows.filter(r=>state.sections[r.dataset.sectionItem]===r.dataset.correct).length;text($('section-counter'),`${n}/4 classés correctement`);$('section-next').disabled=n<4;if(n===4)complete('bud-m3-sections')}
const CALC=[
 {title:'Épargne de gestion',formula:'182 − 157 = 25',explain:'Elle mesure la marge dégagée avant la charge des intérêts.',result:['res-gestion','25'],data:['rf','dho']},
 {title:'Épargne brute',formula:'25 − 12 = 13',explain:'Elle tient compte des intérêts de la dette et contribue au financement de l’investissement.',result:['res-brute','13'],data:['int']},
 {title:'Épargne nette',formula:'13 − 8 = 5',explain:'Elle tient compte du remboursement du capital et donne la marge restante après le service de la dette.',result:['res-nette','5'],data:['cap']}
];
function renderCalc(){const i=state.calcStep||0,c=CALC[i];text($('calc-counter'),`Étape ${i+1} sur 3`);text($('calc-title'),c.title);text($('calc-formula'),state.calcShown[i]?c.formula:c.formula.replace(/= .+$/,'= ?'));text($('calc-explain'),c.explain);qa('.datum').forEach(d=>d.classList.toggle('active',state.calcShown[i]&&c.data.includes(d.dataset.datum)));CALC.forEach((x,j)=>text($(x.result[0]),state.calcShown[j]?x.result[1]:'—'));$('calc-next').disabled=!state.calcShown[i];$('calc-next').textContent=i===2?'Continuer':'Étape suivante';$('calc-do').textContent=state.calcShown[i]?'Calcul affiché':'Afficher le calcul pas à pas'}
function calcDo(){state.calcShown[state.calcStep]=true;renderCalc();if(state.calcShown.every(Boolean))complete('bud-m3-calcul');save()}
function calcNext(){if(!state.calcShown[state.calcStep])return;if(state.calcStep<2){state.calcStep++;renderCalc();save()}else go('bud-m3-interpreter')}
function initSingleChoice(container,feedbackId,nextId,okMsg,badMsg,completeId,nextTarget){qa(`#${container} .choice`).forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>{qa(`#${container} .choice`).forEach(x=>{x.classList.remove('correct','wrong','selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');if(b.dataset.ok==='1'){b.classList.add('correct');feedback(feedbackId,'ok',okMsg);$(nextId).disabled=false;complete(completeId)}else{b.classList.add('wrong');feedback(feedbackId,'bad',badMsg);$(nextId).disabled=true}save()}});if($(nextId))$(nextId).onclick=()=>go(nextTarget)}
function initConstats(){qa('#constat-choices .choice').forEach(b=>{b.classList.toggle('selected',state.constats.includes(+b.dataset.constat));b.onclick=()=>{clearTransientWrong($('constat-choices'));toggleLimited(b,3);state.constats=qa('#constat-choices .choice.selected').map(x=>+x.dataset.constat);text($('constat-counter'),`${state.constats.length}/3 constats sélectionnés`);$('constat-save').disabled=state.constats.length!==3;clearFeedback('constat-feedback');save()}});text($('constat-counter'),`${state.constats.length}/3 constats sélectionnés`);$('constat-save').disabled=state.constats.length!==3}
function saveConstats(){if(isComplete('bud-m3-constats')){go('bud-m3-reflexe');return}const bad=state.constats.some(i=>$('constat-choices').querySelector(`[data-constat="${i}"]`).dataset.ok!=='1');if(bad){releaseWrongSelections('constat-choices','constat','constats',3,'constat-counter','constat-save','constats sélectionnés');feedback('constat-feedback','bad','<strong>Un constat allait trop loin.</strong> Il a été retiré de votre sélection. Gardez les constats factuels déjà retenus et choisissez-en un autre.');return}feedback('constat-feedback','ok','<strong>Constats conservés.</strong> Ils décrivent les faits avant toute conclusion. Ils rejoignent votre carnet.');complete('bud-m3-constats');$('constat-save').textContent='Continuer';renderCarnet();save()}

/* M4 */
function initFlips(){qa('.flip-card').forEach(c=>{const i=+c.dataset.flip;c.classList.toggle('flipped',false);qa('.flip-btn',c).forEach(b=>b.onclick=()=>{c.classList.toggle('flipped');state.flips=Array.from(new Set([...(state.flips||[]),i]));text($('flip-counter'),`${state.flips.length}/4 cartes consultées des deux côtés`);$('flip-next').disabled=state.flips.length<4;if(state.flips.length===4)complete('bud-m4-indicateurs');save()})});text($('flip-counter'),`${state.flips.length}/4 cartes consultées des deux côtés`);$('flip-next').disabled=state.flips.length<4}
function initHypotheses(){qa('#hypo-choices .choice').forEach(b=>{b.classList.toggle('selected',state.hypotheses.includes(+b.dataset.hypo));b.onclick=()=>{clearTransientWrong($('hypo-choices'));toggleLimited(b,3);state.hypotheses=qa('#hypo-choices .choice.selected').map(x=>+x.dataset.hypo);$('hypo-check').disabled=state.hypotheses.length!==3;clearFeedback('hypo-feedback');save()}});$('hypo-check').disabled=state.hypotheses.length!==3}
function checkHypotheses(){if(isComplete('bud-m4-trajectoire')){go('bud-m4-simulateur');return}const bad=state.hypotheses.some(i=>$('hypo-choices').querySelector(`[data-hypo="${i}"]`).dataset.ok!=='1');if(bad){releaseWrongSelections('hypo-choices','hypo','hypotheses',3,'hypo-counter','hypo-check','sélectionnées');feedback('hypo-feedback','bad','<strong>Une hypothèse concluait trop vite.</strong> Elle a été retirée. Conservez les hypothèses solides et sélectionnez celle qui manque en rapprochant emprunt, épargne, dette et trajectoire.');return}feedback('hypo-feedback','ok','<strong>Hypothèses solides.</strong> Vous avez distingué l’événement ponctuel des facteurs qui restent à instruire.');complete('bud-m4-trajectoire');$('hypo-check').textContent='Continuer vers le comparateur';save()}
const REV=[{lab:'Prudente',v:178},{lab:'Centrale',v:182},{lab:'Favorable',v:187}];
const FIN={fonds:'Fonds propres',mixte:'Mixte',emprunt:'Emprunt'};
function renderSim(){const rev=REV[state.simRevenue||0],fin=state.simFinance||'mixte';$('rev-slider').value=state.simRevenue;text($('sim-rev'),rev.v);text($('sim-fin'),FIN[fin]);qa('#finance-choices .choice').forEach(b=>b.classList.toggle('selected',b.dataset.finance===fin));const central=rev.v===182&&fin==='mixte';text($('sim-margin'),central?'5':'—');text($('sim-margin-note'),central?'Md · scénario central de référence':'marge non calculée dans ce prototype');let msg='';if(rev.v===178)msg='Hypothèse prudente : interrogez la robustesse des recettes et les marges de financement.';else if(rev.v===187)msg='Hypothèse favorable : vérifiez la source et le degré de sécurisation avant de retenir cet effet.';else msg='Scénario central de référence : utilisez le résultat comme point de comparaison.';if(fin==='emprunt')msg+=' Le recours accru à l’emprunt doit être rapproché de la trajectoire de dette.';if(fin==='fonds')msg+=' Un financement davantage assuré sur fonds propres doit être rapproché de la marge réellement disponible.';html($('sim-reading'),`<h4>Lecture de votre scénario</h4><p>${esc(msg)}</p><p class="muted">Hors scénario central, la marge n’est pas recalculée : comparez les hypothèses et identifiez les informations qu’il reste à instruire.</p>`);renderScenarios();save()}
function saveScenario(){if(state.scenarios.length>=2)return;const rev=REV[state.simRevenue],fin=state.simFinance;const sig=`${rev.v}|${fin}`;if(state.scenarios.some(s=>s.sig===sig)){feedback('sim-feedback','bad','<strong>Comparez deux configurations différentes.</strong> Modifiez l’hypothèse de recettes ou le financement avant d’enregistrer le second scénario.');return}state.scenarios.push({sig,rev:rev.v,revLab:rev.lab,finance:FIN[fin],central:rev.v===182&&fin==='mixte'});renderScenarios();if(state.scenarios.length===1)$('sim-save').textContent='Conserver le deuxième scénario';else{$('sim-save').disabled=true;$('sim-save').textContent='2 scénarios enregistrés';if(state.simControl)complete('bud-m4-simulateur')}save()}
function renderScenarios(){const box=$('scenario-compare');if(!box)return;box.innerHTML=[0,1].map(i=>{const s=state.scenarios[i];return s?`<div class="scenario"><div class="counter">Scénario ${i+1}</div><h4>${esc(s.revLab)} · ${esc(s.finance)}</h4><div class="tags"><span class="note-tag">Recettes ${s.rev} Md</span><span class="note-tag">Investissements 22 Md</span>${s.central?'<span class="note-tag">Marge nette réf. 5 Md</span>':'<span class="note-tag">Marge à instruire</span>'}</div></div>`:`<div class="scenario empty">Scénario ${i+1} à construire</div>`}).join('');$('sim-save').disabled=state.scenarios.length>=2;}
function initSimControl(){qa('#sim-question .choice').forEach(b=>b.onclick=()=>{qa('#sim-question .choice').forEach(x=>x.classList.remove('correct','wrong'));if(b.dataset.ok==='1'){b.classList.add('correct');state.simControl=true;feedback('sim-feedback','ok','<strong>Oui.</strong> Une hypothèse de recettes doit être documentée : source, méthode et degré de sécurisation.');if(state.scenarios.length>=2)complete('bud-m4-simulateur')}else{b.classList.add('wrong');state.simControl=false;feedback('sim-feedback','bad','<strong>À reprendre.</strong> Le comparateur sert à explorer des hypothèses, pas à sélectionner automatiquement la valeur la plus favorable ni à ignorer le financement.')}save()})}
function initVigilances(){qa('#vig-choices .choice').forEach(b=>{b.classList.toggle('selected',state.vigilances.includes(+b.dataset.vig));b.onclick=()=>{clearTransientWrong($('vig-choices'));toggleLimited(b,2);state.vigilances=qa('#vig-choices .choice.selected').map(x=>+x.dataset.vig);text($('vig-counter'),`${state.vigilances.length}/2 sélectionnés`);$('vig-save').disabled=state.vigilances.length!==2;clearFeedback('vig-feedback');save()}});text($('vig-counter'),`${state.vigilances.length}/2 sélectionnés`);$('vig-save').disabled=state.vigilances.length!==2}
function saveVigilances(){if(isComplete('bud-m4-vigilances')){go('m4-close');return}const bad=state.vigilances.some(i=>$('vig-choices').querySelector(`[data-vig="${i}"]`).dataset.ok!=='1');if(bad){releaseWrongSelections('vig-choices','vig','vigilances',2,'vig-counter','vig-save','sélectionnés');feedback('vig-feedback','bad','<strong>Une proposition n’instruit pas le budget.</strong> Elle a été retirée. Conservez votre vigilance pertinente et sélectionnez un autre point lié aux recettes, à l’épargne, aux charges ou au financement.');return}feedback('vig-feedback','ok','<strong>Vigilances conservées.</strong> Elles rejoignent votre carnet et serviront à préparer la commission.');complete('bud-m4-vigilances');$('vig-save').textContent='Voir le point d’étape';renderCarnet();save()}

/* M5 */
function initPriorities(){qa('#priority-choices .choice').forEach(b=>{b.classList.toggle('selected',state.priorities.includes(+b.dataset.priority));b.onclick=()=>{clearTransientWrong($('priority-choices'));toggleLimited(b,3);state.priorities=qa('#priority-choices .choice.selected').map(x=>+x.dataset.priority);text($('priority-counter'),`${state.priorities.length}/3 sélectionnées`);$('priority-save').disabled=state.priorities.length!==3;clearFeedback('priority-feedback');save()}});text($('priority-counter'),`${state.priorities.length}/3 sélectionnées`);$('priority-save').disabled=state.priorities.length!==3;renderPriorityCarnet()}
function savePriorities(){if(isComplete('bud-m5-priorites')){go('bud-m5-interlocuteur');return}const bad=state.priorities.some(i=>$('priority-choices').querySelector(`[data-priority="${i}"]`).dataset.ok!=='1');if(bad){const labels=state.priorities.filter(i=>$('priority-choices').querySelector(`[data-priority="${i}"]`).dataset.ok!=='1').map(i=>$('priority-choices').querySelector(`[data-priority="${i}"]`).textContent.trim());releaseWrongSelections('priority-choices','priority','priorities',3,'priority-counter','priority-save','sélectionnées');feedback('priority-feedback','bad',`<strong>À reprioriser.</strong> ${esc(labels.join(' / '))} a été retiré de votre sélection. Gardez vos priorités pertinentes et choisissez un signal de remplacement qui appelle réellement une instruction.`);return}feedback('priority-feedback','ok','<strong>Priorités conservées.</strong> Elles vont maintenant servir à construire vos deux questions.');complete('bud-m5-priorites');$('priority-save').textContent='Continuer';renderCarnet();save()}
function renderPriorityCarnet(){if(!$('priority-carnet'))return;const vals=[...carnetSignals().slice(0,3),...carnetConstats().slice(0,2),...carnetVigilances().slice(0,2)];$('priority-carnet').innerHTML=(vals.length?vals:['Votre carnet se complète au fil des missions.']).map(x=>`<span class="note-tag">${esc(x)}</span>`).join('')}

function initQuestionBuilder(){const signal=$('qb-signal');if(!signal)return;const vals=Array.from(new Set([...carnetSignals(),...carnetConstats(),...carnetVigilances(),...carnetPriorities()]));signal.innerHTML='<option value="">Choisir…</option>'+vals.map(v=>`<option>${esc(v)}</option>`).join('');['qb-signal','qb-enjeu','qb-info','qb-who'].forEach(id=>$(id).onchange=updateQuestionPreview);renderQuestions();updateQuestionPreview()}
function updateQuestionPreview(){const vals=['qb-signal','qb-enjeu','qb-info','qb-who'].map(id=>$(id).value);const ready=vals.every(Boolean);const q=ready?`À partir du constat « ${vals[0]} », pouvez-vous préciser ${vals[2].toLowerCase()} afin de ${vals[1].toLowerCase()} ? Interlocuteur pressenti : ${vals[3]}.`:'Complétez les quatre briques pour générer votre formulation.';text($('qb-preview'),q);$('qb-add').disabled=!ready||state.questions.length>=2;$('qb-add').dataset.preview=q}
function addQuestion(){if(state.questions.length>=2||$('qb-add').disabled)return;state.questions.push($('qb-add').dataset.preview);['qb-signal','qb-enjeu','qb-info','qb-who'].forEach(id=>$(id).value='');renderQuestions();updateQuestionPreview();save()}
function renderQuestions(){const box=$('question-cards');if(!box)return;box.innerHTML=state.questions.map((q,i)=>`<div class="card ${i%2?'gold':'info'}"><div class="counter">Question ${i+1}</div><p>${esc(q)}</p><button class="btn secondary q-remove" data-i="${i}">Retirer / reformuler</button></div>`).join('');qa('.q-remove',box).forEach(b=>b.onclick=()=>{state.questions.splice(+b.dataset.i,1);renderQuestions();updateQuestionPreview();save()});text($('qb-counter'),`${state.questions.length}/2 questions préparées`);$('question-next').disabled=state.questions.length!==2;if(state.questions.length===2)complete('bud-m5-question')}

const EXCHANGE_STEPS=[
 {choices:[
  {q:2,l:'Demander la source de l’hypothèse de recette, la méthode d’estimation et son degré de sécurisation.',a:'Nous pouvons documenter la source, la méthode et le degré de sécurisation de l’hypothèse. Cela permet de distinguer ce qui est acquis de ce qui reste incertain.',f:'<strong>Question précise.</strong> Vous obtenez une information vérifiable sur la construction de l’hypothèse.'},
  {q:1,l:'Demander simplement si la recette est considérée comme « sûre ».',a:'Nous pouvons donner une appréciation générale, mais elle reste peu exploitable sans la source, la méthode et le degré de sécurisation.',f:'<strong>Vous progressez.</strong> La demande est utile, mais elle gagnerait à préciser la source et la méthode.'},
  {q:0,l:'Demander si le budget est globalement « bon » ou « mauvais ».',a:'Le service peut documenter des données et des hypothèses. Un jugement global ne permet pas d’instruire la décision.',f:'<strong>Retour formatif.</strong> Cherchez une donnée ou une hypothèse à documenter plutôt qu’un jugement global.'}
 ],note:'À vérifier : source, méthode et degré de sécurisation de l’hypothèse de recette.'},
 {choices:[
  {q:2,l:'Rapprocher la réponse de la trajectoire sur plusieurs exercices et demander ce qui explique les écarts observés.',a:'La trajectoire permet de distinguer un événement ponctuel d’une évolution durable. Il faut rapprocher recettes, dépenses, épargne et dette sur plusieurs exercices.',f:'<strong>Bonne relance.</strong> Vous replacez l’information dans la trajectoire avant de conclure.'},
  {q:1,l:'Demander uniquement si les recettes devraient finalement augmenter.',a:'Une évolution attendue peut être utile, mais elle doit être reliée à la trajectoire et aux hypothèses qui la soutiennent.',f:'<strong>À préciser.</strong> Reliez l’évolution attendue aux exercices précédents et à la méthode d’estimation.'},
  {q:0,l:'Passer à un autre sujet sans relier la réponse au dossier.',a:'Changer de sujet à ce stade laisse l’hypothèse insuffisamment instruite.',f:'<strong>Retour formatif.</strong> Exploitez d’abord la réponse obtenue et reliez-la aux autres éléments du dossier.'}
 ],note:'À mettre en perspective : trajectoire pluriannuelle et facteurs expliquant les écarts.'},
 {choices:[
  {q:2,l:'Reformuler ce qui est acquis, ce qui reste incertain et l’information encore nécessaire avant la commission.',a:'Vous disposez alors d’une conclusion de travail : faits acquis, incertitudes identifiées et prochaine information à demander.',f:'<strong>Réflexe transférable.</strong> Vous terminez l’échange par une synthèse exploitable pour la commission.'},
  {q:1,l:'Demander une confirmation générale sans préciser l’information qui manque encore.',a:'Une confirmation générale clôt l’échange, mais elle laisse moins clairement apparaître ce qui reste à instruire.',f:'<strong>À renforcer.</strong> Nommez l’information encore manquante et la conséquence pour votre analyse.'},
  {q:0,l:'Conclure que le scénario le plus favorable doit être retenu.',a:'Le comparateur ne classe pas les choix politiques. Il sert à révéler les hypothèses et informations à instruire.',f:'<strong>Retour formatif.</strong> Une hypothèse favorable n’est pas, à elle seule, une décision à retenir.'}
 ],note:'Avant la commission : distinguer les faits acquis, les incertitudes et l’information encore manquante.'}
];
function initExchange(){renderExchange();$('exchange-end').onclick=()=>{if(state.exchangeStep>=3){state.exchangeDone=true;complete('bud-m5-commission');renderCarnet();go('bud-m5-note');save()}}}
function doExchange(q,label,answer,fb){if(state.exchangeStep>=3)return;state.precision=Math.min(100,state.precision+([8,20,32][q]||8));state.instruction=Math.min(100,state.instruction+([12,20,30][q]||12));state.exchangeChoices.push(q);state.exchangeNotes[state.exchangeStep]=EXCHANGE_STEPS[state.exchangeStep].note;state.exchangeStep++;feedback('exchange-feedback',q===0?'bad':'ok',fb);renderExchange();renderCarnet();save()}
function renderExchange(){
 if(!$('exchange-options'))return;if($('gauge-precision'))$('gauge-precision').style.width=(state.precision||0)+'%';if($('gauge-progress'))$('gauge-progress').style.width=(state.instruction||0)+'%';
 const qc=$('exchange-question-context');if(qc)qc.innerHTML=(state.questions||[]).slice(0,2).map((q,i)=>`<div class="exchange-question"><b>Question ${i+1} de votre carnet</b><p>${esc(q)}</p></div>`).join('')||'<div class="exchange-question"><b>Vos questions</b><p>Revenez à l’écran précédent pour préparer deux questions avant la simulation.</p></div>';
 const d=$('dialogue');if(d){d.innerHTML='<div class="bubble service">J’ai sous les yeux les deux questions que vous avez préparées. Utilisons-les pour préciser ce qui est acquis et ce qui reste à instruire.</div>';(state.exchangeChoices||[]).forEach((q,i)=>{const st=EXCHANGE_STEPS[i],c=st.choices.find(x=>x.q===q)||st.choices[0];d.insertAdjacentHTML('beforeend',`<div class="bubble user">${esc(c.l)}</div><div class="bubble service">${esc(c.a)}</div>`)});}
 text($('exchange-counter'),state.exchangeStep<3?`Échange ${state.exchangeStep+1} sur 3`:'3 échanges menés');$('exchange-end').disabled=state.exchangeStep<3;
 const box=$('exchange-options');box.innerHTML='';if(state.exchangeStep<3){EXCHANGE_STEPS[state.exchangeStep].choices.forEach(c=>{const b=document.createElement('button');b.className='choice';b.dataset.quality=c.q;b.textContent=c.l;b.onclick=()=>doExchange(c.q,c.l,c.a,c.f);box.appendChild(b)})}else{box.innerHTML='<div class="card success"><strong>Échange terminé.</strong><p>Votre carnet contient maintenant les trois réflexes à conserver pour préparer la commission.</p></div>'}
}

/* Carnet */
function carnetPlan(){return (state.plan||[]).map(i=>D.PLAN_ACTIONS[i]).filter(Boolean)}
function carnetSignals(){const out=[];for(const k of Object.keys(D.DOSSIER||{})){if(state.dossierDone[k]){const d=D.DOSSIER[k],sel=state.dossierSelected[k]||[];sel.forEach(i=>{if(d.options[i]&&d.options[i][1]===1)out.push(d.options[i][0])})}}return out}
function carnetConstats(){return (state.constats||[]).map(i=>{const b=$('constat-choices')?.querySelector(`[data-constat="${i}"]`);return b?b.textContent.trim():null}).filter(Boolean)}
function carnetVigilances(){return (state.vigilances||[]).map(i=>{const b=$('vig-choices')?.querySelector(`[data-vig="${i}"]`);return b?b.textContent.trim():null}).filter(Boolean)}
function carnetPriorities(){return (state.priorities||[]).map(i=>{const b=$('priority-choices')?.querySelector(`[data-priority="${i}"]`);return b?b.textContent.trim():null}).filter(Boolean)}
function tags(vals,empty='Rien pour le moment'){return vals.length?`<div class="tags">${vals.map(v=>`<span class="note-tag">${esc(v)}</span>`).join('')}</div>`:`<p class="empty">${esc(empty)}</p>`}
function carnetHTML(){return `<div class="note-section"><div class="note-label">Mission 1 · Mon plan</div>${tags(carnetPlan())}</div><div class="note-section"><div class="note-label">Mission 2 · Signaux épinglés</div>${tags(carnetSignals())}</div><div class="note-section"><div class="note-label">Mission 3 · Mes constats</div>${tags(carnetConstats())}</div><div class="note-section"><div class="note-label">Mission 4 · Mes vigilances</div>${tags(carnetVigilances())}</div><div class="note-section"><div class="note-label">Mission 5 · Mes priorités</div>${tags(carnetPriorities())}</div><div class="note-section"><div class="note-label">Mes questions de commission</div>${tags(state.questions||[])}</div><div class="note-section"><div class="note-label">Après l’échange · À conserver</div>${tags(state.exchangeNotes||[])}</div>`}
function renderCarnet(){['tool-carnet-content','final-carnet-content'].forEach(id=>html($(id),carnetHTML()));html($('m1-close-carnet'),tags(carnetPlan()).replace(/^<div class="tags">|<\/div>$/g,''));html($('m2-close-carnet'),tags(Object.keys(state.dossierDone).filter(k=>state.dossierDone[k]).map(k=>D.DOSSIER[k].title)).replace(/^<div class="tags">|<\/div>$/g,''));html($('m3-close-carnet'),tags(carnetConstats()).replace(/^<div class="tags">|<\/div>$/g,''));html($('m4-close-carnet'),tags(carnetVigilances()).replace(/^<div class="tags">|<\/div>$/g,''));renderPriorityCarnet()}


function gabArray(obj){return D.COMP.map((_,i)=>Number((obj||{})[i])||null)}
function hydrateScreen(id){
 renderCarnet();updateBadges();
 if(id==='g-fin'){const pre=gabArray(GABARIT.etat.pre),post=gabArray(GABARIT.etat.post);drawRadar($('final-radar'),pre,post);renderRadarText('final-radar-text',pre,post);}
 if(id==='bud-m1-reperes')renderRepere(state.repCurrent||1);
 if(id==='bud-m1-cycle')renderCycleScreen();
 if(id==='bud-m2-documents')renderNeed();
 if(id==='bud-m2-evolution')renderEvol();
 if(id==='bud-dossier')renderDossier();
 if(id==='bud-reperes')updateBadges();
 if(id==='bud-carnet')renderCarnet();
 if(id==='bud-m4-simulateur')renderSim();
 if(id==='bud-m5-note')renderCarnet();
 // Garde-fou UX : aucun écran dynamique actif ne doit rester vide à l'arrivée.
 const guards={
  'bud-m1-reperes':['repere-stage',()=>renderRepere(state.repCurrent||1)],
  'bud-m1-cycle':['cycle-bank',()=>{if(state.cycleMode==='build')renderCycleBank()}],
  'bud-m2-documents':['doc-options',renderNeed],
  'bud-m2-evolution':['evol-options',renderEvol],
  'bud-dossier':['signal-choices',renderDossier],
  'bud-m5-commission':['exchange-options',initExchange]
 };
 const g=guards[id];if(g){const zone=$(g[0]);if(zone&&!zone.children.length&&!(id==='bud-m1-cycle'&&state.cycleMode!=='build')){console.warn('[BUDGET] Auto-réparation d’un état initial vide : '+id);g[1]();}}
}

/* persistent tools / modal */
function openTool(id){state.returnTo=GABARIT.etat.page||state.lastMain||'g-contrat';GABARIT.fermerModal('g-acces');go(id)}
function returnTool(){go(state.returnTo||state.lastMain||'g-contrat')}
/* wire */
function wire(){
 qa('[data-complete-go]').forEach(b=>b.onclick=()=>{complete(GABARIT.etat.page||state.current);go(b.dataset.completeGo)});
 qa('.feedback').forEach(f=>{f.setAttribute('aria-live','polite');f.setAttribute('role','status')});
 if($('return-from-reperes'))$('return-from-reperes').onclick=returnTool;
 if($('return-from-carnet'))$('return-from-carnet').onclick=returnTool;
 if($('return-from-lexique'))$('return-from-lexique').onclick=returnTool;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-bud-tool]');if(!b)return;e.preventDefault();openTool(b.dataset.budTool)});
 qa('.repere-select').forEach(b=>b.onclick=()=>renderRepere(b.dataset.repere));if($('repere-next'))$('repere-next').onclick=()=>go('bud-m1-acteurs');
 qa('.actor').forEach(b=>b.onclick=()=>chooseActor(b.dataset.actor));if($('actor-next'))$('actor-next').onclick=()=>go('bud-m1-regle');
 if($('cycle-start'))$('cycle-start').onclick=()=>{state.cycleMode='build';renderCycleScreen();save()};if($('cycle-reset'))$('cycle-reset').onclick=resetCycle;if($('cycle-next'))$('cycle-next').onclick=()=>go('bud-m1-plan');
 if($('plan-save'))$('plan-save').onclick=savePlan;
 qa('.mission-close').forEach(b=>b.onclick=()=>{const m=+b.dataset.mission;state.badges[m-1]=true;complete(GABARIT.etat.page||state.current);save();go(m<5?`m${m+1}-intro`:'g-post')});
 if($('doc-prev'))$('doc-prev').onclick=()=>{if(state.docNeedIndex>0){state.docNeedIndex--;renderNeed();save()}};if($('doc-nextneed'))$('doc-nextneed').onclick=()=>{if(state.docNeedIndex<3){state.docNeedIndex++;renderNeed();save()}};if($('doc-screen-next'))$('doc-screen-next').onclick=()=>go('bud-m2-logiques');
 initLogic();if($('logic-next'))$('logic-next').onclick=()=>go('bud-m2-evolution');if($('evol-next'))$('evol-next').onclick=evolNext;
 qa('.doc-tab').forEach(b=>b.onclick=()=>{state.dossierPiece=b.dataset.piece;clearFeedback('signal-feedback');renderDossier();save()});if($('signal-check'))$('signal-check').onclick=checkDossier;
 if($('section-next'))$('section-next').onclick=()=>go('bud-m3-calcul');if($('calc-do'))$('calc-do').onclick=calcDo;if($('calc-next'))$('calc-next').onclick=calcNext;
 initSingleChoice('interpret-choices','interpret-feedback','interpret-next','<strong>Oui.</strong> L’événement exceptionnel explique une partie de N−1, mais la poursuite de la baisse en N impose d’instruire les facteurs durables.','<strong>À revoir.</strong> Une valeur isolée ou une explication ponctuelle ne suffit pas : regardez la trajectoire sur plusieurs exercices.','bud-m3-interpreter','bud-m3-constats');
 if($('constat-save'))$('constat-save').onclick=saveConstats;
 initSingleChoice('reflex-choices','reflex-feedback','reflex-next','<strong>Réflexe validé.</strong> Vérifier → comparer → expliquer → instruire avant de conclure.','<strong>À ajuster.</strong> Un seuil ou une valeur isolée ne remplace pas la vérification du calcul, de la trajectoire et des facteurs explicatifs.','bud-m3-reflexe','m3-close');
 if($('flip-next'))$('flip-next').onclick=()=>go('bud-m4-trajectoire');if($('hypo-check'))$('hypo-check').onclick=checkHypotheses;
 if($('rev-slider'))$('rev-slider').oninput=e=>{state.simRevenue=+e.target.value;renderSim()};qa('#finance-choices .choice').forEach(b=>b.onclick=()=>{state.simFinance=b.dataset.finance;renderSim()});if($('sim-save'))$('sim-save').onclick=saveScenario;initSimControl();
 if($('vig-save'))$('vig-save').onclick=saveVigilances;if($('priority-save'))$('priority-save').onclick=savePriorities;
 initSingleChoice('interloc-choices','interloc-feedback','interloc-next','<strong>Oui.</strong> Commencez par le service capable de documenter l’hypothèse technique, puis mobilisez les autres interlocuteurs selon la nature de l’information recherchée.','<strong>À ajuster.</strong> Cherchez d’abord l’acteur capable de produire ou d’expliquer la donnée attendue.','bud-m5-interlocuteur','bud-m5-question');
 if($('qb-add'))$('qb-add').onclick=addQuestion;if($('question-next'))$('question-next').onclick=()=>go('bud-m5-commission');initExchange();if($('note-next'))$('note-next').onclick=()=>{complete('bud-m5-note');go('m5-close')};
 if($('finish-course'))$('finish-course').onclick=()=>{state.finished=true;save();$('finish-course').textContent='Module terminé ✓';$('finish-course').disabled=true;go('g-fin')};
}


function relabelPositionButtons(root){if(!root)return;qa('.g-echelle',root).forEach(e=>qa('button',e).forEach((b,i)=>{if(D.LEVELS&&D.LEVELS[i])b.textContent=D.LEVELS[i]}))}
function answeredIndex(phase){const o=GABARIT.etat[phase]||{};for(let i=0;i<(D.COMP||[]).length;i++)if(!Number(o[i]))return i;return Math.max(0,(D.COMP||[]).length-1)}
function setupSequentialPosition(phase){
 const root=$(phase==='pre'?'g-pre-items':'g-post-items'),summary=$(phase==='pre'?'bud-pre-summary':'bud-post-summary'),counter=$(phase==='pre'?'bud-pre-counter':'bud-post-counter'),back=$(phase==='pre'?'bud-pre-back':'bud-post-back');
 if(!root||!summary)return;relabelPositionButtons(root);let idx=answeredIndex(phase);
 function show(i){idx=Math.max(0,Math.min((D.COMP||[]).length-1,i));const items=qa('.g-item-pos',root);items.forEach((x,j)=>x.hidden=j!==idx);summary.hidden=true;if(counter)counter.textContent=`Compétence ${idx+1} sur ${items.length}`;if(back)back.disabled=idx===0;}
 root.addEventListener('click',e=>{const b=e.target.closest('.g-echelle button');if(!b)return;const item=b.closest('.g-item-pos'),items=qa('.g-item-pos',root),i=items.indexOf(item);setTimeout(()=>{const done=Object.keys(GABARIT.etat[phase]||{}).length>=items.length;if(done&&i===items.length-1){items.forEach(x=>x.hidden=true);summary.hidden=false;const pre=gabArray(GABARIT.etat.pre),post=phase==='post'?gabArray(GABARIT.etat.post):null;drawRadar($(phase==='pre'?'bud-pre-radar':'bud-post-radar'),pre,post);renderRadarText(phase==='pre'?'bud-pre-radar-text':'bud-post-radar-text',pre,post);}else show(Math.min(i+1,items.length-1));},0)});
 if(back)back.onclick=()=>show(idx-1);
 const done=Object.keys(GABARIT.etat[phase]||{}).length>=(D.COMP||[]).length;
 if(done){qa('.g-item-pos',root).forEach(x=>x.hidden=true);summary.hidden=false;const pre=gabArray(GABARIT.etat.pre),post=phase==='post'?gabArray(GABARIT.etat.post):null;drawRadar($(phase==='pre'?'bud-pre-radar':'bud-post-radar'),pre,post);renderRadarText(phase==='pre'?'bud-pre-radar-text':'bud-post-radar-text',pre,post);}else show(idx);
 if(phase==='pre'&&$('bud-pre-go'))$('bud-pre-go').onclick=()=>{complete('g-pre');go('m1-intro')};
 if(phase==='post'&&$('bud-post-go'))$('bud-post-go').onclick=()=>{complete('g-post');go('g-fin')};
}
const MACRO_NAV=[
 {id:'g-contrat',kicker:'Accueil',label:'Bienvenue',pages:['g-contrat']},
 {id:'g-pre',kicker:'Positionnement',label:'Positionnement initial',pages:['g-pre']},
 {id:'m1-intro',kicker:'Mission 1',label:'Maîtriser les repères',pages:['m1-intro','bud-m1-reperes','bud-m1-acteurs','bud-m1-regle','bud-m1-cycle','bud-m1-plan','m1-close']},
 {id:'m2-intro',kicker:'Mission 2',label:'Explorer le dossier',pages:['m2-intro','bud-m2-documents','bud-m2-logiques','bud-m2-evolution','bud-dossier','m2-close']},
 {id:'m3-intro',kicker:'Mission 3',label:'Lire les équilibres',pages:['m3-intro','bud-m3-sections','bud-m3-calcul','bud-m3-interpreter','bud-m3-constats','bud-m3-reflexe','m3-close']},
 {id:'m4-intro',kicker:'Mission 4',label:'Interpréter les indicateurs',pages:['m4-intro','bud-m4-indicateurs','bud-m4-trajectoire','bud-m4-simulateur','bud-m4-vigilances','m4-close']},
 {id:'m5-intro',kicker:'Mission 5',label:'Préparer la commission',pages:['m5-intro','bud-m5-priorites','bud-m5-interlocuteur','bud-m5-question','bud-m5-commission','bud-m5-note','m5-close']},
 {id:'g-post',kicker:'Positionnement',label:'Positionnement final',pages:['g-post']},
 {id:'g-fin',kicker:'Clôture',label:'Pour conclure',pages:['g-fin','bud-ressources','bud-credits']}
];
let macroMenuObserver=null;
function macroForPage(page){
 let found=MACRO_NAV.find(x=>x.pages.includes(page));
 if(!found&&['bud-reperes','bud-carnet','bud-lexique'].includes(page)){
   const ref=state.returnTo||state.lastMain||'g-contrat';found=MACRO_NAV.find(x=>x.pages.includes(ref));
 }
 return found||null;
}
function macroDone(item){
 if(item.id==='g-contrat')return isComplete('g-contrat');
 if(item.id==='g-pre')return isComplete('g-pre');
 const m=navMission(item.id);if(m)return !!state.badges[m-1];
 if(item.id==='g-post')return isComplete('g-post');
 if(item.id==='g-fin')return isComplete('g-fin');
 return false;
}
function updateMacroMenuState(){
 const list=$('g-menu-liste');if(!list)return;
 const current=(document.querySelector('.panel.actif')||{}).id||GABARIT.etat.page||state.current;
 const active=macroForPage(current);
 qa('li[data-macro-id]',list).forEach(li=>{
   const item=MACRO_NAV.find(x=>x.id===li.dataset.macroId),a=li.querySelector('a'),st=li.querySelector('.g-menu-statut');
   li.className='';a.removeAttribute('aria-current');a.removeAttribute('aria-disabled');
   if(active&&item.id===active.id){li.classList.add('est-actif');a.setAttribute('aria-current','page');st.textContent='→'}
   else if(macroDone(item)){li.classList.add('est-termine');st.textContent='✓'}
   else{li.classList.add('est-a-venir');st.textContent=''}
   const allowed=canAccessNav(item.id);
   if(!allowed){a.setAttribute('aria-disabled','true');a.style.opacity='.62';a.style.cursor='default'}else{a.style.opacity='';a.style.cursor='pointer'}
  });
}
function patchNucleusMenu(){
 const list=$('g-menu-liste');if(!list)return;list.innerHTML='';
 MACRO_NAV.forEach(item=>{
   const li=document.createElement('li');li.dataset.macroId=item.id;li.dataset.page=item.id;
   const a=document.createElement('a');a.href='#';a.setAttribute('role','link');
   const txt=document.createElement('span'),k=document.createElement('span'),lab=document.createElement('span'),st=document.createElement('span');
   k.className='g-menu-kicker';k.textContent=item.kicker;lab.className='g-menu-libelle';lab.textContent=item.label;st.className='g-menu-statut';st.setAttribute('aria-hidden','true');
   txt.appendChild(k);txt.appendChild(lab);a.appendChild(txt);a.appendChild(st);li.appendChild(a);list.appendChild(li);
   a.addEventListener('click',e=>{e.preventDefault();if(canAccessNav(item.id))go(item.id)});
   a.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&canAccessNav(item.id)){e.preventDefault();go(item.id)}});
 });
 updateMacroMenuState();
 const app=$('g-app');if(app){macroMenuObserver=new MutationObserver(()=>{updateMacroMenuState();const active=(document.querySelector('.panel.actif')||{}).id;if(active&&active!==hydratedPage){state.current=active;if(SEQ.includes(active))state.lastMain=active;hydrateScreen(active);hydratedPage=active;}});macroMenuObserver.observe(app,{subtree:true,attributes:true,attributeFilter:['class']})}
}
function patchBottomNavigation(){
 const next=$('g-btn-suiv'),prev=$('g-btn-prec');if(!next||!prev)return;
 next.addEventListener('click',e=>{const p=GABARIT.etat.page;if(p==='m5-close'){e.stopImmediatePropagation();e.preventDefault();go('g-post')}else if(p==='g-post'){e.stopImmediatePropagation();e.preventDefault();if(Object.keys(GABARIT.etat.post||{}).length>=(D.COMP||[]).length){complete('g-post');go('g-fin')}}},true);
 prev.addEventListener('click',e=>{const p=GABARIT.etat.page;if(p==='g-post'){e.stopImmediatePropagation();e.preventDefault();go('m5-close')}else if(p==='g-fin'){e.stopImmediatePropagation();e.preventDefault();go('g-post')}},true);
}

function init(){
 GABARIT.init({
  titre:'Comprendre et piloter le budget',
  sousTitre:'Congrès de la Nouvelle-Calédonie × IFAP — mandature 2026-2031',
  items:D.COMP||[],orientation:null,dateMaj:'07/09/2026',nbQuestionsEval:0,
  ipsatif:false,reportPositionnement:true,reportEval:false,reportProgression:true,
  reprise:true,accesOperationnel:true,ouvrirSousEtape:null,dev:false
 });
 restoreModule(GABARIT.lireDonnee('budget',null));
 state.current=GABARIT.etat.page||'g-contrat';state.lastMain=SEQ.includes(state.current)?state.current:'g-contrat';
 ensureOrders();wire();renderCarnet();renderScenarios();initPlan();initSections();initConstats();initVigilances();initPriorities();initQuestionBuilder();initFlips();initHypotheses();renderCalc();initSimControl();initExchange();
 setupSequentialPosition('pre');setupSequentialPosition('post');patchNucleusMenu();patchBottomNavigation();
 hydrateScreen(state.current);hydratedPage=state.current;if(state.current==='bud-m1-reperes'&&!$('repere-stage').innerHTML.trim())renderRepere(state.repCurrent||1);updateMacroMenuState();
 const budget=GABARIT.verifierBudgetStockage();if(!budget.ok)console.error('[BUDGET] suspend_data dépasse la limite projet',budget);
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();

'use strict';
(() => {
 const dataNode=document.querySelector('#collection-data');
 const hero=document.querySelector('#entry-film');
 const toggle=document.querySelector('#entry-toggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let heroStarted=false, heroUserPaused=false, heroInView=true;
 const canAnimate=()=>!reduced.matches&&!navigator.connection?.saveData;
 const setToggle=()=>{if(!toggle||!hero)return;toggle.textContent=hero.paused?'▷':'Ⅱ';toggle.setAttribute('aria-label',hero.paused?'Lire le ralenti':'Mettre en pause le ralenti');toggle.title=hero.paused?'Lire':'Pause';};
 function startHero(){
  if(!hero)return;
  if(!heroStarted){hero.querySelectorAll('source').forEach(s=>s.src=s.dataset.src);heroStarted=true;hero.load();}
  hero.play().then(setToggle).catch(setToggle);
 }
 if(hero){
  // No sound starts automatically. The poster remains visible if autoplay is refused.
  hero.muted=true;
  if(canAnimate())startHero();else{hero.autoplay=false;setToggle();}
  toggle.addEventListener('click',()=>{if(hero.paused){heroUserPaused=false;startHero();}else{heroUserPaused=true;hero.pause();}});
  hero.addEventListener('play',setToggle);hero.addEventListener('pause',setToggle);
  const io=new IntersectionObserver(entries=>{heroInView=entries[0].isIntersecting;if(!heroInView)hero.pause();else if(canAnimate()&&!heroUserPaused&&!document.querySelector('dialog[open]'))startHero();},{threshold:.1});io.observe(hero);
  reduced.addEventListener('change',()=>{if(!canAnimate())hero.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hero.pause();else if(canAnimate()&&heroInView&&!heroUserPaused&&!document.querySelector('dialog[open]'))startHero();});
 }
 if(!dataNode)return;
 const collections=JSON.parse(dataNode.textContent);
 const dialog=document.querySelector('.collection-dialog');
 const stage=dialog.querySelector('.viewer-stage');
 const counter=dialog.querySelector('.viewer-counter');
 const nav=dialog.querySelector('.viewer-nav');
 let active=[],index=0,mode='image',opener=null;
 function stopStage(){stage.querySelectorAll('video,audio').forEach(el=>{el.pause();el.removeAttribute('src');el.load();});stage.replaceChildren();}
 function render(){
  stopStage();const item=active[index];if(!item)return;
  stage.classList.toggle('audio-stage',mode==='audio');
  let el;
  if(mode==='image'){
   el=document.createElement('img');el.src=item.src;el.alt='Photographie de la création';el.decoding='async';
  }else{
   el=document.createElement(mode==='video'?'video':'audio');el.controls=true;el.preload='metadata';el.src=item.src;el.setAttribute('aria-label',item.title||'Création sonore');
   if(mode==='video'){el.playsInline=true;el.poster=item.poster;}
  }
  stage.append(el);counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(active.length).padStart(2,'0')}`;nav.hidden=active.length<2;
  if(mode!=='image')el.play().catch(()=>{});
 }
 function open(button){
  const host=button.closest('[data-collection]');if(!host)return;
  const config=collections[host.dataset.collection];if(!config)return;
  mode=button.dataset.media;active=config[mode==='image'?'images':mode==='video'?'videos':'audio']||[];
  if(!active.length)return;
  index=0;opener=button;hero?.pause();dialog.showModal();render();
 }
 document.querySelectorAll('[data-media]').forEach(button=>button.addEventListener('click',()=>open(button)));
 dialog.querySelector('.viewer-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.viewer-prev').addEventListener('click',()=>{index=(index-1+active.length)%active.length;render();});
 dialog.querySelector('.viewer-next').addEventListener('click',()=>{index=(index+1)%active.length;render();});
 dialog.addEventListener('keydown',e=>{if(e.target.closest('video,audio'))return;if(e.key==='ArrowRight'&&active.length>1){index=(index+1)%active.length;render();e.preventDefault();}if(e.key==='ArrowLeft'&&active.length>1){index=(index-1+active.length)%active.length;render();e.preventDefault();}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{stopStage();opener?.focus({preventScroll:true});if(hero&&canAnimate()&&heroInView&&!heroUserPaused)startHero();});
})();

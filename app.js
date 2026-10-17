function whenNearViewport(id,initialize){
 const element=document.getElementById(id);if(!element)return;
 if(!('IntersectionObserver' in window)){initialize();return;}
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();initialize();}},{rootMargin:'500px'});
 observer.observe(element);
}
// Pause invisible carousels; resume automatically when they enter the viewport.
function carouselVisibility(element){
 const state={visible:true};
 if('IntersectionObserver' in window){
  state.visible=false;
  new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting},{rootMargin:'100px'}).observe(element);
 }
 return state;
}
// Keep the offer date aligned with the visitor's local calendar day.
(function(){
 const label=document.getElementById('offer-today');if(!label)return;
 let midnightTimer;
 const pad=n=>String(n).padStart(2,'0');
 function refresh(){
  const now=new Date(),year=now.getFullYear(),month=pad(now.getMonth()+1),day=pad(now.getDate());
  label.textContent=month+'/'+day+'/'+year;label.setAttribute('datetime',year+'-'+month+'-'+day);
  clearTimeout(midnightTimer);
  const midnight=new Date(year,now.getMonth(),now.getDate()+1);
  midnightTimer=setTimeout(refresh,midnight.getTime()-now.getTime()+50);
 }
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);refresh();
})();
// End automatic offer date.

function closeNotice(){document.getElementById('preview-notice').classList.remove('open');lastFocus?.focus()}
let lastFocus;
document.querySelectorAll('.js-checkout').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();lastFocus=a;const modal=document.getElementById('preview-notice');modal.classList.add('open');modal.querySelector('button').focus()}));
document.getElementById('preview-notice').addEventListener('click',e=>{if(e.target.id==='preview-notice')closeNotice()});
document.addEventListener('keydown',e=>{const modal=document.getElementById('preview-notice');if(!modal.classList.contains('open'))return;if(e.key==='Escape')closeNotice();if(e.key==='Tab'){const b=[...modal.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===b.at(-1)){e.preventDefault();b[0].focus()}}});
// Centered stack: initialize as it approaches the viewport.
whenNearViewport('pages-carousel',function(){
 const c=document.getElementById('pages-carousel'),track=c.querySelector('.track'),slides=[...track.children],dots=c.querySelector('.dots'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const visibility=carouselVisibility(c);
 let current=0,paused=false,startX=null;
 function go(index){current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{let distance=(i-current+slides.length)%slides.length;if(distance>slides.length/2)distance-=slides.length;slide.dataset.position=distance;slide.style.setProperty('--offset',distance);slide.style.zIndex=10-Math.abs(distance);slide.style.opacity=Math.abs(distance)>2?'0':String(1-Math.abs(distance)*.22);slide.setAttribute('aria-hidden',i===current?'false':'true')});[...dots.children].forEach((dot,i)=>{dot.classList.toggle('on',i===current);dot.setAttribute('aria-current',i===current?'true':'false')})}
 slides.forEach((slide,i)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Show activity page '+(i+1));dot.onclick=()=>go(i);dots.append(dot)});
 c.querySelector('.next').onclick=()=>go(current+1);c.querySelector('.prev').onclick=()=>go(current-1);
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(current-1)}});
 track.addEventListener('pointerdown',e=>{startX=e.clientX;track.setPointerCapture(e.pointerId)});
 track.addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>35)go(current+(e.clientX<startX?1:-1));startX=null});track.addEventListener('pointercancel',()=>startX=null);
 ['mouseenter','focusin','pointerdown'].forEach(e=>c.addEventListener(e,()=>paused=true));['mouseleave','focusout','pointerup','pointercancel'].forEach(e=>c.addEventListener(e,()=>paused=false));
 setInterval(()=>{if(visibility.visible&&!paused&&!document.hidden&&!reduced.matches)go(current+1)},3000);go(0);
});

// Fade-in reveals, with a fully visible reduced-motion and no-JavaScript fallback.
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px 45px 0px'});
 document.querySelectorAll('.world-card,.bonus-card,.format-card,.adventure-resources>div,.why-panel,section:not(.hero) h2,.plan').forEach(el=>{el.classList.add('fade-pending');observer.observe(el)});
}
// Color / B&W image reveal: pointer, touch and native keyboard range control.
(function(){
 const box=document.getElementById('print-compare'),range=document.getElementById('compare-range');if(!box||!range)return;
 let dragging=false;
 function paint(value){const n=Math.max(0,Math.min(100,Number(value)));range.value=n;box.style.setProperty('--split',n+'%');range.setAttribute('aria-valuetext',Math.round(n)+'% color, '+Math.round(100-n)+'% black and white')}
 function at(event){const rect=box.getBoundingClientRect();paint((event.clientX-rect.left)/rect.width*100)}
 range.addEventListener('input',()=>paint(range.value));
 box.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;dragging=true;box.setPointerCapture(event.pointerId);range.focus({preventScroll:true});at(event);event.preventDefault()});
 box.addEventListener('pointermove',event=>{if(dragging)at(event)});
 box.addEventListener('pointerup',event=>{if(dragging){at(event);dragging=false;if(box.hasPointerCapture(event.pointerId))box.releasePointerCapture(event.pointerId)}});
 box.addEventListener('pointercancel',()=>dragging=false);box.addEventListener('lostpointercapture',()=>dragging=false);paint(50);
})();
// Supplied message carousel.
whenNearViewport('proof-carousel',function(){
 const carousel=document.getElementById('proof-carousel');if(!carousel)return;
 const track=carousel.querySelector('.proof-track'),slides=[...track.children],dots=carousel.querySelector('.proof-dots'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false,current=0;
 const visibility=carouselVisibility(carousel);
 let cachedStep=1,cachedMaximum=0;
 const step=()=>cachedStep;
 const maximum=()=>cachedMaximum;
 function paint(){[...dots.children].forEach((dot,i)=>{dot.classList.toggle('on',i===current);dot.setAttribute('aria-current',i===current?'true':'false')})}
 function go(i){const pages=maximum()+1;current=(i+pages)%pages;track.scrollTo({left:current===maximum()?track.scrollWidth-track.clientWidth:current*step(),behavior:reduced.matches?'instant':'smooth'});paint()}
 function setup(){cachedStep=slides.length>1?slides[1].offsetLeft-slides[0].offsetLeft:1;cachedMaximum=Math.max(0,Math.ceil((track.scrollWidth-track.clientWidth)/cachedStep));dots.replaceChildren();for(let i=0;i<=maximum();i++){const dot=document.createElement('button');dot.setAttribute('aria-label','Show message group '+(i+1));dot.onclick=()=>go(i);dots.append(dot)}current=Math.min(current,maximum());paint()}
 carousel.querySelector('.next').onclick=()=>go(current+1);carousel.querySelector('.prev').onclick=()=>go(current-1);
 track.addEventListener('scroll',()=>{current=track.scrollWidth-track.clientWidth-track.scrollLeft<2?maximum():Math.min(maximum(),Math.round(track.scrollLeft/step()));paint()},{passive:true});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();go(current+1)}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1)}});
 ['mouseenter','focusin','touchstart','pointerdown'].forEach(e=>carousel.addEventListener(e,()=>paused=true,{passive:true}));['mouseleave','focusout','touchend','pointerup'].forEach(e=>carousel.addEventListener(e,()=>paused=false,{passive:true}));
 setInterval(()=>{if(visibility.visible&&!paused&&!document.hidden&&!reduced.matches)go(current+1)},5000);
 if('ResizeObserver' in window)new ResizeObserver(setup).observe(track);else window.addEventListener('resize',setup);setup();
});

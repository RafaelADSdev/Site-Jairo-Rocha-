import {coastImage,coastImageSet} from '../data/litoral-experience';
import {priceScales} from '../data/filters';
const CYCLE=7000;
const opening=document.querySelector<HTMLElement>('[data-home-opening]');
if(opening) {
 const image=opening.querySelector<HTMLImageElement>('[data-home-photo]')!;
 const features={
  litoral:{title:'Seu lugar em Pernambuco.',subtitle:'Para viver ou investir.',description:'Da vida urbana ao litoral, encontre imóveis e informações para escolher seu próximo endereço.',image:coastImage('coast-hero',1600),srcset:coastImageSet('coast-hero'),alt:'Jangada nas águas de Porto de Galinhas, em Ipojuca, Pernambuco',label:'Explorar o litoral',href:'/litoral',note:'Fotografia real · Porto de Galinhas',credit:'/litoral#creditos-litoral',creditLabel:'Créditos ↗'},
  sopro:{title:'Sopro.',subtitle:'Viver Milagres.',description:'Conheça o empreendimento na Praia do Toque, em São Miguel dos Milagres, Alagoas. Explore as plantas e os ambientes em 3D.',image:'/images/sopro/home.webp',srcset:'',alt:'Perspectiva do restaurante e piscina do Sopro',label:'Conhecer o Sopro',href:'/sopro',note:'Perspectiva ilustrativa · Sopro · AL',credit:'/sopro',creditLabel:'Ver referência ↗'},
  lafleur:{title:'La Fleur Polinésia.',subtitle:'Um endereço em Muro Alto.',description:'Conheça os espaços e as informações deste empreendimento no litoral de Ipojuca, Pernambuco.',image:'/images/la-fleur-polinesia-hero.webp',srcset:'',alt:'Imagem de divulgação das áreas comuns do La Fleur Polinésia',label:'Conhecer o empreendimento',href:'/imovel/la-fleur-polinesia',note:'Imagem de divulgação · La Fleur Polinésia · PE',credit:'/imovel/la-fleur-polinesia',creditLabel:'Ver referência ↗'},
 };
 type Feature=typeof features[keyof typeof features];
 const buttons=Array.from(opening.querySelectorAll<HTMLButtonElement>('[data-home-feature]'));
 const keys=buttons.map(button=>button.dataset.homeFeature as keyof typeof features);
 const pause=opening.querySelector<HTMLButtonElement>('[data-home-pause]')!;
 const switcher=opening.querySelector<HTMLElement>('.home-feature-switcher')!;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let index=0,userPaused=false,hovered=false,focused=false,onScreen=false,timer=0,turn=0;
 let progress:Animation|null=null;

 // A foto que sai fica numa camada própria, senão a troca pisca enquanto o navegador lê a nova.
 const trail=image.cloneNode() as HTMLImageElement;
 trail.removeAttribute('data-home-photo');
 trail.removeAttribute('fetchpriority');
 trail.dataset.homePhotoTrail='';
 trail.alt='';
 trail.setAttribute('aria-hidden','true');
 image.after(trail);

 const decode=(feature:Feature)=>{
  const next=new Image();
  if(feature.srcset){next.srcset=feature.srcset;next.sizes='100vw';}
  next.src=feature.image;
  return next.decode().catch(()=>{});
 };
 const crossfade=()=>{
  if(reduced.matches)return;
  trail.srcset=image.srcset;trail.src=image.src;
  trail.style.transition='none';
  trail.style.opacity='1';
  void trail.offsetWidth;
  trail.style.transition='';
  trail.style.opacity='0';
 };
 const running=()=>keys.length>1&&onScreen&&!userPaused&&!hovered&&!focused&&!document.hidden&&!reduced.matches;
 const stop=()=>{window.clearTimeout(timer);timer=0;progress?.cancel();progress=null;};
 const arm=()=>{
  stop();
  if(!running())return;
  const bar=buttons[index]?.querySelector<HTMLElement>('[data-home-progress]');
  if(bar)progress=bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:CYCLE,easing:'linear',fill:'forwards'});
  timer=window.setTimeout(()=>void show(index+1),CYCLE);
  void decode(features[keys[(index+1)%keys.length]]);
 };
 const show=async(next:number,announce=false)=>{
  const target=(next+keys.length)%keys.length;
  const feature=features[keys[target]];
  const mine=++turn;
  stop();
  await decode(feature);
  if(mine!==turn)return;
  index=target;
  crossfade();
  image.srcset=feature.srcset;image.src=feature.image;image.alt=feature.alt;
  opening.querySelector('[data-home-title]')!.textContent=feature.title;
  opening.querySelector('[data-home-subtitle]')!.textContent=feature.subtitle;
  opening.querySelector('[data-home-description]')!.textContent=feature.description;
  const link=opening.querySelector<HTMLAnchorElement>('[data-home-feature-link]')!;link.href=feature.href;link.childNodes[0].textContent=feature.label+' ';
  const note=opening.querySelector<HTMLElement>('[data-home-photo-note]')!;note.replaceChildren(document.createTextNode(feature.note+' '));
  const source=document.createElement('a');source.href=feature.credit;source.textContent=feature.creditLabel;note.append(source);
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===target)));
  // Anunciar cada volta automática encheria o leitor de tela; só a escolha de quem navega é falada.
  if(announce)opening.querySelector('[data-home-feature-status]')!.textContent=`Destaque selecionado: ${feature.title} ${feature.subtitle}`;
  arm();
 };

 buttons.forEach((button,i)=>{button.disabled=false;button.addEventListener('click',()=>void show(i,true));});
 const syncPause=()=>{
  const text=userPaused?'Retomar a troca automática dos destaques':'Pausar a troca automática dos destaques';
  pause.setAttribute('aria-pressed',String(userPaused));
  pause.setAttribute('aria-label',text);
  pause.title=text;
 };
 // No toque não existe hover, então sem este botão não há como deter o avanço automático.
 pause.addEventListener('click',()=>{userPaused=!userPaused;syncPause();arm();});
 // O hover fica restrito ao seletor: a abertura ocupa a tela inteira e pararia o tempo todo.
 switcher.addEventListener('mouseenter',()=>{hovered=true;stop();});
 switcher.addEventListener('mouseleave',()=>{hovered=false;arm();});
 // O próprio botão de pausa vive na abertura. Se contasse como foco, "Retomar" não teria efeito.
 const holdsFocus=(node:EventTarget|null)=>node instanceof HTMLElement&&opening.contains(node)&&!node.closest('[data-home-pause]');
 opening.addEventListener('focusin',event=>{if(!holdsFocus(event.target))return;focused=true;stop();});
 opening.addEventListener('focusout',event=>{focused=holdsFocus((event as FocusEvent).relatedTarget);if(!focused)arm();});
 opening.addEventListener('keydown',event=>{
  if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
  if(!(event.target instanceof HTMLElement)||!event.target.closest('[data-home-feature]'))return;
  event.preventDefault();
  const next=(index+(event.key==='ArrowRight'?1:-1)+keys.length)%keys.length;
  buttons[next].focus();
  void show(next,true);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else arm();});
 new IntersectionObserver(entries=>{onScreen=entries.some(entry=>entry.isIntersecting);if(onScreen)arm();else stop();},{threshold:.2}).observe(opening);
 const syncMotion=()=>{pause.hidden=reduced.matches||keys.length<2;arm();};
 reduced.addEventListener('change',syncMotion);
 syncPause();
 syncMotion();
}
const form=document.querySelector<HTMLFormElement>('.home-search-form');
if(form) {
 const type=form.querySelector<HTMLSelectElement>('#home-type')!;
 const price=form.querySelector<HTMLSelectElement>('#home-price')!;
 price.disabled=false;
 const intents=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-intent]'));
 let scale='venda';
 const update=()=>{
  const next=type.value==='locacao'?'locacao':'venda';
  if(next!==scale){price.replaceChildren(...priceScales[next].options.map(([value,label])=>new Option(label,value)));scale=next;}
  form.querySelector('[data-home-price-label]')!.textContent=next==='locacao'?'Aluguel mensal até':'Preço de compra até';
  intents.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeIntent===next)));
 };
 intents.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{type.value=button.dataset.homeIntent!;update();});});
 type.addEventListener('change',update);
 const details=form.querySelector<HTMLDetailsElement>('details')!;
 const desktop=matchMedia('(min-width:1100px)');
 details.open=desktop.matches;
 desktop.addEventListener('change',event=>details.open=event.matches);
 update();
}

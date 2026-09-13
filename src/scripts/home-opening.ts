import {coastImage,coastImageSet} from '../data/litoral-experience';
import {priceScales} from '../data/filters';
const opening=document.querySelector<HTMLElement>('[data-home-opening]');
if(opening) {
 const image=opening.querySelector<HTMLImageElement>('[data-home-photo]')!;
 const features={
  litoral:{title:'Seu lugar em Pernambuco.',subtitle:'Para viver ou investir.',description:'Da vida urbana ao litoral, encontre imóveis e informações para escolher seu próximo endereço.',image:coastImage('coast-hero',1600),srcset:coastImageSet('coast-hero'),alt:'Jangada nas águas de Porto de Galinhas, em Ipojuca, Pernambuco',label:'Explorar o litoral',href:'/litoral',note:'Fotografia real · Porto de Galinhas',credit:'/litoral#creditos-litoral'},
  sopro:{title:'Sopro.',subtitle:'Viver Milagres.',description:'Conheça o empreendimento na Praia do Toque, em São Miguel dos Milagres, Alagoas. Explore as plantas e os ambientes em 3D.',image:'/images/sopro/home.webp',srcset:'',alt:'Perspectiva do restaurante e piscina do Sopro',label:'Conhecer o Sopro',href:'/sopro',note:'Perspectiva ilustrativa · Sopro · AL',credit:'/sopro'},
  lafleur:{title:'La Fleur Polinésia.',subtitle:'Um endereço em Muro Alto.',description:'Conheça os espaços e as informações deste empreendimento no litoral de Ipojuca, Pernambuco.',image:'/images/la-fleur-polinesia-hero.webp',srcset:'',alt:'Imagem de divulgação das áreas comuns do La Fleur Polinésia',label:'Conhecer o empreendimento',href:'/imovel/la-fleur-polinesia',note:'Imagem de divulgação · La Fleur Polinésia · PE',credit:'/imovel/la-fleur-polinesia'},
 };
 const buttons=Array.from(opening.querySelectorAll<HTMLButtonElement>('[data-home-feature]'));
 buttons.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{
  const feature=features[button.dataset.homeFeature as keyof typeof features];
  image.srcset=feature.srcset;image.src=feature.image;image.alt=feature.alt;
  opening.querySelector('[data-home-title]')!.textContent=feature.title;
  opening.querySelector('[data-home-subtitle]')!.textContent=feature.subtitle;
  opening.querySelector('[data-home-description]')!.textContent=feature.description;
  const link=opening.querySelector<HTMLAnchorElement>('[data-home-feature-link]')!;link.href=feature.href;link.childNodes[0].textContent=feature.label+' ';
  const note=opening.querySelector<HTMLElement>('[data-home-photo-note]')!;note.replaceChildren(document.createTextNode(feature.note+' '));
  const source=document.createElement('a');source.href=feature.credit;source.textContent='Ver referência ↗';note.append(source);
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  opening.querySelector('[data-home-feature-status]')!.textContent=`Destaque selecionado: ${feature.title} ${feature.subtitle}`;
 });});
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

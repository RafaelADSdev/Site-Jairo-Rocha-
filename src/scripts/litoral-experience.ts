import {coastDestinations,tripProfiles,coastImage,coastImageSet,type TripProfile} from '../data/litoral-experience';
import {coastById,drivingRoute,estimateStay,itineraryFor,buildBrief,tripMoney} from '../lib/litoral-trip';
import type {Map as LeafletMap,Marker} from 'leaflet';

const root=document.querySelector<HTMLElement>('[data-litoral-experience]');
if(root) {
 const q=<T extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<T>(s)!;
 const put=(s:string,value:string)=>{const node=q(s);if(node)node.textContent=value;};
 const list=(s:string,items:readonly string[])=>q(s)?.replaceChildren(...items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 let selected=coastDestinations[0].id as string;
 let map:LeafletMap|undefined;
 const markers=new Map<string,Marker>();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const selectDestination=(id:string,move=true)=>{
  const d=coastById(id);selected=d.id;
  root.querySelectorAll<HTMLButtonElement>('[data-coast-destination]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.coastDestination===selected)));
  put('[data-destination-title]',d.name);put('[data-destination-tag]',d.tag);put('[data-destination-description]',d.description);put('[data-destination-tip]',d.tip);put('[data-destination-municipality]',d.municipality);
  list('[data-destination-highlights]',d.highlights);
  q<HTMLAnchorElement>('[data-route-link]').href=drivingRoute(d.id);
  q<HTMLAnchorElement>('[data-destination-source]').href=d.source;
  q<HTMLSelectElement>('#trip-destination').value=d.id;
  if(map&&move){map.setView([d.lat,d.lng],11,{animate:!reduced.matches});markers.get(d.id)?.openPopup();}
  updateTrip();
 };
 root.querySelectorAll<HTMLButtonElement>('[data-coast-destination]').forEach(button=>button.addEventListener('click',()=>selectDestination(button.dataset.coastDestination!)));
 const fullBounds:[number,number][]=[[-8.1264,-34.9236],...coastDestinations.map(d=>[d.lat,d.lng] as [number,number])];
 let mapPending=false;
 let retryTiles:(()=>void)|undefined;
 q('[data-map-retry]').addEventListener('click',()=>retryTiles?.());
 q('[data-load-map]').addEventListener('click',async()=>{
  if(mapPending||map)return;
  mapPending=true;const button=q<HTMLButtonElement>('[data-load-map]');button.disabled=true;
  put('[data-map-status]','Carregando o mapa…');
  try {
   const L=await import('leaflet');await import('leaflet/dist/leaflet.css');
   q('[data-map-cover]').hidden=true;
   map=L.map(q('#coast-map'),{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).fitBounds(fullBounds,{padding:[32,32]});
   let tileErrors=0,tileSuccess=0;
   const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
   tiles.on('tileload',()=>{tileSuccess++;q('[data-map-retry]').hidden=true;put('[data-map-status]','Mapa ativo. Amplie pelos controles e escolha um destino. Marcadores indicam regiões aproximadas, não imóveis.');});
   tiles.on('tileerror',()=>{tileErrors++;if(tileErrors>=3&&!tileSuccess){q('[data-map-retry]').hidden=false;put('[data-map-status]','O mapa de fundo está indisponível. Use a lista de destinos e os links de rota; os marcadores continuam disponíveis.');}});
   retryTiles=()=>{tileErrors=0;tileSuccess=0;q('[data-map-retry]').hidden=true;put('[data-map-status]','Tentando carregar o mapa novamente…');tiles.redraw();};
   tiles.addTo(map);
   const makeIcon=(label:string)=>L.divIcon({className:'coast-pin',html:`<span>${label}</span>`,iconSize:[42,42],iconAnchor:[21,42]});
   coastDestinations.forEach((d,index)=>{
    const marker=L.marker([d.lat,d.lng],{icon:makeIcon(String(index+1)),title:d.name,alt:d.name,keyboard:true}).addTo(map!);
    const popup=document.createElement('strong');popup.textContent=d.name;marker.bindPopup(popup);
    marker.on('click',()=>selectDestination(d.id,false));markers.set(d.id,marker);
   });
   L.marker([-8.1264,-34.9236],{icon:makeIcon('R'),title:'Aeroporto do Recife',alt:'Aeroporto do Recife'}).addTo(map).bindPopup('Saída sugerida: Aeroporto do Recife');
   q<HTMLButtonElement>('[data-map-reset]').disabled=false;
   put('[data-map-status]','Mapa ativo. Carregando os detalhes cartográficos…');
   // ResizeObserver handles mobile orientation and responsive columns without scroll hijacking.
   new ResizeObserver(()=>map?.invalidateSize()).observe(q('#coast-map'));
  } catch {
   map?.remove();map=undefined;
   const cover=q('[data-map-cover]');if(cover)cover.hidden=false;
   button.disabled=false;put('[data-map-status]','Não foi possível abrir o mapa. Tente novamente ou use a lista e a rota externa.');
  } finally {mapPending=false;}
 });
 q('[data-map-reset]').addEventListener('click',()=>map?.fitBounds(fullBounds,{padding:[32,32],animate:!reduced.matches}));

 const getInput=(id:string)=>Number(q<HTMLInputElement>(id).value);
 let brief='';
 function updateTrip() {
  const profile=q<HTMLSelectElement>('#trip-profile').value as TripProfile;
  const p=tripProfiles[profile];const nights=getInput('#trip-nights');
  const daily=getInput('#trip-daily');const fees=getInput('#trip-fees');
  const budget=estimateStay(nights,daily,fees,p.occupants);
  const validNights=Number.isInteger(nights)&&nights>=1&&nights<=30;
  q<HTMLSelectElement>('#trip-nights').setAttribute('aria-invalid',String(!validNights));
  put('[data-trip-title]',p.title);put('[data-trip-description]',p.description);put('[data-trip-kind]',`${p.kind} · ${p.occupants} pessoas`);
  put('[data-trip-summary]',`${coastById(selected).name} · ${p.label} · ${nights} noites`);
  const destination=coastById(selected);
  const img=q<HTMLImageElement>('[data-trip-image]');img.srcset=coastImageSet(destination.photo);img.src=coastImage(destination.photo);img.alt=destination.photoAlt;
  put('[data-trip-photo-credit]',`${destination.name} · Foto: ${destination.photoCredit}`);
  list('[data-trip-checklist]',p.checklist);list('[data-trip-itinerary]',itineraryFor(selected,nights));
  put('[data-trip-total]',budget?tripMoney(budget.total):'Revise os valores');
  put('[data-trip-per-person]',budget?`${tripMoney(budget.perPerson)} por pessoa, na divisão por ${p.occupants}`:'Diária entre R$ 50 e R$ 20.000. Taxas entre R$ 0 e R$ 20.000.');
  q<HTMLInputElement>('#trip-daily').setAttribute('aria-invalid',String(!Number.isFinite(daily)||daily<50||daily>20000));
  q<HTMLInputElement>('#trip-fees').setAttribute('aria-invalid',String(!Number.isFinite(fees)||fees<0||fees>20000));
  q<HTMLButtonElement>('[data-trip-copy]').disabled=!budget;
  const route=q<HTMLAnchorElement>('[data-trip-route]');if(route)route.href=drivingRoute(selected);
  brief=buildBrief(selected,profile,nights,daily,fees);q<HTMLTextAreaElement>('[data-trip-brief]').value=brief;
  put('[data-trip-copy-status]','');
 }
 ['#trip-profile','#trip-nights','#trip-daily','#trip-fees'].forEach(id=>q(id).addEventListener('input',updateTrip));
 q<HTMLSelectElement>('#trip-destination').addEventListener('change',event=>selectDestination((event.target as HTMLSelectElement).value));
 q('[data-trip-copy]').addEventListener('click',async()=>{
  if(!brief)return;
  try {await navigator.clipboard.writeText(brief);put('[data-trip-copy-status]','Plano copiado. Você pode guardar ou compartilhar. Nenhuma reserva foi feita.');}
  catch {const textarea=q<HTMLTextAreaElement>('[data-trip-brief]');textarea.hidden=false;const wrapper=textarea.closest<HTMLElement>('.coast-manual-copy');if(wrapper)wrapper.hidden=false;textarea.closest('details')?.setAttribute('open','');textarea.focus();textarea.select();put('[data-trip-copy-status]','Selecione e copie o plano no campo abaixo. Nenhuma reserva foi feita.');}
 });

 const film=q<HTMLVideoElement>('[data-coast-film]');
 const play=q<HTMLButtonElement>('[data-play-film]');
 let filmLoaded=false;
 play.addEventListener('click',async()=>{
  if(!filmLoaded) {
   const format=window.matchMedia('(max-width: 600px)').matches?'portrait':'landscape';
   film.src=`/videos/litoral-${format}.mp4`;
   film.querySelectorAll('track').forEach(track=>track.remove());
   const captions=document.createElement('track');captions.kind='captions';captions.srclang='pt-BR';captions.label='Português';captions.src=`/videos/litoral-${format}.vtt`;film.append(captions);
   filmLoaded=true;film.load();
  }
  try {await film.play();play.hidden=true;put('[data-film-status]','Filme em reprodução. Use os controles para pausar.');}
  catch {filmLoaded=false;put('[data-film-status]','Não foi possível reproduzir. Tente novamente ou continue pelos destinos e roteiros.');play.hidden=false;}
 });
 film.addEventListener('error',()=>{filmLoaded=false;play.hidden=false;put('[data-film-status]','Vídeo indisponível nesta conexão. O mapa e o planejador continuam funcionando.');});
 film.addEventListener('ended',()=>{play.hidden=false;play.textContent='Assistir novamente';});
 new IntersectionObserver(([entry])=>{if(!entry.isIntersecting&&!film.paused)film.pause();},{threshold:0}).observe(film);
 selectDestination(selected,false);
}

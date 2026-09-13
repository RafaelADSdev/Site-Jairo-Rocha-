import {coastDestinations,tripProfiles,type TripProfile} from '../data/litoral-experience.ts';
export const coastById = (id:string) => coastDestinations.find(d=>d.id===id) ?? coastDestinations[0];
export function estimateStay(nights:number,daily:number,fees:number,people:number) {
 if(![nights,daily,fees,people].every(Number.isFinite)||!Number.isInteger(nights)||nights<1||nights>30||daily<50||daily>20000||fees<0||fees>20000||people<1) return null;
 const lodging=nights*daily;
 return {lodging,total:lodging+fees,perPerson:(lodging+fees)/people};
}
export function drivingRoute(id:string) {
 const destination=coastById(id);
 const query=new URLSearchParams({api:'1',origin:'Aeroporto Internacional do Recife',destination:`${destination.lat},${destination.lng}`,travelmode:'driving'});
 return `https://www.google.com/maps/dir/?${query}`;
}
export function itineraryFor(id:string,nights:number) {
 if(!Number.isInteger(nights)||nights<1||nights>30)return [];
 const [arrival,experience,departure]=coastById(id).itinerary;
 if(nights===1)return [`Dia 1 · ${arrival}`,`Dia 2 · ${experience} ${departure}`];
 if(nights<=2) return [`Dia 1 · ${arrival}`,`Dia 2 · ${experience}`,`Dia 3 · ${departure}`];
 return [`Dia 1 · ${arrival}`,`Dia 2 · ${experience}`,`Dias 3–${nights} · Alterne praia, descanso e passeios a confirmar. Deixe espaço para o clima e para o ritmo do grupo.`,`Dia ${nights+1} · ${departure}`];
}
export const tripMoney=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
export function buildBrief(id:string,profile:TripProfile,nights:number,daily:number,fees:number) {
 const group=tripProfiles[profile];
 const budget=estimateStay(nights,daily,fees,group.occupants);
 if(!budget) return '';
 return [`MEU PLANO DE TEMPORADA · JAIRO ROCHA`,`${coastById(id).name} · ${group.label} · ${nights} noites`,`${group.occupants} pessoas · ${group.kind} (perfil desejado)`,`Diária hipotética: ${tripMoney(daily)}`,`Taxas extras hipotéticas: ${tripMoney(fees)}`,`Total hipotético: ${tripMoney(budget.total)} · ${tripMoney(budget.perPerson)} por pessoa`,``,`ROTEIRO SUGERIDO`,...itineraryFor(id,nights),``,`ANTES DE RESERVAR`,...group.checklist,``,`Rota: ${drivingRoute(id)}`,`Este plano não é reserva nem cotação. Disponibilidade, preços, taxas e regras devem ser confirmados. Transporte, alimentação e passeios não estão incluídos.`].join('\n');
}

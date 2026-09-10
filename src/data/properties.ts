export type Property = {
  slug: string;
  name: string;
  location: string;
  category: 'novos' | 'seminovos' | 'locacao';
  label: string;
  image: string;
  price: number;
  beds: number;
  parking: number;
  coast: boolean;
  state?: 'PE' | 'AL';
  flagshipHref?: string;
  description: string;
};

export const properties: Property[] = [
  {slug:'sopro',name:'Sopro',location:'Praia do Toque, São Miguel dos Milagres',category:'novos',label:'Lançamento',image:'/images/sopro/galeria-09.webp',price:319900,beds:1,parking:0,coast:true,state:'AL',flagshipHref:'/sopro',description:'Na Praia do Toque, um novo jeito de viver a Rota Ecológica dos Milagres. 120 unidades com piscina privativa e uma prainha só do empreendimento.'},
  {slug:'la-fleur-polinesia',name:'La Fleur Polinésia',location:'Porto de Galinhas, Ipojuca',category:'novos',label:'Novo',image:'/images/marine.jpg',price:0,beds:3,parking:2,coast:true,state:'PE',description:'Um novo jeito de viver Porto de Galinhas. Conheça o empreendimento e explore os espaços que podem fazer parte da sua próxima história.'},
  {slug:'parc-college',name:'Parc College',location:'Imbiribeira, Recife',category:'novos',label:'Novo',image:'/images/college.jpg',price:610000,beds:3,parking:1,coast:false,state:'PE',description:'Sua próxima história na Imbiribeira. Explore o empreendimento e descubra as possibilidades de morar no Recife.'},
  {slug:'amura-carneiros',name:'Amura Carneiros',location:'Praia dos Carneiros, Tamandaré',category:'seminovos',label:'Seminovo',image:'/images/amura.jpg',price:790000,beds:1,parking:1,coast:true,state:'PE',description:'Um endereço na Praia dos Carneiros para estar mais perto do mar. Conheça esta opção do catálogo Jairo Rocha.'},
  {slug:'belem-boulevard',name:'Belém Boulevard',location:'Encruzilhada, Recife',category:'novos',label:'Novo',image:'/images/belem.jpg',price:0,beds:3,parking:1,coast:false,state:'PE',description:'Novas possibilidades na Encruzilhada. Um empreendimento para descobrir seu próximo capítulo no Recife.'},
  {slug:'edf-nice',name:'Edf. Nice',location:'Boa Viagem, Recife',category:'locacao',label:'Locação',image:'/images/nice.jpg',price:8200,beds:3,parking:2,coast:false,state:'PE',description:'Um novo endereço em Boa Viagem. Conheça esta opção de locação e converse sobre o que é importante para a sua mudança.'},
  {slug:'luar-do-parque',name:'Luar do Parque',location:'Imbiribeira, Recife',category:'novos',label:'Novo',image:'/images/polinesia.jpg',price:0,beds:2,parking:1,coast:false,state:'PE',description:'Explore os espaços do Luar do Parque e encontre um lugar para os seus novos planos.'}
];

export const propertyHref = (property: Property) => property.flagshipHref ?? `/imovel/${property.slug}`;

export const money = (value: number) => value ? new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0}).format(value) : 'Sob consulta';

import type { CoastId } from './litoral-experience';

/** Snapshot of cited research, not live inventory or verified availability. */
export const researchDate = '13/09/2026';
export const destinationNames: Record<CoastId, string> = {
  porto: 'Porto de Galinhas',
  muro: 'Muro Alto',
  carneiros: 'Praia dos Carneiros',
  tamandare: 'Tamandaré / Campas',
};

export interface PurchaseOffer {
  id: string;
  destination: CoastId;
  name: string;
  price: number;
  area: number;
  areaType: string;
  bedrooms: string;
  stage: string;
  fees: string;
  note: string;
  url: string;
  from: boolean;
}

/** Area definitions and construction stages must remain visible in comparisons. */
export const purchaseOffers: PurchaseOffer[] = [
  {
    id: 'P1', destination: 'porto', name: 'Laguna Beach', price: 330000,
    area: 30, areaType: 'Área privativa', bedrooms: '1 quarto',
    stage: 'Anunciado como pronto e mobiliado',
    fees: 'Condomínio anunciado: R$ 800. IPTU não informado.',
    note: 'Sem endereço completo. Confirmar unidade, localização e boleto vigente; a consulta não confirma disponibilidade.',
    url: 'https://neeximoveis.com.br/imovel/201205/flat-venda-no-laguna-beach-porto-de-galinhas-porteira-fechada', from: false,
  },
  {
    id: 'P2', destination: 'porto', name: 'Villa Oceânica', price: 450000,
    area: 30.65, areaType: 'Área privativa', bedrooms: '1 quarto',
    stage: 'Anunciado como pronto, porteira fechada',
    fees: 'Condomínio anunciado: R$ 608,76. IPTU: R$ 442,70/ano.',
    note: 'Descrição identifica Merepe II/Porto, apesar do cadastro Centro/Ipojuca. Distâncias da praia divergem no anúncio; operação declarada sem demonstrativos.',
    url: 'https://gregoimoveisprime.com.br/imovel/apartamento-a-venda-no-bairro-centro-em-ipojuca-pe/1175', from: false,
  },
  {
    id: 'P3', destination: 'porto', name: 'Flat com jacuzzi · ref. 2540', price: 477000,
    area: 37, areaType: 'Área privada declarada', bedrooms: '1 quarto',
    stage: 'Anunciado como pronto e mobiliado',
    fees: 'Condomínio e IPTU não informados.',
    note: 'Entrega cadastrada em julho/2026, sem empreendimento ou endereço definido. Não é comparável geográfico estrito antes de confirmar a localização.',
    url: 'https://imperiodovale.com.br/2540', from: false,
  },
  {
    id: 'M1', destination: 'muro', name: 'Makia Beach Experience', price: 515000,
    area: 33, areaType: 'Área útil', bedrooms: '1 quarto',
    stage: 'Anunciado como pronto e mobiliado · 2024',
    fees: 'Condomínio anunciado: R$ 922,31. “Taxas”: R$ 165,93, sem natureza ou periodicidade. IPTU não informado.',
    note: 'Acesso à praia não comprova frente-mar. Não converter o campo “Taxas” em IPTU nem somá-lo automaticamente ao custo mensal.',
    url: 'https://www.fernandaborgesimoveis.com.br/imovel/3669148/flat-venda-ipojuca-pe-praia-muro-alto', from: false,
  },
  {
    id: 'M2', destination: 'muro', name: 'Ekoara Residence', price: 900000,
    area: 66, areaType: 'Área total', bedrooms: '2 quartos',
    stage: 'Anunciado como pronto, térreo e mobiliado',
    fees: 'Condomínio anunciado: R$ 1.243. IPTU divergente: R$ 600/ano e R$ 60/mês.',
    note: 'Exigir carnê e competência do IPTU. Área privativa não confirmada: o quociente por m² total não equivale a preço por m² privativo.',
    url: 'https://eduardofeitosaprime.com.br/imovel/106426/flat-trreo-totalmente-mobiliado-muro-alto-melhor-trecho', from: false,
  },
  {
    id: 'M3', destination: 'muro', name: 'Beach Class · GI69167', price: 900000,
    area: 46, areaType: 'Área genérica, não qualificada', bedrooms: '1 quarto',
    stage: 'Resort em operação; estágio da unidade não informado',
    fees: 'Condomínio e IPTU não informados.',
    note: 'Página informa atualização em 25/08/2026. A área também aparece como terreno; confirmar metragem privativa e situação da unidade.',
    url: 'https://gedeaoimoveis.com.br/imovel/flat-a-venda-oportunidade-unica-resort-beach-class-em-muro-alto/', from: false,
  },
  {
    id: 'C1', destination: 'carneiros', name: 'Carneiros Beach Resort', price: 1000000,
    area: 63.75, areaType: 'Área privativa', bedrooms: '2 quartos',
    stage: 'Unidade existente, anunciada como mobiliada',
    fees: 'Condomínio anunciado: R$ 1.341,53. IPTU: R$ 1.601,96/ano. DSPU: R$ 224,75/ano.',
    note: 'Cadastro Centro/Tamandaré; empreendimento identifica Praia dos Carneiros. Contado apenas aqui. Confirmar matrícula e boletos vigentes.',
    url: 'https://magalhaesaci.com.br/imovel/apartamento-a-venda-no-bairro-centro-em-tamandare-pe/594', from: false,
  },
  {
    id: 'C2', destination: 'carneiros', name: 'Carneiros Atlântico', price: 480000,
    area: 41, areaType: 'Área útil', bedrooms: '1 quarto',
    stage: 'Em construção; entrega não confirmada',
    fees: 'Condomínio anunciado: R$ 200. IPTU: R$ 800/ano. Valores ainda não validados para operação.',
    note: 'Não pressupõe renda imediata. Condomínio pode ser estimativa pré-operação. Confirmar unidade, tabela, entrega e custos após conclusão.',
    url: 'https://rosanameloimobiliaria.com.br/imovel/179023/apartamento-1-quarto-beira-mar-de-carneiros-carneiros-atlntico-flats-resort', from: false,
  },
  {
    id: 'C3', destination: 'carneiros', name: 'Max Carneiros Exclusive', price: 491923,
    area: 47, areaType: 'Área útil', bedrooms: '2 quartos',
    stage: 'Estágio e entrega não informados',
    fees: 'Condomínio e IPTU não informados.',
    note: 'Oferta de empreendimento, sem unidade identificada. Preço de partida não prova disponibilidade ou renda imediata; não confundir com Max Carneiros Suites.',
    url: 'https://carneirosprimeimobiliaria.com.br/imovel/apartamento-a-venda-2-quartos-carneiros-tamandare-pe-47m2-id-4', from: true,
  },
  {
    id: 'T1', destination: 'tamandare', name: 'Acqua Beach Residence', price: 280000,
    area: 24, areaType: 'Área total', bedrooms: 'Studio / 1 quarto na ficha',
    stage: 'Anunciado como pronto',
    fees: 'Condomínio anunciado: R$ 550. IPTU de R$ 10/ano é inconsistente para uso como premissa; confirmar carnê.',
    note: 'Campas/Tamandaré, sem endereço completo. Área total não é privativa; equipamentos da ficha automática precisam de confirmação.',
    url: 'https://neeximoveis.com.br/imovel/196805/apartamento-de-24-m-em-tamandar-studio-moderno-no-acqua-beach-residence-pronto-para-morar', from: false,
  },
  {
    id: 'T2', destination: 'tamandare', name: 'Campas Beach Prime', price: 490000,
    area: 43, areaType: 'Área útil', bedrooms: '2 quartos',
    stage: 'Estágio e prazo não confirmados',
    fees: 'Condomínio e IPTU não informados.',
    note: 'Texto descreve itens que serão entregues. Preço de partida, sem unidade específica ou evidência de entrega: não tratar como imóvel pronto.',
    url: 'https://carneirosprimeimobiliaria.com.br/imovel/apartamento-a-venda-2-quartos-tamandare-tamandare-pe-43m2-id-41', from: true,
  },
  {
    id: 'T3', destination: 'tamandare', name: 'Tamandaré Residence', price: 480000,
    area: 60, areaType: 'Área útil', bedrooms: '2 quartos',
    stage: 'Estágio e prazo não informados',
    fees: 'Condomínio e IPTU não informados.',
    note: 'Preço de partida. Sem endereço ou unidade identificada, sem custos fixos publicados e sem comprovação de entrega.',
    url: 'https://carneirosprimeimobiliaria.com.br/imovel/apartamento-a-venda-2-quartos-tamandare-tamandare-pe-60m2-id-85', from: true,
  },
];

export interface RentalOffer {
  id: string;
  destination: CoastId;
  name: string;
  price: number;
  period: string;
  typology: string;
  note: string;
  url: string;
  /** Fresh dated calendar observation only; never equivalent to a confirmed quote. */
  comparable: boolean;
}

export const rentalOffers: RentalOffer[] = [
  {
    id: 'R1', destination: 'porto', name: 'Tangaroa #303', price: 192,
    period: 'Calendário de 29/09/2026', typology: '2 quartos · 4 pessoas',
    note: 'Calendário atualizado há 16 h na consulta. R$ 218 em 25–26/09. Preço visível, não cotação: mínimo de noites, taxas e disponibilidade precisam de confirmação.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/porto-de-galinhas/porto-de-galinhas/144729-tangaroa-flat-303-quadruplo-por-carpediem', comparable: true,
  },
  {
    id: 'R2', destination: 'porto', name: 'Ora Beach #306', price: 129,
    period: 'Chamada comercial sem data válida', typology: 'Studio · 35 m² · 3 pessoas',
    note: 'Calendário acessível defasado, com julho/agosto e início de setembro. Excluído do recorte futuro; R$ 129 não é cotação para setembro.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/porto-de-galinhas/porto-de-galinhas/149717-ora-beach-306-studio-com-varanda-by-carpediem', comparable: false,
  },
  {
    id: 'R3', destination: 'muro', name: 'Makia #A 308', price: 190,
    period: 'Calendário de 29/09/2026', typology: 'Studio · até 4 pessoas',
    note: 'Atualização há 12 h na consulta. R$ 215 em 18–19/09 e R$ 387 em 9–11/10. Não é diária média anual nem reserva confirmada; taxas à parte podem existir.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/ipojuca/praia-de-muro-alto/136130-makia-beach-a308-em-muro-alto-por-carpediem', comparable: true,
  },
  {
    id: 'R4', destination: 'muro', name: 'Nannai Residence #101', price: 488,
    period: 'Calendário de 29/09/2026', typology: '2 quartos · 80 m² · 4 pessoas',
    note: 'Atualização há 1 h na consulta. R$ 794 em 18–19/09 e R$ 1.032 em 2–3/10. Produto diferente do Makia; preço de calendário sem total de reserva confirmado.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/ipojuca/praia-de-muro-alto/82789-nannai-residence-101-alto-padrao-by-carpediem', comparable: true,
  },
  {
    id: 'R5', destination: 'carneiros', name: 'Eco Resort #24', price: 273,
    period: 'Calendário de 29/09/2026', typology: '38 m² · até 4 pessoas',
    note: 'Atualização há 12 h na consulta. R$ 443 em 19/09, mas 18/09 indisponível: não constitui pacote confirmado. Confirmar taxas e mínimo de noites.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/tamandare/pe-praia-dos-carneiros/136267-eco-resort-24-ape-confortavel-por-carpediem', comparable: true,
  },
  {
    id: 'R6', destination: 'carneiros', name: 'Carneiros Beach Resort C 17-5', price: 243,
    period: 'A partir de · sem datas', typology: '1 quarto',
    note: 'Chamada comercial da página direta do gestor. Não é cotação fechada, diária média ou preço para 29/09; confirmar ocupantes, taxas e total.',
    url: 'https://www.carneirostemporada.com/pt/apartment/IJ07E', comparable: false,
  },
  {
    id: 'R7', destination: 'tamandare', name: 'Açores · ref. 159561', price: 400,
    period: 'Calendário de 29/09/2026 · atualização antiga', typology: '1 quarto · 4 pessoas',
    note: 'Última atualização declarada há 5 meses: confiança baixa. R$ 600 em 18–19/09. Confirmar antes de comparar ou reservar; beira-mar é declaração do anúncio.',
    url: 'https://www.temporadalivre.com/aluguel-temporada/brasil/pernambuco/tamandare/beira-mar/159561-acores-tamandare-pe-alto-padrao-e-conforto', comparable: false,
  },
  {
    id: 'R8', destination: 'tamandare', name: 'Studio B 18', price: 165,
    period: 'A partir de · sem datas', typology: 'Studio',
    note: 'Chamada comercial da página direta do gestor, não cotação fechada. Sem data, ocupantes ou total confirmado; não usar como receita diária realizada.',
    url: 'https://www.carneirostemporada.com/pt/apartment/TZ03I', comparable: false,
  },
];

export interface MarketIndicator {
  city: string;
  provider: string;
  /** Percentage points (51 means 51%), not a decimal fraction. */
  occupancy: number;
  period: string;
  url: string;
  note: string;
}

export const marketIndicators: MarketIndicator[] = [
  {
    city: 'Ipojuca', provider: 'AirDNA', occupancy: 51,
    period: '12 meses até agosto/2026',
    url: 'https://www.airdna.co/vacation-rental-data/app/br/pernambuco/ipojuca/overview',
    note: 'Atualizado em 08/09/2026; 5.590 anúncios. Universo municipal, não exclusivamente Porto ou Muro Alto. Ocupação sobre noites disponíveis.',
  },
  {
    city: 'Tamandaré', provider: 'AirDNA', occupancy: 41,
    period: '12 meses até agosto/2026',
    url: 'https://www.airdna.co/vacation-rental-data/app/br/pernambuco/tamandare/overview',
    note: 'Atualizado em 08/09/2026; 1.554 anúncios. Inclui município, não somente Carneiros. Ocupação sobre noites disponíveis.',
  },
  {
    city: 'Ipojuca', provider: 'AirROI', occupancy: 36.6,
    period: 'Agosto/2025 a julho/2026',
    url: 'https://www.airroi.com/airbnb-data/brazil/pernambuco/ipojuca',
    note: 'Atualizado em 12/09/2026; 5.252 anúncios. Janela, amostra e método diferentes da AirDNA: não calcular média entre provedores.',
  },
  {
    city: 'Tamandaré', provider: 'AirROI', occupancy: 29.6,
    period: 'Agosto/2025 a julho/2026',
    url: 'https://www.airroi.com/airbnb-data/brazil/pernambuco/tamandar%C3%A9',
    note: 'Atualizado em 08/08/2026; 1.573 anúncios. Não isola Carneiros nem prevê ocupação de uma unidade. Não combinar com a AirDNA como uma série única.',
  },
];

export interface InvestmentRiskNote {
  title: string;
  text: string;
  url: string;
  label: string;
}

export const riskNotes: InvestmentRiskNote[] = [
  {
    title: 'A operação é permitida no condomínio?',
    text: 'No REsp 2.121.055-MG, julgado em 07/05/2026, o STJ tratou da exploração reiterada/profissional de curta estadia que descaracteriza a destinação residencial, exigindo previsão em convenção aprovada por dois terços. Não é proibição geral de Airbnb. Obtenha convenção, atas e análise jurídica da unidade.',
    url: 'https://scon.stj.jus.br/jurisprudencia/externo/informativo/?livre=@CNOT%3D022336',
    label: 'STJ · Informativo 889',
  },
  {
    title: 'Licenças e infraestrutura em Tamandaré',
    text: 'O MPPE informou em 27/03/2026 decisão que exige revisão do Plano Diretor. A suspensão das licenças não foi acolhida naquele recurso; isso não comprova regularidade de toda obra. Consulte atos posteriores, licença individual, saneamento, matrícula e prazo de entrega antes da compra.',
    url: 'https://portal.mppe.mp.br/w/mppe-consegue-na-justi%C3%A7a-a-obriga%C3%A7%C3%A3o-do-munic%C3%ADpio-revisar-o-plano-diretor',
    label: 'MPPE · atualização de março/2026',
  },
  {
    title: 'SPU e custo de transferência',
    text: 'Verifique se há terreno da União, RIP, débitos e CAT. Quando devido, laudêmio de 5% incide sobre o valor atualizado do terreno da União, sem benfeitorias, não indiscriminadamente sobre o preço inteiro do apartamento. A regra não se aplica automaticamente a todo imóvel de praia.',
    url: 'https://www.gov.br/gestao/pt-br/assuntos/patrimonio-da-uniao/perguntas-frequentes-spu/duvidas-gerais-1',
    label: 'SPU · perguntas frequentes',
  },
  {
    title: 'Taxa da plataforma: confirme o seu contrato',
    text: 'O Airbnb informa, no Brasil, estruturas com 4% para o anfitrião na taxa dividida ou 16% na taxa única, conforme o enquadramento. Não some as duas taxas. Confirme modalidade, base de cobrança, software de gestão e despesas da administradora antes de projetar o repasse.',
    url: 'https://www.airbnb.com.br/help/article/1857',
    label: 'Airbnb · taxas de serviço',
  },
  {
    title: 'O resultado operacional ainda não é o líquido pessoal',
    text: 'Tributação depende do titular, da fonte pagadora, do regime e das despesas dedutíveis aplicáveis. O simulador não usa IR universal de 15%: mostra operação antes de imposto de renda e dívida. Um contador deve apurar o efeito tributário e o enquadramento da atividade.',
    url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/manual-mir/rendimentos/rendimentos-do-capital',
    label: 'Receita Federal · rendimentos do capital',
  },
  {
    title: 'Mar, manutenção e acesso precisam de visita',
    text: 'Balneabilidade varia por ponto e semana: não é um selo permanente de toda a praia. Consulte o boletim recente e visite o imóvel para avaliar acesso, drenagem, maresia, seguro e manutenção. Estatística municipal não substitui a inspeção do lote e da unidade.',
    url: 'https://www2.cprh.pe.gov.br/monitoramento-ambiental/balneabilidade/',
    label: 'CPRH · boletins de balneabilidade',
  },
];

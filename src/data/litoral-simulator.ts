export type PropertyKind = 'studio' | 'dois' | 'tres' | 'casa';
export type DestinationKey = 'porto' | 'muro' | 'carneiros' | 'tamandare' | 'milagres';

export type Destination = {
  key: DestinationKey;
  label: string;
  ocupacao: {conservador: number; base: number; alto: number};
  diaria: Record<PropertyKind, number>;
  sazonalidade: {
    mesesAlta: number[];
    premioDiariaAlta: number;
    fatorOcupacaoAlta?: number;
    ocupacaoAlta?: {conservador: number; base: number; alto: number};
    fonte: string;
  };
};

export const destinations: Record<DestinationKey, Destination> = {
  porto: {
    key: 'porto',
    label: 'Porto de Galinhas',
    ocupacao: {conservador: 40, base: 48, alto: 56},
    diaria: {studio: 250, dois: 450, tres: 650, casa: 900},
    sazonalidade: {
      mesesAlta: [1, 2, 12],
      fatorOcupacaoAlta: 49 / 39.8,
      premioDiariaAlta: (143 / 120 - 1) * 100,
      fonte: 'Ipojuca · AirROI 2026'
    }
  },
  muro: {
    key: 'muro',
    label: 'Muro Alto',
    ocupacao: {conservador: 42, base: 52, alto: 60},
    diaria: {studio: 250, dois: 520, tres: 750, casa: 1100},
    sazonalidade: {
      mesesAlta: [1, 2, 12],
      fatorOcupacaoAlta: 49 / 39.8,
      premioDiariaAlta: (143 / 120 - 1) * 100,
      fonte: 'Proxy Ipojuca · AirROI 2026'
    }
  },
  carneiros: {
    key: 'carneiros',
    label: 'Praia dos Carneiros',
    ocupacao: {conservador: 40, base: 48, alto: 56},
    diaria: {studio: 250, dois: 480, tres: 700, casa: 1000},
    sazonalidade: {
      mesesAlta: [1, 2, 12],
      ocupacaoAlta: {conservador: 70, base: 86, alto: 94.2},
      premioDiariaAlta: (172 / 141 - 1) * 100,
      fonte: 'referência hoteleira Setur-PE + contraste STR AirROI 2026'
    }
  },
  tamandare: {
    key: 'tamandare',
    label: 'Tamandaré',
    ocupacao: {conservador: 34, base: 44, alto: 52},
    diaria: {studio: 230, dois: 440, tres: 640, casa: 920},
    sazonalidade: {
      mesesAlta: [1, 2, 12],
      ocupacaoAlta: {conservador: 70, base: 86, alto: 94.2},
      premioDiariaAlta: (172 / 141 - 1) * 100,
      fonte: 'referência hoteleira Setur-PE + contraste STR AirROI 2026'
    }
  },
  milagres: {
    key: 'milagres',
    label: 'São Miguel dos Milagres',
    ocupacao: {conservador: 44, base: 54, alto: 64},
    diaria: {studio: 520, dois: 780, tres: 1100, casa: 1600},
    sazonalidade: {
      mesesAlta: [1, 2, 12],
      ocupacaoAlta: {conservador: 72, base: 88, alto: 95},
      premioDiariaAlta: (180 / 140 - 1) * 100,
      fonte: 'cenário ilustrativo · Rota Ecológica · a validar'
    }
  }
};

export const propertyKinds: {value: PropertyKind; label: string}[] = [
  {value: 'studio', label: 'Studio / 1 quarto'},
  {value: 'dois', label: '2 quartos'},
  {value: 'tres', label: '3 quartos'},
  {value: 'casa', label: 'Casa'}
];

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const IR_EFETIVO = 15;

function daysOf(months: number[]) {
  return months.reduce((total, month) => total + DAYS_PER_MONTH[month - 1], 0);
}

export function calibrateSeason(input: {
  diariaMediaAnual: number;
  ocupacaoMediaAnual: number;
  mesesAlta: number[];
  premioDiariaAlta: number;
  fatorOcupacaoAlta?: number;
  ocupacaoAltaAlvo?: number;
}) {
  const mesesAlta = input.mesesAlta;
  const diasAlta = daysOf(mesesAlta);
  const diasRegulares = 365 - diasAlta;
  const {diariaMediaAnual, ocupacaoMediaAnual, premioDiariaAlta} = input;

  let fatorOcupacaoAlta: number;
  let ocupacaoRegular: number;
  let ocupacaoAlta: number;

  if (input.ocupacaoAltaAlvo != null && diasAlta > 0) {
    ocupacaoAlta = input.ocupacaoAltaAlvo;
    ocupacaoRegular = diasRegulares === 0
      ? ocupacaoMediaAnual
      : (ocupacaoMediaAnual * 365 - ocupacaoAlta * diasAlta) / diasRegulares;
    if (ocupacaoRegular < 0 || ocupacaoRegular > 100) {
      throw new RangeError('ocupacaoAltaAlvo é incompatível com a ocupação média anual informada');
    }
    fatorOcupacaoAlta = ocupacaoRegular > 0
      ? ocupacaoAlta / ocupacaoRegular
      : ocupacaoAlta === 0 ? 1 : Infinity;
  } else {
    fatorOcupacaoAlta = input.fatorOcupacaoAlta ?? 1;
    const denominador = diasRegulares + diasAlta * fatorOcupacaoAlta;
    ocupacaoRegular = denominador > 0
      ? ocupacaoMediaAnual * 365 / denominador
      : ocupacaoMediaAnual;
    ocupacaoAlta = ocupacaoRegular * fatorOcupacaoAlta;
  }

  if (ocupacaoAlta > 100) {
    throw new RangeError('ocupacaoAlta calibrada ultrapassa 100%');
  }

  const noitesRegulares = diasRegulares * ocupacaoRegular / 100;
  const noitesAlta = diasAlta * ocupacaoAlta / 100;
  const pesoReceita = noitesRegulares + noitesAlta * (1 + premioDiariaAlta / 100);
  const receitaAlvo = diariaMediaAnual * 365 * ocupacaoMediaAnual / 100;
  const diariaRegular = pesoReceita > 0 ? receitaAlvo / pesoReceita : diariaMediaAnual;

  return {
    mesesAlta,
    ocupacaoRegular,
    ocupacaoAlta,
    diariaRegular,
    diariaAlta: diariaRegular * (1 + premioDiariaAlta / 100),
    premioDiariaAlta,
    noitesAnuais: noitesRegulares + noitesAlta,
    receitaAnual: receitaAlvo
  };
}

export function simulateSeason(input: {
  preco: number;
  diaria: number;
  ocupacaoBase: number;
  custoOperacional: number;
  irEfetivo: number;
  mesesAlta: number[];
  ocupacaoAlta: number;
  premioDiariaAlta: number;
}) {
  const {
    preco,
    diaria,
    ocupacaoBase,
    custoOperacional,
    irEfetivo,
    mesesAlta,
    ocupacaoAlta,
    premioDiariaAlta
  } = input;
  const diariaAlta = diaria * (1 + premioDiariaAlta / 100);
  const fluxoMensalBruto = DAYS_PER_MONTH.map((dias, index) => {
    const alta = mesesAlta.includes(index + 1);
    return dias * (alta ? ocupacaoAlta : ocupacaoBase) / 100 * (alta ? diariaAlta : diaria);
  });
  const noitesEsperadas = DAYS_PER_MONTH.reduce((total, dias, index) => {
    const alta = mesesAlta.includes(index + 1);
    return total + dias * (alta ? ocupacaoAlta : ocupacaoBase) / 100;
  }, 0);
  const receitaBruta = fluxoMensalBruto.reduce((total, value) => total + value, 0);
  const receitaAltaTemporada = fluxoMensalBruto.reduce((total, value, index) => (
    total + (mesesAlta.includes(index + 1) ? value : 0)
  ), 0);
  const receitaAposCustos = receitaBruta * (1 - custoOperacional / 100);
  const impostoEstimado = receitaAposCustos * irEfetivo / 100;
  const rendaLiquida = receitaAposCustos - impostoEstimado;

  return {
    ocupacaoRegular: ocupacaoBase,
    ocupacaoAlta,
    diariaRegular: diaria,
    diariaAlta,
    noitesEsperadas,
    receitaBruta,
    receitaAltaTemporada,
    custos: receitaBruta - receitaAposCustos,
    impostoEstimado,
    rendaLiquida,
    rendaMensalLiquida: rendaLiquida / 12,
    yieldLiquido: rendaLiquida / preco * 100,
    yieldBruto: receitaBruta / preco * 100
  };
}

export function runScenario(input: {
  destination: DestinationKey;
  kind: PropertyKind;
  preco: number;
  diariaMediaAnual: number;
  ocupacaoMediaAnual: number;
  custoOperacional: number;
  irEfetivo?: number;
}) {
  const region = destinations[input.destination];
  const marketOccupancy = region.ocupacao.base;
  const highTarget = region.sazonalidade.ocupacaoAlta?.base;
  const nearMarket = highTarget != null && Math.abs(input.ocupacaoMediaAnual - marketOccupancy) < 0.51;
  let fator = region.sazonalidade.fatorOcupacaoAlta;
  if (highTarget != null && !nearMarket) {
    fator = calibrateSeason({
      diariaMediaAnual: region.diaria[input.kind],
      ocupacaoMediaAnual: marketOccupancy,
      mesesAlta: region.sazonalidade.mesesAlta,
      premioDiariaAlta: region.sazonalidade.premioDiariaAlta,
      ocupacaoAltaAlvo: highTarget
    }).fatorOcupacaoAlta;
  }
  const calibrated = calibrateSeason({
    diariaMediaAnual: input.diariaMediaAnual,
    ocupacaoMediaAnual: input.ocupacaoMediaAnual,
    mesesAlta: region.sazonalidade.mesesAlta,
    premioDiariaAlta: region.sazonalidade.premioDiariaAlta,
    fatorOcupacaoAlta: fator,
    ocupacaoAltaAlvo: nearMarket ? highTarget : undefined
  });
  const result = simulateSeason({
    preco: input.preco,
    diaria: calibrated.diariaRegular,
    ocupacaoBase: calibrated.ocupacaoRegular,
    custoOperacional: input.custoOperacional,
    irEfetivo: input.irEfetivo ?? IR_EFETIVO,
    mesesAlta: region.sazonalidade.mesesAlta,
    ocupacaoAlta: calibrated.ocupacaoAlta,
    premioDiariaAlta: calibrated.premioDiariaAlta
  });
  return {region, calibrated, result};
}

export function marketDefaults(destination: DestinationKey, kind: PropertyKind) {
  const region = destinations[destination];
  return {
    daily: region.diaria[kind],
    occupancy: Math.round(region.ocupacao.base)
  };
}

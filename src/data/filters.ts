// Faixas de preço da busca. Aluguel mensal e preço de venda são grandezas diferentes,
// então a escala acompanha a finalidade escolhida em vez de misturar as duas.
export type PriceScale = {label: string; options: [string, string][]};

export const priceScales: Record<'venda' | 'locacao', PriceScale> = {
  venda: {
    label: 'Valor máximo',
    options: [['', 'Sem limite'], ['500000', 'R$ 500 mil'], ['1000000', 'R$ 1 milhão'], ['2000000', 'R$ 2 milhões']]
  },
  locacao: {
    label: 'Aluguel máximo',
    options: [['', 'Sem limite'], ['3000', 'R$ 3 mil'], ['6000', 'R$ 6 mil'], ['10000', 'R$ 10 mil'], ['15000', 'R$ 15 mil']]
  }
};

export const scaleFor = (type: string): PriceScale => (type === 'locacao' ? priceScales.locacao : priceScales.venda);

export const bedOptions: [string, string][] = [
  ['', 'Qualquer'], ['1', '1 quarto ou mais'], ['2', '2 quartos ou mais'], ['3', '3 quartos ou mais']
];

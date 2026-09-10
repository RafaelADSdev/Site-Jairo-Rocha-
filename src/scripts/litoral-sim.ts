import {IR_EFETIVO, marketDefaults, runScenario, type DestinationKey, type PropertyKind} from '../data/litoral-simulator';

const form = document.querySelector<HTMLFormElement>('#sim-form');
if (form) {
  const val = (id: string) => Number((document.getElementById(id) as HTMLInputElement).value);
  const brl = (value: number) => value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});
  const pct = (value: number) => `${value.toLocaleString('pt-BR', {maximumFractionDigits: 1})}%`;
  const put = (id: string, text: string) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  const destination = () => (document.querySelector('#destination') as HTMLSelectElement).value as DestinationKey;
  const kind = () => (document.querySelector('#property-type') as HTMLSelectElement).value as PropertyKind;

  const applyMarket = () => {
    const defaults = marketDefaults(destination(), kind());
    (document.getElementById('daily') as HTMLInputElement).value = String(defaults.daily);
    (document.getElementById('occupancy') as HTMLInputElement).value = String(defaults.occupancy);
  };

  const calculate = () => {
    const daily = val('daily');
    const occ = val('occupancy');
    const cost = val('cost');
    const investment = val('investment');
    put('daily-label', brl(daily));
    put('occupancy-label', `${occ}%`);
    put('cost-label', `${cost}%`);

    const caption = `${(document.querySelector('#destination') as HTMLSelectElement).selectedOptions[0].text} · ${(document.querySelector('#property-type') as HTMLSelectElement).selectedOptions[0].text}`;
    put('scenario-caption', caption);

    if (investment < 10000 || investment > 100000000) {
      put('net-month', 'Informe um valor válido');
      put('gross', '—');
      put('cost-total', '—');
      put('tax-total', '—');
      put('net-year', '—');
      put('yield', '—');
      put('nights', '—');
      put('high-season', '—');
      return;
    }

    try {
      const {result} = runScenario({
        destination: destination(),
        kind: kind(),
        preco: investment,
        diariaMediaAnual: daily,
        ocupacaoMediaAnual: occ,
        custoOperacional: cost
      });
      put('net-month', brl(result.rendaMensalLiquida));
      put('gross', brl(result.receitaBruta));
      put('cost-total', brl(result.custos));
      put('tax-total', brl(result.impostoEstimado));
      put('net-year', brl(result.rendaLiquida));
      put('yield', pct(result.yieldLiquido));
      put('nights', `${Math.round(result.noitesEsperadas).toLocaleString('pt-BR')} noites/ano`);
      put('high-season', `${brl(result.receitaAltaTemporada)} na alta (jan, fev e dez)`);
    } catch {
      put('net-month', 'Revise diária e ocupação');
      put('gross', '—');
      put('cost-total', '—');
      put('tax-total', '—');
      put('net-year', '—');
      put('yield', '—');
      put('nights', '—');
      put('high-season', 'A combinação atual não cabe na sazonalidade deste destino.');
    }
  };

  form.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (target.id === 'destination' || target.id === 'property-type') applyMarket();
    calculate();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  put('tax-rate', `${IR_EFETIVO}%`);
  applyMarket();
  calculate();
}

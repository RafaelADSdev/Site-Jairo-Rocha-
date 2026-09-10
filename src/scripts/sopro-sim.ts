import {IR_EFETIVO, runScenario} from '../data/litoral-simulator';
import {sopro} from '../data/sopro';

const form = document.querySelector<HTMLFormElement>('#sopro-sim-form');
if (form) {
  const val = (id: string) => Number((document.getElementById(id) as HTMLInputElement).value);
  const brl = (value: number) => value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});
  const pct = (value: number) => `${value.toLocaleString('pt-BR', {maximumFractionDigits: 1})}%`;
  const put = (id: string, text: string) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  const calculate = () => {
    const daily = val('sopro-daily');
    const occ = val('sopro-occupancy');
    const cost = val('sopro-cost');
    const investment = val('sopro-investment');
    put('sopro-daily-label', brl(daily));
    put('sopro-occupancy-label', `${occ}%`);
    put('sopro-cost-label', `${cost}%`);

    if (investment < 10000 || investment > 100000000) {
      put('sopro-net-month', 'Informe um valor válido');
      put('sopro-gross', '—');
      put('sopro-cost-total', '—');
      put('sopro-tax-total', '—');
      put('sopro-net-year', '—');
      put('sopro-yield', '—');
      put('sopro-nights', '—');
      put('sopro-high-season', '—');
      return;
    }

    try {
      const {result} = runScenario({
        destination: sopro.investment.destination,
        kind: sopro.investment.kind,
        preco: investment,
        diariaMediaAnual: daily,
        ocupacaoMediaAnual: occ,
        custoOperacional: cost
      });
      put('sopro-net-month', brl(result.rendaMensalLiquida));
      put('sopro-gross', brl(result.receitaBruta));
      put('sopro-cost-total', brl(result.custos));
      put('sopro-tax-total', brl(result.impostoEstimado));
      put('sopro-net-year', brl(result.rendaLiquida));
      put('sopro-yield', pct(result.yieldLiquido));
      put('sopro-nights', `${Math.round(result.noitesEsperadas).toLocaleString('pt-BR')} noites/ano`);
      put('sopro-high-season', `${brl(result.receitaAltaTemporada)} na alta (jan, fev e dez)`);
    } catch {
      put('sopro-net-month', 'Revise diária e ocupação');
      put('sopro-gross', '—');
      put('sopro-cost-total', '—');
      put('sopro-tax-total', '—');
      put('sopro-net-year', '—');
      put('sopro-yield', '—');
      put('sopro-nights', '—');
      put('sopro-high-season', 'A combinação atual não cabe na sazonalidade deste destino.');
    }
  };

  form.addEventListener('input', calculate);
  form.addEventListener('submit', (event) => event.preventDefault());
  put('sopro-tax-rate', `${IR_EFETIVO}%`);
  calculate();
}

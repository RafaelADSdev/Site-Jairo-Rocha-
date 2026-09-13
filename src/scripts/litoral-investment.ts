import {calculateInvestment,investmentDefaults,investmentScenarios,type InvestmentInput,type InvestmentResult} from '../lib/litoral-investment';
import {destinationNames} from '../data/litoral-investment-evidence';

const root=document.querySelector<HTMLElement>('[data-investor]');
if(root) {
 const $=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const form=$<HTMLFormElement>('#investor-form');
 const inputs=Array.from(form.querySelectorAll<HTMLInputElement>('input[name]'));
 inputs.forEach(field=>{if(!field.max) field.max='1000000000000';});
 const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
 const number=(value:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
 const destination=$<HTMLSelectElement>('#investor-destination');
 const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-scenario]'));
 const copy=$<HTMLButtonElement>('[data-investor-copy]');
 const brief=$<HTMLTextAreaElement>('[data-investor-brief]');
 let result:InvestmentResult|null=null;
 let input:InvestmentInput={...investmentDefaults};
 let announcement:ReturnType<typeof setTimeout>|undefined;
 function resetBrief() {
  brief.value='';brief.parentElement!.hidden=true;
  $('[data-investor-copy-status]').textContent='';
 }
 function filter() {
  root!.querySelectorAll<HTMLElement>('[data-purchase-offer],[data-rental-offer]').forEach(row=>row.hidden=row.dataset.destination!==destination.value);
  resetBrief();
 }
 function update() {
  clearTimeout(announcement);
  resetBrief();
  let valid=true;
  const values={} as InvestmentInput;
  for(const field of inputs) {
   const key=field.name as keyof InvestmentInput;
   const fieldValid=field.value!=='' && Number.isFinite(field.valueAsNumber) && field.validity.valid;
   field.setAttribute('aria-invalid',String(!fieldValid));
   $(`[data-error="${key}"]`).textContent=fieldValid?'':`Informe um número entre ${field.min || '0'} e ${field.max || 'um valor finito'}, respeitando o incremento ${field.step.replace('.',',')}.`;
   if(!fieldValid) valid=false;
   values[key]=field.valueAsNumber;
  }
  result=null;
  if(valid) {
   try {result=calculateInvestment(values);input=values;} catch {valid=false;}
  }
  $('[data-investor-results]').hidden=!valid;
  $('[data-investor-error]').hidden=valid;
  copy.disabled=!valid;
  buttons.forEach(button=>{
   const scenario=investmentScenarios[button.dataset.scenario as keyof typeof investmentScenarios];
   button.setAttribute('aria-pressed',String(values.daily===scenario.daily && values.occupancy===scenario.occupancy));
  });
  if(!result) { $('[data-investor-live]').textContent='Resultado indisponível. Corrija os campos indicados.'; return; }
  const current=result;
  root!.querySelectorAll<HTMLElement>('[data-investor-output]').forEach(element=>{
   const key=element.dataset.investorOutput as keyof InvestmentResult;
   element.textContent=key==='yieldPercent'?`${number(current.yieldPercent)}%`:money(current[key] as number);
  });
  $('[data-result-status]').textContent=current.annualResult<0?'Resultado negativo: a operação consome caixa neste cenário.':current.annualResult===0?'Operação no equilíbrio, antes de IR e financiamento.':'Resultado positivo no cenário, não renda garantida.';
  $('[data-night-summary]').textContent=`${number(current.nights)} noites ocupadas de ${number(current.availableNights)} disponíveis · ${number(current.stays)} estadias/ano. Médias analíticas; reservas reais são inteiras.`;
  const statuses={
   no_available_nights:'Nenhuma noite disponível. Retire bloqueios para testar a operação.',
   non_positive_margin:'A diária não cobre os custos variáveis. Aumentar a ocupação não resolve esta margem.',
   exceeds_available_nights:'Mesmo 100% das noites disponíveis não cobre os custos fixos com esta margem.',
   feasible:`${number(current.breakEvenPercent??0)}% das noites disponíveis para cobrir despesas e provisão, antes de IR e dívida.`,
  };
  $('[data-break-even]').textContent=statuses[current.breakEvenStatus];
  announcement=setTimeout(()=>{
   $('[data-investor-live]').textContent=`Caixa operacional anual antes de IR e financiamento: ${money(current.annualResult)}. Retorno: ${number(current.yieldPercent)}%. ${$('[data-result-status]').textContent}`;
  },450);
 }
 form.addEventListener('submit',event=>event.preventDefault());
 form.addEventListener('input',update);
 destination.addEventListener('change',filter);
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const scenario=investmentScenarios[button.dataset.scenario as keyof typeof investmentScenarios];
  for(const key of ['daily','occupancy'] as const) (form.elements.namedItem(key) as HTMLInputElement).value=String(scenario[key]);
  update();
 }));
 $('[data-investor-reset]').addEventListener('click',()=>{inputs.forEach(field=>field.value=String(investmentDefaults[field.name as keyof InvestmentInput]));update();});
 copy.addEventListener('click',async()=>{
  if(!result) return;
  const fieldLines=inputs.map(field=>`${field.closest('label')!.childNodes[0].textContent?.trim()}: ${number(input[field.name as keyof InvestmentInput])}`).join('\n');
  const text=`Pedido de estudo de unidade — ${destinationNames[destination.value as keyof typeof destinationNames]}\nPesquisa pública: 13/09/2026. Não comprova disponibilidade ou rentabilidade.\n\nHIPÓTESES DO INTERESSADO\n${fieldLines}\n\nCapital total: ${money(result.capital)}\nCaixa operacional anual antes de IR e financiamento: ${money(result.annualResult)}\nRetorno operacional sobre capital: ${number(result.yieldPercent)}% ao ano\n${$('[data-break-even]').textContent}\n\nSOLICITAR PARA UMA UNIDADE IDENTIFICADA\n- Endereço, anúncio e preço atualizado; área privativa e estágio de entrega.\n- Extratos de 12–24 meses: reservas, bloqueios, cancelamentos, taxas e repasses.\n- Condomínio, IPTU, seguro, gestão, manutenção, limpeza e custos de aquisição.\n- Matrícula, convenção e atas, permissão de curta estadia, licenças e situação SPU quando aplicável.\n- Análise jurídica e tributária individual.\n\nNão é promessa de retorno, proposta de compra ou reserva.`;
  brief.value=text;brief.parentElement!.hidden=false;
  copy.disabled=true;
  try {await navigator.clipboard.writeText(text);$('[data-investor-copy-status]').textContent='Pedido copiado. Revise o texto abaixo e envie pelo canal de atendimento de sua preferência.';}
  catch {$('[data-investor-copy-status]').textContent='A cópia automática não foi permitida. Selecione e copie o texto abaixo.';brief.focus();brief.select();}
  finally {copy.disabled=!result;}
 });
 $<HTMLFieldSetElement>('[data-investor-fields]').disabled=false;
 destination.disabled=false;buttons.forEach(button=>button.disabled=false);
 const requested=new URLSearchParams(location.search).get('destino');
 if(requested && Object.hasOwn(destinationNames,requested)) destination.value=requested;
 filter();update();
}

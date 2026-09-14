// Analytical sensitivity model; not market estimates or tax advice.
import assert from 'node:assert/strict';
const capital={purchase:500000,closing:20000,fitOut:60000,cashReserve:20000};
const invested=Object.values(capital).reduce((a,b)=>a+b,0);
export function scenario(adr,occupancy) {
 assert(Number.isFinite(adr) && adr>0 && Number.isFinite(occupancy) && occupancy>=0 && occupancy<=1);
 const nights=365*occupancy,stays=nights/3;
 const lodging=nights*adr,cleaningIncome=150*stays;
 const platform=.16*(lodging+cleaningIncome),management=.20*lodging;
 const replacementReserve=.05*lodging,cleaningCost=150*stays;
 const variableCost=15*nights,fixedCost=1200*12;
 const result=lodging+cleaningIncome-platform-management-replacementReserve-cleaningCost-variableCost-fixedCost;
 assert(Math.abs(result-(nights*(adr*.59-23)-fixedCost))<.00001);
 const marginPerNight=adr*.59-23;
 const rawBreakEven=marginPerNight>0?fixedCost/(365*marginPerNight):Infinity;
 const breakEvenStatus=marginPerNight<=0?'non_positive_margin':rawBreakEven>1?'exceeds_365_nights':'feasible';
 const breakEvenOccupancy=breakEvenStatus==='feasible'?rawBreakEven:null;
 return {adr,occupancy,nights,stays,lodging,cleaningIncome,platform,management,replacementReserve,cleaningCost,variableCost,fixedCost,result,monthlyAverage:result/12,yieldBeforeTax:result/invested,breakEvenOccupancy,breakEvenStatus};
}
const scenarios=[scenario(250,.30),scenario(325,.45),scenario(450,.60)];
assert.equal(invested,600000);
assert.equal(scenarios[0].result,-767.25);
assert.equal(scenarios[1].result,13317.1875);
assert.equal(scenarios[2].result,38707.5);
assert.equal(scenario(10,.45).breakEvenStatus,'non_positive_margin');
assert.equal(scenario(23/.59,.45).breakEvenOccupancy,null);
assert.equal(scenario(50,.45).breakEvenStatus,'exceeds_365_nights');
assert.equal(scenario(50,.45).breakEvenOccupancy,null);
assert.throws(()=>scenario(Infinity,.45));
assert.throws(()=>scenario(325,NaN));
console.log(JSON.stringify({capital,invested,scenarios,requiredADRfor6PercentAt45Occupancy:(.06*invested+14400)/(365*.45*.59)+23/.59,requiredOccupancyFor6PercentAtADR325:(.06*invested+14400)/(365*(325*.59-23))},null,2));

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateStay, drivingRoute, itineraryFor, buildBrief} from '../src/lib/litoral-trip.ts';
test('editable budget includes fees once and splits by travelers',()=>{
 assert.deepEqual(estimateStay(5,450,180,4),{lodging:2250,total:2430,perPerson:607.5});
 assert.equal(estimateStay(2,50,0,2).total,100);
});
test('invalid budget is not silently treated as a quote',()=>{
 for(const args of [[0,450,0,2],[31,450,0,2],[2,-1,0,2],[2,450,-1,2],[2,450,0,0],[2,NaN,0,2],[2.5,450,0,2],[2,50000,0,2]]) assert.equal(estimateStay(...args),null);
});
test('route goes from Recife airport to selected destination',()=>{
 const url=new URL(drivingRoute('carneiros'));
 assert.equal(url.searchParams.get('travelmode'),'driving');
 assert.match(url.searchParams.get('destination'),/-8.696/);
 assert.match(drivingRoute('bad-id'),/-8.5061/);
});
test('itinerary adapts to short and extended stays',()=>{
 assert.equal(itineraryFor('porto',1).length,2);
 for(const nights of [0,-1,NaN,1.5,31]) assert.deepEqual(itineraryFor('porto',nights),[]);
 assert.equal(itineraryFor('porto',2).length,3);
 assert.match(itineraryFor('muro',7).join(' '),/7/);
 assert(itineraryFor('invalid',3).length>0);
});
test('copyable brief clearly identifies hypothetical total and no reservation',()=>{
 const brief=buildBrief('carneiros','familia',5,450,180);
 assert.match(brief,/Carneiros/);assert.match(brief,/5 noites/);assert.match(brief,/hipotético/);assert.match(brief,/não é reserva/i);
 assert.equal(buildBrief('porto','casal',0,450,0),'');
});

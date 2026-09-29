import test from 'node:test';
import assert from 'node:assert/strict';
import {APP_ID,blankGathering,freshState,normalizeState,thanksgivingDate,upcomingThanksgiving,addDays,daysUntil,validDate,confirmedCount,transferIngredients,budgetTotals,ovenConflicts,contrast,foreground,safeRecipeLink,prepTemplate} from '../src/model.ts';

test('Reusable dates handle Thanksgiving, leap days and daylight saving boundaries',()=>{
  assert.equal(thanksgivingDate(2026),'2026-11-26');
  assert.equal(thanksgivingDate(2027),'2027-11-25');
  assert.equal(upcomingThanksgiving('2026-11-27'),'2027-11-25');
  assert.equal(addDays('2028-02-28',1),'2028-02-29');
  assert.equal(daysUntil('2026-03-09','2026-03-07'),2);
  assert.equal(validDate('2026-02-30'),false);
});
test('RSVP totals include household adults and children, exclude invitations and declines',()=>{
 const g=blankGathering();g.guests=[{adults:2,children:1,rsvp:'Confirmed'},{adults:3,children:1,rsvp:'Invited'},{adults:1,children:0,rsvp:'Declined'}];
 assert.equal(confirmedCount(g),3);
});
test('Shopping transfer scales quantities without duplicates or losing purchase details',()=>{
 const g=blankGathering();g.dishes=[{id:'dish',name:'Carrots',baseServings:4,servings:8,ingredients:[{id:'ingredient',name:'Carrots',quantity:1,unit:'kg',aisle:'Produce'}]}];
 let result=transferIngredients(g,'dish');assert.equal(result.groceries[0].quantity,2);
 result.groceries[0]={...result.groceries[0],status:'Bought',estimated:10,actual:8,store:'Market'};
 result.dishes[0]={...result.dishes[0],servings:12};
 result=transferIngredients(result,'dish');assert.equal(result.groceries.length,1);assert.equal(result.groceries[0].quantity,3);assert.equal(result.groceries[0].actual,8);assert.equal(result.groceries[0].status,'Bought');assert.equal(result.groceries[0].store,'Market');
});
test('Budget counts cents and recorded costs, omits pantry items',()=>{
 const g=blankGathering();g.budget=50;g.groceries=[{estimated:.1,actual:.1,status:'Bought'},{estimated:.2,actual:.2,status:'Needed'},{estimated:20,actual:20,status:'In pantry'}];g.expenses=[{estimated:2,actual:1}];
 assert.deepEqual(budgetTotals(g),{estimated:2.3,actual:1.3,remaining:48.7});
});
test('Oven checks honor resource, boundaries, completion and cross-midnight civil dates',()=>{
 const g=blankGathering();const base={date:'2026-11-26',resource:'Oven 1',done:false,minutes:60};
 g.slots=[{...base,id:'a',time:'14:00'},{...base,id:'b',time:'14:30'},{...base,id:'c',time:'15:00',resource:'Oven 2'}];assert.equal(ovenConflicts(g).length,1);
 g.slots=[{...base,id:'a',time:'14:00'},{...base,id:'b',time:'15:00'}];assert.equal(ovenConflicts(g).length,0);
 g.slots=[{...base,id:'a',time:'23:45'},{...base,id:'b',date:'2026-11-27',time:'00:10'}];assert.equal(ovenConflicts(g).length,1);
 g.slots[1].done=true;assert.equal(ovenConflicts(g).length,0);
});
test('Backups preserve history and reject foreign, future, malformed or duplicated data',()=>{
 const s=freshState();s.gatherings[0].date='2021-11-25';
 assert.equal(normalizeState(JSON.parse(JSON.stringify(s))).gatherings[0].date,'2021-11-25');
 for(const bad of [{...s,app:'different'},{...s,version:2},{...s,gatherings:[]},{...s,gatherings:[{...s.gatherings[0],date:'2026-02-30'}]},{...s,gatherings:[s.gatherings[0],s.gatherings[0]]}]) assert.throws(()=>normalizeState(bad));
 assert.equal(normalizeState(s).app,APP_ID);
});
test('All custom grayscale backgrounds receive readable foreground contrast',()=>{
 for(let n=0;n<=255;n++){const c='#'+n.toString(16).padStart(2,'0').repeat(3);assert.ok(contrast(foreground(c),c)>=4.5,c);}
 for(const c of ['#782F45','#F6F1E8','#00FF00','#BB88DD','#526044'])assert.ok(contrast(foreground(c),c)>=4.5,c);
});
test('Recipe links reject script URLs; prep template follows the selected historical date',()=>{
 assert.equal(safeRecipeLink('javascript:alert(1)'), '');
 assert.equal(safeRecipeLink('https://example.com/recipe'),'https://example.com/recipe');
 const g=blankGathering();g.date='2021-11-25';assert.equal(prepTemplate(g)[0].date,'2021-11-04');
});


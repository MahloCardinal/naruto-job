'use strict';

// Recommendations are heuristics, not simulated matches or predicted win rates.
const DECK_AUTOBUILDER = (() => {
  const byIndex=new Map(CARDS.map(card=>[card.index,card]));
  const byKey=new Map(CARDS.map(card=>[card.card_key,card.index]));
  for (const deck of PREBUILT_DECKS) {
    if (!deck.name || !Array.isArray(deck.tags) || new Set(deck.tags).size!==deck.tags.length || deck.cards.length!==10 || new Set(deck.cards).size!==10 || deck.cards.some(key=>!byKey.has(key)) || deck.core.some(key=>!deck.cards.includes(key))) throw Error('Invalid prebuilt deck: '+deck.id);
  }
  const templates=PREBUILT_DECKS.filter(deck=>!deck.tags.includes('boss')).map(deck=>({
    id:deck.id,cards:deck.cards.map(key=>byKey.get(key)),core:deck.core.map(key=>byKey.get(key)),
    average:deck.cards.reduce((sum,key)=>sum+byIndex.get(byKey.get(key)).energy_cost,0)/10
  }));
  const cardFeatures=new Map(CARDS.map(card=>[card.index,{
    cost:card.energy_cost,cheap:Number(card.energy_cost<=3),expensive:Number(card.energy_cost>=6),
    defense:Number(card.skill_types_original.some(type=>['Guard','Pin','Weaken','Push','Slow'].includes(type))),
    pressure:Number(card.chakra>=5||card.skill_types_original.some(type=>['Rush','Summon'].includes(type)))
  }]));
  const pairRules=new Map();
  const kindWeights={trigger:1,amplify:.9,extend:.65,convert:.75,summon:1.1,recover:.55,protect:.65,'named-support':1.05,'shared-plan':.4,mitigate:.55,tradeoff:-.35};
  for (const rule of SYNERGY_RULES) {
    // Rule weights and target features do not change between candidate decks.
    const requires=rule.requiresAny.map(key=>byKey.get(key)),tradeoff=rule.kind==='tradeoff';
    let value=kindWeights[rule.kind]||.5;
    if (!tradeoff) {
      value*=rule.strength==='strategic'?.45:rule.strength==='conditional'?.75:1;
      // Discount broad providers relative to more specific interactions.
      value/=1+Math.log2(1+rule.beneficiaries.length)/6;
    }
    for (const enabler of rule.enablers) for (const beneficiary of rule.beneficiaries) {
      if (enabler===beneficiary) continue;
      // Permanent Guard needs no extra charges. Immunity also blocks allied buffs.
      if (rule.id==='extra-guard-reactions' && beneficiary==='S2_093') continue;
      if (beneficiary==='S3_100' && ['amplify','extend','recover','named-support'].includes(rule.kind)) continue;
      const a=byKey.get(enabler),b=byKey.get(beneficiary),key=a<b?a+':'+b:b+':'+a;
      if (!pairRules.has(key)) pairRules.set(key,[]);
      pairRules.get(key).push({value,requires,tradeoff,enabler:a,training:rule.id==='training-focus-reactions'});
    }
  }
  const profiles={balanced:[.4,.3,.2,.1],synergy:[.55,.2,.15,.1],reference:[.3,.5,.15,.05]};
  // Gamatatsu needs another toad for its core effect, even when Focus triggers are available.
  const partnerRequirements=new Map([[byKey.get('S3_035'),['S1_076','S2_032','S2_033','S2_073','S3_063','S3_085'].map(key=>byKey.get(key))]]);
  const clamp=value=>Math.max(0,Math.min(1,value));
  function pairValue(a,b,chosen) {
    const records=pairRules.get(a<b?a+':'+b:b+':'+a)||[];
    let best=0,penalty=0;
    for (const entry of records) {
      if (entry.requires.length && !entry.requires.some(index=>chosen.has(index))) continue;
      if (entry.tradeoff) {penalty=Math.min(penalty,entry.value);continue;}
      let value=entry.value;
      if (entry.training && ![...chosen].some(index=>index!==entry.enabler&&byIndex.get(index).chakra<=3)) value*=.3;
      best=Math.max(best,value);
    }
    return {value:best+penalty,linked:best>0};
  }
  function ranks(values) {
    const sorted=[...values].sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
    const result=new Map();
    for (let start=0;start<sorted.length;) {
      let end=start+1;while(end<sorted.length&&sorted[end][1]===sorted[start][1])end++;
      const rank=(start+end-1)/2/Math.max(1,sorted.length-1);
      for(let i=start;i<end;i++)result.set(sorted[i][0],rank);
      start=end;
    }
    return result;
  }
  async function generate({selected,estimateCard,signal,eligibleIndices=null}) {
    const locked=[...selected],lockedSet=new Set(locked);
    if (locked.length>10 || lockedSet.size!==locked.length || locked.some(index=>!byIndex.has(index))) throw Error('Invalid locked cards');
    if (locked.length===10) return [];
    const eligible=eligibleIndices===null?null:new Set(eligibleIndices);
    const available=CARDS.filter(card=>lockedSet.has(card.index) || eligible===null || eligible.has(card.index));
    const availableSet=new Set(available.map(card=>card.index));
    if (available.length<10) return [];
    const values=available.map(card=>{const value=estimateCard(card);return [card.index,Number.isFinite(value.quality)?value.quality:0];});
    const qualityRank=ranks(values);
    const matched=templates.map(template=>{
      const overlap=locked.filter(index=>template.cards.includes(index)).length;
      const core=locked.filter(index=>template.core.includes(index)).length;
      return {...template,affinity:locked.length ? .4+.4*overlap/locked.length+.2*Math.min(1,core) : 1};
    }).sort((a,b)=>b.affinity-a.affinity||a.id.localeCompare(b.id));
    const targetAverage=matched.slice(0,4).reduce((sum,deck)=>sum+deck.average,0)/Math.min(4,matched.length);
    const cache=new Map();
    function components(indices) {
      const key=indices.join(',');
      if(cache.has(key))return cache.get(key);
      const chosen=new Set(indices),covered=new Set(),coveredLocked=new Set();
      let total=0,lockedValue=0;
      for(let i=0;i<indices.length;i++)for(let j=i+1;j<indices.length;j++){
        const pair=pairValue(indices[i],indices[j],chosen);total+=pair.value;
        if(pair.linked){
          covered.add(indices[i]);covered.add(indices[j]);
          if(lockedSet.has(indices[i]))coveredLocked.add(indices[i]);
          if(lockedSet.has(indices[j]))coveredLocked.add(indices[j]);
        }
        if(lockedSet.has(indices[i])||lockedSet.has(indices[j]))lockedValue+=pair.value;
      }
      const count=indices.length;
      const globalSynergy=.65*(1-Math.exp(-Math.max(0,total)/(count*.55)))+.35*covered.size/count;
      const synergy=clamp(locked.length ? .5*globalSynergy+.35*coveredLocked.size/locked.length+.15*(1-Math.exp(-Math.max(0,lockedValue)/locked.length)) : globalSynergy);
      let reference=0;
      for(const template of matched){
        const overlap=indices.filter(index=>template.cards.includes(index)).length;
        const core=template.core.filter(index=>chosen.has(index)).length/template.core.length;
        const value=(.75*overlap/count+.25*core)*template.affinity;
        reference=Math.max(reference,value);
      }
      let cost=0,cheapCount=0,expensiveCount=0,defenseCount=0,pressureCount=0,qualitySum=0;
      for (const index of indices) {
        const features=cardFeatures.get(index);
        cost+=features.cost;cheapCount+=features.cheap;expensiveCount+=features.expensive;
        defenseCount+=features.defense;pressureCount+=features.pressure;qualitySum+=qualityRank.get(index);
      }
      const average=cost/count,cheap=cheapCount/count,expensive=expensiveCount/count,defense=defenseCount/count,pressure=pressureCount/count;
      const rotation=clamp(1-Math.abs(average-targetAverage)/2.5);
      const balance=.35*rotation+.25*clamp(cheap/.3)+.2*clamp(defense/.3)+.2*clamp(pressure/.2)-Math.max(0,expensive-.4);
      const quality=qualitySum/count;
      const result={synergy,reference,balance:clamp(balance),quality};
      cache.set(key,result);return result;
    }
    const score=(indices,weights)=>{const c=components(indices);return c.synergy*weights[0]+c.reference*weights[1]+c.balance*weights[2]+c.quality*weights[3];};
    const initial=[...locked].sort((a,b)=>a-b),completed=[];
    const required=new Set([...matched.slice(0,5).flatMap(template=>template.core),...partnerRequirements.values()].flat().filter(index=>!lockedSet.has(index) && availableSet.has(index)));
    for(const [profile,weights]of Object.entries(profiles)){
      if(signal?.aborted)return [];
      const candidates=available.filter(card=>!lockedSet.has(card.index)).map(card=>({index:card.index,score:score([...initial,card.index].sort((a,b)=>a-b),weights)})).sort((a,b)=>b.score-a.score||a.index-b.index);
      const pool=[...required,...candidates.filter(candidate=>!required.has(candidate.index)).slice(0,80-required.size).map(candidate=>candidate.index)];
      let beam=[{indices:initial,score:0}];
      for(let size=locked.length;size<10;size++){
        await new Promise(resolve=>setTimeout(resolve,0));
        if(signal?.aborted)return [];
        const next=new Map();
        for(const state of beam)for(const index of pool){
          if(state.indices.includes(index))continue;
          const indices=[...state.indices,index].sort((a,b)=>a-b),key=indices.join(',');
          if (indices.length===10 && [...partnerRequirements].some(([card,partners])=>indices.includes(card) && !partners.some(partner=>indices.includes(partner)))) continue;
          if(!next.has(key))next.set(key,{indices,score:score(indices,weights)});
        }
        beam=[...next.values()].sort((a,b)=>b.score-a.score||a.indices.join(',').localeCompare(b.indices.join(','))).slice(0,20);
      }
      completed.push(...beam.map(state=>({...state,profile,...components(state.indices)})));
    }
    const results=[],seen=new Set();
    for(const profile of Object.keys(profiles)){
      const candidates=completed.filter(candidate=>candidate.profile===profile).sort((a,b)=>b.score-a.score);
      const chosen=candidates.find(candidate=>!seen.has(candidate.indices.join(','))&&results.every(other=>{
        const additions=candidate.indices.filter(index=>!lockedSet.has(index));
        return additions.filter(index=>other.indices.includes(index)).length/Math.max(1,additions.length)<.85;
      }))||candidates.find(candidate=>!seen.has(candidate.indices.join(',')));
      if(!chosen)continue;
      seen.add(chosen.indices.join(','));
      results.push({...chosen,indices:[...locked,...chosen.indices.filter(index=>!lockedSet.has(index))]});
    }
    // Improve complete decks after the beam search. Every allowed card can now
    // enter through a replacement, including cards outside the initial pool.
    // Accept only strict improvements under the same profile and constraints.
    const completeSeeds=templates.filter(template=>locked.every(index=>template.cards.includes(index))&&template.cards.every(index=>availableSet.has(index)));
    const additions=10-locked.length,usualOverlap=Math.ceil(additions*.85)-1;
    function overlap(a, b) {
      return a.filter(index => !lockedSet.has(index) && b.includes(index)).length;
    }
    function validPartners(indices) {
      return [...partnerRequirements].every(
        ([card, partners]) =>
          !indices.includes(card) || partners.some(partner => indices.includes(partner))
      );
    }
    let yieldedAt=performance.now();
    async function refine(proposal, others) {
      const weights = profiles[proposal.profile],
        limits = others.map(other => Math.max(usualOverlap, overlap(proposal.indices, other.indices)));
      let indices = [...proposal.indices].sort((a, b) => a - b),
        currentScore = proposal.score;
      const acceptable = candidate =>
        validPartners(candidate) &&
        others.every(
          (other, i) =>
            overlap(candidate, other.indices) <= limits[i] &&
            candidate.some(index => !other.indices.includes(index))
        );
      for (let pass = 0; pass < 3; pass++) {
        if (signal?.aborted) return null;
        let best = indices,
          bestScore = currentScore;
        function consider(candidate) {
          if (!acceptable(candidate)) return;
          const value = score(candidate, weights);
          if (value > bestScore + 1e-10) {
            best = candidate;
            bestScore = value;
          }
        }
        if (pass === 0)
          for (const template of completeSeeds) consider([...template.cards].sort((a, b) => a - b));
        const chosen = new Set(indices);
        for (let slot = 0; slot < indices.length; slot++) {
          if (lockedSet.has(indices[slot])) continue;
          for (const card of available) {
            if (chosen.has(card.index)) continue;
            const candidate = [...indices];
            candidate[slot] = card.index;
            candidate.sort((a, b) => a - b);
            consider(candidate);
            if (performance.now() - yieldedAt >= 12) {
              await new Promise(resolve => setTimeout(resolve, 0));
              yieldedAt = performance.now();
              if (signal?.aborted) return null;
            }
          }
        }
        if (best === indices) break;
        indices = best;
        currentScore = bestScore;
      }
      if (currentScore <= proposal.score + 1e-10) return proposal;
      return {
        ...proposal,
        ...components(indices),
        score: currentScore,
        indices: [...locked, ...indices.filter(index => !lockedSet.has(index))]
      };
    }
    for(let i=0;i<results.length;i++){
      const improved=await refine(results[i],results.filter((_,j)=>j!==i));
      if(signal?.aborted)return [];
      results[i]=improved;
    }
    return results;
  }
  return {generate};
})();

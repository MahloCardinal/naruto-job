'use strict';

// Formula tokens are language-independent. Translation is applied only to explanations.
// E/A are configurable target groups; eN/aN cap an explicit maximum to available targets.
// N is the total number of repeated effect activations. Initial effects stay separate.
// Summons add Chakra; additional activation costs are declared separately in the rules.
const formulaCache = new Map(),
  factorCache = new Map();
function compileFormula(expression) {
  if (!formulaCache.has(expression)) {
    const branch = /^max\(([^|]+)\|([^|]+)\)$/.exec(expression);
    formulaCache.set(expression, {
      branch: branch?.slice(1),
      terms: branch
        ? null
        : Array.from(expression.matchAll(/([+-]?)([^+-]+)/g), match => ({
            negative: match[1] === '-',
            term: match[2]
          }))
    });
  }
  return formulaCache.get(expression);
}
function compileFactors(term) {
  if (!factorCache.has(term))
    factorCache.set(
      term,
      term
        .split('*')
        .map(factor => ({
          factor,
          effect: /^([CWHBK])(\d+)$/.exec(factor),
          target: /^([ea])(\d+)$/.exec(factor),
          cap: /^min(\d+)$/.exec(factor),
          drain: /^drain(\d+)$/.exec(factor)
        }))
    );
  return factorCache.get(term);
}
function estimate(card, level, options = scenarioFor(card), dependencies = null) {
  return evaluateCard(card, level, options, dependencies, true);
}
function estimateNumbers(card, level, options = scenarioFor(card), dependencies = null) {
  return evaluateCard(card, level, options, dependencies, false);
}
function evaluateCard(card, level, options, dependencies, explain) {
  const scenario = cleanScenario(options);
  const numbers = card.effect_values[level - 1];
  const rule = RULES[card.card_key];
  let note =
    explain && getTranslation('ruleNotes.' + card.card_key)
      ? t('ruleNotes.' + card.card_key, scenario)
      : '';
  let expression = Array.isArray(rule?.expr) ? rule.expr[level - 1] : rule?.expr;
  let parts = [];

  if (!expression) {
    expression = '0';
    if (explain && Object.values(numbers).some(values => values.length)) {
      note = t('calculation.unquantified');
    }
  }
  if (expression === 'auto' || expression === 'encounter') {
    const repeated = card.repeats[level - 1];
    const times = expression === 'encounter' && repeated ? 'N' : '1';
    if (explain && expression === 'encounter')
      note = t(repeated ? 'calculation.repeated' : 'calculation.once', scenario);
    expression =
      ['C', 'W', 'H', 'B']
        .flatMap(key =>
          numbers[key].map((_, index) => `${key}${index}${key === 'W' ? '*e1' : ''}*${times}`)
        )
        .join('+') || '0';
  }

  function product(term, negative = false) {
    let amount = 1,
      kind = 'damage';
    const labels = [];
    const usesAllyDamage =
      negative &&
      card.card_key !== 'S1_058' &&
      /(?:^|\*)a(?:\d+)?(?:$|\*)|(?:^|\*)A(?:$|\*)/.test(term);
    const use = key => dependencies?.add(key);
    const label = (key, value) => {
      if (explain) labels.push(t('calculation.' + key, { value: fmt(value) }));
    };

    let factorsSeen = 0;
    for (const { factor, effect, target, cap, drain } of compileFactors(term)) {
      let value;
      if (effect) {
        const key = effect[1];
        value = numbers[key][Number(effect[2])];
        if (!Number.isFinite(value))
          throw Error(t('errors.invalidRule', { id: card.card_key, level, factor }));
        kind =
          key === 'C'
            ? 'boost'
            : key === 'K'
              ? 'summon'
              : key === 'H'
                ? 'heal'
                : key === 'B'
                  ? 'burn'
                  : 'damage';
        if (key === 'B') {
          use('enemyChakra');
          value = Math.min(value, scenario.enemyChakra);
        }
        if (key === 'W' && usesAllyDamage) {
          use('allyChakra');
          value = Math.min(value, scenario.allyChakra);
        }
        if (explain)
          labels.push(
            t('calculation.amount', { value: fmt(value), effect: t('calculation.effect' + key) })
          );
      } else if (factor === 'burnTotal') {
        use('enemyChakra');
        value = Math.min(
          numbers.B.reduce((sum, duration) => sum + duration, 0),
          scenario.enemyChakra
        );
        kind = 'burn';
        label('burnTotal', value);
      } else if (factor === 'base') {
        value = card.chakra;
        kind = 'summon';
        label('copy', value);
      } else if (factor === 'restoreBase') {
        value = Math.max(0, card.chakra - 1);
        kind = 'heal';
        label('restore', value);
      } else if (factor === 'rushChakra') {
        value = Math.min(3, card.rush[level - 1]);
        kind = 'boost';
        label('rush', value);
      } else if (factor === 'E') {
        use('enemies');
        value = scenario.enemies;
        label('enemies', value);
      } else if (factor === 'otherE') {
        use('enemies');
        value = Math.max(0, scenario.enemies - 1);
        label('otherEnemies', value);
      } else if (factor === 'A') {
        use('allies');
        value = scenario.allies;
        label('allies', value);
      } else if (factor === 'N' || factor === 'first' || factor === 'remaining') {
        use('activations');
        value =
          factor === 'first'
            ? Number(scenario.activations > 0)
            : factor === 'remaining'
              ? Math.max(0, scenario.activations - 1)
              : scenario.activations;
        label(factor === 'N' ? 'activations' : factor, value);
      } else if (factor === 'Q') {
        use('enemyChakra');
        value = scenario.enemyChakra;
        label('enemyChakra', value);
      } else if (factor === 'burnAll' || factor === 'burnOne') {
        if (factor === 'burnAll') use('enemies');
        value = factor === 'burnOne' ? 1 : scenario.enemies;
        label('targets', value);
      } else if (target) {
        const key = target[1] === 'e' ? 'enemies' : 'allies';
        if (Number(target[2]) > 1) use(key);
        value = Math.min(Number(target[2]), scenario[key]);
        label(key, value);
      } else if (drain) {
        use('enemyChakra');
        value = Math.min(Number(drain[1]), Math.max(0, scenario.enemyChakra - 1));
        label('drain', value);
      } else if (cap) {
        use('enemyChakra');
        value = Math.min(Number(cap[1]), scenario.enemyChakra);
        label('removable', value);
      } else if (/^\d+(?:\.\d+)?$/.test(factor)) {
        value = Number(factor);
        if (usesAllyDamage && factorsSeen === 0) {
          use('allyChakra');
          value = Math.min(value, scenario.allyChakra);
        }
        if (explain) labels.push(fmt(value));
      } else {
        throw Error(t('errors.invalidFactor', { factor }));
      }
      amount *= value;
      factorsSeen++;
    }
    return { value: amount, kind, label: labels.join(' × ') };
  }

  const compiled = compileFormula(expression),
    branch = compiled.branch;
  if (branch) {
    const first = product(branch[0]),
      second = product(branch[1]);
    parts = [second.value > first.value ? second : first];
    if (explain) parts[0].label = t('calculation.bestBranch', { label: parts[0].label });
  } else {
    for (const { term, negative } of compiled.terms) {
      const part = product(term, negative);
      if (negative) {
        part.value = -part.value;
        part.kind = 'friendly';
      }
      parts.push(part);
    }
  }

  const totals = { boost: 0, summon: 0, friendly: 0, damage: 0, burn: 0, heal: 0 };
  for (const part of parts) totals[part.kind] += part.value;
  const boosts = totals.boost,
    summoned = totals.summon,
    friendly = -totals.friendly;
  const { damage, burn, heal } = totals;
  const chakra = card.chakra + boosts + summoned - friendly;
  const value = chakra + damage + burn + heal;
  const costPerActivation = rule?.costPerActivation ?? 0;
  if (costPerActivation) dependencies?.add('activations');
  const cost = card.energy_cost + costPerActivation * scenario.activations;

  if (explain) {
    if (card.conditional[level - 1] && !note) note = t('calculation.favourable');
    if (!rule && !note) note = t('calculation.tactical');
    if (card.card_key === 'S2_054') note = t('calculation.halving');
    if (card.card_key === 'S3_083' || numbers.B.length) note = t('calculation.burnNote');
    if (['S1_083', 'S2_040', 'S2_072', 'S2_080', 'S3_069'].includes(card.card_key))
      note = t('calculation.allCards', scenario);
    if (card.card_key === 'S1_058') note = t('calculation.ebisu');
    if (/(?:^|[^\w])(?:N|first|remaining)(?:$|[^\w])/.test(expression)) note = '';
  }
  return {
    value,
    cost,
    quality: value / cost,
    chakra,
    base: card.chakra,
    boosts,
    summoned,
    friendly,
    damage,
    burn,
    heal,
    parts: parts.filter(part => part.value !== 0),
    note,
    level,
    scenario
  };
}

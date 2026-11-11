'use strict';

// Curated mechanical links. Lane, timing, target and resource conditions still apply.
// Heal is not Chakra gain. Rush conversion is not Rush extension.
// Direction, interaction type and prerequisites are retained for deck recommendations.
// Beneficiaries are cards whose strategy benefits, not necessarily the direct effect targets.
// Condition tags describe requirements; they are not combat-simulation guarantees.
// The browsing graph below is derived from these rules and remains symmetric.
const SYNERGY_RULES = (() => {
  const keys=(season,numbers)=>numbers.map(n=>`S${season}_${String(n).padStart(3,'0')}`);
  const s1=numbers=>keys(1,numbers),s2=numbers=>keys(2,numbers),s3=numbers=>keys(3,numbers);
  const byKey=new Map(CARDS.map(card=>[card.card_key,card]));
  const rules=[],ids=new Set();
  const join=(...groups)=>[...new Set(groups.flat())];
  const without=(group,...excluded)=>group.filter(key=>!excluded.includes(key));
  const withSkill=skill=>CARDS.filter(card=>card.skill_types_original.includes(skill)).map(card=>card.card_key);
  function connect(id,kind,enablers,beneficiaries,{strength='direct',conditions=[],requiresAny=[]}={}) {
    if (ids.has(id)) throw Error('Duplicate synergy rule: '+id);
    ids.add(id);
    for (const key of [...enablers,...beneficiaries,...requiresAny]) {
      if (!byKey.has(key)) throw Error('Unknown synergy card: '+id+'/'+key);
    }
    rules.push({id,kind,strength,enablers:[...new Set(enablers)],beneficiaries:[...new Set(beneficiaries)],conditions,requiresAny});
  }
  const rushUnits=join(s1([9,18,25,26,34,39,40,41,65,78,84]),s2([4,5,13,14,21,23,35,42,43,44,45,50,51,54,57,75,79,91]),s3([2,7,8,12,13,15,16,21,23,25,30,36,38,50,51,57,59,61,63,64,77,80,91,92]));
  const chakraReactors=join(s1([1,75]),s2([55,97]),s3([52,63]));
  const chakraSupport=join(s1([7,10,11,16,19,21,22,24,27,38,41,52,58,62,73]),s2([6,15,36,44,45,56,70,100]),s3([18,39,60]));
  const enemyPin=join(s1([14,28,36,44,48,49,53,55,57,61,65,75]),s2([17,25,26,62,65,87,96]),s3([4,9,22,40,54,64,67,71,72,86,89,95,96]),['ES_004']);
  const focusUnits=join(s1([60]),s2([38,58,64,94,98,99]),s3([35,80,81,84,86,90,94,99]),['ES_004','ES_005']);
  // Remove providers, observers and anti-Guard text that only mentions the keyword.
  const guardUnits=without(withSkill('Guard'),...s1([70]),...s2([12,36,49,74]),...s3([19,33,39,92]));
  const enemyWeaken=without(withSkill('Weaken'),...s1([20,58,82]),...s2([48,81,86]),...s3([29,36,55,60]),'ES_001');
  const enemyPush=without(withSkill('Push'),...s1([27]),...s2([22,33]));
  const enemySlow=join(s1([12,43,59]),s2([8,72,80,82,88,97]),s3([17,22,31,55,68,69,71]));
  const enemySwitch=join(s1([12,49,84]),s2([24,25,59,82]),s3([46]));
  const allySwitch=join(s1([51,75]),s2([6,28,51,66,75,85,93]),s3([12,16,38,41,42,57,73,83,88,96]));
  const teleportBehind=join(s1([23,48,65]),s3([4,64,67,68]));
  const burnSources=join(s2([89,97]),s3([83,84,85]));

  // Explicit Chakra gains activate Chakra reactors; healing-only cards are excluded.
  connect('chakra-gain-reactions','trigger',chakraSupport,chakraReactors,{conditions:['provider_target_eligible','chakra_gain_not_healing','beneficiary_trigger_available']});
  // Advanced Training only accepts low-Chakra allies and also supplies Focus triggers.
  connect('training-chakra-reactions','trigger',s3([10]),chakraReactors.filter(key=>byKey.get(key).chakra<=3),{conditions:['same_lane','current_chakra_at_most_3','focus_completes']});
  connect('training-focus-reactions','trigger',s3([10]),join(s2([78]),s3([29,56])),{conditions:['eligible_training_target','focus_support_active']});
  // Rush extenders and converters use distinct sets. Kimimaro S3_100 is immune to allies.
  connect('rush-extension','extend',join(s1([37,50]),s2([44])),rushUnits,{conditions:['provider_target_eligible','rush_timing_matches']});
  // Choji needs Rush to remain active. Itachi's Chakra-locked clones are excluded.
  connect('ningame-rush-conversion','convert',s2([31]),without(rushUnits,'S2_057'),{conditions:['same_lane','rush_is_converted_not_preserved']});
  // Jirocho converts remaining Rush at Mid Range, up to the stated cap.
  connect('jirocho-rush-conversion','convert',s3([39]),without(rushUnits,'S2_057'),{conditions:['next_ally_on_another_lane','remaining_rush_at_mid_range','conversion_cap_applies']});
  connect('ningame-rush-providers','convert',join(s1([37]),s2([44]),s3([42,48])),s2([31]),{conditions:['same_lane_as_rush_recipient','rush_is_converted_not_preserved']});

  // Reactive effects: enemy Pin, teleport, Focus, Guard and lane changes.
  connect('itachi-enemy-pin-reactions','trigger',enemyPin,s3([82,95]),{conditions:['enemy_is_pinned','reactor_active','chakra_cost_of_reaction']});
  connect('gaara-pin-reaction','trigger',without(enemyPin,'S2_096'),s2([96]),{conditions:['another_ally_applies_pin','enemy_in_relevant_lane']});
  connect('behind-teleport-reaction','trigger',teleportBehind,s3([53]),{conditions:['teleport_behind_enemy','reactor_active']});
  connect('focus-reactions','trigger',focusUnits,join(s2([78]),s3([56])),{conditions:['reactor_active','focus_trigger_matches']});
  connect('shikamaru-allied-pin-reaction','trigger',join(s1([7,28,61]),s2([2,15,27,56]),s3([6,26,54,67,71])),s2([78]),{conditions:['another_ally_is_pinned','shikamaru_active']});
  connect('sakon-ukon-guard-reaction','trigger',guardUnits,s3([98]),{conditions:['allied_guard_activates','reactor_active']});
  connect('enemy-weaken-chakra-engines','trigger',enemyWeaken,join(s2([81]),s1([82])),{conditions:['enemy_weakened','engine_active']});
  // Gaara also counts weakening allies.
  connect('gaara-friendly-weaken-reaction','trigger',join(s1([20,58]),s2([86]),s3([29,36])),s2([81]),{conditions:['allied_card_applies_weaken','gaara_active']});
  connect('gamabunta-push-reaction','trigger',enemyPush,s1([76]),{conditions:['allied_push_matches_trigger','reactor_active']});
  connect('enemy-lane-switch-reactions','trigger',enemySwitch,s2([82,85]),{conditions:['enemy_switches_lane','reactor_active','kankuro_requires_another_ally']});
  connect('enma-allied-lane-switch','trigger',allySwitch,s2([90]),{conditions:['ally_switches_lane','enma_active']});
  connect('akamaru-weaken-amplification','amplify',s3([55]),without(enemyWeaken,'S3_100'),{conditions:['enemy_still_has_akamaru_slow','weaken_hits_marked_enemy','beneficiary_accepts_allied_effects']});

  // Extra Guard provides more opportunities for these explicit Guard-triggered abilities.
  const guardReactors=join(s2([51,60,61]),s3([16,58,65,70,76,77,78,93,98]));
  connect('extra-guard-reactions','amplify',join(s2([36]),s3([39])),guardReactors,{conditions:['provider_target_eligible','guard_bonus_applies','guard_is_triggered']});
  connect('karura-gaara-guard','amplify',s2([12]),s2([60]),{conditions:['gaara_deployed_after_support','guard_is_triggered']});
  // Burn powers Jiraiya during Focus and supplies Gamabunta's detonation.
  connect('burn-payoffs','trigger',burnSources,s3([84,85,2]),{conditions:['enemy_burning','jiraiya_requires_active_focus','gamabunta_requires_same_lane_burning_target']});
  // Longer Focus helps periodic/control effects, not charge-up completion abilities.
  connect('periodic-focus-extension','extend',s3([29]),join(s2([58,64]),s3([35,81,84,86,94])),{conditions:['periodic_or_duration_based_focus','friendly_weaken_during_focus']});
  // Permanent Slow also prolongs drain and Hiruzen's explicit Chakra ticks.
  connect('permanent-slow','extend',s3([87]),join(enemySlow,s3([18])),{conditions:['allied_slow_applied','tayuya_active']});
  // Tayuya buffs summons, except Itachi's clones which cannot gain Chakra.
  connect('tayuya-summon-buff','amplify',s3([99]),join(s1([3,33,56,60,63,71,77]),s2([16,29,32,37,38,86]),s3([27,28])),{conditions:['tayuya_focus_completed','new_unit_is_a_summon','summon_can_gain_chakra']});
  // Healing after self-damage is separate from Chakra-gain triggers.
  connect('recover-self-weaken','recover',s3([60,62]),join(s1([58]),s2([94])),{strength:'conditional',conditions:['first_heal_trigger_available','heal_target_in_range','ally_below_base_chakra']});
  connect('recover-other-chakra-loss','recover',s3([62]),s3([44,82,83,95]),{strength:'conditional',conditions:['first_heal_trigger_available','same_lane','ally_below_base_chakra']});

  // Named-card and clan relationships are explicitly scoped by the supporting card.
  const sasuke=join(s1([5,49,66,81]),s2([3,74,92]),s3([2,52,76,77,91]));
  const hiruzen=join(s1([50,73]),s2([70,89,97,98]),s3([18]));
  const gaara=join(s2([10,60,80,81,96]),s3([78,94]));
  const orochimaru=join(s2([67,84,85,86]),s3([11,12,59]));
  const tsunade=s3([13,14,15,60,61,62,97]);
  const rockLee=join(s2([5,6,53,75,94]),s3([80]));
  const shikamaru=join(s1([28]),s2([78]),s3([7,54]));
  const hyuga=join(s1([31,32]),s2([7,21,22,23,54,55,59,76,95]),s3([6]));
  const uchiha=join(sasuke,s3([19,33,43,50,56,82,83,95,96]));
  const akamaru=join(s1([34]),s3([55]));
  const kiba=join(s1([33]),s2([77]),s3([79]));
  const frogs=join(s1([76]),s2([32,33,73]),s3([35,63,85]));
  connect('akamaru-summon-and-copy','summon',join(s1([33]),s2([77])),akamaru,{conditions:['matching_akamaru_available','summon_or_next_deploy_condition']});
  connect('kiba-transformation-fuel','convert',join(akamaru,kiba),s3([79]),{conditions:['other_kiba_or_akamaru_on_board','withdrawal_occurs','chakra_transfer']});
  connect('hiruzen-summon-and-rescue','named-support',join(s1([56]),s2([35])),hiruzen,{conditions:['hiruzen_in_deck_or_active','konohamaru_summon_is_random','raido_rescues_before_withdrawal']});
  connect('naruto-iruka-rescue','protect',s1([63]),s1([11,51,52,72]),{conditions:['iruka_would_withdraw','naruto_active']});
  connect('gaara-named-support','named-support',s2([11,12,41]),gaara,{conditions:['gaara_matches_support_target','deployment_order']});
  connect('hyuga-main-branch','named-support',s2([23]),s2([22]),{conditions:['hiashi_support_target_eligible']});
  connect('hiashi-hyuga-support','named-support',s2([22]),hyuga,{conditions:['hyuga_target_eligible','hiashi_active']});
  connect('gai-rock-lee-support','named-support',s2([9]),rockLee,{conditions:['rock_lee_deployed','gai_active']});
  connect('sound-four-orochimaru-support','named-support',s2([46,47,48,49]),orochimaru,{conditions:['next_orochimaru_deployed']});
  connect('edo-tensei-summon-targets','summon',s2([86]),s2([68,69]),{conditions:['eligible_ally_withdraws_from_initial_weaken','edo_target_in_deck']});
  connect('choza-old-friends','named-support',s2([18]),s2([19,20,64,65]),{conditions:['matching_inoichi_or_shikaku','choza_active']});
  connect('inoichi-old-friends','named-support',s2([19]),s2([18,20,63,65]),{conditions:['matching_choza_or_shikaku','inoichi_active']});
  connect('shikaku-old-friends','named-support',s2([20]),s2([18,19,63,64]),{conditions:['matching_choza_or_inoichi','shikaku_active']});
  connect('toad-family-support','named-support',join(s2([32,33,73,83]),s3([35])),frogs,{conditions:['matching_toad_target','individual_summon_or_support_condition']});
  connect('tonton-tsunade-support','named-support',s3([27]),tsunade,{conditions:['tsunade_active','tonton_reaches_tsunade']});
  connect('tsume-ninja-hound-support','named-support',s3([28]),join(s1([34,37,61]),s3([55])),{conditions:['next_ninja_hound_deployed']});
  connect('sasuke-family-support','named-support',s3([19,43]),sasuke,{conditions:['next_sasuke_deployed','lane_controls_itachi_bonus','mikoto_heal_requires_chakra_loss']});
  connect('fugaku-uchiha-support','named-support',s3([33]),uchiha,{conditions:['uchiha_deployed','chakra_threshold_controls_bonus']});
  connect('yoshino-shikamaru-support','named-support',s3([49]),shikamaru,{conditions:['next_shikamaru_deployed']});
  connect('shared-dream','trigger',s3([1,32,45]),s3([1,32,45]),{conditions:['another_shared_dream_card_withdraws','beneficiary_active']});


  // Deck-list audit: explicit missing triggers and conditional support plans.
  connect('iruka-shogi-pin','trigger',s1([72]),s2([78]),{conditions:['shikamaru_active','deployed_ally_has_2_chakra','iruka_pins_that_ally']});
  connect('kiba-withdrawal-reactors','trigger',s3([79]),s1([78,54]),{conditions:['reactor_active','real_kiba_or_akamaru_withdraws','zabuza_requires_same_lane','zabuza_first_trigger_available'],requiresAny:without(join(kiba,akamaru),'S3_079')});
  connect('edo-withdrawal-reactors','trigger',s2([86]),s1([78,54]),{conditions:['initial_weaken_causes_ally_withdrawal','reactor_active','zabuza_requires_same_lane','zabuza_first_trigger_available']});
  connect('edo-low-chakra-withdrawal-payoffs','trigger',s2([86]),s1([19,42]),{conditions:['sacrifice_among_two_lowest_allies','current_chakra_at_most_2','withdrawal_actually_occurs']});
  connect('kyubi-rage-withdrawal-plan','shared-plan',s2([16,91]),s1([78]),{strength:'strategic',conditions:['planned_repeated_withdrawals','kyubi_rage_active_on_withdrawal']});
  connect('heal-friendly-weaken-cost','mitigate',s3([60,62]),s1([20,85]),{strength:'conditional',conditions:['heals_damaged_ally_not_damage_source','first_heal_trigger_available','heal_target_in_range']});
  connect('heal-grown-naruto','recover',s3([62]),s2([91]),{strength:'strategic',conditions:['same_lane','naruto_base_chakra_has_grown','naruto_below_base_chakra','first_heal_trigger_available']});
  connect('sakura-enemy-lane-entry','trigger',enemySwitch,s1([67]),{conditions:['enemy_arrives_in_sakura_lane','sakura_active']});
  connect('focus-completion-delay','tradeoff',s3([29]),join(s2([94]),s3([99])),{strength:'conditional',conditions:['longer_focus_delays_completion','friendly_weaken_during_focus']});

  return rules;
})();


const SYNERGIES = (() => {
  const byKey=new Map(CARDS.map(card=>[card.card_key,card.index])),graph=new Map();
  // Broad strategic affinities belong in recommendations, not in the mechanical browsing list.
  for (const rule of SYNERGY_RULES.filter(rule=>rule.strength!=='strategic' && rule.kind!=='tradeoff')) for (const enabler of rule.enablers) for (const beneficiary of rule.beneficiaries) {
    if (enabler===beneficiary) continue;
    for (const [from,to] of [[enabler,beneficiary],[beneficiary,enabler]]) {
      const index=byKey.get(from);
      if (!graph.has(index)) graph.set(index,new Set());
      graph.get(index).add(byKey.get(to));
    }
  }
  return [...graph].sort(([a],[b])=>a-b).map(([index,partners])=>({index,partners:[...partners].sort((a,b)=>a-b)}));
})();

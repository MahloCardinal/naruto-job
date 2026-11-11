'use strict';

// Language-independent card data and calculation rules. Indices stay stable for deck files.
const DEFAULT_SCENARIO = {"enemyChakra": 4, "enemies": 3, "allyChakra": 4, "allies": 2, "activations": 2};
const CARD_ART = {width:600,height:649};
const CARDS = [
{"card_key":"S1_001","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":1,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_002","season":1,"rarity":"Common","energy_cost":2,"chakra":1,"index":2,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_003","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":3,"skill_types_original":["Chakra","Summon"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[1]},{"C":[],"W":[],"H":[],"B":[],"K":[2]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_004","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":4,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_005","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":5,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_006","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":6,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_007","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":7,"skill_types_original":["Chakra","Pin"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_008","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":8,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_009","season":1,"rarity":"Common","energy_cost":3,"chakra":5,"index":9,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[5,6]},
{"card_key":"S1_010","season":1,"rarity":"Common","energy_cost":3,"chakra":5,"index":10,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_011","season":1,"rarity":"Common","energy_cost":3,"chakra":3,"index":11,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_012","season":1,"rarity":"Common","energy_cost":4,"chakra":5,"index":12,"skill_types_original":["Slow","Switch","Chakra"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_013","season":1,"rarity":"Common","energy_cost":5,"chakra":5,"index":13,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_014","season":1,"rarity":"Common","energy_cost":3,"chakra":3,"index":14,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_015","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":15,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_016","season":1,"rarity":"Common","energy_cost":3,"chakra":3,"index":16,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_017","season":1,"rarity":"Common","energy_cost":3,"chakra":1,"index":17,"skill_types_original":[],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_018","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":18,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S1_019","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":19,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_020","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":20,"skill_types_original":["Weaken","Chakra"],"effect_values":[{"C":[3],"W":[2],"H":[],"B":[],"K":[]},{"C":[4],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_021","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":21,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_022","season":1,"rarity":"Common","energy_cost":2,"chakra":1,"index":22,"skill_types_original":["Chakra","Slow"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_023","season":1,"rarity":"Common","energy_cost":2,"chakra":3,"index":23,"skill_types_original":["Weaken","Teleport"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_024","season":1,"rarity":"Common","energy_cost":2,"chakra":1,"index":24,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_025","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":25,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S1_026","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":26,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S1_027","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":27,"skill_types_original":["Chakra","Push"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_028","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":28,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_029","season":1,"rarity":"Common","energy_cost":1,"chakra":2,"index":29,"skill_types_original":["Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_030","season":1,"rarity":"Common","energy_cost":4,"chakra":5,"index":30,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_031","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":31,"skill_types_original":["Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_032","season":1,"rarity":"Common","energy_cost":1,"chakra":2,"index":32,"skill_types_original":["Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_033","season":1,"rarity":"Common","energy_cost":2,"chakra":2,"index":33,"skill_types_original":["Summon","Chakra"],"effect_values":[{"C":[1,1],"W":[],"H":[],"B":[],"K":[]},{"C":[2,2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_034","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":34,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[6,7]},
{"card_key":"S1_035","season":1,"rarity":"Common","energy_cost":3,"chakra":2,"index":35,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[2],"W":[1],"H":[],"B":[],"K":[]},{"C":[2],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_036","season":1,"rarity":"Common","energy_cost":3,"chakra":4,"index":36,"skill_types_original":["Push","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_037","season":1,"rarity":"Common","energy_cost":3,"chakra":1,"index":37,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,3]},
{"card_key":"S1_038","season":1,"rarity":"Common","energy_cost":2,"chakra":1,"index":38,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_039","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":39,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S1_040","season":1,"rarity":"Common","energy_cost":1,"chakra":1,"index":40,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S1_041","season":1,"rarity":"Common","energy_cost":4,"chakra":4,"index":41,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S1_042","season":1,"rarity":"Rare","energy_cost":2,"chakra":1,"index":42,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_043","season":1,"rarity":"Rare","energy_cost":3,"chakra":1,"index":43,"skill_types_original":["Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_044","season":1,"rarity":"Rare","energy_cost":1,"chakra":1,"index":44,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_045","season":1,"rarity":"Rare","energy_cost":2,"chakra":1,"index":45,"skill_types_original":["Chakra","Slow"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_046","season":1,"rarity":"Rare","energy_cost":3,"chakra":2,"index":46,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_047","season":1,"rarity":"Rare","energy_cost":1,"chakra":2,"index":47,"skill_types_original":[],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_048","season":1,"rarity":"Rare","energy_cost":2,"chakra":2,"index":48,"skill_types_original":["Pin","Teleport"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_049","season":1,"rarity":"Rare","energy_cost":3,"chakra":2,"index":49,"skill_types_original":["Pin","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_050","season":1,"rarity":"Rare","energy_cost":5,"chakra":6,"index":50,"skill_types_original":["Chakra","Rush"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_051","season":1,"rarity":"Rare","energy_cost":2,"chakra":1,"index":51,"skill_types_original":["Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_052","season":1,"rarity":"Rare","energy_cost":3,"chakra":3,"index":52,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_053","season":1,"rarity":"Rare","energy_cost":4,"chakra":5,"index":53,"skill_types_original":["Pin","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_054","season":1,"rarity":"Rare","energy_cost":4,"chakra":5,"index":54,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_055","season":1,"rarity":"Rare","energy_cost":1,"chakra":1,"index":55,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_056","season":1,"rarity":"Rare","energy_cost":4,"chakra":1,"index":56,"skill_types_original":["Summon","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_057","season":1,"rarity":"Rare","energy_cost":1,"chakra":1,"index":57,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_058","season":1,"rarity":"Rare","energy_cost":5,"chakra":3,"index":58,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[2],"W":[1],"H":[],"B":[],"K":[]},{"C":[3],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,true],"rush":[0,0]},
{"card_key":"S1_059","season":1,"rarity":"Rare","energy_cost":2,"chakra":1,"index":59,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_060","season":1,"rarity":"Rare","energy_cost":3,"chakra":1,"index":60,"skill_types_original":["Focus","Summon"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_061","season":1,"rarity":"Rare","energy_cost":2,"chakra":2,"index":61,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_062","season":1,"rarity":"Rare","energy_cost":3,"chakra":1,"index":62,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_063","season":1,"rarity":"Epic","energy_cost":3,"chakra":1,"index":63,"skill_types_original":["Chakra","Summon"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[1]},{"C":[],"W":[],"H":[],"B":[],"K":[1]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_064","season":1,"rarity":"Epic","energy_cost":3,"chakra":2,"index":64,"skill_types_original":["Chakra"],"effect_values":[{"C":[5],"W":[],"H":[],"B":[],"K":[]},{"C":[6],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_065","season":1,"rarity":"Epic","energy_cost":2,"chakra":1,"index":65,"skill_types_original":["Pin","Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,4]},
{"card_key":"S1_066","season":1,"rarity":"Epic","energy_cost":3,"chakra":3,"index":66,"skill_types_original":[],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_067","season":1,"rarity":"Epic","energy_cost":3,"chakra":2,"index":67,"skill_types_original":["Chakra"],"effect_values":[{"C":[3,1],"W":[],"H":[],"B":[],"K":[]},{"C":[3,2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_068","season":1,"rarity":"Epic","energy_cost":3,"chakra":5,"index":68,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_069","season":1,"rarity":"Epic","energy_cost":5,"chakra":5,"index":69,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_070","season":1,"rarity":"Epic","energy_cost":4,"chakra":5,"index":70,"skill_types_original":["Weaken","Guard"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_071","season":1,"rarity":"Epic","energy_cost":3,"chakra":5,"index":71,"skill_types_original":["Summon","Chakra"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[2]},{"C":[],"W":[],"H":[],"B":[],"K":[2]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_072","season":1,"rarity":"Epic","energy_cost":4,"chakra":3,"index":72,"skill_types_original":["Chakra","Pin"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_073","season":1,"rarity":"Epic","energy_cost":5,"chakra":6,"index":73,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_074","season":1,"rarity":"Epic","energy_cost":3,"chakra":5,"index":74,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_075","season":1,"rarity":"Epic","energy_cost":3,"chakra":3,"index":75,"skill_types_original":["Pin","Weaken","Switch"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_076","season":1,"rarity":"Epic","energy_cost":5,"chakra":6,"index":76,"skill_types_original":["Chakra","Push"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_077","season":1,"rarity":"Legendary","energy_cost":5,"chakra":2,"index":77,"skill_types_original":["Chakra","Rush","Summon"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[2]},{"C":[1],"W":[],"H":[],"B":[],"K":[2]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,6]},
{"card_key":"S1_078","season":1,"rarity":"Legendary","energy_cost":4,"chakra":3,"index":78,"skill_types_original":["Chakra","Rush"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_079","season":1,"rarity":"Legendary","energy_cost":4,"chakra":3,"index":79,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_080","season":1,"rarity":"Legendary","energy_cost":4,"chakra":2,"index":80,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_081","season":1,"rarity":"Legendary","energy_cost":3,"chakra":3,"index":81,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_082","season":1,"rarity":"Legendary","energy_cost":7,"chakra":5,"index":82,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[1,1],"W":[],"H":[],"B":[],"K":[]},{"C":[2,1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_083","season":1,"rarity":"Legendary","energy_cost":5,"chakra":3,"index":83,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[1,3],"H":[],"B":[],"K":[]},{"C":[],"W":[1,4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S1_084","season":1,"rarity":"Legendary","energy_cost":7,"chakra":5,"index":84,"skill_types_original":["Weaken","Rush","Switch"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S1_085","season":1,"rarity":"Legendary","energy_cost":6,"chakra":7,"index":85,"skill_types_original":["Weaken","Push","Slow"],"effect_values":[{"C":[],"W":[3,1],"H":[],"B":[],"K":[]},{"C":[],"W":[4,1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_001","season":2,"rarity":"Common","energy_cost":2,"chakra":2,"index":86,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_002","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":87,"skill_types_original":["Pin","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_003","season":2,"rarity":"Common","energy_cost":2,"chakra":2,"index":88,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_004","season":2,"rarity":"Common","energy_cost":1,"chakra":1,"index":89,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S2_005","season":2,"rarity":"Common","energy_cost":2,"chakra":2,"index":90,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_006","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":91,"skill_types_original":["Chakra","Switch"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_007","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":92,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_008","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":93,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_009","season":2,"rarity":"Common","energy_cost":4,"chakra":5,"index":94,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_010","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":95,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_011","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":96,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_012","season":2,"rarity":"Common","energy_cost":2,"chakra":2,"index":97,"skill_types_original":["Guard","Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_013","season":2,"rarity":"Common","energy_cost":3,"chakra":4,"index":98,"skill_types_original":["Rush","Guard"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S2_014","season":2,"rarity":"Common","energy_cost":1,"chakra":1,"index":99,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S2_015","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":100,"skill_types_original":["Chakra","Pin"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_016","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":101,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[1]},{"C":[],"W":[],"H":[],"B":[],"K":[1]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S2_017","season":2,"rarity":"Common","energy_cost":3,"chakra":4,"index":102,"skill_types_original":["Push","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_018","season":2,"rarity":"Common","energy_cost":4,"chakra":5,"index":103,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_019","season":2,"rarity":"Common","energy_cost":4,"chakra":5,"index":104,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_020","season":2,"rarity":"Common","energy_cost":4,"chakra":5,"index":105,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_021","season":2,"rarity":"Common","energy_cost":2,"chakra":2,"index":106,"skill_types_original":["Rush","Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S2_022","season":2,"rarity":"Common","energy_cost":6,"chakra":5,"index":107,"skill_types_original":["Chakra","Push"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_023","season":2,"rarity":"Common","energy_cost":4,"chakra":5,"index":108,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S2_024","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":109,"skill_types_original":["Push","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_025","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":110,"skill_types_original":["Weaken","Pin","Switch"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_026","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":111,"skill_types_original":["Weaken","Pin"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_027","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":112,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_028","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":113,"skill_types_original":["Slow","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_029","season":2,"rarity":"Common","energy_cost":4,"chakra":2,"index":114,"skill_types_original":["Chakra","Summon"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[1]},{"C":[],"W":[],"H":[],"B":[],"K":[2]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_030","season":2,"rarity":"Common","energy_cost":3,"chakra":2,"index":115,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[2],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_031","season":2,"rarity":"Common","energy_cost":4,"chakra":2,"index":116,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_032","season":2,"rarity":"Common","energy_cost":5,"chakra":3,"index":117,"skill_types_original":["Summon","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_033","season":2,"rarity":"Common","energy_cost":3,"chakra":1,"index":118,"skill_types_original":["Push","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_034","season":2,"rarity":"Common","energy_cost":3,"chakra":4,"index":119,"skill_types_original":["Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_035","season":2,"rarity":"Common","energy_cost":4,"chakra":4,"index":120,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S2_036","season":2,"rarity":"Common","energy_cost":2,"chakra":1,"index":121,"skill_types_original":["Guard","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_037","season":2,"rarity":"Common","energy_cost":2,"chakra":1,"index":122,"skill_types_original":["Summon"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_038","season":2,"rarity":"Common","energy_cost":5,"chakra":4,"index":123,"skill_types_original":["Focus","Summon","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_039","season":2,"rarity":"Common","energy_cost":3,"chakra":4,"index":124,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_040","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":125,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_041","season":2,"rarity":"Common","energy_cost":2,"chakra":1,"index":126,"skill_types_original":["Chakra","Slow"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_042","season":2,"rarity":"Common","energy_cost":4,"chakra":4,"index":127,"skill_types_original":["Rush","Guard","Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S2_043","season":2,"rarity":"Common","energy_cost":2,"chakra":3,"index":128,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,5]},
{"card_key":"S2_044","season":2,"rarity":"Common","energy_cost":4,"chakra":4,"index":129,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,4]},
{"card_key":"S2_045","season":2,"rarity":"Common","energy_cost":5,"chakra":5,"index":130,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[5,6]},
{"card_key":"S2_046","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":131,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_047","season":2,"rarity":"Common","energy_cost":2,"chakra":3,"index":132,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_048","season":2,"rarity":"Common","energy_cost":3,"chakra":3,"index":133,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_049","season":2,"rarity":"Common","energy_cost":2,"chakra":3,"index":134,"skill_types_original":["Guard"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_050","season":2,"rarity":"Common","energy_cost":3,"chakra":4,"index":135,"skill_types_original":["Chakra","Rush"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,5]},
{"card_key":"S2_051","season":2,"rarity":"Rare","energy_cost":3,"chakra":3,"index":136,"skill_types_original":["Guard","Rush","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,2]},
{"card_key":"S2_052","season":2,"rarity":"Rare","energy_cost":2,"chakra":2,"index":137,"skill_types_original":["Weaken","Guard"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_053","season":2,"rarity":"Rare","energy_cost":3,"chakra":2,"index":138,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_054","season":2,"rarity":"Rare","energy_cost":3,"chakra":3,"index":139,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,4]},
{"card_key":"S2_055","season":2,"rarity":"Rare","energy_cost":2,"chakra":3,"index":140,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_056","season":2,"rarity":"Rare","energy_cost":4,"chakra":5,"index":141,"skill_types_original":["Chakra","Pin"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_057","season":2,"rarity":"Rare","energy_cost":3,"chakra":2,"index":142,"skill_types_original":["Weaken","Push","Rush"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[3,4]},
{"card_key":"S2_058","season":2,"rarity":"Rare","energy_cost":4,"chakra":2,"index":143,"skill_types_original":["Focus"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_059","season":2,"rarity":"Rare","energy_cost":2,"chakra":2,"index":144,"skill_types_original":["Push","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_060","season":2,"rarity":"Rare","energy_cost":3,"chakra":3,"index":145,"skill_types_original":["Guard","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_061","season":2,"rarity":"Rare","energy_cost":3,"chakra":2,"index":146,"skill_types_original":["Guard","Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_062","season":2,"rarity":"Rare","energy_cost":3,"chakra":4,"index":147,"skill_types_original":["Weaken","Pin"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_063","season":2,"rarity":"Rare","energy_cost":5,"chakra":5,"index":148,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_064","season":2,"rarity":"Rare","energy_cost":6,"chakra":5,"index":149,"skill_types_original":["Focus","Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_065","season":2,"rarity":"Rare","energy_cost":4,"chakra":5,"index":150,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_066","season":2,"rarity":"Rare","energy_cost":4,"chakra":6,"index":151,"skill_types_original":["Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_067","season":2,"rarity":"Rare","energy_cost":5,"chakra":6,"index":152,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_068","season":2,"rarity":"Rare","energy_cost":4,"chakra":5,"index":153,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_069","season":2,"rarity":"Rare","energy_cost":4,"chakra":5,"index":154,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_070","season":2,"rarity":"Rare","energy_cost":6,"chakra":6,"index":155,"skill_types_original":["Chakra"],"effect_values":[{"C":[2,2],"W":[],"H":[],"B":[],"K":[]},{"C":[3,2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_071","season":2,"rarity":"Rare","energy_cost":4,"chakra":4,"index":156,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_072","season":2,"rarity":"Rare","energy_cost":4,"chakra":4,"index":157,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_073","season":2,"rarity":"Rare","energy_cost":5,"chakra":4,"index":158,"skill_types_original":["Chakra","Slow"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_074","season":2,"rarity":"Epic","energy_cost":4,"chakra":3,"index":159,"skill_types_original":["Weaken","Guard"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_075","season":2,"rarity":"Epic","energy_cost":4,"chakra":2,"index":160,"skill_types_original":["Rush","Push","Weaken","Switch"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[3,3]},
{"card_key":"S2_076","season":2,"rarity":"Epic","energy_cost":4,"chakra":3,"index":161,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_077","season":2,"rarity":"Epic","energy_cost":3,"chakra":2,"index":162,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,5]},
{"card_key":"S2_078","season":2,"rarity":"Epic","energy_cost":6,"chakra":2,"index":163,"skill_types_original":["Pin","Chakra","Focus"],"effect_values":[{"C":[3,3],"W":[],"H":[],"B":[],"K":[]},{"C":[4,3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_079","season":2,"rarity":"Epic","energy_cost":4,"chakra":5,"index":164,"skill_types_original":["Weaken","Rush"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_080","season":2,"rarity":"Epic","energy_cost":3,"chakra":1,"index":165,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_081","season":2,"rarity":"Epic","energy_cost":5,"chakra":3,"index":166,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_082","season":2,"rarity":"Epic","energy_cost":3,"chakra":2,"index":167,"skill_types_original":["Chakra","Weaken","Slow","Switch"],"effect_values":[{"C":[1],"W":[3],"H":[],"B":[],"K":[]},{"C":[1],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_083","season":2,"rarity":"Epic","energy_cost":5,"chakra":6,"index":168,"skill_types_original":["Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_084","season":2,"rarity":"Epic","energy_cost":4,"chakra":6,"index":169,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_085","season":2,"rarity":"Epic","energy_cost":6,"chakra":6,"index":170,"skill_types_original":["Weaken","Switch","Guard"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_086","season":2,"rarity":"Epic","energy_cost":6,"chakra":6,"index":171,"skill_types_original":["Weaken","Summon","Rush"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,5]},
{"card_key":"S2_087","season":2,"rarity":"Epic","energy_cost":5,"chakra":5,"index":172,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_088","season":2,"rarity":"Epic","energy_cost":5,"chakra":5,"index":173,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_089","season":2,"rarity":"Epic","energy_cost":6,"chakra":6,"index":174,"skill_types_original":["Weaken","Burn"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[4],"K":[]},{"C":[],"W":[3],"H":[],"B":[5],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_090","season":2,"rarity":"Epic","energy_cost":3,"chakra":4,"index":175,"skill_types_original":["Chakra","Switch"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_091","season":2,"rarity":"Legendary","energy_cost":4,"chakra":3,"index":176,"skill_types_original":["Chakra","Rush"],"effect_values":[{"C":[4],"W":[],"H":[],"B":[],"K":[]},{"C":[5],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,3]},
{"card_key":"S2_092","season":2,"rarity":"Legendary","energy_cost":4,"chakra":3,"index":177,"skill_types_original":["Chakra"],"effect_values":[{"C":[3,2],"W":[],"H":[],"B":[],"K":[]},{"C":[4,2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_093","season":2,"rarity":"Legendary","energy_cost":3,"chakra":2,"index":178,"skill_types_original":["Guard","Chakra","Switch"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_094","season":2,"rarity":"Legendary","energy_cost":6,"chakra":3,"index":179,"skill_types_original":["Chakra","Weaken","Focus"],"effect_values":[{"C":[7],"W":[2,1],"H":[],"B":[],"K":[]},{"C":[7],"W":[2,1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_095","season":2,"rarity":"Legendary","energy_cost":3,"chakra":3,"index":180,"skill_types_original":["Push","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S2_096","season":2,"rarity":"Legendary","energy_cost":5,"chakra":3,"index":181,"skill_types_original":["Guard","Pin","Chakra","Weaken"],"effect_values":[{"C":[2],"W":[3],"H":[],"B":[],"K":[]},{"C":[2],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_097","season":2,"rarity":"Legendary","energy_cost":5,"chakra":6,"index":182,"skill_types_original":["Weaken","Slow","Burn"],"effect_values":[{"C":[],"W":[1,2],"H":[],"B":[3],"K":[]},{"C":[],"W":[1,2],"H":[],"B":[4],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_098","season":2,"rarity":"Legendary","energy_cost":7,"chakra":6,"index":183,"skill_types_original":["Focus","Seal"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_099","season":2,"rarity":"Legendary","energy_cost":6,"chakra":8,"index":184,"skill_types_original":["Weaken","Focus"],"effect_values":[{"C":[],"W":[2,2],"H":[],"B":[],"K":[]},{"C":[],"W":[3,3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S2_100","season":2,"rarity":"Legendary","energy_cost":6,"chakra":8,"index":185,"skill_types_original":["Chakra"],"effect_values":[{"C":[7],"W":[],"H":[],"B":[],"K":[]},{"C":[8],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_001","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":186,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_002","season":3,"rarity":"Common","energy_cost":2,"chakra":1,"index":187,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[1,2]},
{"card_key":"S3_003","season":3,"rarity":"Common","energy_cost":3,"chakra":2,"index":188,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_004","season":3,"rarity":"Common","energy_cost":3,"chakra":2,"index":189,"skill_types_original":["Teleport","Weaken","Pin"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_005","season":3,"rarity":"Common","energy_cost":3,"chakra":2,"index":190,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_006","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":191,"skill_types_original":["Guard","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_007","season":3,"rarity":"Common","energy_cost":1,"chakra":1,"index":192,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S3_008","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":193,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,5]},
{"card_key":"S3_009","season":3,"rarity":"Common","energy_cost":5,"chakra":6,"index":194,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_010","season":3,"rarity":"Common","energy_cost":6,"chakra":6,"index":195,"skill_types_original":["Focus","Chakra"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_011","season":3,"rarity":"Common","energy_cost":1,"chakra":2,"index":196,"skill_types_original":["Guard"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_012","season":3,"rarity":"Common","energy_cost":4,"chakra":6,"index":197,"skill_types_original":["Rush","Weaken","Switch"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,5]},
{"card_key":"S3_013","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":198,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S3_014","season":3,"rarity":"Common","energy_cost":4,"chakra":6,"index":199,"skill_types_original":["Guard","Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_015","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":200,"skill_types_original":["Rush","Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S3_016","season":3,"rarity":"Common","energy_cost":5,"chakra":7,"index":201,"skill_types_original":["Rush","Guard","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,4]},
{"card_key":"S3_017","season":3,"rarity":"Common","energy_cost":5,"chakra":6,"index":202,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_018","season":3,"rarity":"Common","energy_cost":7,"chakra":5,"index":203,"skill_types_original":["Slow","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_019","season":3,"rarity":"Common","energy_cost":4,"chakra":5,"index":204,"skill_types_original":["Chakra","Rush","Guard","Slow"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,5]},
{"card_key":"S3_020","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":205,"skill_types_original":["Guard","Push"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_021","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":206,"skill_types_original":["Guard","Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,4]},
{"card_key":"S3_022","season":3,"rarity":"Common","energy_cost":4,"chakra":3,"index":207,"skill_types_original":["Pin","Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_023","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":208,"skill_types_original":["Rush","Weaken"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,4]},
{"card_key":"S3_024","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":209,"skill_types_original":["Guard","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_025","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":210,"skill_types_original":["Guard","Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,4]},
{"card_key":"S3_026","season":3,"rarity":"Common","energy_cost":4,"chakra":4,"index":211,"skill_types_original":["Guard","Pin","Chakra","Weaken"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[1],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_027","season":3,"rarity":"Common","energy_cost":5,"chakra":5,"index":212,"skill_types_original":["Summon","Chakra","Rush"],"effect_values":[{"C":[3],"W":[],"H":[],"B":[],"K":[1]},{"C":[4],"W":[],"H":[],"B":[],"K":[1]}],"repeats":[false,false],"conditional":[false,false],"rush":[5,5]},
{"card_key":"S3_028","season":3,"rarity":"Common","energy_cost":5,"chakra":4,"index":213,"skill_types_original":["Summon","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[3]},{"C":[3],"W":[],"H":[],"B":[],"K":[3]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_029","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":214,"skill_types_original":["Focus","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_030","season":3,"rarity":"Common","energy_cost":2,"chakra":3,"index":215,"skill_types_original":["Rush","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S3_031","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":216,"skill_types_original":["Weaken","Slow"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_032","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":217,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_033","season":3,"rarity":"Common","energy_cost":5,"chakra":5,"index":218,"skill_types_original":["Guard","Slow","Chakra","Pin"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_034","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":219,"skill_types_original":["Guard","Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_035","season":3,"rarity":"Common","energy_cost":2,"chakra":1,"index":220,"skill_types_original":["Focus","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_036","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":221,"skill_types_original":["Rush","Weaken","Chakra"],"effect_values":[{"C":[2],"W":[1],"H":[],"B":[],"K":[]},{"C":[2],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S3_037","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":222,"skill_types_original":["Guard","Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_038","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":223,"skill_types_original":["Rush","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,5]},
{"card_key":"S3_039","season":3,"rarity":"Common","energy_cost":3,"chakra":1,"index":224,"skill_types_original":["Chakra","Rush","Guard"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[2,3]},
{"card_key":"S3_040","season":3,"rarity":"Common","energy_cost":5,"chakra":4,"index":225,"skill_types_original":["Push","Pin","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_041","season":3,"rarity":"Common","energy_cost":5,"chakra":4,"index":226,"skill_types_original":["Weaken","Switch"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_042","season":3,"rarity":"Common","energy_cost":2,"chakra":1,"index":227,"skill_types_original":["Rush","Switch","Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,5]},
{"card_key":"S3_043","season":3,"rarity":"Common","energy_cost":3,"chakra":4,"index":228,"skill_types_original":["Chakra","Heal"],"effect_values":[{"C":[1],"W":[],"H":[1],"B":[],"K":[]},{"C":[1],"W":[],"H":[2],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_044","season":3,"rarity":"Common","energy_cost":4,"chakra":3,"index":229,"skill_types_original":["Weaken","Chakra"],"effect_values":[{"C":[],"W":[4],"H":[],"B":[],"K":[1]},{"C":[],"W":[5],"H":[],"B":[],"K":[1]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_045","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":230,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_046","season":3,"rarity":"Common","energy_cost":3,"chakra":5,"index":231,"skill_types_original":["Weaken","Switch"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_047","season":3,"rarity":"Common","energy_cost":3,"chakra":3,"index":232,"skill_types_original":["Guard","Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_048","season":3,"rarity":"Common","energy_cost":2,"chakra":2,"index":233,"skill_types_original":["Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,3]},
{"card_key":"S3_049","season":3,"rarity":"Common","energy_cost":2,"chakra":3,"index":234,"skill_types_original":["Chakra","Slow"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_050","season":3,"rarity":"Common","energy_cost":4,"chakra":4,"index":235,"skill_types_original":["Rush","Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,6]},
{"card_key":"S3_051","season":3,"rarity":"Rare","energy_cost":5,"chakra":4,"index":236,"skill_types_original":["Rush","Chakra","Heal"],"effect_values":[{"C":[2],"W":[],"H":[2],"B":[],"K":[]},{"C":[2],"W":[],"H":[2],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,5]},
{"card_key":"S3_052","season":3,"rarity":"Rare","energy_cost":3,"chakra":3,"index":237,"skill_types_original":["Chakra"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[4],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_053","season":3,"rarity":"Rare","energy_cost":3,"chakra":2,"index":238,"skill_types_original":["Chakra","Teleport"],"effect_values":[{"C":[2],"W":[],"H":[],"B":[],"K":[]},{"C":[3],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_054","season":3,"rarity":"Rare","energy_cost":3,"chakra":3,"index":239,"skill_types_original":["Chakra","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_055","season":3,"rarity":"Rare","energy_cost":3,"chakra":1,"index":240,"skill_types_original":["Slow","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_056","season":3,"rarity":"Rare","energy_cost":5,"chakra":6,"index":241,"skill_types_original":["Chakra","Pin","Focus"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_057","season":3,"rarity":"Rare","energy_cost":3,"chakra":4,"index":242,"skill_types_original":["Rush","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S3_058","season":3,"rarity":"Rare","energy_cost":5,"chakra":6,"index":243,"skill_types_original":["Guard","Weaken"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_059","season":3,"rarity":"Rare","energy_cost":3,"chakra":4,"index":244,"skill_types_original":["Rush","Weaken"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[3,4]},
{"card_key":"S3_060","season":3,"rarity":"Rare","energy_cost":6,"chakra":6,"index":245,"skill_types_original":["Chakra","Weaken","Heal"],"effect_values":[{"C":[1],"W":[],"H":[2],"B":[],"K":[]},{"C":[2],"W":[],"H":[2],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_061","season":3,"rarity":"Rare","energy_cost":4,"chakra":6,"index":246,"skill_types_original":["Chakra","Rush"],"effect_values":[{"C":[6],"W":[],"H":[],"B":[],"K":[]},{"C":[7],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[3,4]},
{"card_key":"S3_062","season":3,"rarity":"Rare","energy_cost":4,"chakra":4,"index":247,"skill_types_original":["Heal"],"effect_values":[{"C":[],"W":[],"H":[2,2],"B":[],"K":[]},{"C":[],"W":[],"H":[3,3],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_063","season":3,"rarity":"Rare","energy_cost":5,"chakra":6,"index":248,"skill_types_original":["Weaken","Rush"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_064","season":3,"rarity":"Rare","energy_cost":4,"chakra":4,"index":249,"skill_types_original":["Rush","Teleport","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[2,3]},
{"card_key":"S3_065","season":3,"rarity":"Rare","energy_cost":6,"chakra":6,"index":250,"skill_types_original":["Guard","Weaken","Chakra"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[1],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_066","season":3,"rarity":"Rare","energy_cost":4,"chakra":4,"index":251,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[1],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_067","season":3,"rarity":"Rare","energy_cost":3,"chakra":4,"index":252,"skill_types_original":["Teleport","Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_068","season":3,"rarity":"Rare","energy_cost":3,"chakra":4,"index":253,"skill_types_original":["Teleport","Weaken","Slow"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_069","season":3,"rarity":"Rare","energy_cost":5,"chakra":5,"index":254,"skill_types_original":["Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_070","season":3,"rarity":"Rare","energy_cost":3,"chakra":3,"index":255,"skill_types_original":["Chakra","Weaken","Guard"],"effect_values":[{"C":[2],"W":[2,2],"H":[],"B":[],"K":[]},{"C":[3],"W":[2,2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_071","season":3,"rarity":"Rare","energy_cost":4,"chakra":3,"index":256,"skill_types_original":["Pin","Slow"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_072","season":3,"rarity":"Rare","energy_cost":4,"chakra":4,"index":257,"skill_types_original":["Guard","Weaken","Pin"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_073","season":3,"rarity":"Rare","energy_cost":3,"chakra":2,"index":258,"skill_types_original":["Chakra","Switch","Weaken"],"effect_values":[{"C":[1],"W":[2],"H":[],"B":[],"K":[]},{"C":[1],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_074","season":3,"rarity":"Epic","energy_cost":4,"chakra":3,"index":259,"skill_types_original":["Weaken","Push"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_075","season":3,"rarity":"Epic","energy_cost":4,"chakra":4,"index":260,"skill_types_original":["Weaken","Heal"],"effect_values":[{"C":[],"W":[1],"H":[3],"B":[],"K":[]},{"C":[],"W":[1],"H":[4],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_076","season":3,"rarity":"Epic","energy_cost":4,"chakra":3,"index":261,"skill_types_original":["Guard","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_077","season":3,"rarity":"Epic","energy_cost":3,"chakra":4,"index":262,"skill_types_original":["Guard","Weaken","Rush"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[2,4]},
{"card_key":"S3_078","season":3,"rarity":"Epic","energy_cost":5,"chakra":3,"index":263,"skill_types_original":["Guard"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_079","season":3,"rarity":"Epic","energy_cost":3,"chakra":3,"index":264,"skill_types_original":["Chakra","Weaken"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[2],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_080","season":3,"rarity":"Epic","energy_cost":3,"chakra":3,"index":265,"skill_types_original":["Chakra","Weaken","Rush","Guard","Focus"],"effect_values":[{"C":[1],"W":[1],"H":[],"B":[],"K":[]},{"C":[1],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[2,2]},
{"card_key":"S3_081","season":3,"rarity":"Epic","energy_cost":5,"chakra":2,"index":266,"skill_types_original":["Focus","Weaken","Push"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_082","season":3,"rarity":"Epic","energy_cost":5,"chakra":6,"index":267,"skill_types_original":["Summon","Rush"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[4,6]},
{"card_key":"S3_083","season":3,"rarity":"Epic","energy_cost":7,"chakra":6,"index":268,"skill_types_original":["Burn","Switch"],"effect_values":[{"C":[],"W":[],"H":[],"B":[10],"K":[]},{"C":[],"W":[],"H":[],"B":[15],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_084","season":3,"rarity":"Epic","energy_cost":6,"chakra":6,"index":269,"skill_types_original":["Burn","Focus","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[3,4],"K":[]},{"C":[1],"W":[],"H":[],"B":[3,5],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_085","season":3,"rarity":"Epic","energy_cost":5,"chakra":6,"index":270,"skill_types_original":["Burn"],"effect_values":[{"C":[],"W":[],"H":[],"B":[3],"K":[]},{"C":[],"W":[],"H":[],"B":[4],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_086","season":3,"rarity":"Epic","energy_cost":4,"chakra":4,"index":271,"skill_types_original":["Chakra","Weaken","Pin","Focus"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_087","season":3,"rarity":"Epic","energy_cost":4,"chakra":4,"index":272,"skill_types_original":["Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[2],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_088","season":3,"rarity":"Epic","energy_cost":4,"chakra":3,"index":273,"skill_types_original":["Guard","Weaken","Switch"],"effect_values":[{"C":[],"W":[2],"H":[],"B":[],"K":[]},{"C":[],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_089","season":3,"rarity":"Epic","energy_cost":4,"chakra":4,"index":274,"skill_types_original":["Push","Weaken","Pin"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_090","season":3,"rarity":"Epic","energy_cost":3,"chakra":5,"index":275,"skill_types_original":["Focus","Weaken","Push"],"effect_values":[{"C":[],"W":[3],"H":[],"B":[],"K":[]},{"C":[],"W":[3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_091","season":3,"rarity":"Legendary","energy_cost":5,"chakra":4,"index":276,"skill_types_original":["Rush","Chakra","Weaken"],"effect_values":[{"C":[2],"W":[3,2],"H":[],"B":[],"K":[]},{"C":[2],"W":[4,2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,5]},
{"card_key":"S3_092","season":3,"rarity":"Legendary","energy_cost":5,"chakra":4,"index":277,"skill_types_original":["Weaken","Push","Rush","Guard"],"effect_values":[{"C":[],"W":[3,2],"H":[],"B":[],"K":[]},{"C":[],"W":[4,2],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[false,false],"rush":[4,5]},
{"card_key":"S3_093","season":3,"rarity":"Legendary","energy_cost":5,"chakra":3,"index":278,"skill_types_original":["Chakra","Weaken","Push","Guard"],"effect_values":[{"C":[2],"W":[2],"H":[],"B":[],"K":[]},{"C":[3],"W":[2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_094","season":3,"rarity":"Legendary","energy_cost":6,"chakra":3,"index":279,"skill_types_original":["Focus","Weaken","Push","Seal"],"effect_values":[{"C":[],"W":[1,2],"H":[],"B":[],"K":[]},{"C":[],"W":[1,3],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_095","season":3,"rarity":"Legendary","energy_cost":6,"chakra":6,"index":280,"skill_types_original":["Pin"],"effect_values":[{"C":[],"W":[],"H":[],"B":[],"K":[]},{"C":[],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_096","season":3,"rarity":"Legendary","energy_cost":7,"chakra":6,"index":281,"skill_types_original":["Weaken","Pin","Switch"],"effect_values":[{"C":[],"W":[1,3],"H":[],"B":[],"K":[]},{"C":[],"W":[2,4],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_097","season":3,"rarity":"Legendary","energy_cost":6,"chakra":6,"index":282,"skill_types_original":["Chakra","Heal"],"effect_values":[{"C":[4],"W":[],"H":[4],"B":[],"K":[]},{"C":[5],"W":[],"H":[4],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"S3_098","season":3,"rarity":"Legendary","energy_cost":5,"chakra":4,"index":283,"skill_types_original":["Guard","Chakra"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_099","season":3,"rarity":"Legendary","energy_cost":6,"chakra":4,"index":284,"skill_types_original":["Chakra","Summon","Focus"],"effect_values":[{"C":[1],"W":[],"H":[],"B":[],"K":[]},{"C":[1],"W":[],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"S3_100","season":3,"rarity":"Legendary","energy_cost":9,"chakra":5,"index":285,"skill_types_original":["Chakra","Rush","Guard","Weaken"],"effect_values":[{"C":[6],"W":[1,3,2],"H":[],"B":[],"K":[]},{"C":[8],"W":[1,3,2],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[5,6]},
// Event Scrolls, November 2026: https://nncmeta.site/news/event-scroll-cards
{"card_key":"ES_001","season":"ES","rarity":"Rare","energy_cost":3,"chakra":2,"index":286,"skill_types_original":["Heal","Burn","Pin","Weaken"],"effect_values":[{"C":[],"W":[],"H":[1,2],"B":[],"K":[]},{"C":[],"W":[],"H":[1,4],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"ES_002","season":"ES","rarity":"Rare","energy_cost":5,"chakra":4,"index":287,"skill_types_original":["Weaken"],"effect_values":[{"C":[],"W":[10],"H":[],"B":[],"K":[]},{"C":[],"W":[12],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]},
{"card_key":"ES_003","season":"ES","rarity":"Epic","energy_cost":6,"chakra":5,"index":288,"skill_types_original":["Guard","Weaken","Drain"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[false,false],"rush":[0,0]},
{"card_key":"ES_004","season":"ES","rarity":"Epic","energy_cost":8,"chakra":6,"index":289,"skill_types_original":["Guard","Focus","Pin","Weaken","Drain"],"effect_values":[{"C":[],"W":[1],"H":[],"B":[],"K":[]},{"C":[],"W":[1],"H":[],"B":[],"K":[]}],"repeats":[true,true],"conditional":[true,true],"rush":[0,0]},
{"card_key":"ES_005","season":"ES","rarity":"Legendary","energy_cost":5,"chakra":4,"index":290,"skill_types_original":["Focus","Weaken"],"effect_values":[{"C":[],"W":[10],"H":[],"B":[],"K":[]},{"C":[],"W":[12],"H":[],"B":[],"K":[]}],"repeats":[false,false],"conditional":[true,true],"rush":[0,0]}
];
const RULES = {
  "ES_001": { "expr": "H0*a1+H1*a1" },
  "ES_002": { "expr": "W0*e1-2*A" },
  "ES_003": { "expr": "W0*3*e1+drain1*e1*N" },
  "ES_004": { "expr": ["drain4*e1+W0*3*e1+drain2*e1", "drain5*e1+W0*3*e1+drain2*e1"] },
  "ES_005": { "expr": "W0*e1" },
  "S1_001": {
    "expr": "auto"
  },
  "S1_002": {
    "expr": "auto"
  },
  "S1_011": {
    "expr": "auto"
  },
  "S1_013": {
    "expr": "W0*e1"
  },
  "S1_015": {
    "expr": "W0*e1"
  },
  "S1_016": {
    "expr": "C0*a1"
  },
  "S1_027": {
    "expr": "C0*a1"
  },
  "S1_041": {
    "expr": "C0*a1"
  },
  "S1_042": {
    "expr": "W0*e1"
  },
  "S1_045": {
    "expr": "auto"
  },
  "S1_052": {
    "expr": "C0*a1"
  },
  "S1_054": {
    "expr": "auto"
  },
  "S1_059": {
    "expr": "W0*e1"
  },
  "S1_064": {
    "expr": "auto"
  },
  "S1_068": {
    "expr": "W0*e1"
  },
  "S1_070": {
    "expr": "W0*e1"
  },
  "S1_076": {
    "expr": "C0*N"
  },
  "S1_078": {
    "expr": "C0*N"
  },
  "S1_080": {
    "expr": "C0*N"
  },
  "S2_001": {
    "expr": "auto"
  },
  "S2_003": {
    "expr": "W0*e1"
  },
  "S2_006": {
    "expr": "C0*a1"
  },
  "S2_009": {
    "expr": "C0*a1*N"
  },
  "S2_010": {
    "expr": "auto"
  },
  "S2_011": {
    "expr": "C0*a1"
  },
  "S2_026": {
    "expr": "W0*e1"
  },
  "S2_031": {
    "expr": "C0*a1*N"
  },
  "S2_033": {
    "expr": "C0*N"
  },
  "S2_036": {
    "expr": "C0*a1"
  },
  "S2_041": {
    "expr": "C0*A"
  },
  "S2_044": {
    "expr": "C0*a1"
  },
  "S2_046": {
    "expr": "C0*a1"
  },
  "S2_048": {
    "expr": "W0*e1"
  },
  "S2_050": {
    "expr": "auto"
  },
  "S2_055": {
    "expr": "C0*N"
  },
  "S2_056": {
    "expr": "C0*a1"
  },
  "S2_060": {
    "expr": "C0*N"
  },
  "S2_081": {
    "expr": "C0*N"
  },
  "S2_084": {
    "expr": "auto"
  },
  "S2_090": {
    "expr": "C0*a1*N"
  },
  "S2_100": {
    "expr": "C0*a1"
  },
  "S3_001": {
    "expr": "C0*N"
  },
  "S3_003": {
    "expr": "W0*e1*N"
  },
  "S3_005": {
    "expr": "W0*e1*N"
  },
  "S3_010": {
    "expr": "C0*a1*N"
  },
  "S3_012": {
    "expr": "W0*e1*N"
  },
  "S3_019": {
    "expr": "C0*a1"
  },
  "S3_030": {
    "expr": "W0*e1"
  },
  "S3_032": {
    "expr": "C0*N"
  },
  "S3_033": {
    "expr": "C0*a1*N"
  },
  "S3_037": {
    "expr": "W0*e1*N"
  },
  "S3_045": {
    "expr": "C0*N"
  },
  "S3_046": {
    "expr": "W0*e1*N"
  },
  "S3_049": {
    "expr": "C0*a1"
  },
  "S3_050": {
    "expr": "auto"
  },
  "S3_052": {
    "expr": "auto"
  },
  "S3_053": {
    "expr": "C0*N"
  },
  "S3_055": {
    "expr": "W0*E*N"
  },
  "S3_056": {
    "expr": "C0*N"
  },
  "S3_058": {
    "expr": "W0*e1*N"
  },
  "S3_061": {
    "expr": "auto"
  },
  "S3_063": {
    "expr": "W0*e1*N"
  },
  "S3_076": {
    "expr": "C0*N"
  },
  "S3_087": {
    "expr": "auto"
  },
  "S1_004": {
    "expr": "encounter"
  },
  "S1_005": {
    "expr": "encounter"
  },
  "S1_006": {
    "expr": "W0*e1"
  },
  "S1_008": {
    "expr": "encounter"
  },
  "S1_010": {
    "expr": "encounter"
  },
  "S1_023": {
    "expr": "encounter"
  },
  "S1_030": {
    "expr": "encounter"
  },
  "S1_035": {
    "expr": "encounter"
  },
  "S2_007": {
    "expr": "encounter"
  },
  "S2_025": {
    "expr": "encounter"
  },
  "S2_030": {
    "expr": "encounter"
  },
  "S2_042": {
    "expr": "encounter"
  },
  "S2_052": {
    "expr": "encounter"
  },
  "S2_053": {
    "expr": "encounter"
  },
  "S2_063": {
    "expr": "encounter"
  },
  "S3_004": {
    "expr": "encounter"
  },
  "S3_023": {
    "expr": "encounter"
  },
  "S3_024": {
    "expr": "encounter"
  },
  "S3_034": {
    "expr": "encounter"
  },
  "S3_044": {
    "expr": "W0*e1"
  },
  "S3_047": {
    "expr": "encounter"
  },
  "S3_059": {
    "expr": "encounter"
  },
  "S3_068": {
    "expr": "encounter"
  },
  "S3_072": {
    "expr": "encounter"
  },
  "S3_074": {
    "expr": "encounter"
  },
  "S1_003": {
    "expr": "K0"
  },
  "S1_007": {
    "expr": "C0*a1*N"
  },
  "S1_019": {
    "expr": "C0*A"
  },
  "S1_046": {
    "expr": "C0*A"
  },
  "S1_050": {
    "expr": "C0*a1*N"
  },
  "S1_062": {
    "expr": "C0*A"
  },
  "S1_072": {
    "expr": "C0*a1*N"
  },
  "S1_073": {
    "expr": "C0*A"
  },
  "S2_015": {
    "expr": "C0*A"
  },
  "S2_022": {
    "expr": "C0*A"
  },
  "S2_045": {
    "expr": "C0*a1*N"
  },
  "S2_073": {
    "expr": "C0*A"
  },
  "S2_083": {
    "expr": "C0*A"
  },
  "S3_002": {
    "expr": "C0*burnAll"
  },
  "S1_020": {
    "expr": "C0-W0*a1"
  },
  "S1_021": {
    "expr": "C0*a3"
  },
  "S1_022": {
    "expr": "C0*a3"
  },
  "S1_024": {
    "expr": [
      "C0*a2",
      "C0*a3"
    ]
  },
  "S1_033": {
    "expr": "C0"
  },
  "S1_038": {
    "expr": [
      "C0*a2",
      "C0*a3"
    ]
  },
  "S1_053": {
    "expr": "W0*E"
  },
  "S1_069": {
    "expr": "W0*E"
  },
  "S1_074": {
    "expr": "W0*E"
  },
  "S1_079": {
    "expr": "W0*E"
  },
  "S1_081": {
    "expr": "W0*E"
  },
  "S2_008": {
    "expr": "W0*E"
  },
  "S2_076": {
    "expr": "W0*E"
  },
  "S2_088": {
    "expr": "W0*E"
  },
  "S3_017": {
    "expr": "W0*E"
  },
  "S3_031": {
    "expr": "W0*E"
  },
  "S3_089": {
    "expr": "W0*E"
  },
  "S3_090": {
    "expr": "W0*E"
  },
  "S1_056": {
    "expr": "C0"
  },
  "S1_058": {
    "expr": "C0*a1*N-W0*N"
  },
  "S1_060": {
    "expr": "0"
  },
  "S1_063": {
    "expr": [
      "K0*3*N",
      "K0*5*N"
    ]
  },
  "S1_067": {
    "expr": "C0*first+C1*remaining"
  },
  "S1_071": {
    "expr": "K0*N",
    "costPerActivation": 1
  },
  "S1_075": {
    "expr": "W0*E*N"
  },
  "S1_077": {
    "expr": "K0*4+C0*N"
  },
  "S1_082": {
    "expr": "C0*N+C1*E"
  },
  "S1_083": {
    "expr": "W1*E-W1*A"
  },
  "S1_084": {
    "expr": "W0*e1*N"
  },
  "S1_085": {
    "expr": "W0*E-W0*A+W1*e1*N"
  },
  "S2_002": {
    "expr": "C0*E"
  },
  "S2_016": {
    "expr": "K0*3"
  },
  "S2_018": {
    "expr": "C0*a2"
  },
  "S2_019": {
    "expr": "C0*a2"
  },
  "S2_020": {
    "expr": "C0*a2"
  },
  "S2_029": {
    "expr": "K0*2+K0*N"
  },
  "S2_032": {
    "expr": "C0"
  },
  "S2_037": {
    "expr": "0"
  },
  "S2_038": {
    "expr": "C0"
  },
  "S2_039": {
    "expr": [
      "W0*e1",
      "W0*e2"
    ]
  },
  "S2_040": {
    "expr": "W0*E-W0*A"
  },
  "S2_054": {
    "expr": "Q*0.5*e1"
  },
  "S2_057": {
    "expr": "W0*e1*N"
  },
  "S2_058": {
    "expr": "0"
  },
  "S2_064": {
    "expr": "0"
  },
  "S2_062": {
    "expr": [
      "W0*e1",
      "W0*e2"
    ]
  },
  "S2_067": {
    "expr": [
      "W0*e4*2",
      "W0*e6*2"
    ]
  },
  "S2_068": {
    "expr": "C0*N"
  },
  "S2_069": {
    "expr": "C0*N"
  },
  "S2_070": {
    "expr": "C0+C1*A"
  },
  "S2_071": {
    "expr": "W0*e1*3"
  },
  "S2_072": {
    "expr": "W0*E-W0*A"
  },
  "S2_080": {
    "expr": "W0*E-W0*A"
  },
  "S2_074": {
    "expr": "W0*E"
  },
  "S2_075": {
    "expr": "W0*e1*N"
  },
  "S2_079": {
    "expr": "W0*e1*N"
  },
  "S2_085": {
    "expr": "W0*e1*N"
  },
  "S2_077": {
    "expr": "0"
  },
  "S2_078": {
    "expr": "C0+C1*a1*N"
  },
  "S2_082": {
    "expr": "W0*e1*N+C0*remaining"
  },
  "S2_086": {
    "expr": "-W0*a2"
  },
  "S2_089": {
    "expr": "W0*e1+B0*burnOne"
  },
  "S2_091": {
    "expr": "C0"
  },
  "S2_092": {
    "expr": "C0+C1*N"
  },
  "S2_093": {
    "expr": "C0*N"
  },
  "S2_094": {
    "expr": "C0+W0*e1*N-W1*N"
  },
  "S2_095": {
    "expr": "W0*e1*N"
  },
  "S2_096": {
    "expr": "max(C0*N|W0*e1*N)"
  },
  "S2_097": {
    "expr": "W0*E+W1*E+B0*burnAll"
  },
  "S2_098": {
    "expr": [
      "min12*e1*N",
      "min15*e1*N"
    ]
  },
  "S2_099": {
    "expr": "W0*E+W1*E*N"
  },
  "S3_018": {
    "expr": "C0*a3*N"
  },
  "S3_026": {
    "expr": "C0*N+W0*e1"
  },
  "S3_027": {
    "expr": "K0+C0"
  },
  "S3_028": {
    "expr": "K0+C0"
  },
  "S3_029": {
    "expr": "-W0*A*N"
  },
  "S3_035": {
    "expr": "C0*A*N"
  },
  "S3_036": {
    "expr": "C0*A-W0*A"
  },
  "S3_040": {
    "expr": "W0*e1*N"
  },
  "S3_041": {
    "expr": "W0*e2"
  },
  "S3_043": {
    "expr": "C0*a1+H0*a1"
  },
  "S3_051": {
    "expr": "C0+H0"
  },
  "S3_054": {
    "expr": "1*e1*N"
  },
  "S3_060": {
    "expr": "C0*A+H0*A"
  },
  "S3_062": {
    "expr": "H0*a1+H1*a1"
  },
  "S3_065": {
    "expr": "W0*e1*N+C0*N"
  },
  "S3_066": {
    "expr": "C0*N+W0*e1*N"
  },
  "S3_067": {
    "expr": "1*e1*N"
  },
  "S3_069": {
    "expr": "2*E*N-2*A*N"
  },
  "S3_070": {
    "expr": "W0*e1*N+C0-W1*a1"
  },
  "S3_073": {
    "expr": "C0+W0*e1"
  },
  "S3_075": {
    "expr": "W0*e1*N+H0"
  },
  "S3_077": {
    "expr": "W0*e1*N"
  },
  "S3_079": {
    "expr": "C0*a2+W0*e1*N"
  },
  "S3_080": {
    "expr": "C0*N+W0*e1*N"
  },
  "S3_081": {
    "expr": "W0*E*N"
  },
  "S3_082": {
    "expr": "base*N-1*N"
  },
  "S3_083": {
    "expr": "B0*burnAll*N-1*N"
  },
  "S3_084": {
    "expr": "burnTotal*burnAll+C0*N"
  },
  "S3_085": {
    "expr": "B0*burnAll"
  },
  "S3_086": {
    "expr": "W0*e1*N"
  },
  "S3_088": {
    "expr": "W0*e1*N"
  },
  "S3_091": {
    "expr": "C0+W0*e1+W1*E-W1*A"
  },
  "S3_092": {
    "expr": "W0*e1+W1*otherE-W1*A"
  },
  "S3_093": {
    "expr": "C0*N+W0*e1*N"
  },
  "S3_094": {
    "expr": "W1*E*N"
  },
  "S3_095": {
    "expr": [
      "drain12*e1*N-1*N",
      "drain16*e1*N-1*N"
    ]
  },
  "S3_096": {
    "expr": "W1*e1*N"
  },
  "S3_097": {
    "expr": "restoreBase+C0+H0*N"
  },
  "S3_098": {
    "expr": "base+C0*2*N"
  },
  "S3_099": {
    "expr": "C0*a1*N"
  },
  "S3_100": {
    "expr": "C0+W1*e1*N-W0*N+W2*E-W2*A"
  },
  "S3_039": {
    "expr": "rushChakra*a1"
  }
};

// The proposal API validates against the same card database as the browser.
if (typeof module!=='undefined' && module.exports) module.exports={CARDS};

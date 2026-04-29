#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const chapterDir = path.join(root, 'config/ftbquests/quests/chapters')
const registryFile = "/home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/dump/registry_builtin/minecraft/item/_entries.txt"
const registry = fs.existsSync(registryFile) ? fs.readFileSync(registryFile, 'utf8') : ''
const knownItems = new Set([...registry.matchAll(/^([^\s]+)\s+raw_id=/gm)].map(m => m[1]))

const coinOrder = ['copper', 'iron', 'tin', 'bronze', 'brass', 'silver', 'gold', 'diamond', 'platinum', 'emerald', 'ruby', 'sapphire', 'topaz']
const tierCoins = {
  copper: ['copper'],
  iron: ['copper', 'iron'],
  tin: ['copper', 'iron', 'tin'],
  bronze: ['copper', 'iron', 'tin', 'bronze'],
  brass: ['copper', 'iron', 'tin', 'bronze', 'brass'],
  silver: ['copper', 'iron', 'tin', 'bronze', 'brass', 'silver'],
  gold: ['copper', 'iron', 'tin', 'bronze', 'brass', 'silver', 'gold'],
  diamond: ['copper', 'iron', 'tin', 'bronze', 'brass', 'silver', 'gold', 'diamond'],
  platinum: ['copper', 'iron', 'tin', 'bronze', 'brass', 'silver', 'gold', 'diamond', 'platinum']
}

function q(id, title, x, y, tasks, deps = []) { return { id, title, x, y, tasks, deps } }
function item(item, count = 1) { return { item, count } }
function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') }
function taskSnbt(chapter, quest, t, idx) {
  const count = t.count && t.count !== 1 ? ` count:${t.count}L` : ''
  const nbt = t.matchNbt === false ? ' match_nbt:false' : ''
  return `{id:"${chapter}_${quest}_T${idx}" type:"item" item:"${t.item}"${count}${nbt}}`
}
function rewards(chapter, quest, tier) {
  if (tier === 'starting') return `[{id:"${chapter}_${quest}_R0" type:"item" item:"dotcoinmod:copper_coin" count:16}]`
  const list = tierCoins[tier] || ['copper']
  return '[' + list.map((coin, i) => `{id:"${chapter}_${quest}_R${i}" type:"item" item:"dotcoinmod:${coin}_coin" count:4}`).join(',') + ']'
}
function questSnbt(chapterPrefix, tier, quest) {
  const deps = quest.deps?.length ? ` dependencies:[${quest.deps.map(d => `"${d}"`).join(',')}] hide_until_deps_complete:true` : ''
  return `\t\t{id:"${quest.id}"${deps} title:"${esc(quest.title)}" x:${quest.x.toFixed(1)}d y:${quest.y.toFixed(1)}d rewards:${rewards(chapterPrefix, quest.id, tier)} tasks:[${quest.tasks.map((t, i) => taskSnbt(chapterPrefix, quest.id, t, i + 1)).join(',')}]}`
}
function chapterSnbt(ch) {
  return `{
\tdefault_hide_dependency_lines: false
\tfilename: "${ch.filename}"
\tgroup: "BTM_ROOT"
\tid: "${ch.id}"
\torder_index: ${ch.order}
\ttitle: "${esc(ch.title)}"
\tquests: [
${ch.quests.map(qt => questSnbt(ch.prefix, ch.tier, qt)).join('\n')}
\t]
}
`
}

const chapters = [
  {
    filename: 'starting_out', prefix: 'SO', id: 'BTM_STARTING_OUT', order: 0, title: 'Starting Out', tier: 'starting', quests: [
      q('SO_BACKPACK', 'Carry More', -8, 0, [item('sophisticatedbackpacks:backpack')]),
      q('SO_LIGHT', 'Make Light', -6, 0, [item('minecraft:torch', 16)], ['SO_BACKPACK']),
      q('SO_SHELTER', 'Claim Shelter', -4, 0, [item('minecraft:white_bed')], ['SO_LIGHT']),
      q('SO_WATER', 'Carry Water', -2, 0, [{ item: 'thirst:terracotta_water_bowl', matchNbt: false }], ['SO_BACKPACK']),
      q('SO_SEWING', 'Body Temperature', 0, 0, [item('cold_sweat:sewing_table')], ['SO_BACKPACK']),
      q('SO_COOKING', 'Food Is Infrastructure', 2, 0, [item('farmersdelight:cooking_pot'), item('farmersdelight:skillet')], ['SO_WATER']),
      q('SO_TINKER', 'Tinkers Station', -6, 2, [item('tconstruct:tinker_station')], ['SO_LIGHT']),
      q('SO_PARTS', 'Tool Parts', -4, 2, [item('tconstruct:part_builder')], ['SO_TINKER']),
      q('SO_CRAFTING', 'Crafting Station', -2, 2, [item('tconstruct:crafting_station')], ['SO_TINKER']),
      q('SO_REPAIR', 'Repair Mindset', 0, 2, [item('tconstruct:repair_kit')], ['SO_PARTS']),
      q('SO_HOOK', 'Hooks and Routes', 2, 2, [item('rehooked:wood_hook')], ['SO_BACKPACK']),
      q('SO_TNT', 'Controlled Blast Mining', 4, 2, [item('minecraft:tnt')], ['SO_PARTS']),
      q('SO_TRADE_FLOAT', 'Sixteen Copper Coins', 6, 2, [item('dotcoinmod:copper_coin', 16)], ['SO_BACKPACK']),
      q('SO_NETHER', 'First Nether Obelisk Run', -4, 4, [item('minecraft:netherrack', 16)], ['SO_SHELTER', 'SO_WATER', 'SO_COOKING']),
      q('SO_GROUT', 'Netherrack Grout', -2, 4, [item('tconstruct:grout', 8)], ['SO_NETHER', 'SO_PARTS']),
      q('SO_MELTERY', 'First Meltery', 0, 4, [item('tconstruct:seared_melter'), item('tconstruct:seared_heater'), item('tconstruct:seared_faucet'), item('tconstruct:seared_basin'), item('tconstruct:seared_table')], ['SO_GROUT']),
      q('SO_EXIT_TECH', 'Exit: Tech 1', 2, 4, [item('tconstruct:seared_brick', 8)], ['SO_MELTERY']),
      q('SO_EXIT_MAGIC', 'Exit: Body and Blood', 4, 4, [item('rpgstats:still_beating_heart')], ['SO_WATER', 'SO_COOKING']),
      q('SO_EXIT_ADVENTURE', 'Exit: Routes and Villages', 6, 4, [item('minecraft:compass'), item('minecraft:map')], ['SO_TRADE_FLOAT', 'SO_NETHER'])
    ]
  },
  {
    filename: 'tinkers_construct', prefix: 'TC', id: 'BTM_TINKERS', order: 1, title: 'Iron Tier - Tinkers Construct', tier: 'iron', quests: [
      q('TC_SEARED_CASE', 'Seared Machine Casing', 0, 0, [item('kubejs:seared_machine_casing')], ['SO_MELTERY']),
      q('TC_SMELTERY', 'Smeltery Authority', 2, 0, [item('tconstruct:smeltery_controller'), item('tconstruct:seared_fuel_tank')], ['TC_SEARED_CASE']),
      q('TC_FIRST_COPPER', 'Primary Molten Output', 4, -1, [item('minecraft:copper_ingot')], ['TC_SMELTERY']),
      q('TC_FIRST_IRON', 'Ironstone Pays Out', 4, 1, [item('minecraft:iron_ingot')], ['TC_SMELTERY']),
      q('TC_SCORCHED', 'Scorched Machine Casing', 6, 0, [item('kubejs:scorched_machine_casing')], ['TC_FIRST_COPPER', 'TC_FIRST_IRON']),
      q('TC_FOUNDRY', 'Foundry Reads Geology', 8, 0, [item('tconstruct:foundry_controller')], ['TC_SCORCHED']),
      q('TC_ALLOYER', 'Scorched Alloying', 10, -1, [item('tconstruct:scorched_alloyer')], ['TC_SCORCHED']),
      q('TC_FUEL', 'Scorched Fuel Handling', 10, 1, [item('tconstruct:scorched_fuel_tank')], ['TC_SCORCHED'])
    ]
  },
  {
    filename: 'death', prefix: 'DE', id: 'BTM_DEATH', order: 2, title: 'Iron Tier - Death and Blood', tier: 'iron', quests: [
      q('DE_HEART', 'Still-Beating Heart', 0, 0, [item('rpgstats:still_beating_heart')], ['SO_EXIT_MAGIC']),
      q('DE_ALTAR', 'First Blood Altar', 2, 0, [item('bloodmagic:altar')], ['DE_HEART']),
      q('DE_WEAK_HEART', 'Blood-Touched Heart', 4, 0, [item('kubejs:weak_blood_heart')], ['DE_ALTAR']),
      q('DE_WEAK_ORB', 'Weak Blood Orb', 6, 0, [item('bloodmagic:weakbloodorb')], ['DE_WEAK_HEART']),
      q('DE_BLANK', 'Blank Slate', 8, -1, [item('bloodmagic:blankslate')], ['DE_WEAK_ORB']),
      q('DE_BODY_LOOP', 'Body Systems Matter', 8, 1, [item('farmersdelight:cooking_pot'), item('thirst:sand_filter')], ['DE_WEAK_ORB'])
    ]
  },
  {
    filename: 'create_i', prefix: 'C1', id: 'BTM_CREATE_I', order: 3, title: 'Tin Tier - Create I', tier: 'tin', quests: [
      q('C1_ALLOY', 'Alloyed Andesite', 0, 0, [item('create:andesite_alloy')], ['TC_FOUNDRY']),
      q('C1_CRANK', 'Hand Crank', 2, 0, [item('create:hand_crank')], ['C1_ALLOY']),
      q('C1_MILL', 'Millstone', 4, 0, [item('create:millstone')], ['C1_CRANK']),
      q('C1_DEPLOYER', 'Deployer', 6, 0, [item('create:deployer')], ['C1_MILL']),
      q('C1_CASING', 'Deployed Andesite Casing', 8, 0, [item('create:andesite_casing')], ['C1_DEPLOYER']),
      q('C1_POWER_WATER', 'Water Wheel', 10, -1, [item('create:water_wheel')], ['C1_CASING']),
      q('C1_POWER_WIND', 'Windmill Bearing', 10, 1, [item('create:windmill_bearing')], ['C1_CASING']),
      q('C1_WATER', 'Clean Water Infrastructure', 12, 0, [item('thirst:sand_filter')], ['C1_POWER_WATER']),
      q('C1_CRUSHED', 'Deposit Preprocessing', 14, 0, [item('realisticores:crushed_copper_sulfide_ore')], ['C1_WATER'])
    ]
  },
  {
    filename: 'create_ii', prefix: 'C2', id: 'BTM_CREATE_II', order: 4, title: 'Bronze Tier - Create II', tier: 'bronze', quests: [
      q('C2_ANDESITE_CASE', 'Andesite Machine Casing', 0, 0, [item('kubejs:andesite_machine_casing')], ['C1_CRUSHED']),
      q('C2_PRESS', 'Mechanical Press', 2, 0, [item('create:mechanical_press')], ['C2_ANDESITE_CASE']),
      q('C2_PLATES', 'Pressed or Cast Plates', 4, -1, [item('chemlib:iron_plate'), item('chemlib:copper_plate')], ['C2_PRESS']),
      q('C2_MIXER', 'Mechanical Mixer', 4, 1, [item('create:mechanical_mixer')], ['C2_PRESS']),
      q('C2_SAW_DRILL', 'Industrial Contact Tools', 6, -1, [item('create:mechanical_saw'), item('create:mechanical_drill')], ['C2_ANDESITE_CASE']),
      q('C2_CRAFTER', 'Mechanical Crafting', 6, 1, [item('create:mechanical_crafter')], ['C2_ANDESITE_CASE']),
      q('C2_BRASS_INGOT', 'Brass Is Create Steel', 8, -1, [item('create:brass_ingot')], ['C2_MIXER']),
      q('C2_BRASS_SHEET', 'Brass Sheet', 8, 1, [item('create:brass_sheet')], ['C2_BRASS_INGOT', 'C2_PLATES']),
      q('C2_BRASS', 'Brass Machine Casing', 10, 0, [item('kubejs:brass_machine_casing')], ['C2_BRASS_SHEET'])
    ]
  },
  {
    filename: 'electricity', prefix: 'PG', id: 'BTM_ELECTRICITY', order: 5, title: 'Brass Tier - Power Grid', tier: 'brass', quests: [
      q('PG_CONDUCTIVE', 'Conductive Casing', 0, 0, [item('powergrid:conductive_casing')], ['C2_BRASS']),
      q('PG_CASE', 'Power Grid Machine Casing', 2, 0, [item('kubejs:power_grid_machine_casing')], ['PG_CONDUCTIVE']),
      q('PG_CIRCUIT', 'Integrated Circuit', 4, -1, [item('powergrid:integrated_circuit')], ['PG_CASE']),
      q('PG_RELAY', 'Redstone Relay', 4, 1, [item('powergrid:redstone_relay')], ['PG_CASE']),
      q('PG_BATTERY', 'Stored Electricity', 6, 0, [item('powergrid:battery')], ['PG_CIRCUIT', 'PG_RELAY']),
      q('PG_HEAT_PIPE', 'Heat Pipe', 8, -1, [item('create_new_age:heat_pipe')], ['PG_BATTERY']),
      q('PG_HEAT_PUMP', 'Heat Pump', 8, 1, [item('create_new_age:heat_pump')], ['PG_HEAT_PIPE'])
    ]
  },
  {
    filename: 'oc2r', prefix: 'OC', id: 'BTM_OC2R', order: 6, title: 'Silver Tier - OC2R', tier: 'silver', quests: [
      q('OC_TRANSISTOR', 'Transistor', 0, -1, [item('oc2r:transistor')], ['PG_BATTERY']),
      q('OC_CASE', 'OC2R Machine Casing', 0, 1, [item('kubejs:oc2r_machine_casing')], ['PG_BATTERY']),
      q('OC_COMPUTER', 'Local Computer', 2, 0, [item('oc2r:computer')], ['OC_TRANSISTOR', 'OC_CASE']),
      q('OC_NETWORK', 'Wired Site Communication', 4, 0, [item('oc2r:network_hub'), item('oc2r:network_connector')], ['OC_COMPUTER']),
      q('OC_ROBOT', 'Authored Field Work', 6, -1, [item('oc2r:robot')], ['OC_NETWORK']),
      q('OC_ROUTE_LOGIC', 'Route Logic', 6, 1, [item('oc2r:redstone_interface'), item('oc2r:network_interface_card')], ['OC_NETWORK'])
    ]
  },
  {
    filename: 'space', prefix: 'SP', id: 'BTM_SPACE', order: 7, title: 'Gold Tier - Creating Space', tier: 'gold', quests: [
      q('SP_TABLE', 'Rocket Engineer Table', 0, 0, [item('creatingspace:rocket_engineer_table')], ['OC_NETWORK']),
      q('SP_CASE', 'Space Machine Casing', 2, 0, [item('kubejs:space_machine_casing')], ['SP_TABLE']),
      q('SP_SUIT_BASIC', 'Basic Spacesuit', 4, -1, [item('creatingspace:basic_spacesuit_helmet'), item('creatingspace:basic_spacesuit_leggings'), item('creatingspace:basic_spacesuit_boots')], ['SP_CASE']),
      q('SP_ENGINE', 'Rocket Engine', 4, 1, [item('creatingspace:rocket_engine')], ['SP_CASE']),
      q('SP_CASING', 'Rocket Casing', 6, -1, [item('creatingspace:rocket_casing')], ['SP_ENGINE']),
      q('SP_CONTROLS', 'Rocket Controls', 6, 1, [item('creatingspace:rocket_controls')], ['SP_ENGINE']),
      q('SP_CHEM', 'Chemical Synthesizer', 8, 0, [item('creatingspace:chemical_synthesizer')], ['SP_CASING', 'SP_CONTROLS']),
      q('SP_SUIT_ADV', 'Advanced Spacesuit', 10, 0, [item('creatingspace:advanced_spacesuit_helmet'), item('creatingspace:advanced_spacesuit_leggings'), item('creatingspace:advanced_spacesuit_boots')], ['SP_CHEM'])
    ]
  },
  {
    filename: 'ae2', prefix: 'AE', id: 'BTM_AE2', order: 8, title: 'Diamond Tier - AE2 Local Intelligence', tier: 'diamond', quests: [
      q('AE_CHARGER', 'Certus Preparation', 0, -1, [item('ae2:charger')], ['SP_CHEM']),
      q('AE_INSCRIBER', 'Processor Fabrication', 0, 1, [item('ae2:inscriber')], ['SP_CHEM']),
      q('AE_CASE', 'AE2 Machine Casing', 2, 0, [item('kubejs:ae2_machine_casing')], ['AE_CHARGER', 'AE_INSCRIBER']),
      q('AE_CONTROLLER', 'Local Controller', 4, 0, [item('ae2:controller')], ['AE_CASE']),
      q('AE_DRIVE', 'Site Storage, Not Global Logistics', 6, -1, [item('ae2:drive')], ['AE_CONTROLLER']),
      q('AE_CRAFTING', 'Local Pattern Work', 6, 1, [item('ae2:crafting_unit'), item('ae2:molecular_assembler')], ['AE_CONTROLLER']),
      q('AE_SPATIAL', 'Spatial Field Work', 8, 0, [item('ae2:spatial_io_port')], ['AE_DRIVE', 'AE_CRAFTING'])
    ]
  },
  {
    filename: 'magic_i', prefix: 'M1', id: 'BTM_MAGIC_I', order: 9, title: 'Tin Tier - Magic I', tier: 'tin', quests: [
      q('M1_BLANK', 'Blank Slate Permission', 0, 0, [item('bloodmagic:blankslate')], ['DE_WEAK_ORB']),
      q('M1_HEXEREI', 'Hexerei Gate', 2, -1, [item('hexerei:mixing_cauldron')], ['M1_BLANK']),
      q('M1_MALUM', 'Malum Gate', 2, 1, [item('malum:spirit_altar')], ['M1_BLANK']),
      q('M1_REINFORCED', 'Reinforced Slate Permission', 4, 0, [item('bloodmagic:reinforcedslate')], ['M1_HEXEREI', 'M1_MALUM']),
      q('M1_ARS', 'Ars Entry', 6, -1, [item('ars_nouveau:imbuement_chamber')], ['M1_REINFORCED']),
      q('M1_APPARATUS', 'Enchanting Apparatus', 6, 1, [item('ars_nouveau:enchanting_apparatus')], ['M1_ARS']),
      q('M1_RITUALS', 'Ritual Brazier', 8, -1, [item('ars_nouveau:ritual_brazier')], ['M1_APPARATUS']),
      q('M1_NATURE', 'Nature Aura Entry', 8, 1, [item('naturesaura:offering_table')], ['M1_REINFORCED']),
      q('M1_IMBUED', 'Imbued Slate Permission', 10, 0, [item('bloodmagic:infusedslate')], ['M1_RITUALS']),
      q('M1_OCCULT', 'Occultism Chalk', 12, -1, [item('occultism:chalk_white_impure')], ['M1_IMBUED']),
      q('M1_GOETY', 'Goety Dark Altar', 12, 1, [item('goety:dark_altar')], ['M1_IMBUED']),
      q('M1_DEMONIC', 'Demonic Slate Permission', 14, 0, [item('bloodmagic:demonslate')], ['M1_OCCULT', 'M1_GOETY']),
      q('M1_BOTANIA', 'Botania Engineering Gate', 16, -1, [item('botania:runic_altar')], ['M1_DEMONIC']),
      q('M1_ETHEREAL', 'Ethereal Slate Permission', 18, 0, [item('bloodmagic:etherealslate')], ['M1_BOTANIA']),
      q('M1_PSI_HEX', 'Programmable Magic', 20, 0, [item('psi:programmer'), item('hexalia:hex_focus')], ['M1_ETHEREAL'])
    ]
  },
  {
    filename: 'adventuring', prefix: 'AD', id: 'BTM_ADVENTURING', order: 10, title: 'Copper Tier - Adventuring, Coins, and Wares', tier: 'copper', quests: [
      q('AD_ROUTE', 'Route Supplies', 0, 0, [item('minecraft:compass'), item('minecraft:map')], ['SO_EXIT_ADVENTURE']),
      q('AD_COIN', 'First Market Float', 2, 0, [item('dotcoinmod:copper_coin', 16)], ['AD_ROUTE']),
      q('AD_TRADING_POST', 'Village Trading Post', 4, -1, [item('tradingpost:trading_post')], ['AD_COIN']),
      q('AD_WARES_TABLE', 'Wares Delivery Table', 4, 1, [item('wares:delivery_table')], ['AD_COIN']),
      q('AD_CONTRACT', 'Contract As Crafting', 6, 0, [item('wares:delivery_agreement')], ['AD_WARES_TABLE']),
      q('AD_PACKAGE', 'Physical Package', 8, -1, [item('wares:package')], ['AD_CONTRACT']),
      q('AD_COMPLETED', 'Completed Delivery', 8, 1, [item('wares:completed_delivery_agreement')], ['AD_PACKAGE']),
      q('AD_IRON_FLOAT', 'Iron Tier Float', 10, 0, [item('dotcoinmod:iron_coin', 4)], ['AD_COMPLETED'])
    ]
  },
  {
    filename: 'synthesis_i', prefix: 'S1', id: 'BTM_SYNTHESIS_I', order: 11, title: 'Gold Tier - Acid Chemistry', tier: 'gold', quests: [
      q('S1_VAT', 'Acid Vat', 0, 0, [item('acid_vat:acid_vat')], ['C2_BRASS', 'TC_FOUNDRY']),
      q('S1_TUBE', 'Slurry Transport', 2, 0, [item('acid_vat:slurry_tank'), item('acid_vat:smart_slurry_pipe')], ['S1_VAT']),
      q('S1_CENTRIFUGE', 'Centrifuge Fractions', 4, 0, [item('acid_vat:centrifuge_bearing'), item('acid_vat:centrifuge_chamber')], ['S1_TUBE']),
      q('S1_SAMPLE', 'Chemical Interpretation', 6, -1, [item('chemlib:copper'), item('chemlib:sulfur')], ['S1_CENTRIFUGE']),
      q('S1_PLATINUM', 'Mountain-Depth Plate Reward', 6, 1, [item('chemlib:platinum_plate')], ['S1_CENTRIFUGE']),
      q('S1_SYNTHESIS_EXIT', 'Exit: Matter Routing', 8, 0, [item('chemlib:osmium_plate')], ['S1_SAMPLE', 'S1_PLATINUM'])
    ]
  }
]

const allQuestIds = new Set()
const allDeps = []
const missingItems = []
for (const ch of chapters) {
  for (const quest of ch.quests) {
    if (allQuestIds.has(quest.id)) throw new Error(`Duplicate quest id ${quest.id}`)
    allQuestIds.add(quest.id)
    for (const dep of quest.deps || []) allDeps.push({ quest: quest.id, dep })
    for (const t of quest.tasks) if (knownItems.size && !knownItems.has(t.item)) missingItems.push(`${quest.id}: ${t.item}`)
  }
}
const missingDeps = allDeps.filter(d => !allQuestIds.has(d.dep))
if (missingDeps.length) throw new Error(`Missing dependency refs:\n${missingDeps.map(d => `${d.quest} -> ${d.dep}`).join('\n')}`)
if (missingItems.length) throw new Error(`Missing item ids:\n${missingItems.join('\n')}`)

for (const ch of chapters) fs.writeFileSync(path.join(chapterDir, `${ch.filename}.snbt`), chapterSnbt(ch))
console.log(`generated ${chapters.length} quest chapters, ${allQuestIds.size} quests`)

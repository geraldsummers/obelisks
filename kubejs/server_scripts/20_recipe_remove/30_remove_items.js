// kubejs/server_scripts/disable_items_recipes.js

const DISABLED_ITEMS = [
    "fallout_wastelands_:steel_ingot",
    "occultism:miner_debug_unspecialized",
    "ars_nouveau:ritual_flight",
    "bloodmagic:telepositionsigil",
    "ars_nouveau:stable_warp_scroll",
    "ars_nouveau:warp_scroll",
    "occultism:miner_foliot_unspecialized",
    "occultism:miner_djinni_ores",
    "occultism:miner_afrit_deeps",
    "occultism:miner_marid_master"
];

ServerEvents.recipes(event => {
    DISABLED_ITEMS.forEach(id => {
        // Remove any recipe whose OUTPUT is this item
        event.remove({ output: id });
    });
});

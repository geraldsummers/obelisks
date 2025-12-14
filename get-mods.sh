##TARGET: MC 1.20.1 FORGE

install_mod(){
    echo
    echo "$1"
    echo "$2"
    packwiz "$1" install "$2" -y
}

########################################
# 0. Core infrastructure / performance #
########################################

# Perf / engine
install_mod modrinth "https://modrinth.com/mod/modernfix"
install_mod modrinth "https://modrinth.com/mod/ferrite-core"
install_mod modrinth "https://modrinth.com/mod/embeddium"
# Forge port

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/clumps"
install_mod modrinth    "https://modrinth.com/mod/entityculling"

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/alltheleaks"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/deuf-duplicate-entity-uuid-fix"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/let-me-despawn"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/despawntweaker"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/mob-ai-tweaks"

# This one’s slightly fuzzy by name; this *is* the GPU leak fix mod:
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/fix-gpu-memory-leak"

# Core UI / QoL helpers
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/jei"                 # JEI
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/mouse-tweaks"        # Mouse Tweaks
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/the-one-probe"       # The One Probe
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/controlling"         # Keybind search / conflicts
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/disable-ingame-tutorial" # Disable tutorial popups (check loader/version)

########################################
# 1. Tech / Industry                   #
########################################

# --- Create stack ---
install_mod modrinth  "https://modrinth.com/mod/create"
install_mod modrinth  "https://modrinth.com/mod/createaddition"
install_mod modrinth  "https://modrinth.com/mod/createnuclear"
# using CurseForge variant here
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-irradiated"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-diesel-generators"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-steam-n-rails"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-contraption-terminals"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-industry"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/rechiseled-create"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/create-railways-navigator"
# Protection Pixel = the Create pixel armour mod
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/protection-pixel"

# --- Thermal: you’ll probably want to curate this later ---
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/thermal-foundation"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/thermal-expansion"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/thermal-innovation"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/thermal-integration"

# --- AE2 stack ---
install_mod modrinth  "https://modrinth.com/mod/ae2"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/rechiseled-ae2"

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/ae2-network-analyser"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/ae2-things-forge"
install_mod modrinth  "https://modrinth.com/mod/extended-ae"
# ME Requester is actually on Modrinth
install_mod modrinth  "https://modrinth.com/mod/merequester"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/applied-energistics-2-wireless-terminals"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/ae-additions-extra-cells-2-fork"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/applied-flux"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/ae2-jei-integration"

install_mod modrinth  "https://modrinth.com/mod/create-applied-kinetics"

# AE2-themed GUI as a resource pack
# install_mod modrinth  "https://modrinth.com/resourcepack/ae2-gui"

########################################
# 2. Transport & movement              #
########################################

# Macro transport
install_mod modrinth  "https://modrinth.com/mod/little-logistics"
install_mod modrinth  "https://modrinth.com/mod/alekiships"

# Movement / combat feel
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/combat-roll"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/better-combat-by-daedelus"
# original Grappling Hook mod; for 1.20.1 Reforged might be better, but this is what you asked for
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/grappling-hook-mod"
# Binoculars
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/keerdms-binoculars"

# Early weapons / tool gating
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/spartan-weaponry"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/no-tree-punching"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/breaking-tools"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/pickle-tweaks"

########################################
# 3. Worldgen / hazards                #
########################################

# Terrain & ores
install_mod modrinth  "https://modrinth.com/mod/terralith"
install_mod modrinth  "https://modrinth.com/mod/geolosys"

# Dynamic trees & forests
install_mod modrinth  "https://modrinth.com/mod/dynamictrees"

# Underground overhaul
# install_mod modrinth  "https://modrinth.com/mod/undermod"

# Ocean horror
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/thalassophobia"

# Block physics
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/realistic-block-physics"

# Tree chopping & explosives
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/falling-tree"   # tree cutting
# install_mod modrinth  "https://modrinth.com/mod/lucky-tnt-mod"                       # TNT mod

# Nether / End
install_mod modrinth  "https://modrinth.com/mod/nullscape"
# install_mod modrinth  "https://modrinth.com/mod/unusual-end"
install_mod modrinth  "https://modrinth.com/mod/nether-depths-upgrade"
install_mod modrinth  "https://modrinth.com/mod/even-better-nether"

# Villages, structures & trading
install_mod modrinth  "https://modrinth.com/mod/ct-overhaul-village"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/lithostitched"          # CTOV dependency (Forge 1.20.1)
install_mod modrinth  "https://modrinth.com/mod/towns-and-towers"
install_mod modrinth  "https://modrinth.com/mod/cristel-lib"                                 # Towns & Towers / structure config lib
install_mod modrinth  "https://modrinth.com/mod/guard-villagers"
install_mod modrinth  "https://modrinth.com/mod/more_villagers"
install_mod modrinth  "https://modrinth.com/mod/dynamic-villager-trades"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/trading-post"

# Wandering trader datapacks
# install_mod modrinth  "https://modrinth.com/datapack/wanderful-trades"
# Wandering Trades Expanded (PlanetMinecraft datapack) must be added manually / via packwiz url:
# https://www.planetminecraft.com/data-pack/wandering-trades-expanded-1-20/

########################################
# 4. Dimensions & apocalypse modules   #
########################################

# Fungal dimension (infection mod removed)
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/the-undergarden"

# Parasite / wasteland modules (infection core removed)
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/fallout-wastelands"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/biomancy"

# Mob spawn control & chaos
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/in-control"
# install_mod modrinth  "https://modrinth.com/mod/custom-mob-spawns"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/born-in-chaos"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/deeper-and-darker"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/spawn-balance-utility"
install_mod modrinth  "https://modrinth.com/mod/peaceful-nights"

########################################
# 5. Survival systems & food           #
########################################

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/tough-as-nails"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/serene-seasons"

# Death / graves
install_mod modrinth "https://modrinth.com/resourcepack/corail_tombstone_redrawn"

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/farmers-delight"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/undergarden-delight" # FD + Undergarden compat

# Food variety & diet systems
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/spice-of-life-carrot-edition"
# Diet – slug is just 'diet' on CurseForge
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/diet"
install_mod modrinth  "https://modrinth.com/mod/cravings-dyrohc"

# Health & death penalties
install_mod modrinth  "https://modrinth.com/mod/diminishing-health"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/death-penalties"

########################################
# 6. Dungeons, bosses, ARPG gear       #
########################################

# Dungeons / structures
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/yungs-better-dungeons"

# Overworld bosses
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/bosses-of-mass-destruction-forge"
# L_Ender's Cataclysm
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/l_ender-s-cataclysm"

# ARPG loot backbone
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/apotheosis"

# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/epic-knights-shields-armor-and-weapons"

# Curios & trinkets
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/curios"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/artifacts"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/relics"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/artifacts-curse-of-pandora"

########################################
# 7. Aesthetics / immersion            #
########################################

# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/presence-footsteps"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/sound-physics-remastered"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/oculus"
install_mod modrinth  "https://modrinth.com/mod/distanthorizons"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/antique-atlas"
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/tactical-shield-overhaul"
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/sleepingoverhaul2"

# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/unionlib"

# AmbientSounds 6
install_mod modrinth "https://modrinth.com/mod/ambientsounds"

# Disable the vanilla recipe book (Not Enough Recipe Book)
install_mod modrinth "https://modrinth.com/mod/notenoughrecipebook"



########################################
# FIXED: Mods that had no valid 1.20.1 #
########################################

# Disable Ingame Tutorial → No More Pop-ups (1.20.1 Forge)
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/no-more-popups"

# AE2 JEI Integration → REMOVE (not needed on AE2 15.x) — no replacement install call

# UnderMod → correct CurseForge project
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/undermod"

# Wanderful Trades → correct Modrinth link (datapack)
install_mod modrinth "https://modrinth.com/datapack/wanderful-trades"

# Custom Mob Spawns → NO Forge 1.20.1 version exists; remove — no install_mod line

# AE2 GUI pack → working alternative with 1.20.x support
install_mod modrinth "https://modrinth.com/resourcepack/birds-ae2-gui-pack"

# Presence Footsteps (Forge port)
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/presence-footsteps-forge"

# Deeper and Darker → Forge 1.20.1 build exists on Modrinth
install_mod modrinth "https://modrinth.com/mod/deeperdarker"
########################################
# FIXED: Wrong slugs / 404 projects    #
########################################

# Unusual End → correct CurseForge slug (not on Modrinth)
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/unusual-end"

# L_Ender’s Cataclysm → correct slug: lendercataclysm
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/lendercataclysm"

# Epic Knights → correct slug: epic-knights-armor-and-weapons
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/epic-knights-armor-and-weapons"

# Relics → correct slug: relics-mod
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/relics-mod"

# Artifacts – Curse of Pandora → correct slug: curse-of-pandora
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/curse-of-pandora"

# Tactical Shield Overhaul → correct slug: shield-mechanics
# install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/shield-mechanics"

# Breaking Tools → correct slug actually exists
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/breaking-tools"

# KubeJS core
install_mod modrinth "https://modrinth.com/mod/kubejs"

# LootJS (loot table scripting)
install_mod modrinth "https://modrinth.com/mod/lootjs"

install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/global-gamerules"

########################################
# 2. Loot / progression tweaks         #
########################################

# Per-player instanced structure loot
install_mod modrinth  "https://modrinth.com/mod/lootr"                     # Lootr:contentReference[oaicite:0]{index=0}

# Disable the recipe book button everywhere
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/no-recipe-book-reborn"  # No Recipe Book Reborn:contentReference[oaicite:1]{index=1}

########################################
# 3. Storage / backpacks               #
########################################

# Required library for Sophisticated * mods
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/sophisticated-core"     # Sophisticated Core:contentReference[oaicite:2]{index=2}

# Upgradable backpacks with lots of upgrades
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/sophisticated-backpacks" # Sophisticated Backpacks:contentReference[oaicite:3]{index=3}

# Tiered chests/barrels/shulkers + controller network
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/sophisticated-storage"   # Sophisticated Storage:contentReference[oaicite:4]{index=4}

########################################
# 4. Inventory QoL                     #
########################################

# Middle-click (or hotkey) inventory sorting
install_mod curseforge "https://www.curseforge.com/minecraft/mc-mods/inventory-sorter-configurable" # Inventory Sorter (Configurable):contentReference[oaicite:5]{index=5}

########################################
# 5. World / celestial events          #
########################################

# install_mod modrinth "https://cdn.modrinth.com/data/z2XEADmE/versions/WKWSOV6p/Data_Anchor-forge-1.20.1-1.0.0.19.jar"

# Blood / Harvest / other special moons
# install_mod modrinth  "https://modrinth.com/mod/enhanced-celestials"       # Enhanced Celestials (lunar events):contentReference[oaicite:6]{index=6}


install_mod modrinth "https://modrinth.com/mod/dynamic-trees-terralith/"

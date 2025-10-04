// Starting items - the seed items players can combine
// Inspired by Brotato's passive item system

const STARTING_ITEMS = [
    {
        id: "lucky_clover",
        name: "Lucky Clover",
        description: "A four-leaf clover that brings good fortune",
        rarity: "common",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 15,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "alien_armor",
        name: "Alien Armor",
        description: "Sturdy plating from a crashed alien ship",
        rarity: "common",
        effects: {
            maxHealth: 10,
            healthRegen: 0,
            armor: 5,
            speed: 0,
            dodge: 0,
            luck: 0,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "energy_drink",
        name: "Energy Drink",
        description: "Caffeinated beverage that boosts physical performance",
        rarity: "common",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 8,
            dodge: 0,
            luck: 0,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 5,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "regeneration_serum",
        name: "Regeneration Serum",
        description: "Medical compound that accelerates healing",
        rarity: "uncommon",
        effects: {
            maxHealth: 0,
            healthRegen: 3,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 0,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "tactical_vest",
        name: "Tactical Vest",
        description: "Military-grade protective equipment",
        rarity: "uncommon",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 8,
            speed: 0,
            dodge: 3,
            luck: 0,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "training_manual",
        name: "Training Manual",
        description: "A guide to improving combat effectiveness",
        rarity: "common",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 0,
            damageBonus: 10,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 10
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "rabbits_foot",
        name: "Rabbit's Foot",
        description: "A charm said to improve reflexes",
        rarity: "uncommon",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 0,
            dodge: 8,
            luck: 0,
            damageBonus: 0,
            critChance: 5,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "power_gauntlet",
        name: "Power Gauntlet",
        description: "Mechanical gloves that enhance striking power",
        rarity: "rare",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 0,
            damageBonus: 15,
            critChance: 0,
            attackSpeed: -5,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "magnetic_field_generator",
        name: "Magnetic Field Generator",
        description: "Device that pulls items toward the user",
        rarity: "uncommon",
        effects: {
            maxHealth: 0,
            healthRegen: 0,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 5,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 50,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    },
    {
        id: "hearty_meal",
        name: "Hearty Meal",
        description: "A nutritious feast that fortifies the body",
        rarity: "common",
        effects: {
            maxHealth: 25,
            healthRegen: 1,
            armor: 0,
            speed: 0,
            dodge: 0,
            luck: 0,
            damageBonus: 0,
            critChance: 0,
            attackSpeed: 0,
            pickup_range: 0,
            xp_gain: 0
        },
        isStartingItem: true,
        parents: null
    }
];

// Helper function to get item by ID
function getItemById(id) {
    return STARTING_ITEMS.find(item => item.id === id);
}


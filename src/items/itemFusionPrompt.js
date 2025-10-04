// Item Fusion Prompt Template
// This prompt instructs the LLM how to combine two items

function createItemFusionPrompt(item1, item2) {
    // Helper function to format effects (only show non-zero values)
    const formatEffects = (effects) => {
        const nonZero = {};
        for (const [key, value] of Object.entries(effects)) {
            if (value !== 0) {
                nonZero[key] = value;
            }
        }
        return JSON.stringify(nonZero, null, 2);
    };

    return `You are a creative game designer creating items for a roguelike game similar to Brotato. Two items are being combined to create a new, unique item.

Parent Item 1:
Name: ${item1.name}
Description: ${item1.description}
Rarity: ${item1.rarity}
Effects: ${formatEffects(item1.effects)}

Parent Item 2:
Name: ${item2.name}
Description: ${item2.description}
Rarity: ${item2.rarity}
Effects: ${formatEffects(item2.effects)}

Create a new item that combines thematic elements and effects from both parents. The new item should:
- Have a creative name that reflects both parents (or an "upgraded" version if combining the same item)
- Have an engaging description (max 15 words)
- Have effects that are a fusion of both parents' effects (combine, average, or create synergies)
- Have balanced stats (total stat value should be roughly the sum of both parents, distributed creatively)
- Have a rarity equal to or one tier higher than the highest parent rarity (if synergistic)

Rarity tiers: common < uncommon < rare < epic < legendary

Respond with ONLY valid JSON in this exact format:
{
  "name": "New Item Name",
  "description": "Item description here",
  "rarity": "uncommon",
  "effects": {
    "maxHealth": 0,
    "healthRegen": 0,
    "armor": 0,
    "speed": 0,
    "dodge": 0,
    "luck": 0,
    "damageBonus": 0,
    "critChance": 0,
    "attackSpeed": 0,
    "pickup_range": 0,
    "xp_gain": 0
  }
}

Do not include any text outside the JSON object. Do not use markdown code blocks.`;
}


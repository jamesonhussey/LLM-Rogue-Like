// LLM Item Generator
// Handles API calls to Groq/OpenAI for item generation

class ItemGenerator {
    constructor() {
        this.isGenerating = false;
    }

    // Main function to combine two items
    async combineItems(item1, item2) {
        // Check cache first
        const cached = itemStorage.getCachedCombination(item1.id, item2.id);
        if (cached) {
            console.log('✨ Using cached combination');
            return { item: cached.item, fromCache: true };
        }

        // Generate new item via LLM
        this.isGenerating = true;
        try {
            const generatedItem = await this.generateWithLLM(item1, item2);
            const storedItem = itemStorage.storeCombination(item1.id, item2.id, generatedItem);
            this.isGenerating = false;
            return { item: storedItem, fromCache: false };
        } catch (error) {
            this.isGenerating = false;
            throw error;
        }
    }

    // Generate item using LLM
    async generateWithLLM(item1, item2) {
        if (!validateConfig()) {
            throw new Error('API key not configured. Please check config.js');
        }

        const prompt = this.createPrompt(item1, item2);
        const response = await this.callLLMAPI(prompt);
        const item = this.parseResponse(response, item1, item2);
        
        return item;
    }

    // Create prompt for LLM (uses external prompt template)
    createPrompt(item1, item2) {
        return createItemFusionPrompt(item1, item2);
    }

    // Call LLM API (Groq or OpenAI)
    async callLLMAPI(prompt) {
        const isGroq = CONFIG.USE_API === 'groq';
        const endpoint = isGroq ? CONFIG.GROQ_ENDPOINT : CONFIG.OPENAI_ENDPOINT;
        const apiKey = isGroq ? CONFIG.GROQ_API_KEY : CONFIG.OPENAI_API_KEY;
        const model = isGroq ? CONFIG.GROQ_MODEL : CONFIG.OPENAI_MODEL;

        console.log(`🤖 Calling ${CONFIG.USE_API.toUpperCase()} API...`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8, // Higher temperature for more creativity
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Parse LLM response and create item object
    parseResponse(responseText, item1, item2) {
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = responseText.trim();
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
            cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            cleanedResponse = cleanedResponse.trim();

            const parsed = JSON.parse(cleanedResponse);

            // Validate structure
            if (!parsed.name || !parsed.description || !parsed.rarity || !parsed.effects) {
                throw new Error('Invalid response structure from LLM');
            }

            // Generate unique ID
            const timestamp = Date.now();
            const id = `generated_${item1.id}_${item2.id}_${timestamp}`;

            // Create full item object
            const item = {
                id: id,
                name: parsed.name,
                description: parsed.description,
                rarity: parsed.rarity,
                effects: {
                    maxHealth: parsed.effects.maxHealth || 0,
                    healthRegen: parsed.effects.healthRegen || 0,
                    armor: parsed.effects.armor || 0,
                    speed: parsed.effects.speed || 0,
                    dodge: parsed.effects.dodge || 0,
                    luck: parsed.effects.luck || 0,
                    damageBonus: parsed.effects.damageBonus || 0,
                    critChance: parsed.effects.critChance || 0,
                    attackSpeed: parsed.effects.attackSpeed || 0,
                    pickup_range: parsed.effects.pickup_range || 0,
                    xp_gain: parsed.effects.xp_gain || 0
                },
                isStartingItem: false,
                parents: [item1.id, item2.id]
            };

            console.log('✅ Successfully generated item:', item.name);
            return item;

        } catch (error) {
            console.error('❌ Failed to parse LLM response:', error);
            console.error('Raw response:', responseText);
            throw new Error(`Failed to parse LLM response: ${error.message}`);
        }
    }
}

// Create global instance
const itemGenerator = new ItemGenerator();


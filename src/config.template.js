// API Configuration Template
// INSTRUCTIONS: Copy this file to 'config.js' and add your API key

const CONFIG = {
    // Get free API key from: https://console.groq.com
    GROQ_API_KEY: 'YOUR_API_KEY_HERE',
    
    // Alternative: OpenAI API key from: https://platform.openai.com/api-keys
    OPENAI_API_KEY: '',
    
    // Which API to use: 'groq' or 'openai'
    USE_API: 'groq',
    
    // Model selection
    GROQ_MODEL: 'llama-3.3-70b-versatile', // Fast and good quality (updated model)
    OPENAI_MODEL: 'gpt-4o-mini', // Cost-effective
    
    // API Endpoints
    GROQ_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
    OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
};

// Validate configuration
function validateConfig() {
    if (CONFIG.USE_API === 'groq' && CONFIG.GROQ_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('⚠️ Please add your Groq API key to config.js');
        return false;
    }
    if (CONFIG.USE_API === 'openai' && !CONFIG.OPENAI_API_KEY) {
        console.error('⚠️ Please add your OpenAI API key to config.js');
        return false;
    }
    return true;
}


# LLM Item Fusion Prototype

A prototype demonstrating LLM-powered item combination mechanics for a roguelike game.

## Quick Start

### 1. Get API Key (Free)

**Option A: Groq (Recommended - Free & Fast)**
1. Visit https://console.groq.com
2. Sign up for a free account
3. Create an API key

**Option B: OpenAI (Alternative)**
1. Visit https://platform.openai.com/api-keys
2. Sign up and add payment method
3. Create an API key

### 2. Configure API Key

**⚠️ IMPORTANT: Never commit your API key to git!**

The `config.js` file is already in `.gitignore` to protect your API key.

1. Open `src/config.js` file
2. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   GROQ_API_KEY: 'gsk_your_actual_key_here'
   ```
3. **Verify it's ignored**: Run `git status` - you should NOT see `config.js` listed

### 3. Run the Prototype

Simply open `index.html` in your web browser. No server needed!

**Or use a local server (optional, better for development):**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have it)
npx http-server
```

Then visit `http://localhost:8000`

## How to Use

1. **Select two items** from the dropdown menus (can be the same item!)
2. Click **"Combine Items"**
3. Watch as the LLM generates a new, unique item
4. The new item appears in your inventory
5. **Combine generated items** to create even more unique combinations!

## Features

- ✅ 10 starting items inspired by Brotato
- ✅ LLM-powered item generation (Groq or OpenAI)
- ✅ Combination caching (avoid redundant API calls)
- ✅ Growing inventory (combine generated items)
- ✅ JSON output viewer for debugging
- ✅ Error handling and loading states

## Project Structure

```
/src
  - index.html              # Main UI
  - styles.css              # Styling
  - config.js               # API configuration (YOU NEED TO EDIT THIS)
  - startingItems.js        # 10 base items
  - itemGenerator.js        # LLM integration
  - itemStorage.js          # Caching system
  - ui.js                   # UI logic
```

## Tips for Demo

1. **Pre-test combinations** before your meeting to find interesting results
2. **Show the prompt** - demonstrate your prompt engineering
3. **Show the caching** - combine the same items twice to show instant retrieval
4. **Discuss costs** - explain how caching reduces API costs
5. **Scale discussion** - talk about how this extends to NPCs, quests, etc.

## Troubleshooting

**"API Error" message:**
- Check that your API key is correct in `config.js`
- Verify you have credits/access on Groq or OpenAI
- Check browser console (F12) for detailed errors

**No response from LLM:**
- Check your internet connection
- Verify API key is valid
- Try switching between Groq and OpenAI in config

**CORS errors:**
- Some browsers block API calls from local files
- Use a local server (see setup instructions above)

## Next Steps

Once this prototype works:
- [ ] Integrate into Phaser game engine
- [ ] Add visual item sprites
- [ ] Implement stat effects on player
- [ ] Add shop system between waves
- [ ] Polish UI with animations
- [ ] Deploy to web hosting

## License

MIT - Feel free to use!


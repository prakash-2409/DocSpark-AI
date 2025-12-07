# 🎯 Quick Start Guide - ConvertFlow AI

## Try the AI Features (Demo Mode)

The app is currently running in **demo mode** with simulated AI responses. Follow these steps to test it:

### 1. Start the App
```bash
npm run dev
```
The app should be running at `http://localhost:5173`

### 2. Test Free Features
- Type some text in the editor
- Use the formatting toolbar (Bold, Italic, Strike, Code)
- Export your document as PDF, DOCX, or TXT

### 3. Test AI Features (Demo Mode)

#### Step-by-step:
1. **Type some text** in the editor (e.g., "This is a complex sentence that needs improvement.")
2. **Select the text** by clicking and dragging
3. **Click the "AI Tools" button** (purple gradient button with sparkles ✨)
4. **Choose an AI feature**:
   - **Auto Enhance**: Improves writing quality
   - **Simplify**: Makes text easier to understand
   - **Make Better Points**: Converts to bullet points
   - **Summarize**: Creates a summary
   - **Change Tone**: Rewrite in different tones (Professional, Casual, Academic, etc.)
   - **Translate**: Translate to another language
   - **Fix Grammar**: Corrects errors
   - **Continue Writing**: AI continues your text

5. **Watch the magic happen!** 🎉

### 4. Test Upgrade Flow

As a **free user**, you'll see:
- Crown icon (👑) next to AI Tools button
- "Upgrade to Premium" button in the header
- Upgrade prompt when clicking AI features

Click **"Upgrade"** to see the pricing modal with:
- Three pricing tiers (Free, Pro, Enterprise)
- Detailed feature comparison table
- Trust badges

### 5. Simulate Pro User

To test as a Pro user:
1. Open `src/App.jsx`
2. Find line: `const [userPlan, setUserPlan] = useState('free');`
3. Change to: `const [userPlan, setUserPlan] = useState('pro');`
4. Save the file (Vite will hot-reload)
5. Now you can use all AI features!

## 🚀 Enable Real AI (Production)

### Quick Setup (5 minutes)

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Copy it

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key**
   ```env
   VITE_AI_PROVIDER=openai
   VITE_AI_API_KEY=sk-your-actual-key-here
   VITE_AI_MODEL=gpt-4
   ```

4. **Update aiService.js**
   - Open `src/services/aiService.js`
   - Find the `callOpenAI` function
   - Uncomment the actual API code (lines ~26-47)
   - Comment out the mock implementation (lines ~49-52)

5. **Restart the dev server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

6. **Test with real AI!**
   - Select text
   - Use any AI feature
   - See real AI-powered results! 🎉

## 💡 Demo Scenarios

### Scenario 1: Enhance Professional Email
```
Original: "hey can u send me the report asap thx"

1. Select the text
2. Click AI Tools → Auto Enhance
3. Result: Professional, well-formatted email
```

### Scenario 2: Simplify Technical Content
```
Original: "The implementation leverages a microservices architecture with containerized deployments orchestrated via Kubernetes."

1. Select the text
2. Click AI Tools → Simplify
3. Result: Easy-to-understand explanation
```

### Scenario 3: Create Meeting Notes
```
Original: Long paragraph about meeting discussion

1. Select the text
2. Click AI Tools → Make Better Points
3. Result: Clean bullet points of key takeaways
```

### Scenario 4: Change Tone
```
Original: "I think we should probably consider maybe doing this."

1. Select the text
2. Click AI Tools → Change Tone → Professional
3. Result: "I recommend we proceed with this approach."
```

## 🎨 Customization Ideas

### Add Your Own AI Feature

1. **Define the action** in `AIToolbar.jsx`:
```javascript
{
    id: 'make-viral',
    label: 'Make Viral',
    icon: TrendingUp,
    color: 'from-red-500 to-orange-500',
    description: 'Rewrite for social media engagement',
    premium: true
}
```

2. **Create the AI function** in `aiService.js`:
```javascript
async makeViral(text) {
    const systemPrompt = `Rewrite this text to be highly engaging for social media...`;
    const result = await callAI(text, systemPrompt);
    return `<p>${result}</p>`;
}
```

3. **Add to switch statement** in `AIToolbar.jsx`:
```javascript
case 'make-viral':
    result = await AIService.makeViral(text);
    break;
```

## 📊 Feature Comparison

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| Text Editing | ✅ Full | ✅ Full |
| Export (PDF/DOCX/TXT) | ✅ Full | ✅ Full |
| AI Features | 🎭 Simulated | 🤖 Real AI |
| Response Quality | 📝 Basic | 🌟 Advanced |
| Response Time | ⚡ Instant | ⏱️ 1-3 seconds |
| Cost | 💰 Free | 💳 API costs |

## 🐛 Troubleshooting

### AI Features Not Working?
1. Check if text is selected
2. Verify you're on Pro plan (or simulated as Pro)
3. Check browser console for errors
4. Ensure API key is set (production mode)

### Pricing Modal Not Showing?
1. Click the "Upgrade" button in header
2. Or click any AI feature as free user

### Export Not Working?
1. Make sure you have content in the editor
2. Check browser console for errors
3. Try different export format

## 🎯 Next Steps

1. ✅ Test all AI features in demo mode
2. ✅ Customize the pricing
3. ✅ Add your branding
4. ✅ Set up real AI API
5. ✅ Integrate payment provider (Stripe)
6. ✅ Deploy to production
7. ✅ Market your product!

## 💰 Monetization Tips

1. **Freemium Model**: Offer basic features free, charge for AI
2. **Usage-Based**: Charge per AI request
3. **Tiered Pricing**: Free, Pro ($9.99), Enterprise (Custom)
4. **Annual Discount**: Offer 20% off for annual plans
5. **Lifetime Deal**: One-time payment for early adopters

## 🚀 Launch Checklist

- [ ] Test all features thoroughly
- [ ] Set up real AI API
- [ ] Integrate payment provider
- [ ] Add user authentication
- [ ] Set up analytics
- [ ] Create landing page
- [ ] Prepare marketing materials
- [ ] Deploy to production
- [ ] Set up customer support
- [ ] Launch! 🎉

---

**Questions?** Check the main README.md for detailed documentation.

**Ready to make it better than Notion AI?** Let's go! 🚀

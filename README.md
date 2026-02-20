# ConvertFlow AI - Premium Text Editor with AI Features

A powerful text editor with advanced AI capabilities that rivals and exceeds Notion AI. Built with React, TipTap, and integrated with AI services.

## 🚀 Features

### Free Tier
- ✅ Basic rich text editing
- ✅ Export to PDF, DOCX, TXT
- ✅ Rich text formatting (Bold, Italic, Strike, Code)
- ✅ Up to 5 documents per month
- ✅ Community support

### Pro Tier ($9.99/month) ⭐
Everything in Free, plus:

#### AI Text Enhancement Features
1. **✨ Auto Enhance** - Improve writing quality and clarity automatically
2. **🪄 Simplify** - Make complex text easier to understand
3. **📋 Make Better Points** - Convert text into clear, actionable bullet points
4. **📄 Summarize** - Create concise summaries of long text
5. **🎨 Change Tone** - Rewrite text in 6 different tones:
   - 💼 Professional
   - 😊 Casual
   - 🎓 Academic
   - 🎨 Creative
   - 🎯 Persuasive
   - 🤝 Friendly
6. **🌍 Translate** - Translate to 100+ languages
7. **✅ Fix Grammar** - Correct grammar and spelling errors
8. **✍️ Continue Writing** - AI continues your text naturally

#### Additional Pro Benefits
- Unlimited documents
- Unlimited exports
- No watermarks on PDFs
- Priority support
- Advanced formatting
- Custom templates

### Enterprise Tier (Custom Pricing)
Everything in Pro, plus:
- Custom AI models
- Team collaboration
- Admin dashboard
- SSO & SAML
- Dedicated support
- Custom integrations
- API access
- White-label options
- SLA guarantee

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenAI GPT-4 / Anthropic Claude (configurable)
- **Export**: jsPDF, docx, file-saver

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔑 AI Setup (Production)

### Step 1: Choose Your AI Provider

We support multiple AI providers:
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
- **Cohere**
- **Custom API endpoints**

### Step 2: Get API Keys

#### For OpenAI:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (you won't see it again!)

#### For Anthropic:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for an account
3. Navigate to API Keys
4. Generate a new API key
5. Copy the key

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# AI Provider Configuration
VITE_AI_API_KEY=your_api_key_here
VITE_AI_PROVIDER=openai  # or 'anthropic', 'cohere'
VITE_AI_MODEL=gpt-4      # or 'claude-3-opus-20240229'
```

### Step 4: Update AI Service

Edit `src/services/aiService.js`:

1. Uncomment the actual API call code
2. Comment out or remove the mock implementations
3. Configure your preferred model and parameters

Example for OpenAI:
```javascript
const AI_CONFIG = {
    provider: 'openai',
    apiKey: import.meta.env.VITE_AI_API_KEY,
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
};
```

### Step 5: Test AI Features

1. Run the development server: `npm run dev`
2. Upgrade to Pro plan (in demo mode, just click Upgrade)
3. Type some text in the editor
4. Select the text
5. Click "AI Tools" button
6. Try any AI feature

## 💰 Payment Integration (Production)

To enable real payments, integrate with a payment provider:

### Stripe Integration (Recommended)

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Update `src/App.jsx`:
```javascript
const handleSelectPlan = async (planId) => {
    if (planId === 'pro') {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe('your_publishable_key');
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: 'price_xxxxx', quantity: 1 }],
            mode: 'subscription',
            successUrl: window.location.origin + '/success',
            cancelUrl: window.location.origin + '/cancel',
        });
    }
};
```

### Alternative Payment Providers
- **PayPal**: Use PayPal Subscriptions API
- **Paddle**: Great for SaaS businesses
- **LemonSqueezy**: Simple merchant of record

## 🎨 Customization

### Modify AI Prompts

Edit `src/services/aiService.js` to customize AI behavior:

```javascript
async enhanceText(text) {
    const systemPrompt = `Your custom prompt here...`;
    // ...
}
```

### Add New AI Features

1. Add new action to `aiActions` array in `AIToolbar.jsx`
2. Create corresponding function in `aiService.js`
3. Add case in `handleAIAction` switch statement

Example:
```javascript
// In AIToolbar.jsx
{
    id: 'expand',
    label: 'Expand Text',
    icon: Maximize2,
    color: 'from-cyan-500 to-blue-500',
    description: 'Add more details and examples',
    premium: true
}

// In aiService.js
async expandText(text) {
    const systemPrompt = `Expand this text with more details...`;
    const result = await callAI(text, systemPrompt);
    return `<p>${result}</p>`;
}
```

### Customize Pricing

Edit `src/components/PricingModal.jsx`:
```javascript
{
    id: 'pro',
    name: 'Pro',
    price: '$19.99',  // Change price
    period: 'per month',
    // ... modify features
}
```

## 📊 Analytics & Monitoring

### Track AI Usage

Add analytics to track feature usage:

```javascript
// In AIToolbar.jsx
const handleAIAction = async (actionId, tone = null) => {
    // Track usage
    analytics.track('AI Feature Used', {
        feature: actionId,
        tone: tone,
        userId: currentUser.id,
        plan: userPlan
    });
    
    // ... rest of the code
};
```

### Monitor API Costs

```javascript
// In aiService.js
async callAI(prompt, systemPrompt = '') {
    const startTime = Date.now();
    const result = await fetch(/* ... */);
    const endTime = Date.now();
    
    // Log usage
    console.log({
        duration: endTime - startTime,
        tokens: result.usage.total_tokens,
        cost: calculateCost(result.usage.total_tokens)
    });
    
    return result;
}
```

## 🔒 Security Best Practices

1. **Never expose API keys in frontend code**
   - Use environment variables
   - Implement backend proxy for API calls

2. **Rate Limiting**
   - Limit AI requests per user
   - Implement cooldown periods

3. **Input Validation**
   - Sanitize user input
   - Limit text length
   - Prevent prompt injection

4. **User Authentication**
   - Implement proper auth (Firebase, Auth0, Supabase)
   - Verify user plan before AI access

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop 'dist' folder to Netlify
```

### Environment Variables
Don't forget to add your environment variables in your deployment platform:
- `VITE_AI_API_KEY`
- `VITE_AI_PROVIDER`
- `VITE_AI_MODEL`

## 📈 Roadmap

- [ ] Real-time collaboration
- [ ] Version history
- [ ] Custom AI model fine-tuning
- [ ] Voice-to-text integration
- [ ] Advanced export options (Markdown, LaTeX)
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

## 💡 Why ConvertFlow AI is Better Than Notion AI

| Feature | ConvertFlow AI | Notion AI |
|---------|---------------|-----------|
| **Price** | $9.99/month | $10/month |
| **AI Features** | 8+ specialized tools | Limited features |
| **Tone Options** | 6 different tones | Basic rewriting |
| **Export Formats** | PDF, DOCX, TXT, HTML | Limited |
| **Customization** | Fully customizable | Locked down |
| **Open Source** | Yes | No |
| **Offline Mode** | Coming soon | No |
| **API Access** | Enterprise plan | Not available |

## 🆘 Support

- **Documentation**: [docs.convertflow.ai](https://docs.convertflow.ai)
- **Email**: support@convertflow.ai
- **Discord**: [Join our community](https://discord.gg/convertflow)
- **GitHub Issues**: [Report bugs](https://github.com/yourrepo/issues)

## 🎉 Credits

Built with ❤️ using:
- [React](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)


---

**Made with 🚀 by Your Team**

*Transform your writing with AI-powered intelligence.*

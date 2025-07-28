# AI Chat Pro - Complete SaaS Platform

A complete, production-ready AI chat SaaS platform built with SvelteKit, featuring user authentication, subscription management, and AI-powered conversations using Google's Gemini 1.5 Pro.

## 🚀 Features

- **AI Chat Interface**: Powered by Google Gemini 1.5 Pro API
- **User Authentication**: Complete registration/login system with Supabase
- **Tiered Subscriptions**: Free, Pro, and Enterprise plans
- **Multi-Payment Support**: Stripe, PayPal, with placeholders for Georgian banks
- **Token/Credit System**: Usage tracking and limits per plan
- **Admin Panel**: User management and analytics dashboard
- **Responsive Design**: Modern UI with TailwindCSS and DaisyUI
- **Production Ready**: Error handling, security, and optimization

## 🛠️ Tech Stack

- **Frontend & Backend**: SvelteKit
- **Styling**: TailwindCSS + DaisyUI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe + PayPal
- **AI**: Google Generative Language API (Gemini 1.5 Pro)
- **Deployment**: Vercel (configured)

## 📋 Prerequisites

Before setting up the project, you'll need accounts and API keys for:

1. **Supabase** - Database and Authentication
2. **Google AI Studio** - Gemini API access
3. **Stripe** - Payment processing
4. **PayPal Developer** - PayPal payments

## 🚀 Quick Setup

### 1. Clone and Install Dependencies

The dependencies are already installed. You can run:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Fill in your API keys in `.env`:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Stripe Configuration
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox

# Application Configuration
PUBLIC_APP_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`
4. This will create all necessary tables, policies, and triggers

### 4. Stripe Setup

1. Create products and prices in your Stripe dashboard:
   - Pro Plan: $9.99/month
   - Enterprise Plan: $29.99/month
2. Update the `priceId` values in `src/lib/server/stripe.js`
3. Set up webhook endpoint: `your-domain.com/api/payments/stripe/webhook`

### 5. PayPal Setup

1. Create a PayPal Developer account
2. Create a new application
3. Use sandbox credentials for development

### 6. Google AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

## 🏃‍♂️ Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   ├── server/             # Server-side utilities
│   ├── stores/             # Svelte stores for state management
│   └── supabase.js         # Supabase client configuration
├── routes/
│   ├── api/                # API endpoints
│   ├── auth/               # Authentication pages
│   ├── admin/              # Admin dashboard
│   ├── chat/               # Chat interface
│   ├── pricing/            # Pricing page
│   ├── billing/            # Billing management
│   └── dashboard/          # User dashboard
└── app.html                # Main HTML template
```

## 🔐 Authentication Flow

1. Users sign up with email/password
2. Supabase handles authentication
3. User profile is automatically created via database trigger
4. JWT tokens manage session state

## 💳 Payment Flow

### Stripe
1. User selects plan → Creates Stripe Checkout session
2. User completes payment → Webhook updates user subscription
3. Monthly billing automatically resets token limits

### PayPal
1. User selects plan → Creates PayPal order
2. User approves payment → Captures payment and updates subscription

## 🤖 AI Chat System

1. User sends message → Checks token limits
2. Calls Gemini API with conversation context
3. Updates token usage and stores conversation
4. Returns AI response to user

## 👨‍💼 Admin Features

- User management and analytics
- Usage monitoring and statistics
- Subscription and payment tracking
- System health monitoring

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all environment variables in your production environment:
- Update `PUBLIC_APP_URL` to your production domain
- Use production API keys for all services
- Set `PAYPAL_ENVIRONMENT=live` for production

## 🔧 Configuration

### Subscription Plans

Edit plans in `src/lib/server/stripe.js`:

```javascript
export const SUBSCRIPTION_PLANS = {
  free: { tokens: 1000, price: 0 },
  pro: { tokens: 50000, price: 9.99 },
  enterprise: { tokens: 200000, price: 29.99 }
}
```

### Token Limits

Token consumption is estimated at ~4 characters per token. Adjust limits based on your needs.

## 🛡️ Security Features

- Row Level Security (RLS) on all database tables
- JWT token validation for API endpoints
- Input sanitization and validation
- Rate limiting on AI endpoints
- Secure webhook signature verification

## 📊 Monitoring & Analytics

The admin dashboard provides:
- User registration and activity metrics
- Revenue and subscription analytics
- Token usage patterns
- System performance indicators

## 🔄 Database Schema

Key tables:
- `user_profiles`: User data and subscription info
- `chat_messages`: Conversation history
- `payments`: Payment records
- `paypal_orders`: PayPal transaction tracking

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection**: Verify URL and keys in environment
2. **Stripe Webhooks**: Ensure webhook endpoint is accessible
3. **Gemini API**: Check API key and quota limits
4. **PayPal Sandbox**: Use test credentials for development

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting section

---

**Built with ❤️ using SvelteKit, Supabase, and modern web technologies.**
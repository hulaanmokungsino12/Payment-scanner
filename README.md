PaymentScanner

A mobile application that uses AI to scan customer orders, organize payment records, and manage orders for people who likes to sell and manages orders.

## Features

- **AI Order Scanning** — Extracts customer names, items, and quantities from order images using Gemini AI.
- **Payment Management** — Organizes orders into Cash and GCash records.
- **Order Tracking** — Update order details and mark payments as paid.
- **User Authentication** — Secure login and registration using Supabase.
- **Cloud Database** — Stores order records in Supabase for access across devices.
- **User Roles** — Supports administrator and regular user accounts.

## Technologies Used

- React Native and Expo
- TypeScript
- Google Gemini API
- Node.js and Express
- Supabase Authentication and PostgreSQL
- Render
- Expo Application Services (EAS)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/hulaanmokungsino12/Payment-scanner.git
cd PaymentScanner-github
```

### 2. Install Dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 3. Configure Supabase

Create a Supabase project and configure the required database tables, authentication, and Row Level Security (RLS) policies using `supabase/schema.sql`.

Configure these environment variables for the Expo application:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

### 4. Configure Google Gemini AI

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with a Google account and obtain a Gemini API key.
3. Configure API access and billing or usage limits as required for your account.
4. Add the key to the Render backend environment variables as `GEMINI_API_KEY`.

### 5. Configure Render

Deploy the `server` directory to Render and configure these environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Keep all secret keys private. Do not commit `.env` files to GitHub.

### 6. Build the Android APK

Configure the Expo environment variables for the `preview` environment, then run:

```bash
eas login
eas build --platform android --profile preview --environment preview
```

Download the generated APK from the Expo build page and install it on your Android device.

## AI Tools Used

**ChatGPT (OpenAI)** was the only AI tool used to assist with system development, including programming guidance, debugging, and troubleshooting.

**Google Gemini AI** is integrated into the application to process order images and extract order information.

## Test Accounts

Personal Gmail accounts were used to test the administrator and regular user roles.

For privacy and security, actual email addresses and passwords are not included in this repository. Test accounts must be registered and assigned the appropriate roles in Supabase.

## Security

- Protected backend endpoints require valid authentication.
- Supabase RLS policies should enforce database permissions.
- Administrative actions should be restricted to authorized users.
- Never expose secret or `service_role` keys in the mobile application or public repository.


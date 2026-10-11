## PaymentScanner

A mobile application that uses AI to scan customer orders, organize payment records, and manage orders for people who likes to sell food online and manually organize and compute their earnings.

## Problems Being Solved

**Manual Order Recording**
- Recording customer orders manually can be time-consuming and may lead to errors when writing down names, items, and quantities.

**Time-Consuming Order Processing**
- A person need to read and transfer order details into records. AI-powered scanning helps reduce this manual work.

**Disorganized Payment Records**
- Managing Cash and GCash transactions separately helps organize orders and identify their payment status more easily.

**Difficult Payment Tracking**
- Keeping track of paid and unpaid orders can be challenging without a centralized record.

**Manual Compute of Sale**
- Manual computing the total sale and figuring out who paid cash and gcash is time consuming and may lead to errors.

## Features

- **AI Order Scanning** — Extracts customer names, items, and quantities from order images using Gemini AI.
- **Payment Management** — Organizes orders into Cash and GCash records.
- **Order Tracking** — Update order details and mark payments as paid.
- **User Authentication** — Secure login and registration using Supabase.
- **Cloud Database** — Stores order records in Supabase for access across devices.
- **User Roles** — Supports administrator and regular user accounts.

## Admin and Staff Access

The application has two user roles with different permissions.

### Administrator
- Access the same order-management features as Staff.
- Delete order records when necessary.

### Staff
- Scan customer orders using the AI-powered scanner.
- View and manage order details.
- Organize orders under Cash and GCash.
- Update order information and mark payments as paid.

**Access Control:** Only authorized administrator accounts can perform administrative deletion actions. Database permissions are enforced through Supabase Row Level Security (RLS) policies.

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

**Test Admin Account** 
- Hi Sir. Joaquin, chinat po kita para po gawin kong admin yung ireregister nyo po na email account since yun po logical way na naisip ko para sa system ko na sa supabase yung pag handle ng mga accounts, since i pupublic ko po tong repository. thank you po.

**Regular User/staff Account**
- kindly register any valid accounts using the mobile application, an email confirmation is needed after registration.

## Security

- Protected backend endpoints require valid authentication.
- Supabase RLS policies should enforce database permissions.
- Administrative actions should be restricted to authorized users.
- Never expose secret or `service_role` keys in the mobile application or public repository.

## Download the Android APK

You can download and install the Android APK of The Crisostomos — PaymentScanner using the link below.

**[Download The Crisostomos APK](https://expo.dev/accounts/hulaanmokungsino/projects/PaymentScanner/builds/2ede34a4-64b0-4fa6-80a6-d6ff55e1ae02)**

**Installation Instructions:**
1. Open the download link on your Android device.
2. Download the APK file from the Expo build page.
3. Open the downloaded APK and follow the installation instructions.
4. If prompted, allow your browser or file manager to install apps from that source.

*Note: This application is intended for Android devices. Only install APK files from sources you trust.*

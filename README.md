# \# PaymentScanner

# 

# A mobile order-management application I created mainly for people who manages their own orders when it comes to selling food in their own community, that uses AI-powered image scanning to extract customer orders and organize them according to payment method. The application integrates Gemini AI, Supabase, and a Node.js backend to help streamline order recording and payment tracking.

# 

# \## Features

# 

# \- \*\*AI-Powered Order Scanning\*\* — Capture an image of an order or customer message and use Gemini AI to extract structured order information.

# \- \*\*Automatic Order Extraction\*\* — Identify customer names, ordered items, quantities, and payment information from scanned content.

# \- \*\*Payment Categorization\*\* — Organize orders into separate Cash and GCash records.

# \- \*\*Order Management\*\* — View and update customer names, items, and quantities.

# \- \*\*Payment Tracking\*\* — Mark orders as paid and view payment totals.

# \- \*\*Cloud Database\*\* — Store orders in Supabase so authorized users can access shared records across devices.

# \- \*\*User Authentication\*\* — Register and log in using Supabase Authentication.

# \- \*\*Role-Based Access\*\* — Support admin and staff roles, with administrative deletion permissions enforced through the appropriate database policies.

# \- \*\*Secure Scanning Endpoint\*\* — Require a valid Supabase access token when submitting images to the Render backend.

# 

# \## Technology Stack

# 

# | Technology | Purpose |

# |---|---|

# | React Native | Mobile application |

# | Expo | Development and Android builds |

# | Expo Router | Application navigation |

# | TypeScript | Application development |

# | Gemini AI | AI-powered image and order extraction |

# | Node.js and Express | Backend API |

# | Render | Backend hosting |

# | Supabase Auth | User authentication |

# | Supabase PostgreSQL | Cloud order storage |

# | AsyncStorage | Local persistence of authentication sessions |

# 

# \## Project Structure

# 

# ```text

# PaymentScanner/

# ├── src/

# │   ├── app/

# │   │   ├── \_layout.tsx

# │   │   ├── index.tsx

# │   │   ├── login.tsx

# │   │   ├── register.tsx

# │   │   ├── dashboard.tsx

# │   │   ├── cash.tsx

# │   │   ├── gcash.tsx

# │   │   └── unknown.tsx

# │   ├── contexts/

# │   │   └── AuthContext.tsx

# │   └── lib/

# │       ├── orders.ts

# │       └── supabase.ts

# ├── server/

# │   ├── server.js

# │   └── package.json

# ├── supabase/

# │   └── schema.sql

# ├── app.json

# ├── eas.json

# ├── package.json

# └── README.md

# ```

# 

# \## How It Works

# 

# 1\. A user logs in to the application.

# 2\. The user captures a photo containing order information.

# 3\. The mobile application sends the image and the user's Supabase access token to the backend API.

# 4\. The backend validates the access token with Supabase Authentication.

# 5\. Gemini AI processes the image and extracts the order information.

# 6\. The application organizes the resulting records according to payment method.

# 7\. Orders are saved to the Supabase database and can be accessed by authorized users on other devices.

# 

# \## Requirements

# 

# Before setting up the project, install:

# 

# \- Node.js and npm

# \- Expo CLI through the EAS CLI

# \- An Expo account

# \- A Supabase project

# \- A Gemini API key

# \- A Render account for backend hosting

# 

# \## Installation

# 

# \### 1. Clone the Repository

# 

# ```bash

# git clone https://github.com/hulaanmokungsino12/Payment-scanner.git

# cd PaymentScanner-github

# ```

# 

# Use the actual directory name created by Git if it differs from the example above.

# 

# \### 2. Install Dependencies

# 

# Install the mobile application dependencies:

# 

# ```bash

# npm install

# ```

# 

# If the backend dependencies are managed separately, install them as well:

# 

# ```bash

# cd server

# npm install

# cd ..

# ```

# 

# \### 3. Configure Environment Variables

# 

# Create a local `.env` file in the project root for the Expo application.

# 

# ```env

# EXPO\_PUBLIC\_SUPABASE\_URL=your\_supabase\_project\_url

# EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY=your\_supabase\_publishable\_or\_anon\_key

# ```

# 

# Replace the placeholder values with your actual Supabase project URL and publishable key or legacy anon key.

# 

# The application reads these variables in `src/lib/supabase.ts`.

# 

# \*\*Important:\*\* Expo public environment variables are embedded in the client application. Never put a Supabase secret key or `service\_role` key in the mobile app.

# 

# \### 4. Configure Expo EAS

# 

# For cloud builds, configure the following environment variables in the Expo dashboard under the `preview` environment:

# 

# \- `EXPO\_PUBLIC\_SUPABASE\_URL`

# \- `EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY`

# 

# Alternatively, configure them using the EAS CLI or the supported Expo environment-variable workflow.

# 

# Verify the configuration with:

# 

# ```bash

# eas env:list --environment preview

# ```

# 

# \### 5. Configure the Backend

# 

# The backend requires its own environment variables. Configure these in the Render service's Environment settings.

# 

# ```env

# SUPABASE\_URL=your\_supabase\_project\_url

# SUPABASE\_ANON\_KEY=your\_supabase\_publishable\_or\_anon\_key

# GEMINI\_API\_KEY=your\_gemini\_api\_key

# ```

# 

# Use the variable names expected by the backend source code. Do not commit actual credentials to GitHub.

# 

# \### 6. Configure Supabase

# 

# 1\. Create or select your Supabase project.

# 2\. Open the SQL Editor.

# 3\. Review and execute the database schema in `supabase/schema.sql`.

# 4\. Configure the required Row Level Security (RLS) policies.

# 5\. Confirm that authentication and database permissions match the application's admin and staff roles.

# 

# The database policies should enforce access restrictions independently of the mobile interface.

# 

# \### 7. Deploy the Backend

# 

# Deploy the `server` directory to Render using the appropriate service configuration.

# 

# Configure the environment variables listed above and deploy the latest version of the backend.

# 

# The mobile application uses the deployed `/scan` endpoint. Update the endpoint in the mobile source if your backend URL changes.

# 

# \## Running the Application

# 

# Start the Expo development server:

# 

# ```bash

# npx expo start

# ```

# 

# Follow the Expo instructions to run the application on a compatible device or development environment.

# 

# \## Building an Android APK

# 

# The project uses EAS Build to generate an installable Android APK through the `preview` profile.

# 

# Log in to Expo:

# 

# ```bash

# eas login

# ```

# 

# Build the APK:

# 

# ```bash

# eas build --platform android --profile preview --environment preview

# ```

# 

# The `preview` profile in `eas.json` specifies the Android build type as `apk`.

# 

# After the build completes, download the generated APK from the Expo build page and install it on a compatible Android device.

# 

# Make sure the correct environment variables are configured before building.

# 

# \## Configure Gemini AI for the Scanner

# 

# The AI-powered scanner uses Google's Gemini API to extract customer names, ordered items, quantities, and payment information from captured images.

# 

# To enable the scanner:

# 

# Visit Google AI Studio.

# 

# Sign in with a Google account.

# 

# Set up access to the Gemini API and obtain an API key.

# 

# Configure the required API billing or usage allowance for your account. Depending on the selected model and your usage, paid API access may require enabling billing and purchasing or paying for API usage.

# 

# Add the Gemini API key to the Render backend's environment variables using the name GEMINI\_API\_KEY.

# 

# Redeploy the backend if necessary.

# 

# Important: The scanner will not work correctly if the Gemini API key is missing, invalid, or unable to access the selected model. Keep the API key on the backend and never expose it in the mobile application or public repository.

# 

# Google AI Studio account access and API pricing depend on Google's current availability, usage limits, and billing policies.

# 

# \## Security

# 

# \- Keep `.env` files and private API credentials out of version control.

# \- Use Supabase Authentication to identify users.

# \- Validate access tokens on protected backend endpoints.

# \- Enforce authorization and data access restrictions through Supabase RLS policies.

# \- Restrict administrative actions to authorized admin accounts.

# \- Never expose Supabase secret or `service\_role` keys in the mobile application.

# \- Store backend credentials in Render environment variables.

# \- Do not rely solely on hiding buttons in the application to enforce permissions.

# 

# \## Troubleshooting

# 

# \### Supabase Connection Errors

# 

# Verify that `EXPO\_PUBLIC\_SUPABASE\_URL` and `EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY` contain the correct values in the environment used for the build.

# 

# If an APK was built before configuring these variables, create a new build and install that APK.

# 

# \### Scanner Authentication Errors

# 

# If the scanner reports that authentication is not configured, verify that the Render service has the required Supabase environment variables.

# 

# If authentication fails despite correct configuration, check the backend logs and confirm that the application is sending a valid Supabase access token.

# 

# \### Gemini Scanning Errors

# 

# Check that `GEMINI\_API\_KEY` is configured correctly on Render. Review the backend logs for API errors or request failures.

# 

# \### Build Errors

# 

# Run `npm install` in the project directory. Check the Expo Router dependency and confirm that the EAS `preview` build profile is configured correctly.

# 

# \## License

# 

# No license has been specified yet. Unless a license is added to this repository, reuse and redistribution are not automatically permitted.

# 

# \## AI Tools Used

# 

# ChatGPT (OpenAI) was the only AI tool used during the development of this system. It assisted with programming guidance, debugging, troubleshooting, and improving the implementation of features such as Supabase authentication, Gemini-powered order scanning, database integration, and Android APK builds.

# 

# \## Test Accounts

# 

# The application was tested using personal Gmail accounts registered through the application's authentication system. Separate accounts were used to test the administrator and regular user roles.

# 

# For security and privacy reasons, actual account credentials are not published in this repository. To test the application, authorized testers should use their assigned accounts or register accounts and have the appropriate roles configured in Supabase.


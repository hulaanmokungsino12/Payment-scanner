# PaymentScanner authentication setup

## Included in this pass
- Public mobile-friendly business landing page at `/` with menu, image, Login and Register.
- Login and registration via Supabase Auth.
- Protected `/dashboard`, `/gcash`, `/cash`, and `/unknown` routes: logged-out users are redirected to `/login`.
- New registrations get the `staff` role by default. Clients cannot choose `admin` during registration.
- SQL schema for profiles, roles, and a shared orders table with admin-only delete policy.

## Important limitation
The existing GCash/Cash/Unknown screens and scanner still save order records in local AsyncStorage in this pass. Authentication and route protection are in place, but orders are **not yet synchronized across phones**, and delete restrictions are not yet enforced through the orders table because those screens have not yet been migrated to Supabase. Complete that migration before treating this as a production-secure multi-user system.

## Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env` and fill in the Project URL and anon/publishable key from Supabase Project Settings → API. Never put the `service_role` key in the app.
4. Install dependencies from the project root:
   ```bash
   npm install @supabase/supabase-js react-native-url-polyfill
   ```
5. Start the app again after adding environment variables:
   ```bash
   npx expo start --clear
   ```
6. Register your own account. If email confirmation is enabled, confirm the email first.
7. In Supabase SQL Editor, promote your account to admin by replacing the email in this statement:
   ```sql
   update public.profiles p
   set role = 'admin'
   from auth.users u
   where p.id = u.id and u.email = 'YOUR_EMAIL_HERE';
   ```
8. Log in again. New registrations will remain Staff unless the owner promotes them in the database.

## Security notes
- Supabase Auth hashes passwords on the service side; this app never stores plain-text passwords.
- Keep `server/.env`, app `.env`, and all API secrets out of GitHub and shared ZIP files.
- The app only uses the Supabase anon/publishable key; access is controlled by database RLS.
- The existing Render `/scan` endpoint is not yet protected by a Supabase access-token check. Add that before public/production release.

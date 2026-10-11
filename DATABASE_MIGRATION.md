# PaymentScanner database migration

The GCash, Cash, and Unknown screens now read and write orders through Supabase's `public.orders` table. Gemini image scanning still uses the existing Render `/scan` endpoint; its parsed results are inserted into Supabase after scanning.

## Before testing

1. Use the Supabase project already configured in your `.env` file.
2. Confirm that `supabase/schema.sql` was run successfully in the Supabase SQL Editor. Since the project already has the `profiles` and `orders` tables and their policies, do not rerun the whole schema just for this code update.
3. From the folder containing `package.json`, run `npm install` and `npx expo start --clear`.
4. Sign in with an account that has a `profiles.role` of `admin` or `staff`.

## What changed

- New scans are saved to Supabase with the current user's ID in `created_by`.
- GCash, Cash, and Unknown screens load their records from Supabase.
- Editing a customer, item, or quantity is persisted when Save is pressed.
- Paid/unpaid changes and the Mark All Paid action update Supabase.
- Moving an Unknown payment to GCash or Cash changes the database row's `payment_method`.
- Deletion is enforced by Supabase RLS: only admins can delete, even if someone bypasses the app UI.
- A one-time import attempts to move older `gcashRecords`, `cashRecords`, and `unknownRecords` from this device into Supabase. The local records are removed only after the insert succeeds. Each device has its own local legacy records, so open the updated app on each device and sign in to import that device's old records.
- AsyncStorage remains configured for Supabase Auth session persistence. It is not the active order database anymore; it is also used briefly for the one-time legacy import and its completion flag.

## Suggested test sequence

1. Sign in on one phone and scan a test order.
2. Confirm the order appears under the correct payment method.
3. Open the same account on another phone and confirm the order appears there too.
4. Edit the customer name or quantity, save, then refresh/reopen the screen to confirm it persisted.
5. Mark the order paid and verify the state after reopening.
6. Test with a staff account: it should be able to read/update orders but not delete them. Test deletion with the admin account.

## Important remaining security task

The mobile app still sends images to the existing public Render `/scan` endpoint. This database migration does not authenticate that endpoint. Before treating the app as production-secure, the backend should validate Supabase access tokens before accepting scans, and the app should handle expired sessions and network errors cleanly.

# Deployment checklist

## 1. Verify the repository

Run the three project checks before publishing:

```bash
npm run lint
npm run test
npm run build
```

Never commit `.env.local`, a secret key, a service-role key, or the database
password. The browser must use only the Supabase publishable key.

## 2. Configure Vercel

Create or open the Vercel project and add these environment variables for the
Production, Preview, and Development environments:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Use the same values stored locally in `.env.local`. Trigger a new deployment
after adding or changing an environment variable.

## 3. Configure Supabase Auth URLs

In **Authentication > URL Configuration**:

1. set **Site URL** to the final production URL;
2. keep `http://localhost:5173/**` in the additional Redirect URLs;
3. add the exact production URL as an allowed redirect;
4. add only the preview pattern that is actually needed for Vercel previews.

Exact production redirects are preferable to broad wildcards.

## 4. Configure authentication email delivery

The default Supabase email sender is suitable only for initial development.
Before presenting registration as production-ready, configure a supported SMTP
provider, update the sender identity, and test:

- sign-up confirmation;
- email change confirmation;
- delivery failures and rate limits.

## 5. Manual smoke test

Test the deployed application in this order:

1. search for a book as a guest and save it;
2. refresh and verify the local guest library;
3. register and confirm the email;
4. import the guest library;
5. change status, favourite, and rating;
6. refresh and verify that Supabase restores them;
7. sign out and verify that account books are no longer visible;
8. sign back in and verify that they return;
9. edit the profile and test the email-change message;
10. verify keyboard access and the mobile layout.

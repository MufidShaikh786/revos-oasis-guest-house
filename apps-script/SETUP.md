# Connect website enquiries and the Instagram feed (free, use the client's Google account)
## Enquiry spreadsheet
1. Sign in to `mufidshaikh0044@gmail.com` and open the existing [Revo's Oasis enquiries spreadsheet](https://docs.google.com/spreadsheets/d/1yaIvcxl5wvRfwSu-GBf-ouGiateUwWsF_SG0-Kki7Qc/edit).
2. Share the Sheet with `girkarvedant@gmail.com` as a Viewer, if not already shared.
3. In the Sheet: Extensions > Apps Script. Delete the sample code, paste all of Code.gs, Save.
4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy and approve the permission prompts.
5. Copy the Web app URL (ends with `/exec`) and send it to the site developer to configure `sheetsEndpoint` in `js/script.js`. Do not share your Google password or access tokens.
6. Test the enquiry form. A row should appear in the "Enquiries" tab, and only then does the thank-you screen show.

The `Enquiries` tab is created if needed. Each successful submission writes one row in this exact order:
`Received`, `Name`, `Mobile`, `Email`, `Check-in`, `Check-out`, `Guests`, `Message`.
Email and Message are optional form fields; their columns are still included and remain blank if the guest leaves them empty. Keep these header names and order unchanged if preparing the tab manually. If an existing tab has different headers, the script refuses to append a misaligned row; correct the row-one headers and redeploy.

## Connect the latest Instagram posts

The website's "Visit Instagram" link always opens the official profile. The posts grid is populated from the official Instagram Graph API; it does not pretend the property's room photos are Instagram posts.

1. The Instagram account must be a Business or Creator account linked to a Facebook Page. The owner must have a Meta developer account and permission to manage that Page.
2. Create/configure a Meta app and enable Facebook Login for Business. For this Page-linked API flow, request `instagram_basic`, `pages_show_list` and `pages_read_engagement`. Meta's official setup guide: [Get started with Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/get-started).
3. Use Meta's Graph API Explorer to obtain an access token with those permissions. Use the token to get the connected Page ID:

   `GET https://graph.facebook.com/v26.0/me/accounts`

   Then get the connected Instagram professional-account ID:

   `GET https://graph.facebook.com/v26.0/PAGE_ID?fields=instagram_business_account`

4. In the Apps Script editor, open **Project Settings → Script Properties → Add script property** and add:
   - `INSTAGRAM_USER_ID`: the `instagram_business_account.id` from the previous request.
   - `INSTAGRAM_ACCESS_TOKEN`: the access token authorized for this account.

   Keep the token in Script Properties. Do not put it in `js/script.js`, HTML, or any public repository. Do not send it in chat.
5. Deploy the changed Apps Script as a new version: **Deploy → Manage deployments → Edit → New version → Deploy**. The `/exec` URL stays the same.
6. Reload the website. The homepage feed shows up to eight recent posts and links each one to its Instagram permalink. The response is cached for 10 minutes to reduce API calls.
7. Check the token's expiry and renew it when required. If the feed stops updating, check the Apps Script execution log for the Instagram feed error and confirm the token, permissions and account/Page connection.

The API serves the account that the owner manages. Meta access levels and API requirements can change; consult the linked Meta documentation when creating the app.

Until the endpoint and Script Properties are configured, the homepage displays a setup message and the separate profile link still works.

## Redeploy after edits

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version → Deploy**. The web app URL remains the same. The current script includes both `doPost` (save enquiries) and `doGet` (health check / Instagram feed); opening the `/exec` URL in a browser should return a small JSON service response, not a Google sign-in or "Script function not found" page.

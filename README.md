# Revo's Oasis Resort

A static, framework-free website for Revo's Oasis Resort at Dandi Beach, Malvan. It uses HTML, CSS and vanilla JavaScript; there is no build step.

## Run locally

Open this folder in VS Code and use Live Server, or serve it with any local static HTTP server. Check the home, about, gallery, contact and `404.html` pages. The site's photos are in `images/`; missing client photos show labelled placeholders.

## Configure before launch

1. Follow [`apps-script/SETUP.md`](apps-script/SETUP.md) to deploy the Google Apps Script, set the Instagram API credentials in Script Properties, and paste the deployed URL into `CONFIG.sheetsEndpoint` and `CONFIG.instagramFeedEndpoint` in `js/script.js`. Test a real enquiry from the deployed site. Until configured, the form keeps its data and provides a WhatsApp fallback; the profile link works without the live feed.
2. After an enquiry is successfully saved, **Complete Guest Details** pre-fills the Google Form's name, mobile, check-in/out dates and special requests. Required details not collected by the website (such as room count, address and payment information) still need to be completed in Google Forms. If those Form questions change, update their `entry.*` IDs in `guestDetailsUrl` in `js/script.js`.
3. The map is configured to the resort coordinates in `CONFIG.mapEmbedUrl`. Update it only if the confirmed location changes.
4. Add the client's photos using the filenames in [`PENDING.md`](PENDING.md). Update image dimensions if the supplied photos do not match the existing 1280 × 960 room images.
5. Replace every `YOUR-DOMAIN` placeholder in the HTML files, `robots.txt` and `sitemap.xml` with the confirmed production domain. Do not launch with the placeholder URLs.
6. Replace the `[PENDING: ...]` copy only after the client confirms the facts. Confirm the Instagram handle spelling with the owner.

## Deploy with GitHub and Cloudflare Pages

1. Create a GitHub repository and upload the **contents of this folder** to the repository root. Do not include an extra enclosing `revos-oasis/` directory.
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git** and select that repository.
3. Leave the build command empty and set the build output directory to `.` (the repository root). Deploy the site.
4. Open the generated `*.pages.dev` address and check all four main pages, the 404 page, mobile menu, room photos, contact links and enquiry fallback.
5. When the client chooses a domain, add it under the Pages project's **Custom domains**. Follow Cloudflare's DNS instructions at the registrar. Domain registration may have a separate cost; GitHub and Pages hosting can remain on their free plans.
6. Replace `YOUR-DOMAIN` with the final HTTPS domain in every HTML file, `robots.txt` and `sitemap.xml`, then deploy again. Recheck canonical URLs, structured data and Open Graph links.
7. In Google Search Console, add and verify the site (DNS verification is suitable for a domain property), then submit `https://YOUR-DOMAIN/sitemap.xml`.
8. Create or claim the resort's free Google Business Profile if eligible. Use only client-confirmed business details, complete Google's verification, and add the deployed website URL.

## Launch checks

- Test the enquiry with the real Apps Script deployment and confirm that exactly one row is written to the client's sheet.
- Check keyboard navigation, the reduced-motion setting, mobile and tablet layouts, image alternatives and focus visibility.
- Confirm the final address, map, domain, check-in/out details and any owner story before adding them to the website or structured data.
- Review [`PENDING.md`](PENDING.md) and resolve client-dependent items before launch.

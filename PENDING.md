# Pending from the client (placeholders are already in place)
## Photos (drop into images/ with these exact names; each missing one shows a dashed labelled box)
- [x] 4 room photos added (room-1..4.jpg, gallery g1-g4.jpg)
- [ ] images/hero.jpg: promotional banner or best property photo (wide, landscape)
- [ ] images/about.jpg: garden / outdoor or owner photo
- [ ] images/gallery/g5.jpg ... g12.jpg: property front, pool, pool side, garden, outdoor seating, entrance, beach, night view
- Tip: about 1600px wide, JPG under 300 KB.
## Details
- [x] Google Form URL (set) and Instagram link (set)
- [x] Existing enquiries Sheet link provided and shared with `girkarvedant@gmail.com` as Viewer
- [x] Configure the Apps Script `/exec` URL in `sheetsEndpoint`
- [x] Confirm the Apps Script URL is publicly accessible
- [ ] Update the deployed Apps Script with the current `apps-script/Code.gs` and deploy a new version (public GET currently reports `Script function not found: doGet`)
- [ ] Submit a real enquiry and verify it appears in the shared Sheet
- [ ] Connect Instagram Graph API: set `instagramFeedEndpoint` and add `INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN` to Apps Script Script Properties (see apps-script/SETUP.md)
- [x] Google Maps embedded map and directions link configured to confirmed coordinates
- [ ] Owner story / welcome text (about.html)
- [x] Address and check-in/out times added (contact.html + structured data)
- [x] Pin code (416606) and email (reyosoasis@gmail.com)
- [x] Resort coordinates added to maps, directions links, and structured data
- [ ] Room types and rates, if the client wants them shown
- [ ] Final domain -> replace YOUR-DOMAIN in all .html files, robots.txt, sitemap.xml

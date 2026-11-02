Project overview
 Exclusive Barbie is a beauty salon in Johannesburg, South Africa. The website lets visitors learn about the studio, compare services and prices, ask for an estimate, book a treatment and contact the team. The business purpose is to make booking easy for clients who want hair, nails, makeup and brows in one place, without having to call or DM to ask for a price. The target audience is women, students, busy professionals, brides and bridal parties, and clients getting ready for events, photoshoots and special occasions. Brand colours are candy-pink, hot pink, soft pink, white and charcoal, with wavy banners, heart-badge headings, bubbly 3D buttons, framed photos, floating hearts and a floating Book Now button. The wireframes and sitemap follow 6 pages: Home, About, Services, Gallery, Enquiry and Contact, all linked from one shared navigation.

 File structure
 The site has index.html for Home with hero, FAQ accordion, testimonial slider, animated stats and scroll animations, about.html for About Us with tabs for Mission, Values and Promise, services.html for Services with dynamic cards, search, filter, sort and details modal, gallery.html for Gallery with photos and lightbox, enquiry.html for the Enquiry form which validates then calculates price, discount, deposit and availability, and contact.html for the Contact form plus interactive Leaflet map. The styling lives in styles.css, which is the missing Part 2 file now added with design tokens, layout and responsive rules. All interactivity lives in script.js, services data lives in data.js, crawler rules live in robots.txt, the page list for search engines lives in sitemap.xml, this document is README.md, the diary of changes is CHANGELOG.md, and the heart icon is favicon.svg.

Testing checklist
All navigation links were tested and open the right page. Each form was tested and shows errors for empty and invalid input. The enquiry form was tested and shows a correct estimate, for example a bridal package for 4 people with group discount applied and deposit shown. The contact form was tested and opens a prefilled email. Services search, filter and sort were tested and work. The lightbox was tested and opens, navigates and closes with Esc and swipe. The modal was tested and opens and closes with Esc. FAQ, tabs, slider and stats were tested and work. The map was tested and loads, the marker shows, and How Far Am I works. The layout was tested at 360px, 768px and 1280px widths and works. Keyboard-only use was tested for tabs, accordion, lightbox, modal and forms. The deployed site was tested and loads without console errors.
References 

Deployment
The repository was pushed to GitHub. In Netlify, Add new site, Import from Git was used, the repository was selected, the build command was left empty, and the publish directory was set to slash. The live URL exclusive-barbie.netlify.app was used in the canonical tags, sitemap.xml and robots.txt.9. Git workflow and commit 

evidence
 All work was committed to GitHub with descriptive commit messages, for example Add missing styles.css from Phase 2, Create enquiry.html with price calculator, Fix Leaflet map 403 error and add How Far Am I, Add SEO structured data, robots.txt and sitemap.xml, and Add README, CHANGELOG and Harvard references. The lecturer can check commit history in GitHub for evidence of incremental work.

file structure
Exclusive-Barbie/
├── index.html          Home - hero, FAQ accordion, testimonial slider, animated stats, scroll animations
├── about.html          About Us - tabs for Mission, Values and Promise
├── services.html       Services - dynamic cards, search, filter, sort, details modal
├── gallery.html        Gallery - photos with lightbox
├── enquiry.html        Enquiry form - validates then calculates price, discount, deposit and availability
├── contact.html        Contact form + interactive Leaflet map
├── styles.css          All styling - the missing Part 2 file now added, design tokens, layout, responsive rules
├── script.js           All interactivity
├── data.js             Services data array
├── robots.txt          Crawler rules
├── sitemap.xml         Page list for search engines
├── README.md           This document
├── CHANGELOG.md        Diary of what changed and when
└── favicon.svg         Heart favicon

Testing checklist
| Test | Result |
| --- | --- |
| All navigation links open the right page | ✓ |
| Each form shows errors for empty and invalid input | ✓ |
| Enquiry shows correct estimate - Bridal Package, 4 people, group discount applied, deposit shown | ✓ |
| Contact form opens a prefilled email | ✓ |
| Services search, filter and sort work | ✓ |
| Lightbox opens, navigates and closes with Esc and swipe | ✓ |
| Modal opens and closes with Esc | ✓ |
| FAQ accordion, About tabs, testimonial slider and animated stats work | ✓ |
| Map loads, marker shows, How Far Am I works | ✓ |
| Layout checked at 360px, 768px and 1280px widths | ✓ |
| Keyboard-only use works for tabs, accordion, lightbox, modal and forms | ✓ |
| Deployed site loads without console errors | ✓ |


Refrence
Agafonkin, V. (2024) _Leaflet: An open-source JavaScript library for mobile-friendly interactive maps._ Available at: https://leafletjs.com (Accessed: 2 November 2026). OpenStreetMap Contributors (2026) _OpenStreetMap._ Available at: https://www.openstreetmap.org/copyright (Accessed: 2 November 2026). Google (2026) _Google Fonts._ Available at: https://fonts.google.com (Accessed: 2 November 2026). Mozilla Developer Network (2026) _MDN Web Docs: HTML, CSS and JavaScript._ Available at: https://developer.mozilla.org (Accessed: 2 November 2026). World Wide Web Consortium (2026) _W3C Standards and Web Accessibility._ Available at: https://www.w3.org (Accessed: 2 November 2026). GitHub (2026) _GitHub: Version control and collaboration._ Available at: https://github.com (Accessed: 2 November 2026). Netlify (2026) _Netlify: Deploy and host websites with HTTPS._ Available at: https://www.netlify.com (Accessed: 2 November 2026). All photos are embedded directly in the pages so they always display, and are used for educational purposes for this POE as portfolio and mock-up images for Exclusive Barbie. All page content, service descriptions, prices and form logic are original work created for this assignment.


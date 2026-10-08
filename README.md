# PITCHLINE — Football & Sportswear Store

A demo e-commerce store (Node.js + Express) built to generate real Google Analytics 4
ecommerce data for a Power BI dashboard. No real payments are taken.

**Features:** home page with promo banners, shop with filters/sort/search, product pages with
sizes, wishlist, bag with promo codes (`KICKOFF10`, `GOAL20`), sign up / log in, 3-step checkout,
order history. Product images are original SVG illustrations, so there are no image licences to worry about.

## Run it locally

```bash
npm install
npm start
# open http://localhost:3000
```

Without a GA ID, every analytics event is printed to the browser console (F12 → Console),
so you can watch the tracking work before connecting Google Analytics.

## Connect Google Analytics 4

1. In Google Analytics, create a property and a **Web** data stream for your site URL.
2. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).
3. Set it as an environment variable called `GA_MEASUREMENT_ID` (locally:
   `GA_MEASUREMENT_ID=G-XXXXXXXXXX npm start`; on Render: Environment tab).
4. Open your site with `?debug_mode=1` at the end of the URL and watch events arrive live in
   GA4 → Admin → **DebugView**.

### Events sent

| Shopper action | GA4 event |
|---|---|
| Any page opened | `page_view` |
| Home banners seen / clicked | `view_promotion` / `select_promotion` |
| Product grid shown / card clicked | `view_item_list` / `select_item` |
| Product page | `view_item` |
| Heart clicked | `add_to_wishlist` |
| Add to bag / remove / qty change | `add_to_cart` / `remove_from_cart` |
| Bag opened | `view_cart` |
| Checkout steps | `begin_checkout` → `add_shipping_info` → `add_payment_info` |
| Order placed | `purchase` (with order ID, revenue, tax, shipping, coupon) |
| Account | `sign_up`, `login` |
| Search / filter | `search`, `filter_products` |

Every product in an event carries these item fields — these become your Power BI slicers:

| GA4 item field | PITCHLINE meaning | Example |
|---|---|---|
| `item_category` | Category | Boots |
| `item_category2` | Sport | Football |
| `item_category3` | Gender | Women |
| `item_category4` | Collection | Strike |
| `item_category5` | Colour | Solar Red |
| `item_variant` | Colour / size | Solar Red / UK 8 |

### Register custom definitions (once)

GA4 only reports custom parameters after you register them. In **Admin → Custom definitions**, add:

- Event-scoped dimensions: `payment_type`, `shipping_tier`, `filter_name`, `filter_value`, `results_count`
- User-scoped dimensions: `favourite_sport`, `customer_status`

GA4 starts filling these from the moment they're registered (not retroactively), so do it
before you share the site. Data can take 24–48 hours to appear in standard reports.

## Deploy to Render (free)

1. Push this folder to a GitHub repository.
2. On render.com: **New → Web Service** → pick the repo.
3. Build command `npm install`, start command `npm start`.
4. Environment variables: `GA_MEASUREMENT_ID`, `SESSION_SECRET` (any long random text),
   `NODE_ENV=production`.

Note: on Render's free plan the disk resets when the service restarts or sleeps, so accounts
and orders stored in `data/db.json` are wiped. That's fine for analytics, because GA4 keeps all
the event data. The free service also sleeps after inactivity, so the first visit can take
about a minute to load.

## Project structure

```
server.js            Express API: products, auth, cart pricing, orders
data/products.js     Catalog (25 products) — edit to add your own
public/index.html    Page shell, header, footer
public/js/app.js     Pages and routing (single-page app)
public/js/analytics.js  All GA4 tracking in one place
public/js/art.js     SVG product illustrations
public/styles.css    Design
```

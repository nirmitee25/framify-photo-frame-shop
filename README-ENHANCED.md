# Framify — Colorful Responsive Upgrade

Framify is a responsive photo-frame shop website with a coordinated design across the home, product, custom-frame, cart/checkout and account pages.

## Included pages and functionality

- `public/frame.html` — homepage, collections, about section and calls to action.
- `public/product.html` — 30 products, product search, category and price filters, sorting, favourites, add-to-cart and live cart count.
- `public/customize.html` — custom frame request form, image upload preview, validation and request submission to the Express API.
- `public/cart.html` — cart contents, quantity controls, remove item, subtotal, delivery summary and order submission to the Express API.
- `public/index.html` — login/sign-up demonstration stored locally in the current browser.
- `public/site.css` — colorful pink/purple/peach design, responsive layouts, touch-friendly navigation, visible keyboard focus and reduced-motion support.
- `server.js` — Express API, MongoDB persistence for custom requests and orders, image upload limit, health endpoint, and clearer startup checks when MongoDB is not configured or reachable.

## Run on Windows

1. Install Node.js LTS and MongoDB Community Server, or use a MongoDB Atlas connection string.
2. Open this project folder in VS Code.
3. Copy `.env.example` to `.env`.
4. In `.env`, set `MONGODB_URI` to your own MongoDB connection string. Keep `.env` private.
5. Open **Terminal → New Terminal** and run `npm install`.
6. Run `npm start`.
7. Visit `http://localhost:5000/frame.html`.
8. Optional: open `http://localhost:5000/api/health` to check whether the app can reach MongoDB.

## Important notes

- The cart and favourites are stored in browser `localStorage`.
- The account page is only a front-end demonstration; it stores credentials in browser storage and must not be used for real passwords. For production, replace it with backend authentication, password hashing, sessions or secure tokens, and rate limiting.
- Custom frame requests and orders require a running server and a connected MongoDB database.
- Checkout records an order; it does not take payment. Razorpay/other payments must be implemented with server-side order creation, signature verification and webhook handling before claiming a payment succeeded.
- Product catalogue entries are currently front-end demo data and should be validated against server-side product prices in a production store.
- Images are local files under `public/images`.


## What this upgrade changes

- Preserves the existing page names, product cards, filters, favourites, localStorage cart, customization request form, order submission flow, and image assets.
- Improves mobile spacing and layouts down to narrow screens, updates the palette to a creative colorful style, and adds accessible focus and reduced-motion rules.
- The server now refuses to report itself as running when MongoDB is missing or unreachable. It prints a direct setup hint instead.
- The account page remains a browser-only demonstration. Real customer authentication and real payments are intentionally not enabled in this phase.

# SOAP MONEY Partner Map + Drop Tracker

https://odotofrva.github.io/SoapMoneyMap/

A mobile and desktop responsive app style page for showing participating SOAP MONEY laundromats and letting customers log in to track drop offs, pickups, wash progress, and deliveries.

## What is included

- App style SOAP MONEY landing/map page
- SOAP MONEY logo assets
- Leaflet map with OpenStreetMap tiles
- Search and filters for partner laundromats
- Browser location button for nearest spots
- Directions links for every laundromat
- Customer login popup modal demo
- Drop off creation form
- Tracking code lookup
- Order timeline statuses
- Local browser storage for demo accounts and demo orders
- PWA manifest and service worker for an app like feel

## Tracking workflow

The included front end has these statuses:

1. Scheduled
2. Dropped Off
3. Washing
4. Quality Check
5. Out for Delivery
6. Delivered

Customers can create a drop off and receive a code such as `SM-48291`. In the demo, the buttons named **Advance status** and **Mark delivered** simulate staff/admin updates so you can test the flow.

## Important production note

The login and tracking system in this ZIP is a front end prototype. It uses `localStorage`, meaning the data only lives inside that customer browser. Do not use this as the final storage method for real customer orders.

For a real launch, connect the forms to a backend such as:

- Supabase Auth + Supabase database
- Firebase Auth + Firestore
- Shopify customer accounts + custom app backend
- A Node, Django, Laravel, or FastAPI API

Recommended production tables or collections:

### customers

```js
{
  id: "customer-id",
  name: "Customer Name",
  contact: "phone or email",
  created_at: "timestamp"
}
```

### orders

```js
{
  id: "order-id",
  code: "SM-48291",
  customer_id: "customer-id",
  partner_id: "harlem-drop",
  service: "Wash + Fold",
  bags: 2,
  delivery_window: "Tomorrow Evening",
  delivery_address: "customer address",
  notes: "customer notes",
  status_step: 2,
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

## How to edit laundromats

Open `app.js` and update the `partners` array near the top of the file.

Each partner needs:

```js
{
  id: "unique-id",
  name: "Laundromat Name",
  address: "Street or neighborhood",
  city: "City",
  borough: "Borough",
  coords: [40.8075, -73.9451],
  status: "Partner ready",
  hours: "Daily 8 AM to 8 PM",
  phone: "",
  services: ["drop", "pickup", "delivery", "merch"],
  note: "Short partner note."
}
```

Use coordinates from Google Maps or another map service. The first number is latitude. The second number is longitude.

## How to run locally

For the smoothest map and service worker behavior, run it from a simple local server:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Deploy

Upload all files and folders to GitHub Pages, Netlify, Vercel, or your existing SOAP MONEY site folder.

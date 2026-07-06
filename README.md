# SOAP MONEY Partner Map

A mobile and desktop responsive map page for showing participating SOAP MONEY laundromats.

## What is included

- App style landing page
- SOAP MONEY logo assets
- Leaflet map with OpenStreetMap tiles
- Partner cards with search and filters
- Drop off, pickup, merch, and event filters
- Browser location button for nearest spots
- Directions links for every laundromat
- PWA manifest and service worker for an app like feel

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
  services: ["drop", "pickup", "merch"],
  note: "Short partner note."
}
```

Use coordinates from Google Maps or another map service. The first number is latitude. The second number is longitude.

## How to run locally

Open `index.html` in a browser. For the smoothest map and service worker behavior, run it from a simple local server:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Deploy

Upload all files and folders to GitHub Pages, Netlify, Vercel, or your existing SOAP MONEY site folder.

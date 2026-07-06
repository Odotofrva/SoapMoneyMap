const partners = [
  {
    id: "harlem-drop",
    name: "SOAP MONEY Harlem Drop",
    address: "125th Street area, Harlem, NY",
    city: "Harlem",
    borough: "Manhattan",
    coords: [40.8075, -73.9451],
    status: "Partner ready",
    hours: "Mon to Sat 8 AM to 8 PM",
    phone: "",
    services: ["drop", "pickup", "merch"],
    note: "Drop off access, pickup point, and selected SOAP MONEY merch access."
  },
  {
    id: "brooklyn-clean",
    name: "Brooklyn Wash Partner",
    address: "Atlantic Avenue area, Brooklyn, NY",
    city: "Brooklyn",
    borough: "Brooklyn",
    coords: [40.6782, -73.9442],
    status: "Partner ready",
    hours: "Daily 7 AM to 9 PM",
    phone: "",
    services: ["drop", "pickup", "event"],
    note: "Partner location for drops, pickup days, and local SOAP MONEY activations."
  },
  {
    id: "queens-cycle",
    name: "Queens Cycle Partner",
    address: "Jamaica Avenue area, Queens, NY",
    city: "Queens",
    borough: "Queens",
    coords: [40.7027, -73.7890],
    status: "Partner ready",
    hours: "Daily 8 AM to 10 PM",
    phone: "",
    services: ["drop", "merch"],
    note: "Great for SOAP MONEY drop off service and product pickup."
  },
  {
    id: "bronx-suds",
    name: "Bronx Suds Partner",
    address: "Grand Concourse area, Bronx, NY",
    city: "Bronx",
    borough: "Bronx",
    coords: [40.8501, -73.8662],
    status: "Coming online",
    hours: "Schedule pending",
    phone: "",
    services: ["drop", "event"],
    note: "Future partner for community wash days and short film brand moments."
  },
  {
    id: "staten-wash",
    name: "Staten Island Wash Partner",
    address: "St George area, Staten Island, NY",
    city: "Staten Island",
    borough: "Staten Island",
    coords: [40.6437, -74.0736],
    status: "Partner ready",
    hours: "Mon to Fri 9 AM to 7 PM",
    phone: "",
    services: ["pickup", "merch"],
    note: "Pickup point for select SOAP MONEY member access."
  },
  {
    id: "newark-drop",
    name: "Newark Drop Partner",
    address: "Broad Street area, Newark, NJ",
    city: "Newark",
    borough: "New Jersey",
    coords: [40.7357, -74.1724],
    status: "Partner ready",
    hours: "Daily 8 AM to 8 PM",
    phone: "",
    services: ["drop", "pickup", "merch"],
    note: "Tri state SOAP MONEY partner spot for drops and pickups."
  }
];

const serviceLabels = {
  drop: "Drop off",
  pickup: "Pickup",
  merch: "Merch",
  event: "Events"
};

const state = {
  filter: "all",
  query: "",
  selectedId: partners[0]?.id || null,
  userPosition: null,
  map: null,
  markers: new Map(),
  userMarker: null
};

const els = {
  list: document.querySelector("#partnerList"),
  count: document.querySelector("#resultCount"),
  search: document.querySelector("#searchInput"),
  chips: Array.from(document.querySelectorAll(".chip")),
  mapStatus: document.querySelector("#mapStatus"),
  locateBtn: document.querySelector("#locateBtn"),
  resetMapBtn: document.querySelector("#resetMapBtn"),
  openSelectedBtn: document.querySelector("#openSelectedBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  bottomNavItems: Array.from(document.querySelectorAll(".bottom-nav-item")),
  template: document.querySelector("#partnerCardTemplate")
};

const iconUrl = "assets/soap-money-sm.png";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function partnerMatches(partner) {
  const matchesFilter = state.filter === "all" || partner.services.includes(state.filter);
  const haystack = normalize([
    partner.name,
    partner.address,
    partner.city,
    partner.borough,
    partner.status,
    partner.note,
    ...partner.services.map(service => serviceLabels[service])
  ].join(" "));
  const matchesQuery = !state.query || haystack.includes(normalize(state.query));
  return matchesFilter && matchesQuery;
}

function filteredPartners() {
  return partners.filter(partnerMatches).sort((a, b) => {
    if (!state.userPosition) return 0;
    return distanceMiles(state.userPosition, a.coords) - distanceMiles(state.userPosition, b.coords);
  });
}

function distanceMiles(from, to) {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const radius = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function directionsUrl(partner) {
  const destination = encodeURIComponent(`${partner.coords[0]},${partner.coords[1]}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

function createTags(partner) {
  return partner.services.map(service => `<span class="tag">${serviceLabels[service]}</span>`).join("");
}

function renderList() {
  const results = filteredPartners();
  els.count.textContent = `${results.length} ${results.length === 1 ? "spot" : "spots"}`;
  els.list.innerHTML = "";

  if (!results.length) {
    els.list.innerHTML = `<div class="empty-state">No participating laundromats match this search yet. Try another borough, service, or partner name.</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  results.forEach(partner => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const body = node.querySelector(".partner-card-body");
    const viewBtn = node.querySelector(".view-link");
    const distanceText = node.querySelector(".distance-text");
    node.dataset.id = partner.id;
    if (partner.id === state.selectedId) node.classList.add("active");
    node.querySelector(".status-text").textContent = partner.status;
    node.querySelector("h3").textContent = partner.name;
    node.querySelector(".address").textContent = `${partner.address} · ${partner.hours}`;
    node.querySelector(".tags").innerHTML = createTags(partner);
    node.querySelector(".directions-link").href = directionsUrl(partner);
    distanceText.textContent = state.userPosition ? `${distanceMiles(state.userPosition, partner.coords).toFixed(1)} mi` : "";
    body.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      selectPartner(partner.id, true);
    });
    body.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPartner(partner.id, true);
      }
    });
    viewBtn.addEventListener("click", event => {
      event.stopPropagation();
      selectPartner(partner.id, true);
    });
    fragment.appendChild(node);
  });
  els.list.appendChild(fragment);
}

function createMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="sm-marker"><img src="${iconUrl}" alt="" /></div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -24]
  });
}

function createPopup(partner) {
  return `
    <div class="popup-card">
      <h4>${partner.name}</h4>
      <p>${partner.address}<br>${partner.hours}</p>
      <a href="${directionsUrl(partner)}" target="_blank" rel="noopener">Get directions</a>
    </div>
  `;
}

function initMap() {
  if (!window.L) {
    els.mapStatus.textContent = "Map needs internet access";
    return;
  }

  state.map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: true
  }).setView([40.7465, -73.9565], 10);

  L.control.zoom({ position: "bottomleft" }).addTo(state.map);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  partners.forEach(partner => {
    const marker = L.marker(partner.coords, { icon: createMarkerIcon(), title: partner.name })
      .addTo(state.map)
      .bindPopup(createPopup(partner));
    marker.on("click", () => selectPartner(partner.id, false));
    state.markers.set(partner.id, marker);
  });

  fitMapToPartners(partners);
  els.mapStatus.textContent = "SOAP MONEY map ready";
  setTimeout(() => {
    if (els.mapStatus.textContent === "SOAP MONEY map ready") els.mapStatus.style.opacity = "0";
  }, 1800);
}

function fitMapToPartners(items) {
  if (!state.map || !items.length) return;
  const group = L.featureGroup(items.map(partner => state.markers.get(partner.id)).filter(Boolean));
  if (!group.getLayers().length) return;
  state.map.fitBounds(group.getBounds().pad(0.18), { animate: true });
}

function refreshMarkers() {
  if (!state.map) return;
  const visibleIds = new Set(filteredPartners().map(partner => partner.id));
  partners.forEach(partner => {
    const marker = state.markers.get(partner.id);
    if (!marker) return;
    if (visibleIds.has(partner.id)) {
      marker.addTo(state.map);
    } else {
      marker.removeFrom(state.map);
    }
  });
  fitMapToPartners(filteredPartners());
}

function selectPartner(id, openPopup = true) {
  const partner = partners.find(item => item.id === id);
  if (!partner) return;
  state.selectedId = id;
  renderList();

  if (state.map) {
    state.map.setView(partner.coords, Math.max(state.map.getZoom(), 13), { animate: true });
    const marker = state.markers.get(id);
    if (marker && openPopup) marker.openPopup();
  }

  const card = document.querySelector(`.partner-card[data-id="${id}"]`);
  card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function applyFilters() {
  renderList();
  refreshMarkers();
}

function locateUser() {
  if (!navigator.geolocation) {
    els.mapStatus.style.opacity = "1";
    els.mapStatus.textContent = "Location not available";
    return;
  }

  els.mapStatus.style.opacity = "1";
  els.mapStatus.textContent = "Finding your nearest spots";

  navigator.geolocation.getCurrentPosition(position => {
    state.userPosition = [position.coords.latitude, position.coords.longitude];

    if (state.map && window.L) {
      if (state.userMarker) state.userMarker.removeFrom(state.map);
      const userIcon = L.divIcon({ className: "", html: "<div class='user-marker'></div>", iconSize: [20, 20], iconAnchor: [10, 10] });
      state.userMarker = L.marker(state.userPosition, { icon: userIcon, title: "Your location" }).addTo(state.map);
    }

    renderList();
    const nearest = filteredPartners()[0];
    if (nearest) selectPartner(nearest.id, true);
    els.mapStatus.textContent = "Nearest spots shown";
  }, () => {
    els.mapStatus.textContent = "Location permission was not allowed";
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

function sharePage() {
  const shareData = {
    title: "SOAP MONEY Partner Map",
    text: "Find participating SOAP MONEY laundromats.",
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
    return;
  }

  navigator.clipboard?.writeText(window.location.href);
  els.shareBtn.querySelector("span").textContent = "Copied";
  setTimeout(() => {
    els.shareBtn.querySelector("span").textContent = "Share";
  }, 1600);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

els.search.addEventListener("input", event => {
  state.query = event.target.value;
  applyFilters();
});

els.chips.forEach(chip => {
  chip.addEventListener("click", () => {
    els.chips.forEach(item => item.classList.remove("active"));
    chip.classList.add("active");
    state.filter = chip.dataset.filter;
    applyFilters();
  });
});

els.locateBtn.addEventListener("click", locateUser);
els.resetMapBtn.addEventListener("click", () => {
  state.query = "";
  els.search.value = "";
  state.filter = "all";
  els.chips.forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
  applyFilters();
});
els.openSelectedBtn.addEventListener("click", () => {
  const partner = partners.find(item => item.id === state.selectedId) || filteredPartners()[0];
  if (partner) window.open(directionsUrl(partner), "_blank", "noopener");
});
els.shareBtn.addEventListener("click", sharePage);

els.bottomNavItems.forEach(item => {
  item.addEventListener("click", () => {
    els.bottomNavItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");
  });
});

renderList();
initMap();
registerServiceWorker();

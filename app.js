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
    services: ["drop", "pickup", "delivery", "merch"],
    note: "Drop off access, delivery pickup point, and selected SOAP MONEY merch access."
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
    services: ["drop", "pickup", "delivery", "event"],
    note: "Partner location for drops, delivery days, and local SOAP MONEY activations."
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
    services: ["drop", "delivery", "merch"],
    note: "Great for SOAP MONEY drop off service, delivery pickup, and product pickup."
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
    services: ["pickup", "delivery", "merch"],
    note: "Pickup and delivery point for select SOAP MONEY member access."
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
    services: ["drop", "pickup", "delivery", "merch"],
    note: "Tri state SOAP MONEY partner spot for drops, pickups, and deliveries."
  }
];

const serviceLabels = {
  drop: "Drop off",
  pickup: "Pickup",
  delivery: "Delivery",
  merch: "Merch",
  event: "Events"
};

const statusSteps = [
  "Scheduled",
  "Dropped Off",
  "Washing",
  "Quality Check",
  "Out for Delivery",
  "Delivered"
];

const storageKeys = {
  customer: "soapMoneyCustomerV2",
  orders: "soapMoneyOrdersV2"
};

const state = {
  filter: "all",
  query: "",
  selectedId: partners[0]?.id || null,
  userPosition: null,
  map: null,
  markers: new Map(),
  userMarker: null,
  customer: null,
  orders: []
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
  accountTopBtn: document.querySelector("#accountTopBtn"),
  accountTopText: document.querySelector("#accountTopText"),
  bottomNavItems: Array.from(document.querySelectorAll(".bottom-nav-item")),
  template: document.querySelector("#partnerCardTemplate"),
  orderTemplate: document.querySelector("#orderCardTemplate"),
  quickTrackForm: document.querySelector("#quickTrackForm"),
  quickTrackInput: document.querySelector("#quickTrackInput"),
  loginPromptCard: document.querySelector("#loginPromptCard"),
  openLoginModalBtn: document.querySelector("#openLoginModalBtn"),
  loginModal: document.querySelector("#loginModal"),
  loginModalPanel: document.querySelector("#loginModal .login-modal"),
  closeLoginModal: document.querySelector("#closeLoginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginName: document.querySelector("#loginName"),
  loginContact: document.querySelector("#loginContact"),
  loginPin: document.querySelector("#loginPin"),
  demoLoginBtn: document.querySelector("#demoLoginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  sessionCard: document.querySelector("#sessionCard"),
  customerName: document.querySelector("#customerName"),
  customerContact: document.querySelector("#customerContact"),
  dashboardCard: document.querySelector("#dashboardCard"),
  lockedOverlay: document.querySelector("#lockedOverlay"),
  unlockLoginBtn: document.querySelector("#unlockLoginBtn"),
  dropForm: document.querySelector("#dropForm"),
  dropPartner: document.querySelector("#dropPartner"),
  dropService: document.querySelector("#dropService"),
  dropBags: document.querySelector("#dropBags"),
  deliveryWindow: document.querySelector("#deliveryWindow"),
  deliveryAddress: document.querySelector("#deliveryAddress"),
  dropNotes: document.querySelector("#dropNotes"),
  ordersList: document.querySelector("#ordersList"),
  orderCount: document.querySelector("#orderCount"),
  activeCount: document.querySelector("#activeCount"),
  deliveryCount: document.querySelector("#deliveryCount"),
  deliveredCount: document.querySelector("#deliveredCount"),
  seedOrderBtn: document.querySelector("#seedOrderBtn"),
  toast: document.querySelector("#toast")
};

const iconUrl = "assets/soap-money-sm.png";
let toastTimer = null;
let lastFocusedElement = null;

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function loadState() {
  try {
    state.customer = JSON.parse(localStorage.getItem(storageKeys.customer)) || null;
  } catch {
    state.customer = null;
  }

  try {
    const orders = JSON.parse(localStorage.getItem(storageKeys.orders));
    state.orders = Array.isArray(orders) ? orders : [];
  } catch {
    state.orders = [];
  }
}

function saveCustomer() {
  if (state.customer) {
    localStorage.setItem(storageKeys.customer, JSON.stringify(state.customer));
  } else {
    localStorage.removeItem(storageKeys.customer);
  }
}

function saveOrders() {
  localStorage.setItem(storageKeys.orders, JSON.stringify(state.orders));
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 3200);
}

function openLoginModal() {
  if (!els.loginModal) return;
  lastFocusedElement = document.activeElement;
  els.loginModal.classList.remove("hidden");
  els.loginModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => {
    const focusTarget = els.loginName || els.loginModalPanel;
    focusTarget?.focus();
  }, 80);
}

function closeLoginModal() {
  if (!els.loginModal) return;
  els.loginModal.classList.add("hidden");
  els.loginModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
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
    document.querySelector("#map").innerHTML = `<div class="empty-state" style="margin:18px">Map tiles need internet access. Partner cards and tracking still work.</div>`;
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
  if (!state.map || !items.length || !window.L) return;
  const bounds = L.latLngBounds(items.map(item => item.coords));
  state.map.fitBounds(bounds, { padding: [34, 34] });
}

function selectPartner(id, openPopup = true) {
  const partner = partners.find(item => item.id === id);
  if (!partner) return;
  state.selectedId = id;

  document.querySelectorAll(".partner-card").forEach(card => {
    card.classList.toggle("active", card.dataset.id === id);
  });

  if (state.map && window.L) {
    const marker = state.markers.get(id);
    if (marker) {
      state.map.setView(partner.coords, Math.max(state.map.getZoom(), 13), { animate: true });
      if (openPopup) marker.openPopup();
    }
  }
}

function renderPartnerSelect() {
  els.dropPartner.innerHTML = partners
    .map(partner => `<option value="${partner.id}">${partner.name}</option>`)
    .join("");
}

function createTrackingCode() {
  const number = Math.floor(10000 + Math.random() * 89999);
  return `SM-${number}`;
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function customerOrders() {
  if (!state.customer) return [];
  return state.orders
    .filter(order => order.customerId === state.customer.id || normalize(order.contact) === normalize(state.customer.contact))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getPartnerName(id) {
  return partners.find(partner => partner.id === id)?.name || "SOAP MONEY Partner";
}

function currentStatus(order) {
  const step = Number.isFinite(order.step) ? order.step : 0;
  return statusSteps[Math.min(step, statusSteps.length - 1)];
}

function orderProgressHtml(order) {
  const step = Number.isFinite(order.step) ? order.step : 0;
  const bars = statusSteps.map((label, index) => `<span class="progress-step ${index <= step ? "done" : ""}" title="${label}"></span>`).join("");
  const labels = `<div class="progress-labels">${statusSteps.map(label => `<span>${label}</span>`).join("")}</div>`;
  return bars + labels;
}

function renderOrders(highlightCode = "") {
  const orders = customerOrders();
  els.orderCount.textContent = `${orders.length} ${orders.length === 1 ? "order" : "orders"}`;
  els.activeCount.textContent = orders.filter(order => order.step < statusSteps.length - 1).length;
  els.deliveryCount.textContent = orders.filter(order => currentStatus(order) === "Out for Delivery").length;
  els.deliveredCount.textContent = orders.filter(order => currentStatus(order) === "Delivered").length;
  els.ordersList.innerHTML = "";

  if (!state.customer) {
    els.ordersList.innerHTML = `<div class="empty-state">Log in to view your SOAP MONEY drop offs and deliveries.</div>`;
    return;
  }

  if (!orders.length) {
    els.ordersList.innerHTML = `<div class="empty-state">No drops yet. Create your first drop off above and your tracking code will show here.</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  orders.forEach(order => {
    const node = els.orderTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.code = order.code;
    if (normalize(order.code) === normalize(highlightCode)) {
      node.style.borderColor = "rgba(255,255,255,.62)";
      node.style.background = "rgba(255,255,255,.1)";
    }
    node.querySelector(".tracking-code").textContent = order.code;
    node.querySelector("h3").textContent = order.service;
    node.querySelector(".order-meta").textContent = `${getPartnerName(order.partnerId)} · ${formatTime(order.createdAt)}`;
    node.querySelector(".order-status").textContent = currentStatus(order);
    node.querySelector(".progress-track").innerHTML = orderProgressHtml(order);
    node.querySelector(".order-details").innerHTML = `
      <span><strong>Bags:</strong> ${order.bags}</span>
      <span><strong>Window:</strong> ${order.deliveryWindow}</span>
      <span><strong>Address:</strong> ${order.deliveryAddress}</span>
      ${order.notes ? `<span><strong>Notes:</strong> ${order.notes}</span>` : ""}
    `;

    const advanceBtn = node.querySelector(".advance-order");
    const deliveredBtn = node.querySelector(".delivered-order");
    const delivered = currentStatus(order) === "Delivered";
    advanceBtn.disabled = delivered;
    deliveredBtn.disabled = delivered;
    advanceBtn.style.opacity = delivered ? "0.45" : "1";
    deliveredBtn.style.opacity = delivered ? "0.45" : "1";

    advanceBtn.addEventListener("click", () => advanceOrder(order.code));
    deliveredBtn.addEventListener("click", () => markDelivered(order.code));
    fragment.appendChild(node);
  });
  els.ordersList.appendChild(fragment);
}

function renderAuth() {
  const loggedIn = Boolean(state.customer);
  els.loginPromptCard?.classList.toggle("hidden", loggedIn);
  els.sessionCard.classList.toggle("hidden", !loggedIn);
  els.dashboardCard.classList.toggle("locked", !loggedIn);
  els.lockedOverlay.classList.toggle("hidden", loggedIn);
  els.accountTopText.textContent = loggedIn ? "Account" : "Log in";

  if (loggedIn) {
    els.customerName.textContent = state.customer.name;
    els.customerContact.textContent = state.customer.contact;
  } else {
    els.customerName.textContent = "Customer";
    els.customerContact.textContent = "Tracking account active";
  }

  renderOrders();
}

function loginCustomer({ name, contact, pin }) {
  const cleanedName = String(name || "Customer").trim() || "Customer";
  const cleanedContact = String(contact || "demo@soapmoney.local").trim() || "demo@soapmoney.local";
  state.customer = {
    id: slug(cleanedContact) || `customer-${Date.now()}`,
    name: cleanedName,
    contact: cleanedContact,
    pin: String(pin || "0000").slice(0, 4),
    updatedAt: new Date().toISOString()
  };
  saveCustomer();
  renderAuth();
  closeLoginModal();
  showToast(`Welcome ${state.customer.name}. Your tracker is open.`);
  document.querySelector("#tracker").scrollIntoView({ behavior: "smooth", block: "start" });
}

function logoutCustomer() {
  state.customer = null;
  saveCustomer();
  renderAuth();
  showToast("Logged out of this browser.");
}

function createOrderFromForm() {
  if (!state.customer) {
    showToast("Please log in before creating a drop off.");
    openLoginModal();
    return;
  }

  const order = {
    code: createTrackingCode(),
    customerId: state.customer.id,
    customerName: state.customer.name,
    contact: state.customer.contact,
    partnerId: els.dropPartner.value,
    service: els.dropService.value,
    bags: Number(els.dropBags.value || 1),
    deliveryWindow: els.deliveryWindow.value,
    deliveryAddress: els.deliveryAddress.value.trim(),
    notes: els.dropNotes.value.trim(),
    step: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  saveOrders();
  els.dropForm.reset();
  els.dropBags.value = "1";
  renderOrders(order.code);
  showToast(`Drop created. Tracking code ${order.code}`);
}

function seedSampleOrder() {
  if (!state.customer) {
    showToast("Log in first to add a sample order.");
    openLoginModal();
    return;
  }

  const sample = {
    code: createTrackingCode(),
    customerId: state.customer.id,
    customerName: state.customer.name,
    contact: state.customer.contact,
    partnerId: partners[1]?.id || partners[0].id,
    service: "Wash + Fold",
    bags: 2,
    deliveryWindow: "Tomorrow Evening",
    deliveryAddress: "Demo delivery address",
    notes: "Keep tees low heat. Call on arrival.",
    step: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.orders.unshift(sample);
  saveOrders();
  renderOrders(sample.code);
  showToast(`Sample drop added. Tracking code ${sample.code}`);
}

function updateOrder(code, updater) {
  const order = state.orders.find(item => item.code === code);
  if (!order) return;
  updater(order);
  order.updatedAt = new Date().toISOString();
  saveOrders();
  renderOrders(code);
}

function advanceOrder(code) {
  updateOrder(code, order => {
    order.step = Math.min((order.step || 0) + 1, statusSteps.length - 1);
  });
  showToast(`${code} is now ${currentStatus(state.orders.find(item => item.code === code))}.`);
}

function markDelivered(code) {
  updateOrder(code, order => {
    order.step = statusSteps.length - 1;
  });
  showToast(`${code} marked delivered.`);
}

function quickTrack(code) {
  const cleaned = String(code || "").trim();
  if (!cleaned) {
    showToast("Enter a tracking code first.");
    return;
  }

  const order = state.orders.find(item => normalize(item.code) === normalize(cleaned));
  if (!order) {
    showToast("Tracking code not found in this browser demo.");
    return;
  }

  if (!state.customer || state.customer.id !== order.customerId) {
    state.customer = {
      id: order.customerId,
      name: order.customerName || "SOAP MONEY Customer",
      contact: order.contact || "Tracking lookup",
      pin: "0000",
      updatedAt: new Date().toISOString()
    };
    saveCustomer();
  }

  renderAuth();
  renderOrders(order.code);
  document.querySelector("#tracker").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => document.querySelector(`[data-code="${order.code}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
  showToast(`${order.code}: ${currentStatus(order)}.`);
}

function wireEvents() {
  els.search.addEventListener("input", event => {
    state.query = event.target.value;
    renderList();
  });

  els.chips.forEach(chip => {
    chip.addEventListener("click", () => {
      els.chips.forEach(item => item.classList.remove("active"));
      chip.classList.add("active");
      state.filter = chip.dataset.filter;
      renderList();
      const results = filteredPartners();
      fitMapToPartners(results.length ? results : partners);
    });
  });

  els.locateBtn.addEventListener("click", locateUser);
  els.resetMapBtn.addEventListener("click", () => fitMapToPartners(partners));

  els.openSelectedBtn.addEventListener("click", () => {
    const partner = partners.find(item => item.id === state.selectedId) || partners[0];
    window.open(directionsUrl(partner), "_blank", "noopener");
  });

  els.shareBtn?.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "Find SOAP MONEY partner laundromats and track drop offs.",
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied.");
      }
    } catch {
      showToast("Share canceled.");
    }
  });

  els.accountTopBtn.addEventListener("click", () => {
    if (state.customer) {
      document.querySelector("#tracker").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    openLoginModal();
  });

  els.openLoginModalBtn?.addEventListener("click", openLoginModal);
  els.unlockLoginBtn.addEventListener("click", openLoginModal);
  els.closeLoginModal?.addEventListener("click", closeLoginModal);
  els.loginModal?.addEventListener("click", event => {
    if (event.target === els.loginModal) closeLoginModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !els.loginModal?.classList.contains("hidden")) {
      closeLoginModal();
    }
  });

  els.loginForm.addEventListener("submit", event => {
    event.preventDefault();
    loginCustomer({
      name: els.loginName.value,
      contact: els.loginContact.value,
      pin: els.loginPin.value
    });
  });

  els.demoLoginBtn.addEventListener("click", () => {
    loginCustomer({
      name: "SOAP MONEY Demo",
      contact: "demo@soapmoney.local",
      pin: "2026"
    });
    if (!customerOrders().length) seedSampleOrder();
  });

  els.logoutBtn.addEventListener("click", logoutCustomer);

  els.dropForm.addEventListener("submit", event => {
    event.preventDefault();
    createOrderFromForm();
  });

  els.seedOrderBtn.addEventListener("click", seedSampleOrder);

  els.quickTrackForm.addEventListener("submit", event => {
    event.preventDefault();
    quickTrack(els.quickTrackInput.value);
  });

  const navTargets = ["partners", "mapPanel", "tracker", "join"];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      els.bottomNavItems.forEach(item => {
        item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 });

  navTargets.forEach(id => {
    const target = document.getElementById(id);
    if (target) observer.observe(target);
  });
}

function locateUser() {
  if (!navigator.geolocation) {
    showToast("Location is not available on this device.");
    return;
  }

  els.mapStatus.style.opacity = "1";
  els.mapStatus.textContent = "Finding your location";

  navigator.geolocation.getCurrentPosition(position => {
    state.userPosition = [position.coords.latitude, position.coords.longitude];
    renderList();

    if (state.map && window.L) {
      if (state.userMarker) state.userMarker.remove();
      const userIcon = L.divIcon({ className: "", html: `<div class="user-marker"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
      state.userMarker = L.marker(state.userPosition, { icon: userIcon, title: "Your location" }).addTo(state.map);
      const results = filteredPartners();
      const nearest = results[0];
      if (nearest) {
        const bounds = L.latLngBounds([state.userPosition, nearest.coords]);
        state.map.fitBounds(bounds, { padding: [60, 60] });
        selectPartner(nearest.id, true);
      }
    }

    els.mapStatus.textContent = "Nearest spots sorted";
    showToast("Nearest participating laundromats are sorted first.");
    setTimeout(() => {
      if (els.mapStatus.textContent === "Nearest spots sorted") els.mapStatus.style.opacity = "0";
    }, 1800);
  }, () => {
    els.mapStatus.textContent = "Location permission denied";
    showToast("Location permission was not allowed.");
    setTimeout(() => {
      if (els.mapStatus.textContent === "Location permission denied") els.mapStatus.style.opacity = "0";
    }, 2000);
  }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => null);
    });
  }
}

function init() {
  loadState();
  renderPartnerSelect();
  renderList();
  renderAuth();
  initMap();
  wireEvents();
  registerServiceWorker();
}

init();

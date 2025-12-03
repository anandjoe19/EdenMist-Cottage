const DATA_VERSION = "2025-11-gallery";

const App = (() => {
  const selectors = {
    navToggle: ".nav-toggle",
    navLinks: ".nav-links",
    heroActions: ".hero-actions",
    bookingForm: "#bookingForm",
    bookingRooms: '#bookingForm select[name="roomId"]',
    cartSummary: "#cartSummary",
    txnInput: "#txnIdInput",
    roomForm: "#roomForm",
    amenityForm: "#amenityForm",
    galleryForm: "#galleryForm",
    pricingForm: "#pricingForm",
    pricingRequestForm: "#pricingRequestForm",
    contactForm: "#contactForm",
  };

  const state = {
    rooms: [],
    amenities: [],
    gallery: [],
    pricing: [],
    bookings: [],
    cart: {},
    ownerPhone: "919876543210",
  };

  function init() {
    cacheDom();
    seedDefaults();
    bindEvents();
    renderAll();
    setYear();
  }

  function cacheDom() {
    state.navToggle = document.querySelector(selectors.navToggle);
    state.navLinks = document.querySelector(selectors.navLinks);
    state.bookingForm = document.querySelector(selectors.bookingForm);
    state.bookingRooms = document.querySelector(selectors.bookingRooms);
    state.cartSummary = document.querySelector(selectors.cartSummary);
    state.txnInput = document.querySelector(selectors.txnInput);
    state.roomForm = document.querySelector(selectors.roomForm);
    state.amenityForm = document.querySelector(selectors.amenityForm);
    state.galleryForm = document.querySelector(selectors.galleryForm);
    state.pricingForm = document.querySelector(selectors.pricingForm);
    state.pricingRequestForm = document.querySelector(
      selectors.pricingRequestForm
    );
    state.contactForm = document.querySelector(selectors.contactForm);
  }

  function seedDefaults() {
    const storedVersion = localStorage.getItem("kc_data_version");
    const hasExisting = Boolean(localStorage.getItem("kc_rooms"));

    if (hasExisting) {
      loadFromStorage();
      if (storedVersion !== DATA_VERSION) {
        state.gallery = getDefaultGallery();
        persistAll();
        localStorage.setItem("kc_data_version", DATA_VERSION);
      }
      return;
    }

    applyDefaultData();
    persistAll();
    localStorage.setItem("kc_data_version", DATA_VERSION);
  }

  function loadFromStorage() {
    state.rooms = JSON.parse(localStorage.getItem("kc_rooms") || "[]");
    state.amenities = JSON.parse(localStorage.getItem("kc_amenities") || "[]");
    state.gallery = JSON.parse(localStorage.getItem("kc_gallery") || "[]");
    state.pricing = JSON.parse(localStorage.getItem("kc_pricing") || "[]");
    state.bookings = JSON.parse(localStorage.getItem("kc_bookings") || "[]");
    state.cart = JSON.parse(localStorage.getItem("kc_cart") || "{}");
  }

  function applyDefaultData() {
    state.rooms = [
      {
        id: crypto.randomUUID(),
        name: "Mist View Cottage",
        beds: 2,
        maxGuests: 4,
        price: 4800,
        description: "Panoramic valley views with private sit-out.",
      },
      {
        id: crypto.randomUUID(),
        name: "Forest Pod",
        beds: 1,
        maxGuests: 2,
        price: 3200,
        description: "Cozy pod stay tucked under shola canopy.",
      },
    ];

    state.amenities = [
      { id: crypto.randomUUID(), label: "Organic breakfast" },
      { id: crypto.randomUUID(), label: "Bonfire & music" },
      { id: crypto.randomUUID(), label: "Guided plantation walk" },
      { id: crypto.randomUUID(), label: "High-speed Wi-Fi" },
    ];

    state.gallery = getDefaultGallery();

    state.pricing = [
      {
        id: crypto.randomUUID(),
        label: "Weekday Tariff",
        rate: "₹4,800 / night",
        includes: ["Breakfast", "Guided walk", "Welcome drink"],
      },
      {
        id: crypto.randomUUID(),
        label: "Weekend Tariff",
        rate: "₹5,600 / night",
        includes: ["Breakfast & dinner", "Bonfire setup"],
      },
    ];

    state.bookings = [];
    state.cart = {};
  }

  function getDefaultGallery() {
    return [
      {
        id: crypto.randomUUID(),
        url: "assets/gallery/kanthalloor-village.jpg",
        caption: "Mist rolling over Kanthalloor valley",
      },
      {
        id: crypto.randomUUID(),
        url: "assets/gallery/tea-ridge.jpg",
        caption: "Tea ridges en route to Kanthalloor",
      },
      {
        id: crypto.randomUUID(),
        url: "assets/gallery/apple-orchard.jpg",
        caption: "Apple orchard walk in Kanthalloor",
      },
      {
        id: crypto.randomUUID(),
        url: "assets/gallery/waterfall.jpg",
        caption: "Shola-side cascade near Kanthalloor",
      },
    ];
  }

  function persistAll() {
    localStorage.setItem("kc_rooms", JSON.stringify(state.rooms));
    localStorage.setItem("kc_amenities", JSON.stringify(state.amenities));
    localStorage.setItem("kc_gallery", JSON.stringify(state.gallery));
    localStorage.setItem("kc_pricing", JSON.stringify(state.pricing));
    localStorage.setItem("kc_bookings", JSON.stringify(state.bookings));
    persistCart();
    localStorage.setItem("kc_data_version", DATA_VERSION);
  }

  function persistCart() {
    localStorage.setItem("kc_cart", JSON.stringify(state.cart));
  }

  function bindEvents() {
    state.navToggle?.addEventListener("click", toggleNav);
    document.addEventListener("click", handleGlobalClicks);
    state.bookingForm?.addEventListener("submit", handleBookingSubmit);
    state.bookingForm?.addEventListener("input", syncCartFromForm);
    state.bookingForm?.addEventListener("change", syncCartFromForm);
    state.roomForm?.addEventListener("submit", handleRoomSave);
    state.roomForm?.addEventListener("reset", () =>
      resetFormInputs(state.roomForm)
    );
    state.amenityForm?.addEventListener("submit", handleAmenitySave);
    state.amenityForm?.addEventListener("reset", () =>
      resetFormInputs(state.amenityForm)
    );
    state.galleryForm?.addEventListener("submit", handleGallerySave);
    state.galleryForm?.addEventListener("reset", () =>
      resetFormInputs(state.galleryForm)
    );
    state.pricingForm?.addEventListener("submit", handlePricingSave);
    state.pricingForm?.addEventListener("reset", () =>
      resetFormInputs(state.pricingForm)
    );
    state.pricingRequestForm?.addEventListener(
      "submit",
      handlePricingRequestSubmit
    );
    state.contactForm?.addEventListener("submit", handleContactSubmit);
    state.txnInput?.addEventListener("input", handleTxnInput);
  }

  function toggleNav() {
    const expanded = state.navLinks.getAttribute("aria-expanded") === "true";
    state.navLinks.setAttribute("aria-expanded", expanded ? "false" : "true");
  }

  function handleGlobalClicks(e) {
    const modalTrigger = e.target.closest("[data-modal]");
    if (modalTrigger) {
      openModal(modalTrigger.dataset.modal);
    }
    if (e.target.matches("[data-close]")) {
      closeModal(e.target.closest(".modal"));
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.preventDefault();
      handleAction(actionBtn.dataset.action, actionBtn.dataset.id);
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal?.setAttribute("aria-hidden", "true");
  }

  function renderAll() {
    renderRooms();
    renderRoomAdmin();
    renderAmenities();
    renderAmenityAdmin();
    renderGallery();
    renderGalleryAdmin();
    renderPricing();
    renderPricingAdmin();
    populateRoomOptions();
    hydrateBookingForm();
    renderCart();
  }

  function renderRooms() {
    const list = document.getElementById("roomList");
    if (!list) return;
    list.innerHTML = state.rooms
      .map(
        (room) => `
        <article class="card">
          <header>
            <h3>${room.name}</h3>
            <p>${room.description}</p>
          </header>
          <ul>
            <li>${room.beds} beds • ${room.maxGuests} guests</li>
            <li>From ₹${room.price.toLocaleString()}</li>
          </ul>
          <button class="secondary" data-action="select-room" data-id="${room.id}">
            Select
          </button>
        </article>
      `
      )
      .join("");
  }

  function renderAmenities() {
    const list = document.getElementById("amenityList");
    if (!list) return;
    list.innerHTML = state.amenities
      .map((item) => `<div class="card small">${item.label}</div>`)
      .join("");
  }

  function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;
    grid.innerHTML = state.gallery
      .map(
        (item) => `
        <figure>
          <img src="${item.url}" alt="${item.caption}" />
          <figcaption>${item.caption}</figcaption>
        </figure>
      `
      )
      .join("");
  }

  function renderPricing() {
    const list = document.getElementById("pricingList");
    if (!list) return;
    list.innerHTML = state.pricing
      .map(
        (tier) => `
        <article class="card">
          <h3>${tier.label}</h3>
          <p>${tier.rate}</p>
          <ul>
            ${tier.includes.map((line) => `<li>${line}</li>`).join("")}
          </ul>
        </article>
      `
      )
      .join("");
  }

  function populateRoomOptions() {
    const select = state.bookingRooms;
    if (!select) return;
    select.innerHTML = state.rooms
      .map(
        (room) => `
        <option value="${room.id}">
          ${room.name} (max ${room.maxGuests})
        </option>
      `
      )
      .join("");
  }

  function hydrateBookingForm() {
    if (!state.bookingForm || !state.cart) return;
    Object.entries(state.cart).forEach(([key, value]) => {
      if (state.bookingForm[key]) {
        state.bookingForm[key].value = value;
      }
    });
  }

  function handleBookingSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const booking = Object.fromEntries(formData);
    booking.id = crypto.randomUUID();
    booking.roomCount = Number(booking.roomCount || 1);
    booking.guests = Number(booking.guests || 1);
    booking.phone = booking.phone.trim();
    booking.email = booking.email.trim();
    booking.name = booking.name.trim();
    const room = state.rooms.find((item) => item.id === booking.roomId);
    booking.roomName = room?.name || "Custom room";
    booking.nightlyRate = room?.price || 0;
    const nights = calculateNights(booking.checkin, booking.checkout);
    if (!booking.checkin || !booking.checkout || nights <= 0) {
      alert("Please pick valid check-in and check-out dates.");
      return;
    }
    booking.nights = nights;
    booking.createdAt = new Date().toISOString();
    state.bookings.push(booking);
    const existingTxn = state.cart?.txnId || "";
    state.cart = { ...booking, txnId: existingTxn };
    persistAll();
    renderCart();
    alert("Booking saved locally. Proceed to Pay Now to complete payment.");
    notifyOwner(booking);
  }

  function renderCart() {
    if (!state.cartSummary) return;
    if (!state.cart || Object.keys(state.cart).length === 0) {
      state.cartSummary.innerHTML = "<p>No selections yet.</p>";
      if (state.txnInput) state.txnInput.value = "";
      return;
    }
    const {
      name,
      checkin,
      checkout,
      roomName,
      roomCount,
      guests,
      nightlyRate,
    } = state.cart;
    const nights = calculateNights(checkin, checkout);
    const rate = Number(nightlyRate || 0);
    const total = rate * nights * (roomCount || 1);
    if (state.txnInput) state.txnInput.value = state.cart.txnId || "";
    state.cartSummary.innerHTML = `
      <h3>Cart Summary</h3>
      <p><strong>${name || "Pending guest"}</strong></p>
      <p>${checkin || "Add check-in"} → ${checkout || "Add check-out"}</p>
      <p>${roomCount || 1} × ${roomName || "Select room"}</p>
      <p>Guests: ${guests || "-"}</p>
      <p>Rate: ${formatCurrency(rate)} / night</p>
      <p>Total: ${formatCurrency(total)}</p>
    `;
  }

  function clearCart() {
    state.cart = {};
    persistCart();
    renderCart();
    state.bookingForm?.reset();
    if (state.txnInput) state.txnInput.value = "";
  }

  function setYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function syncCartFromForm() {
    if (!state.bookingForm) return;
    const data = new FormData(state.bookingForm);
    const cartData = Object.fromEntries(data);
    cartData.roomCount = Number(cartData.roomCount || 1);
    cartData.guests = Number(cartData.guests || 1);
    if (cartData.roomId) {
      const room = state.rooms.find((item) => item.id === cartData.roomId);
      cartData.roomName = room?.name || state.cart.roomName;
      cartData.nightlyRate = room?.price || state.cart.nightlyRate || 0;
    }
    state.cart = { ...state.cart, ...cartData };
    persistCart();
    renderCart();
  }

  function renderRoomAdmin() {
    const list = document.getElementById("roomAdminList");
    if (!list) return;
    list.innerHTML = state.rooms
      .map(
        (room) => `
        <div class="admin-item">
          <div>
            <strong>${room.name}</strong>
            <p>${room.beds} beds • ₹${room.price.toLocaleString()}</p>
          </div>
          <div class="admin-actions">
            <button data-action="edit-room" data-id="${room.id}">Edit</button>
            <button data-action="delete-room" data-id="${room.id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function handleRoomSave(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("roomId");
    const payload = {
      id: id || crypto.randomUUID(),
      name: data.get("roomName").trim(),
      beds: Number(data.get("roomBeds")),
      maxGuests: Number(data.get("roomGuests")),
      price: Number(data.get("roomPrice")),
      description: data.get("roomDescription").trim(),
    };
    if (id) {
      state.rooms = state.rooms.map((room) =>
        room.id === id ? payload : room
      );
    } else {
      state.rooms.push(payload);
    }
    persistAll();
    renderRooms();
    renderRoomAdmin();
    populateRoomOptions();
    e.currentTarget.reset();
    resetFormInputs(e.currentTarget);
  }

  function handleAmenitySave(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("amenityId");
    const label = data.get("amenityLabel").trim();
    if (!label) return;
    if (id) {
      state.amenities = state.amenities.map((item) =>
        item.id === id ? { ...item, label } : item
      );
    } else {
      state.amenities.push({ id: crypto.randomUUID(), label });
    }
    persistAll();
    renderAmenities();
    renderAmenityAdmin();
    e.currentTarget.reset();
    resetFormInputs(e.currentTarget);
  }

  function renderAmenityAdmin() {
    const list = document.getElementById("amenityAdminList");
    if (!list) return;
    list.innerHTML = state.amenities
      .map(
        (item) => `
        <div class="admin-item">
          <span>${item.label}</span>
          <div class="admin-actions">
            <button data-action="edit-amenity" data-id="${item.id}">Edit</button>
            <button data-action="delete-amenity" data-id="${item.id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function handleGallerySave(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("galleryId");
    const payload = {
      id: id || crypto.randomUUID(),
      url: data.get("galleryUrl").trim(),
      caption: data.get("galleryCaption").trim(),
    };
    if (id) {
      state.gallery = state.gallery.map((item) =>
        item.id === id ? payload : item
      );
    } else {
      state.gallery.push(payload);
    }
    persistAll();
    renderGallery();
    renderGalleryAdmin();
    e.currentTarget.reset();
    resetFormInputs(e.currentTarget);
  }

  function renderGalleryAdmin() {
    const list = document.getElementById("galleryAdminList");
    if (!list) return;
    list.innerHTML = state.gallery
      .map(
        (item) => `
        <div class="admin-item">
          <span>${item.caption}</span>
          <div class="admin-actions">
            <button data-action="edit-gallery" data-id="${item.id}">Edit</button>
            <button data-action="delete-gallery" data-id="${item.id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function handlePricingSave(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("pricingId");
    const payload = {
      id: id || crypto.randomUUID(),
      label: data.get("pricingLabel").trim(),
      rate: data.get("pricingRate").trim(),
      includes: data
        .get("pricingIncludes")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    if (id) {
      state.pricing = state.pricing.map((item) =>
        item.id === id ? payload : item
      );
    } else {
      state.pricing.push(payload);
    }
    persistAll();
    renderPricing();
    renderPricingAdmin();
    e.currentTarget.reset();
    resetFormInputs(e.currentTarget);
  }

  function renderPricingAdmin() {
    const list = document.getElementById("pricingAdminList");
    if (!list) return;
    list.innerHTML = state.pricing
      .map(
        (item) => `
        <div class="admin-item">
          <div>
            <strong>${item.label}</strong>
            <p>${item.rate}</p>
          </div>
          <div class="admin-actions">
            <button data-action="edit-pricing" data-id="${item.id}">Edit</button>
            <button data-action="delete-pricing" data-id="${item.id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function resetFormInputs(form) {
    if (!form) return;
    form.querySelectorAll('input[type="hidden"]').forEach((input) => {
      input.value = "";
    });
  }

  function handleAction(action, id) {
    if (!action) return;
    switch (action) {
      case "edit-room":
        fillRoomForm(id);
        break;
      case "delete-room":
        deleteRoom(id);
        break;
      case "edit-amenity":
        fillAmenityForm(id);
        break;
      case "delete-amenity":
        deleteAmenity(id);
        break;
      case "edit-gallery":
        fillGalleryForm(id);
        break;
      case "delete-gallery":
        deleteGallery(id);
        break;
      case "edit-pricing":
        fillPricingForm(id);
        break;
      case "delete-pricing":
        deletePricing(id);
        break;
      case "select-room":
        selectRoom(id);
        break;
      case "book-now":
        scrollToSection("booking");
        break;
      case "view-rooms":
        scrollToSection("rooms");
        break;
      case "contact":
        scrollToSection("contact");
        break;
      case "clear-cart":
        clearCart();
        break;
      case "print-bill":
      case "show-bill":
        showBill();
        break;
      case "trigger-print":
        window.print();
        break;
      default:
        break;
    }
  }

  function fillRoomForm(id) {
    const data = state.rooms.find((room) => room.id === id);
    if (!data || !state.roomForm) return;
    state.roomForm.roomId.value = data.id;
    state.roomForm.roomName.value = data.name;
    state.roomForm.roomBeds.value = data.beds;
    state.roomForm.roomGuests.value = data.maxGuests;
    state.roomForm.roomPrice.value = data.price;
    state.roomForm.roomDescription.value = data.description;
  }

  function deleteRoom(id) {
    if (!confirm("Remove this room?")) return;
    state.rooms = state.rooms.filter((room) => room.id !== id);
    persistAll();
    renderRooms();
    renderRoomAdmin();
    populateRoomOptions();
  }

  function fillAmenityForm(id) {
    const data = state.amenities.find((item) => item.id === id);
    if (!data || !state.amenityForm) return;
    state.amenityForm.amenityId.value = data.id;
    state.amenityForm.amenityLabel.value = data.label;
  }

  function deleteAmenity(id) {
    if (!confirm("Remove this amenity?")) return;
    state.amenities = state.amenities.filter((item) => item.id !== id);
    persistAll();
    renderAmenities();
    renderAmenityAdmin();
  }

  function fillGalleryForm(id) {
    const data = state.gallery.find((item) => item.id === id);
    if (!data || !state.galleryForm) return;
    state.galleryForm.galleryId.value = data.id;
    state.galleryForm.galleryUrl.value = data.url;
    state.galleryForm.galleryCaption.value = data.caption;
  }

  function deleteGallery(id) {
    if (!confirm("Remove this image?")) return;
    state.gallery = state.gallery.filter((item) => item.id !== id);
    persistAll();
    renderGallery();
    renderGalleryAdmin();
  }

  function fillPricingForm(id) {
    const data = state.pricing.find((item) => item.id === id);
    if (!data || !state.pricingForm) return;
    state.pricingForm.pricingId.value = data.id;
    state.pricingForm.pricingLabel.value = data.label;
    state.pricingForm.pricingRate.value = data.rate;
    state.pricingForm.pricingIncludes.value = data.includes.join("\n");
  }

  function deletePricing(id) {
    if (!confirm("Remove this plan?")) return;
    state.pricing = state.pricing.filter((item) => item.id !== id);
    persistAll();
    renderPricing();
    renderPricingAdmin();
  }

  function selectRoom(id) {
    const room = state.rooms.find((item) => item.id === id);
    if (!room) return;
    state.cart = {
      ...state.cart,
      roomId: room.id,
      roomName: room.name,
      nightlyRate: room.price,
    };
    if (state.bookingRooms) {
      state.bookingRooms.value = room.id;
    }
    if (state.bookingForm?.roomId) {
      state.bookingForm.roomId.value = room.id;
    }
    persistCart();
    renderCart();
    scrollToSection("booking");
  }

  function scrollToSection(anchor) {
    const el = document.getElementById(anchor);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  function showBill() {
    const modal = document.getElementById("billModal");
    const container = document.getElementById("billContent");
    if (!state.cart?.name || !container) {
      alert("Add booking details to generate the bill.");
      return;
    }
    const nights = calculateNights(state.cart.checkin, state.cart.checkout);
    const rate = Number(state.cart.nightlyRate || 0);
    const total = nights * rate * (state.cart.roomCount || 1);
    container.innerHTML = `
      <p><strong>Name:</strong> ${state.cart.name}</p>
      <p><strong>Phone:</strong> ${state.cart.phone || "-"}</p>
      <p><strong>Stay:</strong> ${state.cart.checkin} → ${
      state.cart.checkout
    } (${nights} nights)</p>
      <p><strong>Room:</strong> ${state.cart.roomName || "Pending selection"}</p>
      <p><strong>Rate:</strong> ${formatCurrency(rate)} / night</p>
      <p><strong>Total:</strong> ${formatCurrency(total)}</p>
      <p><strong>Transaction ID:</strong> ${
        state.cart.txnId || "Pending"
      }</p>
    `;
    if (modal) {
      modal.setAttribute("aria-hidden", "false");
    }
  }

  function calculateNights(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return Number.isFinite(diff) && diff > 0 ? diff : 1;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  function handleTxnInput(e) {
    state.cart = { ...state.cart, txnId: e.currentTarget.value.trim() };
    persistCart();
  }

  function handlePricingRequestSubmit(e) {
    e.preventDefault();
    const phone = new FormData(e.currentTarget)
      .get("pricingPhone")
      .replace(/\D/g, "");
    if (phone.length < 10) {
      alert("Enter a valid phone number");
      return;
    }
    const message = encodeURIComponent(
      [
        "Kanthalloor Cottage Tariff",
        ...state.pricing.map(
          (plan) =>
            `• ${plan.label}: ${plan.rate} (Includes: ${plan.includes.join(", ")})`
        ),
        "",
        "Amenities:",
        ...state.amenities.map((item) => `- ${item.label}`),
      ].join("\n")
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
    closeModal(document.getElementById("priceRequestModal"));
    e.currentTarget.reset();
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    alert("Thanks for reaching out! We'll respond shortly.");
    e.currentTarget.reset();
  }

  function notifyOwner(booking) {
    if (!booking) return;
    const message = encodeURIComponent(
      [
        "New Kanthalloor Cottage Booking",
        `Guest: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Dates: ${booking.checkin} → ${booking.checkout} (${booking.nights} nights)`,
        `Room: ${booking.roomName} × ${booking.roomCount}`,
        `Guests: ${booking.guests}`,
      ].join("\n")
    );
    const url = `https://wa.me/${state.ownerPhone}?text=${message}`;
    window.open(url, "_blank");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);


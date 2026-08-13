/**
 * ============================================================================
 * RENTFLOW - BOOKING & RENTALS MODULE
 * ============================================================================
 * This script handles the core functionality of the Explore Rentals page.
 * It demonstrates proficiency in DOM Manipulation, Event Handling, Local Storage,
 * Array Higher-Order Functions (map, filter), Promises, Async/Await, and the
 * Fetch API (used for reverse geocoding via OpenStreetMap Nominatim).
 */

document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // 0. AUTH UI UPDATE
    // ========================================
    function updateAuthUI() {
        const authContainer = document.getElementById("auth-buttons");
        if (!authContainer) return;
        
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
            let user = { userfname: "User" };
            try { user = JSON.parse(localStorage.getItem("current_user")) || user; } catch(e) {}
            const initial = user.userfname ? user.userfname.charAt(0).toUpperCase() : "U";
            
            authContainer.innerHTML = `
                <a href="profile.html" class="btn-ghost" style="display:flex; align-items:center; gap:8px;">
                    <div style="width:24px; height:24px; border-radius:50%; background:var(--blue); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px;">${initial}</div>
                    Profile
                </a>
                <a href="#" class="btn-nav-primary" id="logout-btn">Log Out</a>
            `;
            document.getElementById("logout-btn").addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("current_user");
                window.location.reload();
            });
        }
    }
    updateAuthUI();

    // ========================================
    // 1. STATE MANAGEMENT & VARIABLES
    // ========================================
    let allListings = [];
    let currentCategory = "All";
    let userLocation = null; // { lat, lon, city }
    
    // DOM Elements
    const listingsGrid = document.getElementById("listings-grid");
    const categoryFilters = document.getElementById("category-filters");
    const autoLocateBtn = document.getElementById("auto-locate-btn");
    const locationInput = document.getElementById("location-input");
    const toastContainer = document.getElementById("toast-container");

    // Modal Elements
    const bookingModal = document.getElementById("booking-modal");
    const chatModal = document.getElementById("chat-modal");
    const proModal = document.getElementById("pro-modal");
    
    // Booking Form Elements
    const bookingForm = document.getElementById("booking-form");
    const bookingStart = document.getElementById("booking-start");
    const bookingEnd = document.getElementById("booking-end");

    // Chat Form Elements
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    // Currently active interaction contexts
    let activeBookingListingId = null;
    let activeChatListingId = null;

    // ========================================
    // 2. INITIALIZATION (IIFE-like start)
    // ========================================
    init();

    function init() {
        // Load data from Local Storage (using JSON parsing)
        fetchListings();
        
        // Render initial UI state
        renderListings(allListings);

        // Setup Event Listeners
        setupEventListeners();
        
        // Set minimum dates for booking form
        const today = new Date().toISOString().split('T')[0];
        bookingStart.min = today;
        bookingEnd.min = today;
    }

    // ========================================
    // 3. DATA FETCHING & MOCKING
    // ========================================
    /**
     * Fetches listings from localStorage.
     * If empty, injects some default mock data to demonstrate the UI.
     */
    function fetchListings() {
        const stored = localStorage.getItem('RentFlow_listings');
        if (stored) {
            try {
                allListings = JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing listings", e);
                allListings = getMockListings();
            }
        } else {
            allListings = getMockListings();
            // Save mock data back to local storage for persistence
            localStorage.setItem('RentFlow_listings', JSON.stringify(allListings));
        }

        // Ensure every listing has mock coordinates for distance calculation
        allListings = allListings.map(listing => {
            if (!listing.lat || !listing.lon) {
                // Mock random coordinates around India
                return {
                    ...listing,
                    lat: 19.0760 + (Math.random() - 0.5) * 5,
                    lon: 72.8777 + (Math.random() - 0.5) * 5
                };
            }
            return listing;
        });
    }

    // ========================================
    // 4. DOM RENDER & HIGHER-ORDER FUNCTIONS
    // ========================================
    /**
     * Renders listing cards to the grid.
     * Uses Array.prototype.map() to generate HTML strings dynamically.
     * @param {Array} listings - The array of listing objects to render
     */
    function renderListings(listings) {
        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #8b93a1;">
                    <p>No rentals found matching your criteria.</p>
                </div>
            `;
            return;
        }

        const isPro = checkProStatus();

        // Using map() to transform object data into DOM HTML
        listingsGrid.innerHTML = listings.map(item => {
            const initial = item.seller?.name?.charAt(0).toUpperCase() || 'S';
            let distanceHtml = '';
            
            // If user location is known, calculate distance
            if (userLocation && item.lat && item.lon) {
                const dist = calculateDistance(userLocation.lat, userLocation.lon, item.lat, item.lon);
                distanceHtml = `
                    <div class="card-distance-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${dist.toFixed(1)} km
                    </div>
                `;
            }

            // Construct contact display based on PRO status
            const contactDisplay = isPro 
                ? (item.seller?.phone || 'Contact Available')
                : 'Unlock Contact (Pro)';
            
            const contactClass = isPro ? 'text-green-500' : 'text-blue-400 cursor-pointer unlock-trigger';

            return `
                <div class="listing-card" data-id="${item.id}">
                    <div class="card-image-wrapper">
                        <img src="${item.images?.[0] || 'https://via.placeholder.com/400x300'}" alt="${item.title}" class="card-image" />
                        <div class="card-category-badge">${item.category}</div>
                        ${distanceHtml}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">${item.description || 'No description provided.'}</p>
                        
                        <div class="card-lender-info">
                            <div class="lender-avatar">${initial}</div>
                            <div class="lender-details">
                                <h5>${item.seller?.name || 'Verified Owner'}</h5>
                                <p class="${contactClass}">${contactDisplay}</p>
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="card-price">
                                ₹${item.price.toLocaleString('en-IN')}<span>/${item.period}</span>
                            </div>
                            <div class="card-actions">
                                <button class="btn-chat" onclick="window.openChatModal('${item.id}')">Chat</button>
                                <button class="btn-book" onclick="window.openBookingModal('${item.id}')">Book</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners to unlock triggers (Pro gate)
        document.querySelectorAll('.unlock-trigger').forEach(el => {
            el.addEventListener('click', () => {
                proModal.classList.add('show');
            });
        });
    }

    // ========================================
    // 5. EVENT DELEGATION & HANDLING
    // ========================================
    function setupEventListeners() {
        // Category Filtering
        categoryFilters.addEventListener("click", (e) => {
            if (e.target.classList.contains("category-pill")) {
                // Update active class styling
                document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
                e.target.classList.add("active");
                
                // Update state and re-render
                currentCategory = e.target.getAttribute("data-category");
                filterAndSortListings();
            }
        });

        // Location Auto-Detect (Promises, Async/Await, Fetch API)
        autoLocateBtn.addEventListener("click", handleAutoLocate);

        // Modal Close Buttons
        document.getElementById("close-booking-modal").addEventListener("click", () => bookingModal.classList.remove("show"));
        document.getElementById("close-chat-modal").addEventListener("click", () => chatModal.classList.remove("show"));
        document.getElementById("close-pro-modal").addEventListener("click", () => proModal.classList.remove("show"));
        
        // Close modals on outside click
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.remove("show");
                }
            });
        });

        // Booking Form Logic
        bookingStart.addEventListener("change", updateBookingCalculations);
        bookingEnd.addEventListener("change", updateBookingCalculations);
        bookingForm.addEventListener("submit", handleBookingSubmit);

        // Chat Form Logic
        chatForm.addEventListener("submit", handleChatSubmit);
    }

    // ========================================
    // 6. ASYNC/AWAIT & FETCH API (GEOCODING)
    // ========================================
    /**
     * Handles the "Locate Me" button click.
     * Uses Geolocation API to get coordinates, then Fetch API to reverse geocode via Nominatim.
     */
    async function handleAutoLocate() {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }

        autoLocateBtn.textContent = "Locating...";
        autoLocateBtn.disabled = true;

        try {
            // Promisify geolocation to use with async/await
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });

            const { latitude, longitude } = position.coords;
            userLocation = { lat: latitude, lon: longitude };

            // Fetch API call to OpenStreetMap Nominatim
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.state || "Unknown Location";
            
            locationInput.value = city;
            showToast(`Location detected: ${city}`);
            
            // Re-render to show distances
            filterAndSortListings();

        } catch (error) {
            console.error("Location error:", error);
            showToast("Failed to detect location.", "error");
        } finally {
            autoLocateBtn.textContent = "Locate Me";
            autoLocateBtn.disabled = false;
        }
    }

    /**
     * Filters listings by category and sorts them by distance if location is known.
     * Uses Array.prototype.filter() and Array.prototype.sort().
     */
    function filterAndSortListings() {
        let filtered = allListings;

        if (currentCategory !== "All") {
            filtered = allListings.filter(item => item.category === currentCategory);
        }

        if (userLocation) {
            // Sort by distance (closest first)
            filtered.sort((a, b) => {
                const distA = calculateDistance(userLocation.lat, userLocation.lon, a.lat, a.lon);
                const distB = calculateDistance(userLocation.lat, userLocation.lon, b.lat, b.lon);
                return distA - distB;
            });
        }

        renderListings(filtered);
    }

    // ========================================
    // 7. MATHEMATICAL UTILITIES
    // ========================================
    /**
     * Haversine formula to calculate distance between two coordinates in kilometers.
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1); 
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // ========================================
    // 8. MODAL LOGIC & FORM HANDLING
    // ========================================
    
    // Make functions globally accessible for inline onclick handlers
    window.openBookingModal = function(listingId) {
        const listing = allListings.find(l => l.id === listingId);
        if (!listing) return;

        activeBookingListingId = listingId;
        
        document.getElementById("booking-item-title").textContent = listing.title;
        document.getElementById("booking-item-id").value = listing.id;
        document.getElementById("booking-item-price").value = listing.price;
        document.getElementById("booking-item-deposit").value = listing.securityDeposit || Math.round(listing.price * 0.1);
        
        // Reset form
        bookingForm.reset();
        document.getElementById("calc-days").textContent = "0";
        document.getElementById("calc-rate-display").textContent = "₹" + listing.price;
        document.getElementById("calc-subtotal").textContent = "₹0";
        document.getElementById("calc-deposit").textContent = "₹0";
        document.getElementById("calc-total").textContent = "₹0";

        bookingModal.classList.add("show");
    };

    function updateBookingCalculations() {
        const start = new Date(bookingStart.value);
        const end = new Date(bookingEnd.value);
        const price = parseFloat(document.getElementById("booking-item-price").value);
        const deposit = parseFloat(document.getElementById("booking-item-deposit").value);

        if (start && end && start <= end) {
            // Calculate difference in days (minimum 1 day)
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
            
            const subtotal = diffDays * price;
            const total = subtotal + deposit; // Platform fee for renter is Free (₹0)

            document.getElementById("calc-days").textContent = diffDays;
            document.getElementById("calc-subtotal").textContent = "₹" + subtotal.toLocaleString('en-IN');
            document.getElementById("calc-deposit").textContent = "₹" + deposit.toLocaleString('en-IN');
            document.getElementById("calc-total").textContent = "₹" + total.toLocaleString('en-IN');
        } else {
            document.getElementById("calc-days").textContent = "0";
            document.getElementById("calc-subtotal").textContent = "₹0";
            document.getElementById("calc-total").textContent = "₹0";
        }
    }

    function handleBookingSubmit(e) {
        e.preventDefault();
        
        const start = bookingStart.value;
        const end = bookingEnd.value;
        const days = parseInt(document.getElementById("calc-days").textContent);
        
        if (days <= 0) {
            showToast("Invalid date range selected.", "error");
            return;
        }

        const listing = allListings.find(l => l.id === activeBookingListingId);
        if (!listing) return;

        // Construct Booking Object
        const bookingRecord = {
            id: 'BKG-' + Date.now(),
            listingId: listing.id,
            itemTitle: listing.title,
            itemImage: listing.images?.[0] || 'https://via.placeholder.com/400x300',
            lenderName: listing.seller?.name || 'Verified Owner',
            startDate: start,
            endDate: end,
            duration: days,
            rate: listing.price,
            subtotal: listing.price * days,
            deposit: listing.securityDeposit || Math.round(listing.price * 0.1),
            platformFee: 0,
            grandTotal: (listing.price * days) + (listing.securityDeposit || Math.round(listing.price * 0.1)),
            status: 'Pending', // Default status upon creation
            createdAt: new Date().toISOString()
        };

        // Save to Local Storage (Array manipulation)
        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('rentflow_bookings')) || [];
        } catch(e) {}
        
        bookings.unshift(bookingRecord); // Add to beginning of array
        localStorage.setItem('rentflow_bookings', JSON.stringify(bookings));

        bookingModal.classList.remove("show");
        showToast("Booking request sent successfully! Check My Rentals.");
    }

    // ========================================
    // 9. CHAT SYSTEM (OLX STYLE)
    // ========================================
    window.openChatModal = function(listingId) {
        const listing = allListings.find(l => l.id === listingId);
        if (!listing) return;

        activeChatListingId = listingId;
        
        document.getElementById("chat-lender-name").textContent = listing.seller?.name || 'Verified Owner';
        document.getElementById("chat-lender-avatar").textContent = (listing.seller?.name || 'V').charAt(0).toUpperCase();

        // Load existing chat history from localStorage
        loadChatHistory(listingId);

        chatModal.classList.add("show");
        chatInput.focus();
    };

    function loadChatHistory(listingId) {
        chatMessages.innerHTML = `<div style="text-align: center; font-size: 12px; color: #8b93a1; margin-bottom: 10px;">This conversation is secured by RentFlow.</div>`;
        
        let chats = {};
        try {
            chats = JSON.parse(localStorage.getItem('rentflow_chats')) || {};
        } catch(e) {}

        const thread = chats[listingId] || [];

        thread.forEach(msg => {
            appendMessageToUI(msg.text, msg.sender, msg.time);
        });

        scrollToBottom(chatMessages);
    }

    function handleChatSubmit(e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // 1. Append user message
        appendMessageToUI(text, "user", time);
        saveChatMessage(activeChatListingId, { text, sender: "user", time });
        chatInput.value = "";
        // Peer-to-peer chat simulation: we only save the sent message.
        // The lender would reply from their own dashboard when they log in.
    }

    function appendMessageToUI(text, sender, time) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender === "user" ? "sent" : "received"}`;
        bubble.innerHTML = `${text}<span class="chat-time">${time}</span>`;
        chatMessages.appendChild(bubble);
        scrollToBottom(chatMessages);
    }

    function saveChatMessage(listingId, messageObj) {
        let chats = {};
        try {
            chats = JSON.parse(localStorage.getItem('rentflow_chats')) || {};
        } catch(e) {}

        if (!chats[listingId]) chats[listingId] = [];
        chats[listingId].push(messageObj);
        
        localStorage.setItem('rentflow_chats', JSON.stringify(chats));
    }

    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    // ========================================
    // 10. UTILITIES
    // ========================================
    function checkProStatus() {
        try {
            const user = JSON.parse(localStorage.getItem('current_user'));
            return user?.isPro === true;
        } catch(e) {
            return false;
        }
    }

    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = "toast";
        
        const iconHtml = type === "success" 
            ? `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add("show"), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400); // wait for transition
        }, 3000);
    }

    function getMockListings() {
        return [
            {
                id: 'LIST-MOCK-1',
                title: 'Apple MacBook Pro M3 (16-inch)',
                category: 'Electronics',
                price: 500,
                period: 'day',
                description: 'Perfect for heavy video editing. Comes with charger and carrying case.',
                seller: { name: 'Aryan Tyagi', phone: '+91 99999 88888', city: 'Delhi NCR' },
                images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 2000,
                lat: 28.6139, lon: 77.2090
            },
            {
                id: 'LIST-MOCK-2',
                title: 'Sony A7S III Mirrorless Camera',
                category: 'Electronics',
                price: 350,
                period: 'day',
                description: 'Low light monster. Includes 3 batteries and a 64GB fast SD card.',
                seller: { name: 'Priya Sharma', phone: '+91 91234 56789', city: 'Mumbai' },
                images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 1500,
                lat: 19.0760, lon: 72.8777
            },
            {
                id: 'LIST-MOCK-3',
                title: 'DJI Mavic 3 Pro Drone',
                category: 'Electronics',
                price: 600,
                period: 'day',
                description: 'Triple camera system. Fly More Combo. Only renting to experienced pilots.',
                seller: { name: 'Kabir Singh', phone: '+91 98765 12345', city: 'Bangalore' },
                images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 3000,
                lat: 12.9716, lon: 77.5946
            },
            {
                id: 'LIST-MOCK-4',
                title: 'Bosch Power Drill Set',
                category: 'Tools',
                price: 150,
                period: 'day',
                description: 'Complete set with all drill bits. Ideal for DIY home projects.',
                seller: { name: 'Ravi Kumar', phone: '+91 99887 77665', city: 'Pune' },
                images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 500,
                lat: 18.5204, lon: 73.8567
            }
        ];
    }
});

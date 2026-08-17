/* ============================================================
   RentFlow – Admin Dashboard JavaScript (Platform Moderator)
   Uses shared storage.js for all data access.
   ============================================================ */

// ─── SAMPLE DATA (PHASE 1 — non-persistent) ─────────────────

const sampleReports = [
    { id: 'RP-01', type: 'Listing Report', reason: 'Inappropriate content', status: 'Pending' },
    { id: 'RP-02', type: 'Feedback Report', reason: 'Offensive language', status: 'Reviewed' }
];

const sampleActivity = [
    { text: 'Listing submitted — Camping Tent', time: '2 min ago', dot: 'dot-purple' },
    { text: 'Booking confirmed — BK-1021', time: '15 min ago', dot: 'dot-green' },
    { text: 'Content reported — RP-01', time: '1 hr ago', dot: 'dot-orange' },
    { text: 'Listing removed — Old Camera', time: '3 hrs ago', dot: 'dot-pink' },
    { text: 'Feedback submitted — FB-02', time: '5 hrs ago', dot: 'dot-blue' },
    { text: 'Booking cancelled — BK-1023', time: '8 hrs ago', dot: 'dot-orange' }
];


// ─── STATE ──────────────────────────────────────────────────

let listingToRemove = null;

// ─── KPI RENDERING ──────────────────────────────────────────

function renderKPIs() {
    const users = getUsers();
    const listings = getListings();
    const bookings = getBookings();
    const revenue = calculateTotalRevenue(bookings);
    const platformFee = calculatePlatformFeeRevenue(listings);
    const premiumUsers = getPremiumUsers(users);

    const kpiUsers = document.getElementById('kpiUsers');
    const kpiSellers = document.getElementById('kpiSellers');
    const kpiListings = document.getElementById('kpiListings');
    const kpiBookings = document.getElementById('kpiBookings');
    const kpiRevenue = document.getElementById('kpiRevenue');
    const kpiPlatformFee = document.getElementById('kpiPlatformFee');
    const kpiPremium = document.getElementById('kpiPremium');

    if (kpiUsers) kpiUsers.textContent = users.length;
    if (kpiSellers) {
        const sellerCount = users.filter(u => (u.role || '').toLowerCase() === 'seller').length;
        kpiSellers.textContent = sellerCount;
    }
    if (kpiListings) kpiListings.textContent = listings.length;
    if (kpiBookings) kpiBookings.textContent = bookings.length;
    if (kpiRevenue) kpiRevenue.textContent = formatCurrency(revenue);
    if (kpiPlatformFee) kpiPlatformFee.textContent = formatCurrency(platformFee);
    if (kpiPremium) kpiPremium.textContent = premiumUsers.length;
}

// ─── RENDER FUNCTIONS ────────────────────────────────────────

function renderListings() {
    const list = document.getElementById('listingList');
    const searchInput = document.getElementById('listingSearch');
    const categorySelect = document.getElementById('listingCategoryFilter');
    const statusSelect = document.getElementById('listingStatusFilter');
    const sortSelect = document.getElementById('listingSort');

    if (!list) return;

    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryFilter = categorySelect ? categorySelect.value : 'All';
    const statusFilter = statusSelect ? statusSelect.value : 'All';
    const sortVal = sortSelect ? sortSelect.value : 'newest';

    const allListings = getListings();

    // Filter
    let filtered = allListings.filter(listing => {
        const title = listing.title || listing.name || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery) || listing.id.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryFilter === 'All' || listing.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || listing.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
        const dateA = a.date || a.createdAt || 0;
        const dateB = b.date || b.createdAt || 0;
        const priceA = a.price || a.basePrice || 0;
        const priceB = b.price || b.basePrice || 0;
        if (sortVal === 'newest') return new Date(dateB) - new Date(dateA);
        if (sortVal === 'oldest') return new Date(dateA) - new Date(dateB);
        if (sortVal === 'price-asc') return priceA - priceB;
        if (sortVal === 'price-desc') return priceB - priceA;
        return 0;
    });

    let html = '';

    if (filtered.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center; padding:20px;">No listings found.</td></tr>';
    } else {
        filtered.forEach(listing => {
            let statusClass = 'badge-normal';
            if (listing.status === 'Active') statusClass = 'badge-low'; // green
            if (listing.status === 'Inactive' || listing.status === 'Pending') statusClass = 'badge-orange';

            // Build dynamic actions based on status
            let actionsHtml = `<button class="action-btn" onclick="viewListing('${listing.id}')">View</button>
                               <button class="action-btn" onclick="editListing('${listing.id}')">Edit</button>`;
                               
            if (listing.status === 'Active') {
                actionsHtml += `<button class="action-btn" onclick="toggleListing('${listing.id}', 'Disabled')">Disable</button>`;
            } else if (listing.status === 'Disabled' || listing.status === 'Inactive') {
                actionsHtml += `<button class="action-btn" onclick="toggleListing('${listing.id}', 'Active')">Restore</button>`;
            } else if (listing.status === 'Pending') {
                actionsHtml += `<button class="action-btn" onclick="toggleListing('${listing.id}', 'Active')">Approve</button>`;
            }
            
            actionsHtml += `<button class="action-btn btn-remove-text" onclick="requestRemoveListing('${listing.id}')" style="color: #f87171;">Remove</button>`;

            const title = listing.title || listing.name || 'Unknown';
            const price = listing.price || listing.basePrice || 0;

            html += `
                <tr>
                    <td><strong>${title}</strong><br><small style="color:#9ca3af">${listing.id}</small></td>
                    <td>${listing.category || 'Other'}</td>
                    <td>₹${price.toLocaleString('en-IN')}</td>
                    <td><span class="badge ${statusClass}">${listing.status.toUpperCase()}</span></td>
                    <td>${actionsHtml}</td>
                </tr>
            `;
        });
    }

    list.innerHTML = html;
}

function renderBookings() {
    const list = document.getElementById('bookingList');
    if (!list) return;

    const allBookings = getBookings();
    let html = '';

    allBookings.forEach(booking => {
        let statusClass = 'badge-normal';
        if (booking.status === 'Confirmed') statusClass = 'badge-low';
        if (booking.status === 'Cancelled') statusClass = 'badge-orange';
        
        const bookingId = booking.bookingId || booking.id;
        const listingTitle = booking.itemTitle || booking.listing;
        const dates = (booking.startDate && booking.endDate) ? `${booking.startDate} – ${booking.endDate}` : booking.dates;
        const amount = booking.grandTotal || booking.amount || 0;

        html += `
            <tr>
                <td><strong>${bookingId}</strong></td>
                <td>${listingTitle}</td>
                <td>${dates}</td>
                <td>₹${amount.toLocaleString('en-IN')}</td>
                <td><span class="badge ${statusClass}">${booking.status}</span></td>
                <td>
                    <button class="action-btn" onclick="alert('Viewing booking: ${bookingId}')">View</button>
                    ${booking.status === 'Pending' || booking.status === 'Confirmed' ? `<button class="action-btn" style="color: #f87171;" onclick="alert('Cancelling booking: ${bookingId}')">Cancel Booking</button>` : ''}
                    ${booking.status === 'Cancelled' ? `<button class="action-btn" onclick="alert('Reviewing issue for ${bookingId}')">Review Issue</button>` : ''}
                </td>
            </tr>
        `;
    });

    list.innerHTML = html;
}

function renderFeedbackAndReports() {
    const feedbackEl = document.getElementById('feedbackList');
    const reportEl = document.getElementById('reportList');

    if (feedbackEl) {
        let fbHtml = '';
        const allFeedback = getFeedback();
        
        if (allFeedback.length === 0) {
            fbHtml = '<p style="padding:12px; color:#9ca3af; font-size:14px; text-align:center;">No feedback submitted yet.</p>';
        }
        
        allFeedback.forEach(fb => {
            let starsStr = '';
            for(let i=1; i<=5; i++) starsStr += (i <= fb.rating) ? '★' : '☆';
            
            fbHtml += `
                <div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                        <span style="color:#fbbf24">${starsStr}</span>
                        <span class="badge badge-normal">${fb.status}</span>
                    </div>
                    <p style="font-size:14px; margin-bottom: 4px; color: #cbd5e1;">"${fb.message}"</p>
                    <div style="font-size:12px; color:#6b7280; margin-bottom:8px;">${fb.type} | ${fb.date}</div>
                    <div>
                        <button class="action-btn" onclick="alert('Viewing feedback ${fb.id}')">View</button>
                        <button class="action-btn" style="color: #f87171;" onclick="removeAdminFeedback('${fb.id}')">Remove</button>
                    </div>
                </div>
            `;
        });
        feedbackEl.innerHTML = fbHtml;
    }

    if (reportEl) {
        let rpHtml = '';
        sampleReports.forEach(rp => {
            let statusClass = rp.status === 'Pending' ? 'badge-orange' : 'badge-low';
            rpHtml += `
                <div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                        <strong style="font-size: 14px;">${rp.type}</strong>
                        <span class="badge ${statusClass}">${rp.status}</span>
                    </div>
                    <p style="font-size:13px; margin-bottom: 8px; color: #9ca3af;">Reason: ${rp.reason}</p>
                    <div>
                        <button class="action-btn" onclick="alert('Reviewing report ${rp.id}')">Review</button>
                        <button class="action-btn" onclick="alert('Dismissing report ${rp.id}')">Dismiss</button>
                    </div>
                </div>
            `;
        });
        reportEl.innerHTML = rpHtml;
    }
}

function renderActivity() {
    const list = document.getElementById('activityList');
    if (!list) return;
    
    let html = '';
    sampleActivity.forEach(item => {
        html += `
            <div class="activity-item">
                <span class="activity-dot ${item.dot}"></span>
                <span class="activity-text">${item.text}</span>
                <span class="activity-time">${item.time}</span>
            </div>
        `;
    });

    list.innerHTML = html;
}
function renderPremiumUsers() {
    const list = document.getElementById('premiumList');
    if (!list) return;

    const allUsers = getUsers();
    const premiumUsers = getPremiumUsers(allUsers);
    let html = '';

    if (premiumUsers.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center; padding:20px;">No premium users found.</td></tr>';
    } else {
        premiumUsers.forEach(u => {
            const purchaseDate = new Date(u.premiumPurchaseDate).toLocaleDateString('en-IN');
            const expiryDate = new Date(u.premiumExpiryDate).toLocaleDateString('en-IN');
            html += `
                <tr>
                    <td><strong>${u.username || 'Unknown'}</strong></td>
                    <td>${u.useremail}</td>
                    <td><span class="badge badge-low">Premium Active</span></td>
                    <td>${purchaseDate}</td>
                    <td>${expiryDate}</td>
                </tr>
            `;
        });
    }

    list.innerHTML = html;
}
// ─── ACTIONS & MODALS ────────────────────────────────────────

function viewListing(id) {
    alert(`Viewing listing ${id}`);
}

function editListing(id) {
    // Navigate to edit-listing.html
    window.location.href = `edit-listing.html?id=${id}`;
}

function toggleListing(id, newStatus) {
    const allListings = getListings();
    const listing = allListings.find(l => l.id === id);
    if (listing) {
        listing.status = newStatus;
        saveListings(allListings);
        dispatchStorageUpdate(STORAGE_KEYS.LISTINGS);
        refreshAll();
        showToast(`Listing ${id} is now ${listing.status}.`);
    }
}

function requestRemoveListing(id) {
    listingToRemove = id;
    const modal = document.getElementById('removeListingModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRemoveModal() {
    listingToRemove = null;
    const modal = document.getElementById('removeListingModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function confirmRemoveListing() {
    if (listingToRemove) {
        const allListings = getListings();
        const updated = allListings.filter(l => l.id !== listingToRemove);
        saveListings(updated);
        dispatchStorageUpdate(STORAGE_KEYS.LISTINGS);
        refreshAll();
        showToast(`Listing ${listingToRemove} successfully removed from the platform.`);
    }
    closeRemoveModal();
}

function removeAdminFeedback(id) {
    if (confirm('Remove this feedback from the platform?')) {
        let allFeedback = getFeedback();
        allFeedback = allFeedback.filter(fb => fb.id !== id);
        saveFeedback(allFeedback);
        dispatchStorageUpdate(STORAGE_KEYS.FEEDBACK);
        refreshAll();
        showToast('Feedback removed successfully.');
    }
}

// ─── TOAST NOTIFICATION ──────────────────────────────────────

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger reflow for animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if(container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}


// ─── EVENT LISTENERS ─────────────────────────────────────────

function attachFilterListeners() {
    const searchInput = document.getElementById('listingSearch');
    const categorySelect = document.getElementById('listingCategoryFilter');
    const statusSelect = document.getElementById('listingStatusFilter');
    const sortSelect = document.getElementById('listingSort');

    if (searchInput) searchInput.addEventListener('input', renderListings);
    if (categorySelect) categorySelect.addEventListener('change', renderListings);
    if (statusSelect) statusSelect.addEventListener('change', renderListings);
    if (sortSelect) sortSelect.addEventListener('change', renderListings);
}

function attachModalListeners() {
    const cancelBtn = document.getElementById('cancelRemoveBtn');
    const confirmBtn = document.getElementById('confirmRemoveBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', closeRemoveModal);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmRemoveListing);
}

function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const links  = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');

    if (!toggle || !links) return;

    const closeMenu = () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    if (navbar) {
        const syncScrolledState = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };

        syncScrolledState();
        window.addEventListener('scroll', syncScrolledState, { passive: true });
    }
}

/** Re-render all data-driven sections */
function refreshAll() {
    renderKPIs();
    renderListings();
    renderBookings();
    renderPremiumUsers();
    renderFeedbackAndReports();
}

// ─── INITIALISE ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // SECURITY CHECK: Only allow admins
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserRaw = localStorage.getItem('current_user');
    let isAdmin = false;
    
    if (isLoggedIn === 'true' && currentUserRaw) {
        try {
            const currentUser = JSON.parse(currentUserRaw);
            if (currentUser.useremail === "admin@rentflow.com" || currentUser.role === "admin") {
                isAdmin = true;
            }
        } catch (e) {
            console.error("Error parsing current_user:", e);
        }
    }
    
    if (!isAdmin) {
        window.location.href = "login.html";
        return;
    }

    // Initial renders
    renderKPIs();
    renderListings();
    renderBookings();
    renderFeedbackAndReports();
    renderActivity();
    
    // Listen for storage changes from OTHER tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.LISTINGS ||
            e.key === STORAGE_KEYS.BOOKINGS || e.key === STORAGE_KEYS.FEEDBACK) {
            refreshAll();
        }
    });

    // Listen for custom same-tab updates
    window.addEventListener('rentiq_storage_update', (e) => {
        refreshAll();
    });
    
    // Attach events
    initMobileMenu();
    attachFilterListeners();
    attachModalListeners();
});

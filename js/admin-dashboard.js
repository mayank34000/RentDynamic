/* ============================================================
   RentIQ – Admin Dashboard JavaScript (Platform Moderator)
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

    const kpiUsers = document.getElementById('kpiUsers');
    const kpiSellers = document.getElementById('kpiSellers');
    const kpiListings = document.getElementById('kpiListings');
    const kpiBookings = document.getElementById('kpiBookings');
    const kpiRevenue = document.getElementById('kpiRevenue');

    if (kpiUsers) kpiUsers.textContent = users.length;
    if (kpiSellers) {
        const sellerCount = users.filter(u => (u.role || '').toLowerCase() === 'seller').length;
        kpiSellers.textContent = sellerCount;
    }
    if (kpiListings) kpiListings.textContent = listings.length;
    if (kpiBookings) kpiBookings.textContent = bookings.length;
    if (kpiRevenue) kpiRevenue.textContent = formatCurrency(revenue);
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
        const matchesSearch = listing.name.toLowerCase().includes(searchQuery) || listing.id.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryFilter === 'All' || listing.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || listing.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
        if (sortVal === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortVal === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortVal === 'price-asc') return a.basePrice - b.basePrice;
        if (sortVal === 'price-desc') return b.basePrice - a.basePrice;
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

            html += `
                <tr>
                    <td><strong>${listing.name}</strong><br><small style="color:#9ca3af">${listing.id}</small></td>
                    <td>${listing.category}</td>
                    <td>₹${listing.basePrice.toLocaleString('en-IN')}</td>
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
        
        html += `
            <tr>
                <td><strong>${booking.id}</strong></td>
                <td>${booking.listing}</td>
                <td>${booking.dates}</td>
                <td>₹${booking.amount.toLocaleString('en-IN')}</td>
                <td><span class="badge ${statusClass}">${booking.status}</span></td>
                <td>
                    <button class="action-btn" onclick="alert('Viewing booking: ${booking.id}')">View</button>
                    ${booking.status === 'Pending' || booking.status === 'Confirmed' ? `<button class="action-btn" style="color: #f87171;" onclick="alert('Cancelling booking: ${booking.id}')">Cancel Booking</button>` : ''}
                    ${booking.status === 'Cancelled' ? `<button class="action-btn" onclick="alert('Reviewing issue for ${booking.id}')">Review Issue</button>` : ''}
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
        renderListings();
        renderKPIs();
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
        renderListings();
        renderKPIs();
        showToast(`Listing ${listingToRemove} successfully removed from the platform.`);
    }
    closeRemoveModal();
}

function removeAdminFeedback(id) {
    if (confirm('Remove this feedback from the platform?')) {
        let allFeedback = getFeedback();
        allFeedback = allFeedback.filter(fb => fb.id !== id);
        saveFeedback(allFeedback);
        renderFeedbackAndReports();
        renderKPIs();
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

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.textContent = '☰';
        });
    });
}

/** Re-render all data-driven sections */
function refreshAll() {
    renderKPIs();
    renderListings();
    renderBookings();
    renderFeedbackAndReports();
}

// ─── INITIALISE ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
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
    
    // Attach events
    initMobileMenu();
    attachFilterListeners();
    attachModalListeners();
});

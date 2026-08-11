/* ============================================================
   RentIQ – Admin Dashboard JavaScript (Platform Moderator)
   ============================================================ */

// ─── SAMPLE DATA (PHASE 1) ──────────────────────────────────

let sampleListings = [
    { id: 'LST-001', name: 'Sony A7IV', category: 'Camera Gear', basePrice: 1000, status: 'Active', date: '2023-08-01' },
    { id: 'LST-002', name: 'BMW 3 Series', category: 'Vehicle', basePrice: 5000, status: 'Active', date: '2023-08-05' },
    { id: 'LST-003', name: 'Conference Hall', category: 'Venue', basePrice: 8000, status: 'Pending', date: '2023-08-10' },
    { id: 'LST-004', name: 'Camping Tent', category: 'Outdoor', basePrice: 500, status: 'Active', date: '2023-08-12' },
    { id: 'LST-005', name: 'DJI Mavic 3', category: 'Camera Gear', basePrice: 1500, status: 'Inactive', date: '2023-07-20' }
];

const sampleBookings = [
    { id: 'BK-1021', listing: 'Sony A7IV', dates: '15 Aug – 18 Aug', amount: 3240, status: 'Confirmed' },
    { id: 'BK-1022', listing: 'BMW 3 Series', dates: '20 Aug – 22 Aug', amount: 11500, status: 'Pending' },
    { id: 'BK-1023', listing: 'Conference Hall', dates: '01 Sep – 02 Sep', amount: 16000, status: 'Cancelled' },
    { id: 'BK-1024', listing: 'Camping Tent', dates: '10 Aug – 12 Aug', amount: 1500, status: 'Confirmed' }
];

const FEEDBACK_STORAGE_KEY = 'rentiq_feedback';

function getStoredFeedback() {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    const initial = [
        { id: 'FB-01', name: 'User 1', email: 'user1@test.com', type: 'Booking Experience', message: 'Great booking experience.', rating: 5, status: 'Visible', date: '2026-08-10' },
        { id: 'FB-02', name: 'User 2', email: 'user2@test.com', type: 'Listing Experience', message: 'Listing was misleading, host did not respond.', rating: 1, status: 'Visible', date: '2026-08-11' }
    ];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(initial));
    return initial;
}

function saveStoredFeedback(list) {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
}

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

// ─── RENDER FUNCTIONS ────────────────────────────────────────

function renderListings() {
    const list = document.getElementById('listingList');
    const searchQuery = document.getElementById('listingSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('listingCategoryFilter').value;
    const statusFilter = document.getElementById('listingStatusFilter').value;
    const sortVal = document.getElementById('listingSort').value;

    if (!list) return;

    // Filter
    let filtered = sampleListings.filter(listing => {
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

    let html = '';

    sampleBookings.forEach(booking => {
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
        const allFeedback = getStoredFeedback();
        
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
    const listing = sampleListings.find(l => l.id === id);
    if (listing) {
        listing.status = newStatus;
        renderListings();
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
        // Remove from array
        sampleListings = sampleListings.filter(l => l.id !== listingToRemove);
        renderListings();
        showToast(`Listing ${listingToRemove} successfully removed from the platform.`);
    }
    closeRemoveModal();
}

function removeAdminFeedback(id) {
    if (confirm('Remove this feedback from the platform?')) {
        let allFeedback = getStoredFeedback();
        allFeedback = allFeedback.filter(fb => fb.id !== id);
        saveStoredFeedback(allFeedback);
        renderFeedbackAndReports();
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


// ─── INITIALISE ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Initial renders
    renderListings();
    renderBookings();
    renderFeedbackAndReports();
    renderActivity();
    
    // Listen for storage changes across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === FEEDBACK_STORAGE_KEY) {
            renderFeedbackAndReports();
        }
    });
    
    // Attach events
    initMobileMenu();
    attachFilterListeners();
    attachModalListeners();
});

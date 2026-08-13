/* ============================================================
   RentIQ – Analytics JavaScript
   Uses shared storage.js for all data access.
   ============================================================ */

// ─── KPI OVERVIEW ───────────────────────────────────────────

function renderKPIs() {
    const users = getUsers();
    const listings = getListings();
    const bookings = getBookings();
    const revenue = calculateTotalRevenue(bookings);

    document.getElementById("statUsers").textContent = users.length;
    document.getElementById("statListings").textContent = listings.length;
    document.getElementById("statBookings").textContent = bookings.length;
    document.getElementById("statRevenue").textContent = formatCurrency(revenue);
}

// ─── BOOKING ANALYTICS ──────────────────────────────────────

function renderBookingAnalytics() {
    const container = document.getElementById("bookingAnalyticsBody");
    const bookings = getBookings();

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No booking data available yet.</div>
            </div>
        `;
        return;
    }

    // Group by status
    const statusCounts = {
        'Pending': 0,
        'Confirmed': 0,
        'Completed': 0,
        'Cancelled': 0
    };

    let total = 0;
    bookings.forEach(b => {
        // Normalize status
        let s = b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase() : 'Pending';
        if (statusCounts[s] !== undefined) {
            statusCounts[s]++;
        } else {
            statusCounts[s] = 1; // dynamically track unknown statuses just in case
        }
        total++;
    });

    let html = `<div class="bar-chart">`;
    for (const [status, count] of Object.entries(statusCounts)) {
        if (count > 0 || Object.keys(statusCounts).indexOf(status) < 4) {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            // Subtle lime accent for Confirmed/Completed
            const fillClass = (status === 'Confirmed' || status === 'Completed') ? 'bar-fill lime-accent' : 'bar-fill';
            
            html += `
                <div class="bar-row">
                    <div class="bar-label">${status}</div>
                    <div class="bar-track">
                        <div class="${fillClass}" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="bar-value">${count}</div>
                </div>
            `;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

// ─── REVENUE ANALYTICS ──────────────────────────────────────

function renderRevenueAnalytics() {
    const container = document.getElementById("revenueAnalyticsBody");
    const bookings = getBookings();

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-text">No revenue data available yet.</div>
            </div>
        `;
        return;
    }

    let totalRevenue = 0;
    let validBookingsCount = 0;

    bookings.forEach(b => {
        const status = (b.status || "").toLowerCase();
        if (status === "confirmed" || status === "completed") {
            const amount = parseFloat(b.amount || b.totalPrice || b.price || 0);
            totalRevenue += amount;
            validBookingsCount++;
        }
    });

    const avgBooking = validBookingsCount > 0 ? (totalRevenue / validBookingsCount) : 0;

    container.innerHTML = `
        <div class="revenue-highlight">₹${totalRevenue.toLocaleString('en-IN')}</div>
        <div class="trend-badge trend-positive">+ Active Revenue</div>
        
        <div class="revenue-stats">
            <div class="stat-item">
                <span class="stat-label">Valid Bookings</span>
                <span class="stat-val">${validBookingsCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Average Booking Value</span>
                <span class="stat-val">₹${Math.round(avgBooking).toLocaleString('en-IN')}</span>
            </div>
        </div>
    `;
}

// ─── LISTING PERFORMANCE ────────────────────────────────────

function renderListingPerformance() {
    const tbody = document.getElementById("listingPerformanceBody");
    const bookings = getBookings();
    const listings = getListings();

    if (bookings.length === 0 || listings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-text">No listing performance data available yet.</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Map bookings to listings
    const performance = {};

    listings.forEach(l => {
        // Depending on naming conventions, listing ID could be id, _id, or listingId
        const id = l.id || l.listingId || l.name;
        performance[id] = {
            name: l.name || l.title || "Unknown Listing",
            category: l.category || "Uncategorized",
            bookings: 0,
            revenue: 0
        };
    });

    bookings.forEach(b => {
        const listingId = b.listingId || b.listing || "";
        const status = (b.status || "").toLowerCase();
        const amount = parseFloat(b.amount || b.totalPrice || b.price || 0);

        // Find matching listing by ID or Name (handling different structures)
        let targetKey = null;
        if (performance[listingId]) {
            targetKey = listingId;
        } else {
            // Fallback match by name
            const match = Object.keys(performance).find(key => performance[key].name === listingId);
            if (match) targetKey = match;
        }

        if (targetKey) {
            performance[targetKey].bookings++;
            if (status === "confirmed" || status === "completed") {
                performance[targetKey].revenue += amount;
            }
        }
    });

    // Convert to array and sort by revenue (descending), then bookings
    const sorted = Object.values(performance)
        .filter(p => p.bookings > 0) // Only show listings with activity
        .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
        .slice(0, 5); // Top 5

    if (sorted.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="empty-state-icon">📉</div>
                        <div class="empty-state-text">No active bookings for current listings.</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = "";
    sorted.forEach(item => {
        html += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>${item.bookings}</td>
                <td>₹${item.revenue.toLocaleString('en-IN')}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ─── CATEGORY DISTRIBUTION ──────────────────────────────────

function renderCategoryDistribution() {
    const container = document.getElementById("categoryAnalyticsBody");
    const listings = getListings();

    if (listings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏷️</div>
                <div class="empty-state-text">No categories available yet.</div>
            </div>
        `;
        return;
    }

    const categories = {};
    let total = 0;

    listings.forEach(l => {
        const cat = l.category || "Uncategorized";
        categories[cat] = (categories[cat] || 0) + 1;
        total++;
    });

    // Sort by count descending
    const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    let html = `<div class="bar-chart">`;
    sortedCats.forEach(([cat, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        html += `
            <div class="bar-row">
                <div class="bar-label" style="text-align: left; width: 120px;">${cat}</div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%;"></div>
                </div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    });
    html += `</div>`;

    container.innerHTML = html;
}

// ─── USER OVERVIEW ──────────────────────────────────────────

function renderUserOverview() {
    const container = document.getElementById("userAnalyticsBody");
    const users = getUsers();

    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">No user data available yet.</div>
            </div>
        `;
        return;
    }

    const roles = {
        'Customer': 0,
        'Seller': 0,
        'Admin': 0
    };

    let total = 0;
    users.forEach(u => {
        // Fallback for role mapping if undefined
        let role = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : 'Customer';
        if (roles[role] !== undefined) {
            roles[role]++;
        } else {
            roles[role] = 1;
        }
        total++;
    });

    let html = `<div class="bar-chart">`;
    for (const [role, count] of Object.entries(roles)) {
        if (count > 0 || Object.keys(roles).indexOf(role) < 3) {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            html += `
                <div class="bar-row">
                    <div class="bar-label" style="text-align: left;">${role}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="bar-value">${count}</div>
                </div>
            `;
        }
    }
    html += `</div>`;

    container.innerHTML = html;
}

// ─── FEEDBACK ANALYTICS ─────────────────────────────────────

function renderFeedbackAnalytics() {
    const container = document.getElementById("feedbackAnalyticsBody");
    const feedback = getFeedback();

    if (feedback.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <div class="empty-state-text">No feedback submitted yet.</div>
            </div>
        `;
        return;
    }

    let totalRating = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    feedback.forEach(fb => {
        const r = parseInt(fb.rating) || 0;
        if (r >= 1 && r <= 5) {
            ratingCounts[r]++;
            totalRating += r;
        }
    });

    const totalCount = feedback.length;
    const avgRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : "0.0";
    
    // Generate stars visual
    const fullStars = Math.round(avgRating);
    let starsHtml = "";
    for(let i=1; i<=5; i++) {
        starsHtml += (i <= fullStars) ? "★" : "☆";
    }

    let html = `
        <div class="rating-overview">
            <div class="average-rating">
                <div class="average-score">${avgRating}</div>
                <div class="average-stars">${starsHtml}</div>
                <div class="rating-total">Based on ${totalCount} reviews</div>
            </div>
            
            <div class="bar-chart" style="flex: 1; margin-top: 0;">
    `;

    // Render bars 5 down to 1
    for (let i = 5; i >= 1; i--) {
        const count = ratingCounts[i];
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        const fillClass = (i >= 4) ? 'bar-fill lime-accent' : 'bar-fill';

        html += `
            <div class="bar-row">
                <div class="bar-label" style="width: 60px;">${i} Stars</div>
                <div class="bar-track">
                    <div class="${fillClass}" style="width: ${percentage}%;"></div>
                </div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// ─── MOBILE MENU ────────────────────────────────────────────

function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const links  = document.getElementById('navLinks');

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
}

/** Re-render all data-driven sections */
function refreshAll() {
    renderKPIs();
    renderBookingAnalytics();
    renderRevenueAnalytics();
    renderListingPerformance();
    renderCategoryDistribution();
    renderUserOverview();
    renderFeedbackAnalytics();
}

// ─── INITIALISE ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render all charts/tables
    refreshAll();

    // 2. Setup mobile menu
    initMobileMenu();

    // 3. Listen for storage changes from OTHER tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.LISTINGS ||
            e.key === STORAGE_KEYS.BOOKINGS || e.key === STORAGE_KEYS.FEEDBACK) {
            refreshAll();
        }
    });
});

/* ============================================================
   RentFlow – Analytics JavaScript
   Uses shared storage.js for all data access.
   All shared business logic (calculatePlatformFeeRevenue,
   getPremiumUsers, formatCurrency) lives in storage.js.
   ============================================================ */

// ─── KPI OVERVIEW ───────────────────────────────────────────

function renderKPIs() {
    const users = getUsers();
    const listings = getListings();
    const bookings = getBookings();
    const revenue = calculateTotalRevenue(bookings);
    // Use shared helper — same formula as Admin Dashboard
    const platformFee = calculatePlatformFeeRevenue(listings);
    const premiumUsers = getPremiumUsers(users);
    const activeListings = listings.filter(l => (l.status || '').toLowerCase() === 'active');

    const el = id => document.getElementById(id);

    if (el('statUsers'))         el('statUsers').textContent = users.length;
    if (el('statListings'))      el('statListings').textContent = listings.length;
    if (el('statActiveListings')) el('statActiveListings').textContent = activeListings.length;
    if (el('statBookings'))      el('statBookings').textContent = bookings.length;
    if (el('statRevenue'))       el('statRevenue').textContent = formatCurrency(revenue);
    if (el('statPlatformFee'))   el('statPlatformFee').textContent = formatCurrency(platformFee);
    if (el('statPremium'))       el('statPremium').textContent = premiumUsers.length;
}

// ─── BOOKING ANALYTICS ──────────────────────────────────────

function renderBookingAnalytics() {
    const container = document.getElementById('bookingAnalyticsBody');
    if (!container) return;
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

    const statusCounts = { 'Pending': 0, 'Confirmed': 0, 'Completed': 0, 'Cancelled': 0 };
    let total = 0;
    bookings.forEach(b => {
        let s = b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase() : 'Pending';
        if (statusCounts[s] !== undefined) { statusCounts[s]++; } else { statusCounts[s] = 1; }
        total++;
    });

    let html = `<div class="bar-chart">`;
    for (const [status, count] of Object.entries(statusCounts)) {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const fillClass = (status === 'Confirmed' || status === 'Completed') ? 'bar-fill lime-accent' : 'bar-fill';
        html += `
            <div class="bar-row">
                <div class="bar-label">${status}</div>
                <div class="bar-track"><div class="${fillClass}" style="width: ${percentage}%;"></div></div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
}

// ─── REVENUE ANALYTICS ──────────────────────────────────────

function renderRevenueAnalytics() {
    const container = document.getElementById('revenueAnalyticsBody');
    if (!container) return;
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
        const status = (b.status || '').toLowerCase();
        if (status === 'confirmed' || status === 'completed') {
            // Support both old schema (amount) and new schema (grandTotal)
            const amount = parseFloat(b.grandTotal || b.amount || b.totalPrice || b.price || 0);
            totalRevenue += amount;
            validBookingsCount++;
        }
    });

    const avgBooking = validBookingsCount > 0 ? Math.round(totalRevenue / validBookingsCount) : 0;

    // Platform fee uses shared helper — same as Admin Dashboard
    const listings = getListings();
    const platformFee = calculatePlatformFeeRevenue(listings);

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
                <span class="stat-val">₹${avgBooking.toLocaleString('en-IN')}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Platform Fee Revenue (2%)</span>
                <span class="stat-val" style="color:#fbbf24;">${formatCurrency(platformFee)}</span>
            </div>
        </div>
    `;
}

// ─── LISTING PERFORMANCE ────────────────────────────────────

function renderListingPerformance() {
    const tbody = document.getElementById('listingPerformanceBody');
    if (!tbody) return;
    const bookings = getBookings();
    const listings = getListings();

    if (listings.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="4">
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No listing data available yet.</div>
                </div>
            </td></tr>
        `;
        return;
    }

    // Map all listings (not just active) for performance tracking
    const performance = {};
    listings.forEach(l => {
        const id = l.id;
        // Use real schema: title preferred over name, price preferred over basePrice
        performance[id] = {
            name: l.title || l.name || 'Unknown Listing',
            category: l.category || 'Uncategorized',
            status: l.status || 'Unknown',
            price: parseFloat(l.price || l.basePrice || 0),
            bookings: 0,
            revenue: 0
        };
    });

    bookings.forEach(b => {
        const listingId = b.listingId || '';
        const status = (b.status || '').toLowerCase();
        const amount = parseFloat(b.grandTotal || b.amount || b.totalPrice || b.price || 0);

        if (performance[listingId]) {
            performance[listingId].bookings++;
            if (status === 'confirmed' || status === 'completed') {
                performance[listingId].revenue += amount;
            }
        }
    });

    // Sort by revenue desc, then bookings desc — include all listings with activity
    const sorted = Object.values(performance)
        .filter(p => p.bookings > 0)
        .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
        .slice(0, 5);

    if (sorted.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="4">
                <div class="empty-state">
                    <div class="empty-state-icon">📉</div>
                    <div class="empty-state-text">No booking activity for current listings.</div>
                </div>
            </td></tr>
        `;
        return;
    }

    let html = '';
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
    const container = document.getElementById('categoryAnalyticsBody');
    if (!container) return;
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
    listings.forEach(l => {
        const cat = l.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    const total = listings.length;
    const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    let html = `<div class="bar-chart">`;
    sortedCats.forEach(([cat, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        html += `
            <div class="bar-row">
                <div class="bar-label" style="text-align: left; width: 120px;">${cat}</div>
                <div class="bar-track"><div class="bar-fill" style="width: ${percentage}%;"></div></div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// ─── USER OVERVIEW ──────────────────────────────────────────

function renderUserOverview() {
    const container = document.getElementById('userAnalyticsBody');
    if (!container) return;
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

    const roles = { 'Customer': 0, 'Seller': 0, 'Admin': 0 };
    const total = users.length;
    users.forEach(u => {
        const role = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : 'Customer';
        if (roles[role] !== undefined) { roles[role]++; } else { roles[role] = 1; }
    });

    // Also show Premium breakdown
    const premiumCount = getPremiumUsers(users).length;

    let html = `<div class="bar-chart">`;
    for (const [role, count] of Object.entries(roles)) {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        html += `
            <div class="bar-row">
                <div class="bar-label" style="text-align: left;">${role}</div>
                <div class="bar-track"><div class="bar-fill" style="width: ${percentage}%;"></div></div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    }
    // Premium row
    const premiumPct = total > 0 ? Math.round((premiumCount / total) * 100) : 0;
    html += `
        <div class="bar-row">
            <div class="bar-label" style="text-align: left;">⭐ Premium</div>
            <div class="bar-track"><div class="bar-fill lime-accent" style="width: ${premiumPct}%;"></div></div>
            <div class="bar-value">${premiumCount}</div>
        </div>
    `;
    html += `</div>`;
    container.innerHTML = html;
}

// ─── FEEDBACK ANALYTICS ─────────────────────────────────────

function renderFeedbackAnalytics() {
    const container = document.getElementById('feedbackAnalyticsBody');
    if (!container) return;
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
    const categoryCounts = {};

    feedback.forEach(fb => {
        const r = parseInt(fb.rating) || 0;
        if (r >= 1 && r <= 5) { ratingCounts[r]++; totalRating += r; }
        const cat = fb.type || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const totalCount = feedback.length;
    const avgRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : '0.0';
    const fullStars = Math.round(parseFloat(avgRating));
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) { starsHtml += (i <= fullStars) ? '★' : '☆'; }

    let html = `
        <div class="rating-overview">
            <div class="average-rating">
                <div class="average-score">${avgRating}</div>
                <div class="average-stars">${starsHtml}</div>
                <div class="rating-total">Based on ${totalCount} reviews</div>
            </div>
            <div class="bar-chart" style="flex: 1; margin-top: 0;">
    `;

    for (let i = 5; i >= 1; i--) {
        const count = ratingCounts[i];
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        const fillClass = i >= 4 ? 'bar-fill lime-accent' : 'bar-fill';
        html += `
            <div class="bar-row">
                <div class="bar-label" style="width: 60px;">${i} Stars</div>
                <div class="bar-track"><div class="${fillClass}" style="width: ${percentage}%;"></div></div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    }

    html += `</div></div>`;

    // Category breakdown
    if (Object.keys(categoryCounts).length > 0) {
        html += `<div style="margin-top:24px;"><strong style="font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">By Category</strong><div class="bar-chart" style="margin-top:12px;">`;
        const catTotal = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            const pct = catTotal > 0 ? Math.round((count / catTotal) * 100) : 0;
            html += `
                <div class="bar-row">
                    <div class="bar-label" style="text-align:left;width:140px;font-size:12px;">${cat}</div>
                    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
                    <div class="bar-value">${count}</div>
                </div>
            `;
        });
        html += `</div></div>`;
    }

    container.innerHTML = html;
}

// ─── MOBILE MENU ────────────────────────────────────────────

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
        link.addEventListener('click', closeMenu);
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
    renderBookingAnalytics();
    renderRevenueAnalytics();
    renderListingPerformance();
    renderCategoryDistribution();
    renderUserOverview();
    renderFeedbackAnalytics();
}

// ─── INITIALISE ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    refreshAll();
    initMobileMenu();

    // Listen for storage changes from OTHER tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.LISTINGS ||
            e.key === STORAGE_KEYS.BOOKINGS || e.key === STORAGE_KEYS.FEEDBACK) {
            refreshAll();
        }
    });

    // Listen for custom same-tab updates dispatched by dispatchStorageUpdate()
    window.addEventListener('rentiq_storage_update', () => {
        refreshAll();
    });
});

/**
 * ============================================================================
 * RENTFLOW - BOOKING HISTORY MODULE
 * ============================================================================
 * This script handles the My Rentals page.
 * It demonstrates advanced Array operations (map, filter, reduce),
 * DOM Manipulation, and Local Storage integration.
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
    // 1. STATE MANAGEMENT
    // ========================================
    let allBookings = [];
    let currentFilter = "All"; // All, Pending, Active, Completed, Cancelled
    
    // DOM Elements
    const ordersList = document.getElementById("orders-list");
    const filterTabs = document.getElementById("filter-tabs");
    
    // Stats Elements
    const statTotal = document.getElementById("stat-total");
    const statActive = document.getElementById("stat-active");
    const statCompleted = document.getElementById("stat-completed");
    const statSpent = document.getElementById("stat-spent");

    // Modal Elements
    const receiptModal = document.getElementById("receipt-modal");

    // ========================================
    // 2. INITIALIZATION
    // ========================================
    init();

    function init() {
        fetchBookings();
        calculateStats();
        renderOrders();
        setupEventListeners();
    }

    // ========================================
    // 3. DATA FETCHING (Local Storage)
    // ========================================
    /**
     * Fetches bookings from localStorage.
     * If empty, injects seed data as requested by user.
     */
    function fetchBookings() {
        const stored = localStorage.getItem('rentflow_bookings');
        if (stored) {
            try {
                allBookings = JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing bookings", e);
                allBookings = getSeedBookings();
            }
        } else {
            allBookings = getSeedBookings();
            localStorage.setItem('rentflow_bookings', JSON.stringify(allBookings));
        }
    }

    // ========================================
    // 4. ARRAY REDUCE: CALCULATE STATS
    // ========================================
    /**
     * Uses Array.prototype.reduce() to calculate aggregate statistics
     * from the user's booking history.
     */
    function calculateStats() {
        // Total Rentals
        statTotal.textContent = allBookings.length;

        // Using reduce to count Active bookings
        const activeCount = allBookings.reduce((count, booking) => {
            return booking.status === 'Active' ? count + 1 : count;
        }, 0);
        statActive.textContent = activeCount;

        // Using reduce to count Completed bookings
        const completedCount = allBookings.reduce((count, booking) => {
            return booking.status === 'Completed' ? count + 1 : count;
        }, 0);
        statCompleted.textContent = completedCount;

        // Using reduce to sum total spent (only for Completed/Active/Pending, ignoring Cancelled if any)
        const totalSpent = allBookings.reduce((sum, booking) => {
            if (booking.status !== 'Cancelled') {
                return sum + (booking.grandTotal || 0);
            }
            return sum;
        }, 0);
        statSpent.textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
    }

    // ========================================
    // 5. ARRAY FILTER & MAP: RENDER ORDERS
    // ========================================
    /**
     * Filters the bookings based on current tab, then maps them to HTML.
     */
    function renderOrders() {
        let filtered = allBookings;

        if (currentFilter !== "All") {
            filtered = allBookings.filter(b => b.status === currentFilter);
        }

        if (filtered.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <h3 class="empty-title">No ${currentFilter === 'All' ? 'rentals' : currentFilter.toLowerCase() + ' rentals'} found</h3>
                    <p class="empty-sub">Looks like you haven't booked anything yet.</p>
                    <a href="booking.html" class="btn-primary">Explore Rentals</a>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = filtered.map(item => {
            const statusClass = `status-${item.status.toLowerCase()}`;
            const dateStr = item.startDate ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` : 'Dates TBD';
            
            return `
                <div class="order-card">
                    <div class="order-info-wrapper">
                        <img src="${item.itemImage}" alt="${item.itemTitle}" class="order-img" />
                        <div class="order-details">
                            <h4 class="order-title">${item.itemTitle}</h4>
                            <div class="order-meta">
                                Lender: <span>${item.lenderName}</span>
                            </div>
                            <div class="order-meta">
                                Dates: <span>${dateStr} (${item.duration} days)</span>
                            </div>
                            <div class="order-status-badge ${statusClass}">${item.status}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <div class="order-price">₹${item.grandTotal.toLocaleString('en-IN')}</div>
                        <button class="btn-receipt" onclick="window.openReceiptModal('${item.id}')">View Receipt</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // 6. EVENT DELEGATION
    // ========================================
    function setupEventListeners() {
        // Tab Filtering
        filterTabs.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-tab")) {
                document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
                e.target.classList.add("active");
                
                currentFilter = e.target.getAttribute("data-filter");
                renderOrders();
            }
        });

        // Close Receipt Modal
        document.getElementById("close-receipt-modal").addEventListener("click", () => {
            receiptModal.classList.remove("show");
        });

        receiptModal.addEventListener("click", (e) => {
            if (e.target === receiptModal) {
                receiptModal.classList.remove("show");
            }
        });

        // Download Receipt (PDF)
        document.getElementById("btn-download-receipt").addEventListener("click", () => {
            const element = document.getElementById("receipt-content");
            const itemName = document.getElementById("receipt-item").textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const opt = {
                margin:       10,
                filename:     `rentflow_receipt_${itemName}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, backgroundColor: '#1a1d24' }, // matches dark theme if needed, or white if preferred. Wait, the modal card in RentFlow has dark bg (#1f2937). We'll let it capture naturally.
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const btn = document.getElementById("btn-download-receipt");
            const originalText = btn.textContent;
            btn.textContent = "Generating PDF...";
            btn.disabled = true;

            html2pdf().set(opt).from(element).save().then(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }).catch(err => {
                console.error("PDF generation error:", err);
                btn.textContent = originalText;
                btn.disabled = false;
                alert("Failed to generate PDF.");
            });
        });
    }

    // ========================================
    // 7. RECEIPT MODAL LOGIC
    // ========================================
    window.openReceiptModal = function(bookingId) {
        const booking = allBookings.find(b => b.id === bookingId);
        if (!booking) return;

        document.getElementById("receipt-item").textContent = booking.itemTitle;
        document.getElementById("receipt-lender").textContent = `Lender: ${booking.lenderName}`;
        document.getElementById("receipt-dates").textContent = `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
        
        document.getElementById("receipt-rate").textContent = `₹${booking.rate.toLocaleString('en-IN')}`;
        document.getElementById("receipt-duration").textContent = booking.duration;
        document.getElementById("receipt-subtotal").textContent = `₹${booking.subtotal.toLocaleString('en-IN')}`;
        document.getElementById("receipt-deposit").textContent = `₹${booking.deposit.toLocaleString('en-IN')}`;
        document.getElementById("receipt-total").textContent = `₹${booking.grandTotal.toLocaleString('en-IN')}`;

        receiptModal.classList.add("show");
    };

    // ========================================
    // 8. UTILITIES
    // ========================================
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }

    function getSeedBookings() {
        // 4 Demo Bookings as requested
        const now = new Date();
        
        const d1Start = new Date(now); d1Start.setDate(now.getDate() - 20);
        const d1End = new Date(now); d1End.setDate(now.getDate() - 15);

        const d2Start = new Date(now); d2Start.setDate(now.getDate() - 2);
        const d2End = new Date(now); d2End.setDate(now.getDate() + 3);

        const d3Start = new Date(now); d3Start.setDate(now.getDate() - 40);
        const d3End = new Date(now); d3End.setDate(now.getDate() - 30);

        const d4Start = new Date(now); d4Start.setDate(now.getDate() + 5);
        const d4End = new Date(now); d4End.setDate(now.getDate() + 8);

        return [
            {
                id: 'BKG-001',
                listingId: 'LIST-MOCK-2',
                itemTitle: 'Sony A7S III Mirrorless Camera',
                itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
                lenderName: 'Priya Sharma',
                startDate: d1Start.toISOString().split('T')[0],
                endDate: d1End.toISOString().split('T')[0],
                duration: 5,
                rate: 350,
                subtotal: 1750,
                deposit: 1500,
                platformFee: 0,
                grandTotal: 3250,
                status: 'Completed'
            },
            {
                id: 'BKG-002',
                listingId: 'LIST-MOCK-1',
                itemTitle: 'Apple MacBook Pro M3 (16-inch)',
                itemImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
                lenderName: 'Aryan Tyagi',
                startDate: d2Start.toISOString().split('T')[0],
                endDate: d2End.toISOString().split('T')[0],
                duration: 5,
                rate: 500,
                subtotal: 2500,
                deposit: 2000,
                platformFee: 0,
                grandTotal: 4500,
                status: 'Active'
            },
            {
                id: 'BKG-003',
                listingId: 'LIST-MOCK-4',
                itemTitle: 'Bosch Power Drill Set',
                itemImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
                lenderName: 'Ravi Kumar',
                startDate: d3Start.toISOString().split('T')[0],
                endDate: d3End.toISOString().split('T')[0],
                duration: 10,
                rate: 150,
                subtotal: 1500,
                deposit: 500,
                platformFee: 0,
                grandTotal: 2000,
                status: 'Completed'
            },
            {
                id: 'BKG-004',
                listingId: 'LIST-MOCK-3',
                itemTitle: 'DJI Mavic 3 Pro Drone',
                itemImage: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=300&q=80',
                lenderName: 'Kabir Singh',
                startDate: d4Start.toISOString().split('T')[0],
                endDate: d4End.toISOString().split('T')[0],
                duration: 3,
                rate: 600,
                subtotal: 1800,
                deposit: 3000,
                platformFee: 0,
                grandTotal: 4800,
                status: 'Pending'
            }
        ];
    }
});

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
            const nameToDisplay = user.name || user.username || user.userfname || 'User';
            const firstName = nameToDisplay.split(' ')[0];
            const savedImage = localStorage.getItem('profileImage') || 'assets/profile.png';
            
            authContainer.style.display = 'flex';
            authContainer.style.alignItems = 'center';
            authContainer.style.gap = '15px';
            authContainer.style.position = 'relative';
            const premiumText = user.isPremium ? "Extend Premium" : "Get Premium";
            
            authContainer.innerHTML = `
                <div class="profile-dropdown-trigger" id="profile-dropdown-trigger" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                    <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                        <img src="${savedImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span id="profile-name" style="font-weight: 600; color: #fff;">${firstName}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                
                <div class="profile-dropdown-menu" id="profile-dropdown-menu" style="display: none; position: absolute; top: 40px; right: 0; background: #12172b; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; width: 180px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1000; padding: 6px 0; flex-direction: column;">
                    <a href="profile.html" style="padding: 10px 16px; color: #b0b8c6; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s, color 0.2s; display: block;">My Profile</a>
                    <a href="#" id="nav-my-wallet" style="padding: 10px 16px; color: #b0b8c6; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s, color 0.2s; display: block;">My Wallet</a>
                    <a href="premium.html" style="padding: 10px 16px; color: #eab308; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.2s, color 0.2s; display: block; white-space: nowrap;">👑 ${premiumText}</a>
                    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0;"></div>
                    <a href="#" id="dropdown-logout" style="padding: 10px 16px; color: #ef4444; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.2s; display: block;">Logout</a>
                </div>
            `;
            
            const trigger = document.getElementById("profile-dropdown-trigger");
            const menu = document.getElementById("profile-dropdown-menu");
            
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                menu.style.display = menu.style.display === "flex" ? "none" : "flex";
            });
            
            document.addEventListener("click", () => {
                menu.style.display = "none";
            });
            
            document.getElementById("nav-my-wallet").addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                menu.style.display = "none";
                openWalletModal();
            });
            
            document.getElementById("dropdown-logout").addEventListener("click", (e) => {
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
    const statReturned = document.getElementById("stat-returned");
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

    function getMyBookings() {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        const userEmail = currentUser ? currentUser.useremail : '';
        
        return allBookings.filter(booking => {
            // For legacy seed bookings that don't have renterEmail, show them only to default seed user (rahul@example.com)
            if (!booking.renterEmail) {
                return userEmail === 'rahul@example.com';
            }
            return booking.renterEmail === userEmail;
        });
    }

    // ========================================
    // 4. ARRAY REDUCE: CALCULATE STATS
    // ========================================
    /**
     * Uses Array.prototype.reduce() to calculate aggregate statistics
     * from the user's booking history.
     */
    function calculateStats() {
        const myBookings = getMyBookings();

        // Total Rentals
        statTotal.textContent = myBookings.length;

        // Using reduce to count Active bookings
        const activeCount = myBookings.reduce((count, booking) => {
            return booking.status === 'Active' ? count + 1 : count;
        }, 0);
        statActive.textContent = activeCount;

        // Using reduce to count Completed bookings
        const completedCount = myBookings.reduce((count, booking) => {
            return booking.status === 'Completed' ? count + 1 : count;
        }, 0);
        statCompleted.textContent = completedCount;

        // Using reduce to count Returned bookings
        const returnedCount = myBookings.reduce((count, booking) => {
            return booking.status === 'Returned' ? count + 1 : count;
        }, 0);
        if (statReturned) statReturned.textContent = returnedCount;

        // Using reduce to sum total spent (only for Completed/Active/Pending/Returned, ignoring Cancelled if any)
        const totalSpent = myBookings.reduce((sum, booking) => {
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
        const myBookings = getMyBookings();
        let filtered = myBookings;

        if (currentFilter !== "All") {
            filtered = myBookings.filter(b => b.status === currentFilter);
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
                            ${item.status === 'Active' ? `<div class="order-meta" style="color: #ef4444; font-weight: 600;" id="countdown-${item.id}">Time Left: Calculating...</div>` : ''}
                            <div class="order-status-badge ${statusClass}">${item.status}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions" style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                        <div class="order-price">₹${item.grandTotal.toLocaleString('en-IN')}</div>
                        ${item.status === 'Approved' ? `<button class="btn-primary" style="padding: 6px 12px; font-size: 13px;" onclick="window.initiatePayment('${item.id}')">Pay Now</button>` : ''}
                        <button class="btn-receipt" onclick="window.openReceiptModal('${item.id}')">View Receipt</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // COUNTDOWN LOGIC FOR ACTIVE RENTALS
    // ========================================
    setInterval(() => {
        const myBookings = getMyBookings();
        myBookings.forEach(item => {
            if (item.status === 'Active' && item.endDate) {
                const el = document.getElementById(`countdown-${item.id}`);
                if (el) {
                    const hasTime = item.endDate.includes('T') || item.endDate.includes(':');
                    const end = new Date(item.endDate);
                    if (!hasTime) {
                        end.setHours(23, 59, 59, 999);
                    }
                    const now = new Date();
                    const diff = end - now;

                    if (diff <= 0) {
                        el.textContent = "Rental Ended";
                        el.style.color = "#ef4444";
                        
                        // Automatically complete it
                        item.status = 'Completed';
                        localStorage.setItem('rentflow_bookings', JSON.stringify(allBookings));
                        calculateStats();
                        renderOrders();
                    } else {
                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const s = Math.floor((diff % (1000 * 60)) / 1000);
                        el.textContent = `Time Left: ${d}d ${h}h ${m}m ${s}s`;
                    }
                }
            }
        });
    }, 1000);

    // ========================================
    // RAZORPAY PAYMENT LOGIC
    // ========================================
    window.initiatePayment = function(bookingId) {
        const booking = allBookings.find(b => b.id === bookingId);
        if (!booking) return;

        const options = {
            "key": "rzp_test_TPWlCTZ9mczHSa", 
            "amount": booking.grandTotal * 100, // in paise
            "currency": "INR",   
            "name": "RentFlow",
            "description": "Payment for " + booking.itemTitle,
            "handler": function (response) {
                console.log("Successful Payment ID:", response.razorpay_payment_id);
                
                // Update status to Active
                booking.status = 'Active';
                localStorage.setItem('rentflow_bookings', JSON.stringify(allBookings));
                
                alert('Payment Successful! Rental is now Active.');
                calculateStats();
                renderOrders();
            },
            "prefill": {
                "name": "User", 
                "email": "user@example.com",
                "contact": "9999999999" 
            },
            "theme": {
                "color": "#2563eb" 
            }
        };

        try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();
        } catch (error) {
            alert("Failed to load payment gateway.");
        }
    };

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
            const modalCard = element.closest(".modal-card");
            const itemName = document.getElementById("receipt-item").textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // --- Apply a temporary light/print theme so the PDF isn't all-black ---
            const printStyles = document.createElement("style");
            printStyles.id = "pdf-print-override";
            printStyles.textContent = `
                #receipt-content {
                    background: #ffffff !important;
                    color: #1a1a1a !important;
                    padding: 32px !important;
                    border-radius: 0 !important;
                    width: 500px !important;
                    min-width: 500px !important;
                }
                #receipt-content .modal-title {
                    color: #111827 !important;
                }
                #receipt-content .receipt-item-name {
                    color: #111827 !important;
                }
                #receipt-content .receipt-lender {
                    color: #4b5563 !important;
                }
                #receipt-content .receipt-row {
                    color: #374151 !important;
                    flex-wrap: nowrap !important;
                    overflow: visible !important;
                }
                #receipt-content .receipt-row span {
                    white-space: nowrap !important;
                    overflow: visible !important;
                    flex-shrink: 0 !important;
                }
                #receipt-content .receipt-row.total-row {
                    color: #111827 !important;
                    border-top-color: #d1d5db !important;
                }
                #receipt-content .receipt-header {
                    border-bottom-color: #d1d5db !important;
                }
                #receipt-content .receipt-breakdown {
                    margin-bottom: 16px !important;
                }
            `;
            document.head.appendChild(printStyles);

            // --- Temporarily expand the modal so amounts don't get clipped ---
            const origMaxWidth = modalCard.style.maxWidth;
            const origWidth = modalCard.style.width;
            modalCard.style.maxWidth = "600px";
            modalCard.style.width = "600px";

            const opt = {
                margin:       10,
                filename:     `rentflow_receipt_${itemName}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, backgroundColor: '#ffffff', useCORS: true, width: 500 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const btn = document.getElementById("btn-download-receipt");
            const originalText = btn.textContent;
            btn.textContent = "Generating PDF...";
            btn.disabled = true;

            html2pdf().set(opt).from(element).save().then(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                // Remove temporary print styles and restore modal size
                printStyles.remove();
                modalCard.style.maxWidth = origMaxWidth;
                modalCard.style.width = origWidth;
            }).catch(err => {
                console.error("PDF generation error:", err);
                btn.textContent = originalText;
                btn.disabled = false;
                // Clean up even on error
                printStyles.remove();
                modalCard.style.maxWidth = origMaxWidth;
                modalCard.style.width = origWidth;
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
        const hasTime = dateString.includes('T') || dateString.includes(':');
        const date = new Date(dateString);
        if (hasTime) {
            const options = { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            return date.toLocaleString('en-IN', options);
        } else {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-IN', options);
        }
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

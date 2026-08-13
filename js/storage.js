/* ============================================================
   RentIQ – Centralized Storage Helper
   Single source of truth for Users, Listings, Bookings, Feedback
   ============================================================ */

const STORAGE_KEYS = {
    USERS: 'user',
    LISTINGS: 'listings',
    BOOKINGS: 'bookings',
    FEEDBACK: 'rentiq_feedback'
};

// Initial Seed Data for Phase 1 LocalStorage
const DEFAULT_USERS = [
    { username: 'Admin User', useremail: 'admin@rentiq.com', userphone: '9876543210', userpassword: 'Admin@123', role: 'admin' },
    { username: 'Rahul Sharma', useremail: 'rahul@example.com', userphone: '9876543211', userpassword: 'User@1234', role: 'customer' },
    { username: 'Aman Verma', useremail: 'aman@example.com', userphone: '9876543212', userpassword: 'User@1234', role: 'seller' },
    { username: 'Priya Singh', useremail: 'priya@example.com', userphone: '9876543213', userpassword: 'User@1234', role: 'customer' },
    { username: 'Karan Patel', useremail: 'karan@example.com', userphone: '9876543214', userpassword: 'User@1234', role: 'seller' }
];

const DEFAULT_LISTINGS = [
    { id: 'LST-001', name: 'Sony A7IV', category: 'Camera Gear', basePrice: 1000, status: 'Active', date: '2026-08-01', seller: 'Aman Verma' },
    { id: 'LST-002', name: 'BMW 3 Series', category: 'Vehicle', basePrice: 5000, status: 'Active', date: '2026-08-05', seller: 'Karan Patel' },
    { id: 'LST-003', name: 'Conference Hall', category: 'Venue', basePrice: 8000, status: 'Pending', date: '2026-08-10', seller: 'Aman Verma' },
    { id: 'LST-004', name: 'Camping Tent', category: 'Outdoor', basePrice: 500, status: 'Active', date: '2026-08-12', seller: 'Karan Patel' },
    { id: 'LST-005', name: 'DJI Mavic 3', category: 'Camera Gear', basePrice: 1500, status: 'Inactive', date: '2026-07-20', seller: 'Aman Verma' }
];

const DEFAULT_BOOKINGS = [
    { id: 'BK-1021', listingId: 'LST-001', listing: 'Sony A7IV', customer: 'Rahul Sharma', dates: '15 Aug – 18 Aug', amount: 3240, status: 'Confirmed', date: '2026-08-10' },
    { id: 'BK-1022', listingId: 'LST-002', listing: 'BMW 3 Series', customer: 'Priya Singh', dates: '20 Aug – 22 Aug', amount: 11500, status: 'Pending', date: '2026-08-11' },
    { id: 'BK-1023', listingId: 'LST-003', listing: 'Conference Hall', customer: 'Rahul Sharma', dates: '01 Sep – 02 Sep', amount: 16000, status: 'Cancelled', date: '2026-08-08' },
    { id: 'BK-1024', listingId: 'LST-004', listing: 'Camping Tent', customer: 'Priya Singh', dates: '10 Aug – 12 Aug', amount: 1500, status: 'Confirmed', date: '2026-08-09' }
];

const DEFAULT_FEEDBACK = [
    { id: 'FB-001', name: 'Rahul Sharma', email: 'rahul@example.com', type: 'Booking Experience', rating: 5, message: 'The booking process was simple and smooth.', bookingId: 'BK-1021', date: '2026-08-12', status: 'Visible' },
    { id: 'FB-002', name: 'Aman Verma', email: 'aman@example.com', type: 'Listing Experience', rating: 4, message: 'Great vehicle, exactly as described in the listing.', bookingId: '', date: '2026-08-10', status: 'Visible' }
];

// Initialize storage if keys do not exist
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(DEFAULT_LISTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
        localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(DEFAULT_FEEDBACK));
    }
}

// ─── GETTERS ────────────────────────────────────────────────

function getUsers() {
    initStorage();
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch (e) {
        return [];
    }
}

function getListings() {
    initStorage();
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS)) || [];
    } catch (e) {
        return [];
    }
}

function getBookings() {
    initStorage();
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
    } catch (e) {
        return [];
    }
}

function getFeedback() {
    initStorage();
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK)) || [];
    } catch (e) {
        return [];
    }
}

// ─── SETTERS ────────────────────────────────────────────────

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function saveListings(listings) {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
}

function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function saveFeedback(feedbackList) {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
}

// ─── SHARED CALCULATIONS ────────────────────────────────────

/**
 * Calculates total revenue from confirmed/completed bookings.
 * Shared business rule across Admin Dashboard and Analytics.
 */
function calculateTotalRevenue(bookingsList) {
    const list = bookingsList || getBookings();
    return list.reduce((total, b) => {
        const status = (b.status || '').toLowerCase();
        if (status === 'confirmed' || status === 'completed') {
            const amount = parseFloat(b.amount || b.totalPrice || b.price || 0);
            return total + amount;
        }
        return total;
    }, 0);
}

/**
 * Formats currency values consistently.
 */
function formatCurrency(amount) {
    if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(2) + 'L';
    }
    return '₹' + amount.toLocaleString('en-IN');
}

// Execute initial storage check immediately
initStorage();

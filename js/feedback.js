/* ============================================================
   RentIQ – Feedback JavaScript
   Uses shared storage.js for all data access.
   ============================================================ */

// Check if current user is admin (Phase 1 mock)
// We assume 'currentUserRole' is stored elsewhere, defaulting to user if not found.
const isAdmin = localStorage.getItem('currentUserRole') === 'admin';


// ─── STAR RATING LOGIC ───────────────────────────────────────

function initStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    const ratingInput = document.getElementById('fbRating');
    const errRating = document.getElementById('errRating');

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const value = parseInt(e.target.getAttribute('data-value'), 10);
            ratingInput.value = value;
            errRating.textContent = ''; // clear error on select

            // Update UI
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'), 10);
                if (sVal <= value) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });
    });
}

function resetStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    const ratingInput = document.getElementById('fbRating');
    ratingInput.value = '0';
    stars.forEach(s => {
        s.classList.remove('active');
        s.textContent = '☆';
    });
}


// ─── FORM VALIDATION & SUBMISSION ────────────────────────────

function validateForm() {
    let isValid = true;

    const nameInput = document.getElementById('fbName');
    const emailInput = document.getElementById('fbEmail');
    const typeInput = document.getElementById('fbType');
    const ratingInput = document.getElementById('fbRating');
    const messageInput = document.getElementById('fbMessage');

    const errName = document.getElementById('errName');
    const errEmail = document.getElementById('errEmail');
    const errType = document.getElementById('errType');
    const errRating = document.getElementById('errRating');
    const errMessage = document.getElementById('errMessage');

    // Reset errors
    [errName, errEmail, errType, errRating, errMessage].forEach(el => el.textContent = '');
    [nameInput, emailInput, typeInput, messageInput].forEach(el => el.classList.remove('input-error'));

    if (!nameInput.value.trim()) {
        errName.textContent = 'Please enter your name.';
        nameInput.classList.add('input-error');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        errEmail.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('input-error');
        isValid = false;
    }

    if (!typeInput.value) {
        errType.textContent = 'Please select a feedback type.';
        typeInput.classList.add('input-error');
        isValid = false;
    }

    if (parseInt(ratingInput.value, 10) === 0) {
        errRating.textContent = 'Please select a star rating.';
        isValid = false;
    }

    if (messageInput.value.trim().length < 10) {
        errMessage.textContent = 'Feedback message must be at least 10 characters.';
        messageInput.classList.add('input-error');
        isValid = false;
    }

    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Build feedback object
    const newFeedback = {
        id: 'FB-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        name: document.getElementById('fbName').value.trim(),
        email: document.getElementById('fbEmail').value.trim(),
        type: document.getElementById('fbType').value,
        rating: parseInt(document.getElementById('fbRating').value, 10),
        message: document.getElementById('fbMessage').value.trim(),
        bookingId: document.getElementById('fbBookingId').value.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'Visible'
    };

    // Save and re-render
    const allFeedback = getFeedback();
    allFeedback.unshift(newFeedback); // add to top
    saveFeedback(allFeedback);

    renderFeedbackList();
    showToast('Thanks for your feedback!');

    // Reset form
    document.getElementById('feedbackForm').reset();
    resetStarRating();
}


// ─── RENDER FEEDBACK LIST ────────────────────────────────────

function getStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += (i <= rating) ? '★' : '☆';
    }
    return stars;
}

// Global scope for onclick
window.removeFeedback = function(id) {
    if (confirm('Remove this feedback from the platform?')) {
        let allFeedback = getFeedback();
        allFeedback = allFeedback.filter(fb => fb.id !== id);
        saveFeedback(allFeedback);
        renderFeedbackList();
        showToast('Feedback removed successfully.');
    }
};

function renderFeedbackList() {
    const container = document.getElementById('feedbackListContainer');
    const allFeedback = getFeedback();
    
    // Only show 'Visible' feedback unless admin, but for Phase 1 we can just show all 
    // or assume removal deletes it.
    
    if (allFeedback.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No feedback submitted yet.</p>
                <small>Your feedback will appear here after you submit it.</small>
            </div>
        `;
        return;
    }

    let html = '';
    allFeedback.forEach(fb => {
        let adminControls = '';
        
        // Show moderation controls only if admin
        if (isAdmin) {
            adminControls = `
                <div class="admin-actions">
                    <button class="btn-remove" onclick="removeFeedback('${fb.id}')">Remove Feedback</button>
                </div>
            `;
        }

        html += `
            <div class="feedback-item">
                <div class="feedback-stars">${getStars(fb.rating)}</div>
                <div class="feedback-message">"${fb.message}"</div>
                <div class="feedback-meta">
                    <span class="feedback-type-badge">${fb.type}</span>
                    <span>${fb.date}</span>
                </div>
                ${adminControls}
            </div>
        `;
    });

    container.innerHTML = html;
}


// ─── TOAST NOTIFICATION ──────────────────────────────────────

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if(container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}


// ─── MOBILE MENU TOGGLE ─────────────────────────────────────

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
    initStarRating();
    initMobileMenu();
    renderFeedbackList();

    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Listen for storage changes from OTHER tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.FEEDBACK) {
            renderFeedbackList();
        }
    });
});

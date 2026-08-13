/**
 * ============================================================================
 * RENTFLOW - CONTACT & FAQ MODULE
 * ============================================================================
 * Handles the FAQ Accordion UI and the Contact Us Form.
 * Demonstrates DOM Manipulation, Event Listeners, and Promises (simulated network request).
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
    // 1. FAQ ACCORDION LOGIC
    // ========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle the 'active' class on the parent accordion-item
            const parentItem = this.parentElement;
            
            // Optional: Close all other open accordions before opening this one
            // document.querySelectorAll('.accordion-item').forEach(item => {
            //     if (item !== parentItem) item.classList.remove('active');
            // });

            parentItem.classList.toggle('active');
        });
    });

    // ========================================
    // 2. MODAL LOGIC
    // ========================================
    const contactModal = document.getElementById("contact-modal");
    const closeContactModal = document.getElementById("close-contact-modal");
    
    // Close modal via close button
    closeContactModal.addEventListener("click", () => {
        contactModal.classList.remove("show");
    });

    // Close modal via backdrop click
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) {
            contactModal.classList.remove("show");
        }
    });

    // ========================================
    // 3. FORM HANDLING & PROMISES
    // ========================================
    const contactForm = document.getElementById("contact-form");
    const toastContainer = document.getElementById("toast-container");

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Gather form data
        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (!name || !email || !subject || !message) {
            showToast("Please fill in all fields.", "error");
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        // Simulate network request using Promises and setTimeout
        new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate a successful API call 95% of the time
                if (Math.random() > 0.05) {
                    resolve("Message sent successfully");
                } else {
                    reject(new Error("Network Error"));
                }
            }, 1500); // 1.5 second delay
        })
        .then((successMsg) => {
            showToast("Your message has been sent. We'll be in touch soon!");
            contactForm.reset();
            contactModal.classList.remove("show");
        })
        .catch((error) => {
            showToast("Failed to send message. Please try again later.", "error");
            console.error("Contact Form Error:", error);
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });

    // ========================================
    // 4. TOAST NOTIFICATION UTILITY
    // ========================================
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
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
});

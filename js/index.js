document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });


    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });


    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const idx = siblings.indexOf(entry.target);
                    const delay = Math.min(idx * 80, 320);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealEls.forEach(el => observer.observe(el));


    const counters = document.querySelectorAll('.stat-number[data-target]');
    let countersStarted = false;

    const heroSection = document.getElementById('hero');

    const counterObserver = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(counter => animateCounter(counter));
            }
        },
        { threshold: 0.4 }
    );

    if (heroSection && counters.length > 0) counterObserver.observe(heroSection);

    function animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 1800;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            el.textContent = isDecimal
                ? current.toFixed(1)
                : Math.floor(current).toLocaleString('en-IN');

            if (progress < 1) requestAnimationFrame(step);
            else {
                el.textContent = isDecimal
                    ? target.toFixed(1)
                    : target.toLocaleString('en-IN');
            }
        }

        requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                const offset = 80; // header height buffer
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        modalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

});


function handleRazorpay() {
    const isLoggedIn = checkLoginStatus();

    if (!isLoggedIn) {
        window.location.href = 'login.html?redirect=pricing';
        return;
    }

    // Show modal
    const modalBackdrop = document.getElementById('modal-backdrop');
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
}


function initiatePayment() {
    const btn = document.getElementById('modal-pay-btn');
    btn.disabled = true;
    btn.textContent = 'Loading Razorpay...';


    const options = {
        key: 'rzp_test_YOUR_KEY_HERE',    
        amount: 29900,                      
        currency: 'INR',
        name: 'RentFlow',
        description: 'RentFlow Pro — Monthly Subscription',
        image: '',                           
        handler: function (response) {
            // Payment Success
            console.log('Payment Success:', response);
            onPaymentSuccess(response);
        },
        prefill: {
            name: '',     
            email: '',
            contact: '',
        },
        notes: {
            subscription_type: 'pro_monthly',
            platform: 'RentFlow',
        },
        theme: {
            color: '#5c7cfa',
        },
        modal: {
            ondismiss: function () {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Pay ₹299 via Razorpay
                `;
            }
        }
    };

    try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            showPaymentError(response.error.description);
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Pay ₹299 via Razorpay
            `;
        });
        rzp.open();
    } catch (err) {
        console.error('Razorpay not loaded:', err);
        btn.disabled = false;
        btn.textContent = 'Pay ₹299 via Razorpay';
        alert('Payment gateway unavailable. Please try again later.');
    }
}


function onPaymentSuccess(response) {
    const modalCard = document.getElementById('modal-card');
    modalCard.innerHTML = `
        <div style="text-align:center; padding: 20px 0;">
            <div style="font-size:56px; margin-bottom:16px;">🎉</div>
            <h3 style="font-family:'Manrope',sans-serif; font-size:22px; font-weight:800; color:#fff; margin-bottom:10px;">
                You're now a Pro member!
            </h3>
            <p style="font-size:14px; color:#8b93a1; line-height:1.6; margin-bottom:20px;">
                Seller contacts are now visible on all listings.<br>
                Payment ID: <strong style="color:#5c7cfa">${response.razorpay_payment_id || 'DEMO_SUCCESS'}</strong>
            </p>
            <a href="login.html" style="
                display:inline-block; padding:14px 28px;
                background:linear-gradient(135deg,#5c7cfa,#a78bfa);
                color:#fff; font-weight:700; border-radius:12px;
                text-decoration:none; font-size:15px;
            ">Go to My Dashboard</a>
        </div>
    `;
}

function showPaymentError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4);
        color: #f87171; font-size: 14px; font-weight: 600;
        padding: 12px 24px; border-radius: 12px; z-index: 9999;
        backdrop-filter: blur(12px); animation: fadeIn 0.3s ease;
    `;
    errorDiv.textContent = `Payment failed: ${message}`;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 4000);
}

function checkLoginStatus() {
    return !!localStorage.getItem('rentflow_user_token');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab auth variables from LocalStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    // 2. Grab HTML Elements
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const profileName = document.getElementById('profile-name');
    const navProfileImg = document.getElementById('nav-profile-img');
    const logoutBtn = document.getElementById('logout-btn');
    const navPremiumBtn = document.getElementById('nav-premium');

    if (isLoggedIn && currentUser) {
        // Toggle UI visibility
        if(authButtons) authButtons.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';
        
        // Set User Info safely
        if(profileName) {
            const nameToDisplay = currentUser.name || currentUser.username || 'User';
            profileName.innerText = nameToDisplay.split(' ')[0];
        }

        // Fetch Profile Image
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage && navProfileImg) {
            navProfileImg.src = savedImage;
        } else if (navProfileImg) {
            navProfileImg.src = "assets/profile.png";
        }

        // Hide "Go Premium" if they already bought it
        if (currentUser.isPremium) {
            if(navPremiumBtn) navPremiumBtn.style.display = 'none';
            
            // Check Expiration behind the scenes
            if (currentUser.premiumExpiryDate) {
                const expiry = new Date(currentUser.premiumExpiryDate);
                const now = new Date();
                if (now > expiry) {
                    handleExpiredPremium(currentUser);
                }
            }
        }
    }

    // 3. Logout Functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('current_user');
            window.location.href = 'index.html'; 
        });
    }

    // 4. Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
    }

    // 5. Dynamic About Page CTA buttons rendering
    const aboutCtaButtons = document.getElementById('about-cta-buttons');
    if (aboutCtaButtons) {
        if (isLoggedIn && currentUser) {
            aboutCtaButtons.innerHTML = `
                <a href="profile.html" class="btn-primary">Go to Profile</a>
                <a href="booking.html" class="btn-secondary">Explore Rentals</a>
            `;
        } else {
            aboutCtaButtons.innerHTML = `
                <a href="signup.html" class="btn-primary">Get Started Free</a>
                <a href="login.html" class="btn-secondary">Log In</a>
            `;
        }
    }
});

function handleExpiredPremium(currentUser) {
    if (confirm("Your RentFlow Premium subscription has expired. Do you want to renew now to continue accessing premium features (like your phone number visibility)?")) {
        currentUser.isPremium = false;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        let allUsers = JSON.parse(localStorage.getItem('user')) || [];
        const userIndex = allUsers.findIndex(u => u.useremail === currentUser.useremail);
        if (userIndex !== -1) {
            allUsers[userIndex].isPremium = false;
            localStorage.setItem('user', JSON.stringify(allUsers));
        }
        window.location.href = "premium.html";
    } else {
        currentUser.isPremium = false;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        let allUsers = JSON.parse(localStorage.getItem('user')) || [];
        const userIndex = allUsers.findIndex(u => u.useremail === currentUser.useremail);
        if (userIndex !== -1) {
            allUsers[userIndex].isPremium = false;
            localStorage.setItem('user', JSON.stringify(allUsers));
        }
        window.location.reload();
    }
}
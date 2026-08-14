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
        
        // Set User Info (Removed "Hi, ")
        if(profileName) profileName.innerText = currentUser.name.split(' ')[0];

        // Fetch Profile Image
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage && navProfileImg) {
            navProfileImg.src = savedImage;
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
});

function handleExpiredPremium(currentUser) {
    alert("Your RentFlow Premium subscription has expired. Please renew to continue accessing premium features.");
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
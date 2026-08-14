// ========================================
// GLOBAL MODAL & AUTH FUNCTIONS
// ========================================
function handlelogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("current_user");
    window.location.href = "login.html";
}

function openSettings() { document.getElementById("settingsOverlay").classList.add("show"); }
function closeSettings() { document.getElementById("settingsOverlay").classList.remove("show"); }
function openSecurity() { document.getElementById("securityOverlay").classList.add("show"); }
function closeSecurity() { document.getElementById("securityOverlay").classList.remove("show"); }

function showToast(message) {
    const toast = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = message;
    toast.style.display = "flex";
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
        toast.style.display = "none";
    }, 3000);
}

// ========================================
// MAIN APPLICATION LOGIC
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. AUTHENTICATION & DATA LOAD
    const currentUserData = localStorage.getItem("current_user");
    if (!currentUserData) {
        window.location.href = "login.html";
        return;
    }
    
    const user = JSON.parse(currentUserData);
    
    // Fill Display Information
    document.getElementById("profileNameDisplay").textContent = user.username || user.name || "RentFlow User";
    document.getElementById("profileEmailDisplay").textContent = user.useremail || "";
    
    // Premium Badge Check with Expiry Date
    if (user.isPremium) {
        let metaHtml = `<span style="color: #10b981; font-weight: 700;">👑 RentFlow Premium Active</span>`;
        
        if (user.premiumExpiryDate) {
            const expiry = new Date(user.premiumExpiryDate);
            const now = new Date();
            
            if (now > expiry) {
                user.isPremium = false;
                metaHtml = `<span style="color: #ef4444; font-weight: 700;">Premium Expired</span><br>
                            <a href="premium.html" style="color: white; background: #2563eb; padding: 5px 12px; border-radius: 4px; display: inline-block; margin-top: 10px; text-decoration: none; font-size: 14px;">Renew Premium</a>`;
            } else {
                const options = { day: 'numeric', month: 'short', year: 'numeric' };
                const formattedDate = expiry.toLocaleDateString('en-IN', options);
                
                metaHtml += `<br><span style="font-size: 0.85rem; color: #94a3b8; display: block; margin-top: 6px;">Valid till: ${formattedDate}</span>`;
            }
        }
        
        document.getElementById("profileMetaDisplay").innerHTML = metaHtml;
    }

    // Fill Form Inputs (Matching data correctly)
    document.getElementById("fullName").value = user.username || user.name || "";
    document.getElementById("email").value = user.useremail || "";
    
    const phoneInput = document.getElementById("phone");
    phoneInput.value = user.userphone || "";
    phoneInput.type = "tel";
    phoneInput.dataset.locked = "false";

    document.getElementById("dob").value = user.dob || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("address").value = user.address || "";
    document.getElementById("bio").value = user.bio || "";

    // 2. IMAGE UPLOAD LOGIC
    const profileImage = document.getElementById("profileImage");
    const profileImageInput = document.getElementById("profileImageInput");
    const savedImage = localStorage.getItem("profileImage");
    
    if (savedImage) {
        profileImage.src = savedImage;
    } else {
        profileImage.src = "assets/profile.png"; // Default fallback
    }

    profileImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const imageData = event.target.result;
            profileImage.src = imageData;
            localStorage.setItem("profileImage", imageData);
        };
        reader.readAsDataURL(file);
    });

    // 3. EDIT TOGGLE LOGIC
    const editToggleBtn = document.getElementById("editToggleBtn");
    const editToggleLabel = document.getElementById("editToggleLabel");
    const saveBtn = document.getElementById("saveBtn");
    const locationBtn = document.getElementById("getLocationBtn");
    
    // Get all inputs except email (usually unchangeable)
    const formFields = document.querySelectorAll("#profileForm input:not(#email), #profileForm select, #profileForm textarea");

    editToggleBtn.addEventListener("click", () => {
        const isEditing = editToggleBtn.classList.contains("editing");

        if (isEditing) {
            // Cancel Editing
            formFields.forEach(field => field.disabled = true);
            locationBtn.disabled = true;
            editToggleBtn.classList.remove("editing");
            editToggleLabel.textContent = "Edit";
            saveBtn.style.display = "none";
        } else {
            // Start Editing
            formFields.forEach(field => {
                if (field.dataset.locked !== "true") {
                    field.disabled = false;
                }
            });
            locationBtn.disabled = false;
            editToggleBtn.classList.add("editing");
            editToggleLabel.textContent = "Cancel";
            saveBtn.style.display = "flex";
        }
    });

    // 4. SAVE PROFILE LOGIC
    document.getElementById("profileForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const oldEmail = user.useremail;

        // Update User Object
        const newName = document.getElementById("fullName").value.trim();
        user.username = newName;
        user.name = newName;
        user.userphone = document.getElementById("phone").value.trim();

        user.dob = document.getElementById("dob").value;
        user.gender = document.getElementById("gender").value;
        user.address = document.getElementById("address").value.trim();
        user.bio = document.getElementById("bio").value.trim();

        // Save Current User
        localStorage.setItem("current_user", JSON.stringify(user));

        // Update Main Users Array
        let allUsers = JSON.parse(localStorage.getItem("user")) || [];
        const userIndex = allUsers.findIndex(u => u.useremail === oldEmail);
        if (userIndex !== -1) {
            allUsers[userIndex] = user;
            localStorage.setItem("user", JSON.stringify(allUsers));
        }

        // Update UI & Lock Form
        document.getElementById("profileNameDisplay").textContent = user.username;
        editToggleBtn.click(); // Programmatically click to cancel/lock
        showToast("Profile updated successfully!");
    });

    // 5. OPENSTREETMAP LOCATION LOGIC
    locationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        locationBtn.textContent = "📍 Getting Location...";

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
                const response = await fetch(url, { headers: { "Accept": "application/json" } });
                
                if (!response.ok) throw new Error("Request failed");
                const data = await response.json();
                
                if (data.display_name) {
                    document.getElementById("address").value = data.display_name;
                    locationBtn.textContent = "✓ Location Found";
                }
            } catch (error) {
                console.error("Location Error:", error);
                locationBtn.textContent = "📍 Try Again";
                alert("Could not fetch address. Please enter manually.");
            }
        }, (error) => {
            locationBtn.textContent = "📍 Use Current Location";
            alert("Location access denied or unavailable.");
        });
    });

    // 6. DELETE ACCOUNT LOGIC
    document.getElementById("deleteAccountBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete your RentFlow account? This cannot be undone.")) {
            const emailToDelete = user.useremail;
            
            // Remove from main array
            let allUsers = JSON.parse(localStorage.getItem("user")) || [];
            allUsers = allUsers.filter(u => u.useremail !== emailToDelete);
            localStorage.setItem("user", JSON.stringify(allUsers));
            
            // Clear session
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("current_user");
            window.location.href = "signup.html";
        }
    });

    // 7. THEME LOGIC
    const themeSelect = document.getElementById("themeSelect");
    const applyTheme = (theme) => {
        if (theme === "light") document.body.classList.add("light-theme");
        else document.body.classList.remove("light-theme");
    };

    const savedTheme = localStorage.getItem("theme") || "dark";
    if (themeSelect) {
        themeSelect.value = savedTheme;
        themeSelect.addEventListener("change", function () {
            applyTheme(this.value);
            localStorage.setItem("theme", this.value);
        });
    }
    applyTheme(savedTheme);

    // 8. NOTIFICATIONS
    const bellBtn = document.getElementById("bellBtn");
    if (bellBtn) {
        // Check for notifications
        let notifications = [];
        try {
            notifications = JSON.parse(localStorage.getItem('rentflow_notifications')) || [];
        } catch(e) {}

        const myNotifications = notifications.filter(n => n.recipientName === user.name && !n.read);
        const badgeDot = bellBtn.querySelector('.badge-dot');
        
        if (myNotifications.length > 0) {
            if (badgeDot) badgeDot.style.display = 'block';
        } else {
            if (badgeDot) badgeDot.style.display = 'none';
        }

        bellBtn.addEventListener('click', () => {
            if (myNotifications.length > 0) {
                let msgs = myNotifications.map(n => n.message).join('\n\n');
                alert("You have new notifications:\n\n" + msgs);
                
                // Mark as read
                myNotifications.forEach(n => n.read = true);
                localStorage.setItem('rentflow_notifications', JSON.stringify(notifications));
                if (badgeDot) badgeDot.style.display = 'none';
                
                // Refresh list
                myNotifications.length = 0;
            } else {
                alert("You have no new notifications.");
            }
        });
    }
});
let handlelogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profileImage");
    // userRole kept intentionally — reloaded on next login
    window.location.href = "login.html";
};

// ============ TOAST ============
let toastTimer = null;

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ============ SETTINGS POPUP ============
const settingsBtn = document.getElementById("settingsBtn");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsCancelBtn = document.getElementById("settingsCancelBtn");
const settingsOverlay = document.getElementById("settingsOverlay");

function openSettings() {
    if (settingsOverlay) settingsOverlay.classList.add("show");
}
function closeSettings() {
    if (settingsOverlay) settingsOverlay.classList.remove("show");
}

// ============ SECURITY POPUP ============
const securityOverlay = document.getElementById("securityOverlay");

function openSecurity() {
    if (securityOverlay) securityOverlay.classList.add("show");
}
function closeSecurity() {
    if (securityOverlay) securityOverlay.classList.remove("show");
}

// ============ CHANGE PASSWORD (lives inside Settings popup) ============
// "Change Password" in the Security popup jumps here instead of a dead link.
function openChangePassword() {
    closeSecurity();
    openSettings();

    const form = document.getElementById("changePasswordForm");
    const toggleBtn = document.getElementById("togglePasswordFormBtn");
    if (form && toggleBtn) {
        form.hidden = false;
        toggleBtn.textContent = "Cancel";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("togglePasswordFormBtn");
    const cancelBtn = document.getElementById("cancelPasswordBtn");
    const form = document.getElementById("changePasswordForm");
    const errorEl = document.getElementById("passwordError");

    if (!toggleBtn || !form) return;

    function showForm() {
        form.hidden = false;
        toggleBtn.textContent = "Cancel";
    }

    function hideForm() {
        form.hidden = true;
        form.reset();
        if (errorEl) errorEl.hidden = true;
        toggleBtn.textContent = "Change";
    }

    toggleBtn.addEventListener("click", function () {
        if (form.hidden) showForm();
        else hideForm();
    });

    if (cancelBtn) {
        cancelBtn.addEventListener("click", hideForm);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        function showError(message) {
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.hidden = false;
            }
        }

        const currentUserData = localStorage.getItem("current_user");
        if (!currentUserData) {
            showError("User information not found.");
            return;
        }

        let user;
        try {
            user = JSON.parse(currentUserData);
        } catch (error) {
            console.error("Could not parse current user:", error);
            showError("Could not load your account.");
            return;
        }

        // Support whichever password field name was used at signup.
        const storedPassword = user.userpassword || user.password || "";

        if (storedPassword && currentPassword !== storedPassword) {
            showError("Current password is incorrect.");
            return;
        }

        if (newPassword.length < 6) {
            showError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showError("New passwords do not match.");
            return;
        }

        // Save under whichever key the account already used, defaulting to userpassword.
        const passwordKey = user.userpassword !== undefined ? "userpassword" : "password";
        user[passwordKey] = newPassword;

        localStorage.setItem("current_user", JSON.stringify(user));
        updateStoredUser(user);

        hideForm();
        alert("Password updated successfully!");
    });
});

// ============ THEME ============
const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");
}

const savedTheme = localStorage.getItem("theme") || "dark";

if (themeSelect) {
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener("change", function () {
        applyTheme(themeSelect.value);
        localStorage.setItem("theme", themeSelect.value);
    });
}

// ============ DELETE ACCOUNT ============
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", function () {
        const confirmDelete = confirm(
            "Are you sure you want to delete your RentFlow account?\n\nThis action cannot be undone."
        );
        if (!confirmDelete) return;

        // Remove user from the users array
        const currentUserData = localStorage.getItem("current_user");
        let currentUser = null;

        if (currentUserData) {
            try {
                currentUser = JSON.parse(currentUserData);
            } catch (error) {
                console.error("Could not read current user:", error);
            }
        }

        if (currentUser && currentUser.useremail) {
            const usersData = localStorage.getItem("user");
            if (usersData) {
                try {
                    let users = JSON.parse(usersData);
                    users = users.filter(
                        u => u.useremail?.toLowerCase() !== currentUser.useremail.toLowerCase()
                    );
                    localStorage.setItem("user", JSON.stringify(users));
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            }
        }

        // Clear account data (theme kept intentionally)
        [
            "token", "current_user", "isLoggedIn", "userRole",
            "pendingUserEmail", "profileImage", "userLatitude",
            "userLongitude", "address", "city", "state", "country", "pin"
        ].forEach(key => localStorage.removeItem(key));

        alert("Your account has been deleted successfully.");
        window.location.href = "signup.html";
    });
}

// ============ LOAD PROFILE ============
function loadProfile() {
    const currentUser = localStorage.getItem("current_user");
    if (!currentUser) {
        console.log("No current user found in localStorage.");
        return;
    }

    let user;
    try {
        user = JSON.parse(currentUser);
    } catch (error) {
        console.error("Could not parse current user:", error);
        return;
    }

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    if (fullName) fullName.value = user.username || "";
    if (email) email.value = user.useremail || "";
    if (phone) phone.value = user.userphone || "";

    // Role — current_user is the source of truth, fallback to stored userRole
    const roleSelect = document.getElementById("userRole");
    let userRole = user.role;

    if (userRole !== "customer" && userRole !== "renter") {
        userRole = localStorage.getItem("userRole");
    }

    if (roleSelect && (userRole === "customer" || userRole === "renter")) {
        roleSelect.value = userRole;
    }
    if (userRole === "customer" || userRole === "renter") {
        localStorage.setItem("userRole", userRole);
    }

    const fields = ["dob", "gender", "city", "address", "state", "country", "pin", "bio"];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = user[id] || "";
    });

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    if (profileName) profileName.textContent = user.username || "";
    if (profileEmail) profileEmail.textContent = user.useremail || "";

    const premiumStatus = document.getElementById("premiumStatus");
    const premiumExpiryDateStr = document.getElementById("premiumExpiryDateStr");
    if (premiumStatus && user.isPremium && user.premiumExpiryDate) {
        const expiryDate = new Date(user.premiumExpiryDate);
        if (expiryDate > new Date()) {
            premiumStatus.style.display = "block";
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            if (premiumExpiryDateStr) {
                premiumExpiryDateStr.textContent = expiryDate.toLocaleDateString(undefined, options);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", loadProfile);

// ============ PROFILE IMAGE ============
const DEFAULT_PROFILE_IMAGE = "assets/profile.png";

function loadProfileImage() {
    const profileImage = document.getElementById("profileImage");
    if (!profileImage) return;
    profileImage.src = localStorage.getItem("profileImage") || DEFAULT_PROFILE_IMAGE;
}

function setupProfileImageUpload() {
    const profileImageInput = document.getElementById("profileImageInput");
    const profileImage = document.getElementById("profileImage");
    if (!profileImageInput || !profileImage) return;

    profileImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const imageData = event.target.result;
            profileImage.src = imageData;
            localStorage.setItem("profileImage", imageData);

            const currentUserData = localStorage.getItem("current_user");
            if (currentUserData) {
                try {
                    const currentUser = JSON.parse(currentUserData);
                    currentUser.profileImage = imageData;
                    localStorage.setItem("current_user", JSON.stringify(currentUser));
                    updateStoredUser(currentUser);
                } catch (error) {
                    console.error("Could not update profile image:", error);
                }
            }
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadProfileImage();
    setupProfileImageUpload();
});

// ============ EDIT / SAVE CONTROLS ============
document.addEventListener("DOMContentLoaded", function () {
    const editToggleBtn = document.getElementById("editToggleBtn");
    const editToggleLabel = document.getElementById("editToggleLabel");
    const saveBtn = document.getElementById("saveBtn");
    const locationBtn = document.getElementById("getLocationBtn");

    const profileFields = [
        "fullName", "email", "phone", "dob", "gender",
        "city", "address", "state", "country", "pin", "bio"
    ];

    if (!editToggleBtn) return;

    editToggleBtn.addEventListener("click", function () {
        profileFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.disabled = false;
                field.style.pointerEvents = "auto";
                field.style.opacity = "1";
                field.removeAttribute("readonly");
            }
        });

        const roleSelect = document.getElementById("userRole");
        if (roleSelect) roleSelect.disabled = false;

        if (locationBtn) {
            locationBtn.disabled = false;
            locationBtn.style.pointerEvents = "auto";
            locationBtn.style.opacity = "1";
        }

        if (editToggleLabel) editToggleLabel.textContent = "Editing";
        editToggleBtn.classList.add("editing");
        if (saveBtn) saveBtn.style.display = "flex";
    });
});

// ============ SAVE PROFILE CHANGES ============
document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profileForm");
    const saveBtn = document.getElementById("saveBtn");
    if (!profileForm || !saveBtn) return;

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentUserData = localStorage.getItem("current_user");
        if (!currentUserData) {
            alert("User information not found.");
            return;
        }

        let user;
        try {
            user = JSON.parse(currentUserData);
        } catch (error) {
            console.error("Could not parse user:", error);
            alert("Could not load your profile.");
            return;
        }

        const oldEmail = user.useremail;

        const getVal = id => document.getElementById(id);
        const fullName = getVal("fullName"), email = getVal("email"), phone = getVal("phone");
        const dob = getVal("dob"), gender = getVal("gender"), city = getVal("city");
        const address = getVal("address"), state = getVal("state"), country = getVal("country");
        const pin = getVal("pin"), bio = getVal("bio"), roleSelect = getVal("userRole");

        if (fullName) user.username = fullName.value.trim();
        if (email) user.useremail = email.value.trim();
        if (phone) user.userphone = phone.value.trim();
        if (dob) user.dob = dob.value.trim();
        if (gender) user.gender = gender.value;
        if (city) user.city = city.value.trim();
        if (address) user.address = address.value.trim();
        if (state) user.state = state.value;
        if (country) user.country = country.value;
        if (pin) user.pin = pin.value.trim();
        if (bio) user.bio = bio.value.trim();

        if (roleSelect && (roleSelect.value === "customer" || roleSelect.value === "renter")) {
            user.role = roleSelect.value;
            localStorage.setItem("userRole", roleSelect.value);
        }

        localStorage.setItem("current_user", JSON.stringify(user));
        updateStoredUser(user, oldEmail);

        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");
        if (profileName) profileName.textContent = user.username || "";
        if (profileEmail) profileEmail.textContent = user.useremail || "";

        const profileFields = [
            "fullName", "email", "phone", "dob", "gender",
            "city", "address", "state", "country", "pin", "bio"
        ];
        profileFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.disabled = true;
        });

        if (roleSelect) roleSelect.disabled = true;

        const editToggleBtn = document.getElementById("editToggleBtn");
        const editToggleLabel = document.getElementById("editToggleLabel");
        if (editToggleBtn) editToggleBtn.classList.remove("editing");
        if (editToggleLabel) editToggleLabel.textContent = "Edit";

        saveBtn.style.display = "none";
        alert("Profile updated successfully!");
    });
});

// ============ UPDATE STORED USER ============
function updateStoredUser(updatedUser, oldEmail = null) {
    const usersData = localStorage.getItem("user");
    if (!usersData) {
        console.log("No stored users found.");
        return;
    }

    try {
        let users = JSON.parse(usersData);
        if (!Array.isArray(users)) {
            console.error("Stored users is not an array.");
            return;
        }

        const emailToFind = oldEmail || updatedUser.useremail;
        const userIndex = users.findIndex(
            u => u.useremail && emailToFind && u.useremail.toLowerCase() === emailToFind.toLowerCase()
        );

        if (userIndex !== -1) users[userIndex] = updatedUser;

        localStorage.setItem("user", JSON.stringify(users));
    } catch (error) {
        console.error("Error updating stored user:", error);
    }
}

// ============ CURRENT LOCATION (OpenStreetMap) ============
// Same async/await + toast pattern as handleAutoLocate() in booking.js,
// adapted to fill the profile's address/city/state/country/pin fields.
document.addEventListener("DOMContentLoaded", function () {
    const locationBtn = document.getElementById("getLocationBtn");
    if (!locationBtn) {
        console.error("Location button not found!");
        return;
    }

    locationBtn.addEventListener("click", handleAutoLocate);

    async function handleAutoLocate() {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", true);
            return;
        }

        locationBtn.textContent = "📍 Getting Location...";
        locationBtn.disabled = true;
        locationBtn.classList.add("loading");

        try {
            // Promisify geolocation to use with async/await
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            localStorage.setItem("userLatitude", latitude);
            localStorage.setItem("userLongitude", longitude);

            // Fetch API call to OpenStreetMap Nominatim
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            const response = await fetch(url, { headers: { "Accept": "application/json" } });
            if (!response.ok) throw new Error("Nominatim request failed");

            const data = await response.json();
            if (!data.address) throw new Error("No address information found");

            const a = data.address;
            const fullAddress = data.display_name || "";
            const city = a.city || a.town || a.village || a.municipality || "";
            const state = a.state || "";
            const country = a.country || "";
            const pin = a.postcode || "";

            const addressInput = document.getElementById("address");
            if (addressInput) addressInput.value = fullAddress;

            const cityInput = document.getElementById("city");
            if (cityInput) cityInput.value = city;

            setSelectValue("state", state);
            setSelectValue("country", country);

            const pinInput = document.getElementById("pin");
            if (pinInput) pinInput.value = pin;

            // Save location into current_user
            const currentUserData = localStorage.getItem("current_user");
            if (currentUserData) {
                try {
                    const currentUser = JSON.parse(currentUserData);
                    Object.assign(currentUser, {
                        address: fullAddress, city, state, country, pin, latitude, longitude
                    });
                    localStorage.setItem("current_user", JSON.stringify(currentUser));
                    updateStoredUser(currentUser);
                } catch (error) {
                    console.error("Could not save location:", error);
                }
            }

            locationBtn.textContent = "✓ Location Found";
            showToast(`Location detected: ${city ? city + ", " : ""}${state || country}`);

        } catch (error) {
            console.error("Location error:", error);
            locationBtn.textContent = "📍 Use Current Location";

            // Geolocation errors carry a code; fetch/parse errors don't.
            const messages = {
                1: "Location permission denied. Please allow location access.",
                2: "Your location could not be determined.",
                3: "Location request timed out."
            };
            showToast(messages[error.code] || "Could not find your address. Please try again.", true);

        } finally {
            locationBtn.disabled = false;
            locationBtn.classList.remove("loading");
        }
    }
});

// ============ SET SELECT VALUE ============
function setSelectValue(elementId, value) {
    const select = document.getElementById(elementId);
    if (!select || !value) return;

    const optionExists = Array.from(select.options).some(opt => opt.value === value);

    if (!optionExists) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    }

    select.value = value;
}

// ============ ACCOUNT ROLE CHANGE ============
function setupRoleChange() {
    const roleSelect = document.getElementById("userRole");
    if (!roleSelect) return;

    roleSelect.addEventListener("change", function () {
        const selectedRole = roleSelect.value;
        if (selectedRole !== "customer" && selectedRole !== "renter") return;

        const currentUserData = localStorage.getItem("current_user");
        if (!currentUserData) {
            console.error("No current user found.");
            return;
        }

        let currentUser;
        try {
            currentUser = JSON.parse(currentUserData);
        } catch (error) {
            console.error("Could not parse current user:", error);
            return;
        }

        currentUser.role = selectedRole;
        localStorage.setItem("current_user", JSON.stringify(currentUser));
        localStorage.setItem("userRole", selectedRole);

        const usersData = localStorage.getItem("user");
        if (usersData) {
            try {
                let users = JSON.parse(usersData);
                if (Array.isArray(users)) {
                    const userIndex = users.findIndex(
                        u => u.useremail && currentUser.useremail &&
                             u.useremail.toLowerCase() === currentUser.useremail.toLowerCase()
                    );
                    if (userIndex !== -1) {
                        users[userIndex].role = selectedRole;
                        localStorage.setItem("user", JSON.stringify(users));
                    }
                }
            } catch (error) {
                console.error("Could not update users array:", error);
            }
        }

        console.log("Account role changed to:", selectedRole);
    });
}
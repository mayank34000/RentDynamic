let handlelogout = () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";

}

// ================================
// SETTINGS POPUP
// ================================

const settingsBtn = document.getElementById("settingsBtn");

const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsCancelBtn = document.getElementById("settingsCancelBtn");


// ================================
// SETTINGS POPUP
// ================================

const settingsOverlay =
    document.getElementById("settingsOverlay");
    

function openSettings() {
    settingsOverlay.classList.add("show");
}

function closeSettings() {
    settingsOverlay.classList.remove("show");
}


// ================================
// SECURITY POPUP
// ================================

const securityOverlay =
    document.getElementById("securityOverlay");


// OPEN SECURITY
function openSecurity() {

    securityOverlay.classList.add("show");

}


// CLOSE SECURITY
function closeSecurity() {

    securityOverlay.classList.remove("show");

}

// ================================
// APPEARANCE / THEME
// ================================

const themeSelect =
    document.getElementById("themeSelect");


// ================================
// APPLY THEME
// ================================

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add("light-theme");

    } else {

        document.body.classList.remove("light-theme");

    }
}


// ================================
// LOAD SAVED THEME
// ================================

const savedTheme =
    localStorage.getItem("theme") || "dark";


// Set dropdown to saved theme
themeSelect.value = savedTheme;


// Apply saved theme
applyTheme(savedTheme);


// ================================
// CHANGE THEME
// ================================

themeSelect.addEventListener("change", function () {

    const selectedTheme =
        themeSelect.value;


    // Apply immediately
    applyTheme(selectedTheme);


    // Save for future page loads
    localStorage.setItem(
        "theme",
        selectedTheme
    );

});

// ================================
// DELETE ACCOUNT
// ================================

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");


deleteAccountBtn.addEventListener("click", function () {

    const confirmDelete = confirm(
        "Are you sure you want to delete your RentFlow account?\n\n" +
        "This action cannot be undone."
    );

    if (confirmDelete) {

        // Remove stored account information
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("phone");
        localStorage.removeItem("theme");

        // Redirect to signup page
        window.location.href = "signup.html";
    }

});


// ================================
// FETCH CURRENT USER PROFILE
// ================================

function loadProfile() {

    // Get currently logged-in user
    const currentUser =
        localStorage.getItem("current_user");

    // Check if user exists
    if (!currentUser) {
        console.log("No current user found in localStorage.");
        return;
    }

    // Convert JSON string into JavaScript object
    const user = JSON.parse(currentUser);

    console.log("Current User:", user);


    // ================================
    // BASIC INFORMATION
    // ================================

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");


    // Full Name
    if (fullName) {
        fullName.value = user.username || "";
    }


    // Email
    if (email) {
        email.value = user.useremail || "";
    }


    // Phone
    if (phone) {
        phone.value = user.userphone || "";
    }


    // ================================
    // ADDITIONAL PROFILE INFORMATION
    // ================================

    const dob =
        document.getElementById("dob");

    const gender =
        document.getElementById("gender");

    const city =
        document.getElementById("city");

    const address =
        document.getElementById("address");

    const state =
        document.getElementById("state");

    const country =
        document.getElementById("country");

    const pin =
        document.getElementById("pin");

    const bio =
        document.getElementById("bio");


    if (dob) {
        dob.value = user.dob || "";
    }

    if (gender) {
        gender.value = user.gender || "";
    }

    if (city) {
        city.value = user.city || "";
    }

    if (address) {
        address.value = user.address || "";
    }

    if (state) {
        state.value = user.state || "";
    }

    if (country) {
        country.value = user.country || "";
    }

    if (pin) {
        pin.value = user.pin || "";
    }

    if (bio) {
        bio.value = user.bio || "";
    }
}


// ================================
// LOAD WHEN PAGE IS READY
// ================================

document.addEventListener(
    "DOMContentLoaded",
    loadProfile
);

// ================================
// PROFILE IMAGE
// ================================

const DEFAULT_PROFILE_IMAGE =
    "assets/profile.png"; // <-- put your image path here


// ================================
// LOAD PROFILE IMAGE
// ================================

function loadProfileImage() {

    const profileImage =
        document.getElementById("profileImage");

    if (!profileImage) {
        return;
    }


    // Check if user has uploaded an image
    const savedImage =
        localStorage.getItem("profileImage");


    if (savedImage) {

        // User uploaded an image
        profileImage.src = savedImage;

    } else {

        // No image uploaded → use default
        profileImage.src = DEFAULT_PROFILE_IMAGE;

    }
}


// ================================
// UPLOAD PROFILE IMAGE
// ================================

function setupProfileImageUpload() {

    const profileImageInput =
        document.getElementById("profileImageInput");

    const profileImage =
        document.getElementById("profileImage");


    if (!profileImageInput || !profileImage) {
        return;
    }


    profileImageInput.addEventListener(
        "change",
        function () {

            const file = this.files[0];


            if (!file) {
                return;
            }


            // Make sure the selected file is an image
            if (!file.type.startsWith("image/")) {

                alert("Please select a valid image.");

                return;
            }


            const reader =
                new FileReader();


            reader.onload = function (event) {

                const imageData =
                    event.target.result;


                // Show uploaded image
                profileImage.src =
                    imageData;


                // Save uploaded image
                localStorage.setItem(
                    "profileImage",
                    imageData
                );

            };


            reader.readAsDataURL(file);

        }
    );
}


// ================================
// PAGE LOAD
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfileImage();

        setupProfileImageUpload();

    }
);

document.addEventListener("DOMContentLoaded", function () {

    const editToggleBtn =
        document.getElementById("editToggleBtn");

    const editToggleLabel =
        document.getElementById("editToggleLabel");

    const saveBtn =
        document.getElementById("saveBtn");


    const profileFields = [
        "fullName",
        "email",
        "phone",
        "dob",
        "gender",
        "city",
        "address",
        "state",
        "country",
        "pin",
        "bio"
    ];


    editToggleBtn.addEventListener("click", function () {

        console.log("Edit clicked");


        profileFields.forEach(function (id) {

            const field =
                document.getElementById(id);

            if (field) {

                field.disabled = false;

                // In case CSS/pointer-events is blocking it
                field.style.pointerEvents = "auto";
                field.style.opacity = "1";
                field.removeAttribute("readonly");

            }

        });


        editToggleLabel.textContent = "Editing";

        editToggleBtn.classList.add("editing");


        if (saveBtn) {
            saveBtn.style.display = "flex";
        }

    });

});

// ================================
// SAVE PROFILE CHANGES
// ================================

document.addEventListener("DOMContentLoaded", function () {

    const profileForm =
        document.getElementById("profileForm");

    const saveBtn =
        document.getElementById("saveBtn");


    if (!profileForm || !saveBtn) {
        console.log("Profile form or Save button not found.");
        return;
    }


    // ================================
    // SAVE BUTTON
    // ================================

    profileForm.addEventListener("submit", function (event) {

        event.preventDefault();


        // Get currently logged-in user
        const currentUserData =
            localStorage.getItem("current_user");


        if (!currentUserData) {

            alert("User information not found.");

            return;

        }


        // Convert JSON into object
        const user =
            JSON.parse(currentUserData);


        // Store old email BEFORE changing it
        const oldEmail =
            user.useremail;


        // ================================
        // GET UPDATED VALUES
        // ================================

        user.username =
            document.getElementById("fullName").value.trim();

        user.useremail =
            document.getElementById("email").value.trim();

        user.userphone =
            document.getElementById("phone").value.trim();

        user.dob =
            document.getElementById("dob").value.trim();

        user.gender =
            document.getElementById("gender").value;

        user.city =
            document.getElementById("city").value.trim();

        user.address =
            document.getElementById("address").value.trim();

        user.state =
            document.getElementById("state").value;

        user.country =
            document.getElementById("country").value;

        user.pin =
            document.getElementById("pin").value.trim();

        user.bio =
            document.getElementById("bio").value.trim();


        // ================================
        // SAVE CURRENT USER
        // ================================

        localStorage.setItem(
            "current_user",
            JSON.stringify(user)
        );


        // ================================
        // UPDATE USER ARRAY
        // ================================

        const usersData =
            localStorage.getItem("user");


        if (usersData) {

            const users =
                JSON.parse(usersData);


            const userIndex =
                users.findIndex(function (storedUser) {

                    return storedUser.useremail === oldEmail;

                });


            if (userIndex !== -1) {

                users[userIndex] = user;

                localStorage.setItem(
                    "user",
                    JSON.stringify(users)
                );

            }

        }


        // ================================
        // UPDATE PROFILE CARD
        // ================================

        const profileName =
            document.getElementById("profileName");

        const profileEmail =
            document.getElementById("profileEmail");


        if (profileName) {

            profileName.textContent =
                user.username || "";

        }


        if (profileEmail) {

            profileEmail.textContent =
                user.useremail || "";

        }


        // ================================
        // DISABLE FIELDS AFTER SAVING
        // ================================

        const profileFields = [
            "fullName",
            "email",
            "phone",
            "dob",
            "gender",
            "city",
            "address",
            "state",
            "country",
            "pin",
            "bio"
        ];


        profileFields.forEach(function (id) {

            const field =
                document.getElementById(id);

            if (field) {
                field.disabled = true;
            }

        });


        // ================================
        // CHANGE EDIT BUTTON BACK
        // ================================

        const editToggleBtn =
            document.getElementById("editToggleBtn");

        const editToggleLabel =
            document.getElementById("editToggleLabel");


        if (editToggleBtn) {

            editToggleBtn.classList.remove("editing");

        }


        if (editToggleLabel) {

            editToggleLabel.textContent = "Edit";

        }


        // Hide Save button
        saveBtn.style.display = "none";


        alert("Profile updated successfully!");

    });

});


// ========================================
// CURRENT LOCATION - OPENSTREETMAP
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const locationBtn =
        document.getElementById("getLocationBtn");


    if (!locationBtn) {
        console.error("Location button not found!");
        return;
    }


    locationBtn.addEventListener("click", function () {

        console.log("Getting current location...");


        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        locationBtn.textContent =
            "📍 Getting Location...";


        navigator.geolocation.getCurrentPosition(

            async function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);


                // Save coordinates
                localStorage.setItem(
                    "userLatitude",
                    latitude
                );

                localStorage.setItem(
                    "userLongitude",
                    longitude
                );


                try {

                    // ========================================
                    // OPENSTREETMAP REVERSE GEOCODING
                    // ========================================

                    const url =
                        `https://nominatim.openstreetmap.org/reverse?` +
                        `format=json&` +
                        `lat=${latitude}&` +
                        `lon=${longitude}&` +
                        `zoom=18&` +
                        `addressdetails=1`;


                    const response =
                        await fetch(url, {
                            headers: {
                                "Accept": "application/json"
                            }
                        });


                    if (!response.ok) {

                        throw new Error(
                            "Nominatim request failed"
                        );

                    }


                    const data =
                        await response.json();


                    console.log(
                        "OpenStreetMap response:",
                        data
                    );


                    if (!data.address) {

                        throw new Error(
                            "No address information found"
                        );

                    }


                    const addressData =
                        data.address;


                    // ========================================
                    // GET ADDRESS
                    // ========================================

                    const fullAddress =
                        data.display_name || "";


                    // ========================================
                    // GET CITY
                    // ========================================

                    const city =
                        addressData.city ||
                        addressData.town ||
                        addressData.village ||
                        addressData.municipality ||
                        "";


                    // ========================================
                    // GET STATE
                    // ========================================

                    const state =
                        addressData.state || "";


                    // ========================================
                    // GET COUNTRY
                    // ========================================

                    const country =
                        addressData.country || "";


                    // ========================================
                    // GET PIN
                    // ========================================

                    const pin =
                        addressData.postcode || "";


                    console.log(
                        "Address:",
                        fullAddress
                    );

                    console.log(
                        "City:",
                        city
                    );

                    console.log(
                        "State:",
                        state
                    );

                    console.log(
                        "Country:",
                        country
                    );

                    console.log(
                        "PIN:",
                        pin
                    );


                    // ========================================
                    // FILL ADDRESS
                    // ========================================

                    const addressInput =
                        document.getElementById("address");


                    if (addressInput) {

                        addressInput.value =
                            fullAddress;

                    }


                    // ========================================
                    // FILL CITY
                    // ========================================

                    const cityInput =
                        document.getElementById("city");


                    if (cityInput) {

                        cityInput.value =
                            city;

                    }


                    // ========================================
                    // FILL STATE
                    // ========================================

                    setSelectValue(
                        "state",
                        state
                    );


                    // ========================================
                    // FILL COUNTRY
                    // ========================================

                    setSelectValue(
                        "country",
                        country
                    );


                    // ========================================
                    // FILL PIN
                    // ========================================

                    const pinInput =
                        document.getElementById("pin");


                    if (pinInput) {

                        pinInput.value =
                            pin;

                    }


                    // ========================================
                    // SAVE LOCATION
                    // ========================================

                    localStorage.setItem(
                        "address",
                        fullAddress
                    );

                    localStorage.setItem(
                        "city",
                        city
                    );

                    localStorage.setItem(
                        "state",
                        state
                    );

                    localStorage.setItem(
                        "country",
                        country
                    );

                    localStorage.setItem(
                        "pin",
                        pin
                    );


                    // ========================================
                    // SUCCESS
                    // ========================================

                    locationBtn.textContent =
                        "✓ Location Found";


                    console.log(
                        "Location successfully filled!"
                    );

                }


                catch (error) {

                    console.error(
                        "Location conversion error:",
                        error
                    );


                    locationBtn.textContent =
                        "📍 Use Current Location";


                    alert(
                        "Could not find your address. Please try again."
                    );

                }

            },


            function (error) {

                console.error(
                    "GPS Error:",
                    error
                );


                locationBtn.textContent =
                    "📍 Use Current Location";


                if (error.code === 1) {

                    alert(
                        "Location permission denied. Please allow location access."
                    );

                }

                else if (error.code === 2) {

                    alert(
                        "Your location could not be determined."
                    );

                }

                else if (error.code === 3) {

                    alert(
                        "Location request timed out."
                    );

                }

                else {

                    alert(
                        "Unable to get your location."
                    );

                }

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    });

});


// ========================================
// SET SELECT VALUE
// ========================================

function setSelectValue(
    elementId,
    value
) {

    const select =
        document.getElementById(elementId);


    if (!select || !value) {
        return;
    }


    let optionExists = false;


    for (
        let i = 0;
        i < select.options.length;
        i++
    ) {

        if (
            select.options[i].value === value
        ) {

            optionExists = true;
            break;

        }

    }


    // Add new option if necessary
    if (!optionExists) {

        const option =
            document.createElement("option");


        option.value =
            value;

        option.textContent =
            value;


        select.appendChild(option);

    }


    select.value =
        value;

}



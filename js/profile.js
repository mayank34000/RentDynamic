// ======================================================
// LOGOUT
// ======================================================

let handlelogout = () => {

    // Remove login information
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    localStorage.removeItem("isLoggedIn");

    // Keep userRole because the account itself still has
    // a role. It can be loaded again after the next login.

    window.location.href = "login.html";
};


// ======================================================
// SETTINGS POPUP
// ======================================================

const settingsBtn =
    document.getElementById("settingsBtn");

const settingsCloseBtn =
    document.getElementById("settingsCloseBtn");

const settingsCancelBtn =
    document.getElementById("settingsCancelBtn");

const settingsOverlay =
    document.getElementById("settingsOverlay");


function openSettings() {

    if (settingsOverlay) {
        settingsOverlay.classList.add("show");
    }

}


function closeSettings() {

    if (settingsOverlay) {
        settingsOverlay.classList.remove("show");
    }

}


// ======================================================
// SECURITY POPUP
// ======================================================

const securityOverlay =
    document.getElementById("securityOverlay");


// OPEN SECURITY

function openSecurity() {

    if (securityOverlay) {
        securityOverlay.classList.add("show");
    }

}


// CLOSE SECURITY

function closeSecurity() {

    if (securityOverlay) {
        securityOverlay.classList.remove("show");
    }

}


// ======================================================
// APPEARANCE / THEME
// ======================================================

const themeSelect =
    document.getElementById("themeSelect");


// ======================================================
// APPLY THEME
// ======================================================

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    }

    else {

        document.body.classList.remove(
            "light-theme"
        );

    }

}


// ======================================================
// LOAD SAVED THEME
// ======================================================

const savedTheme =
    localStorage.getItem("theme") || "dark";


if (themeSelect) {

    themeSelect.value =
        savedTheme;

    applyTheme(savedTheme);


    // ==================================================
    // CHANGE THEME
    // ==================================================

    themeSelect.addEventListener(
        "change",
        function () {

            const selectedTheme =
                themeSelect.value;


            // Apply immediately
            applyTheme(selectedTheme);


            // Save
            localStorage.setItem(
                "theme",
                selectedTheme
            );

        }
    );

}


// ======================================================
// DELETE ACCOUNT
// ======================================================

const deleteAccountBtn =
    document.getElementById(
        "deleteAccountBtn"
    );


if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        "click",
        function () {

            const confirmDelete =
                confirm(
                    "Are you sure you want to delete your RentFlow account?\n\n" +
                    "This action cannot be undone."
                );


            if (!confirmDelete) {
                return;
            }


            // ==========================================
            // GET CURRENT USER
            // ==========================================

            const currentUserData =
                localStorage.getItem(
                    "current_user"
                );


            let currentUser = null;


            if (currentUserData) {

                try {

                    currentUser =
                        JSON.parse(
                            currentUserData
                        );

                }

                catch (error) {

                    console.error(
                        "Could not read current user:",
                        error
                    );

                }

            }


            // ==========================================
            // REMOVE USER FROM USER ARRAY
            // ==========================================

            if (
                currentUser &&
                currentUser.useremail
            ) {

                const usersData =
                    localStorage.getItem(
                        "user"
                    );


                if (usersData) {

                    try {

                        let users =
                            JSON.parse(
                                usersData
                            );


                        users =
                            users.filter(
                                storedUser =>
                                    storedUser.useremail
                                        ?.toLowerCase() !==
                                    currentUser.useremail
                                        .toLowerCase()
                            );


                        localStorage.setItem(
                            "user",
                            JSON.stringify(users)
                        );

                    }

                    catch (error) {

                        console.error(
                            "Error deleting user:",
                            error
                        );

                    }

                }

            }


            // ==========================================
            // REMOVE ACCOUNT INFORMATION
            // ==========================================

            localStorage.removeItem("token");

            localStorage.removeItem("current_user");

            localStorage.removeItem("isLoggedIn");

            localStorage.removeItem("userRole");

            localStorage.removeItem("pendingUserEmail");

            localStorage.removeItem("profileImage");

            localStorage.removeItem("userLatitude");

            localStorage.removeItem("userLongitude");

            localStorage.removeItem("address");

            localStorage.removeItem("city");

            localStorage.removeItem("state");

            localStorage.removeItem("country");

            localStorage.removeItem("pin");


            // Keep theme if desired


            // ==========================================
            // REDIRECT
            // ==========================================

            alert(
                "Your account has been deleted successfully."
            );


            window.location.href =
                "signup.html";

        }
    );

}


// ======================================================
// FETCH CURRENT USER PROFILE
// ======================================================

function loadProfile() {

    // ================================================
    // GET CURRENT USER
    // ================================================

    const currentUser =
        localStorage.getItem(
            "current_user"
        );


    if (!currentUser) {

        console.log(
            "No current user found in localStorage."
        );

        return;
    }


    // ================================================
    // PARSE USER
    // ================================================

    let user;


    try {

        user =
            JSON.parse(
                currentUser
            );

    }

    catch (error) {

        console.error(
            "Could not parse current user:",
            error
        );

        return;

    }


    console.log(
        "Current User:",
        user
    );


    // ==================================================
    // BASIC INFORMATION
    // ==================================================

    const fullName =
        document.getElementById(
            "fullName"
        );

    const email =
        document.getElementById(
            "email"
        );

    const phone =
        document.getElementById(
            "phone"
        );


    // Full Name

    if (fullName) {

        fullName.value =
            user.username || "";

    }


    // Email

    if (email) {

        email.value =
            user.useremail || "";

    }


    // Phone

    if (phone) {

        phone.value =
            user.userphone || "";

    }


    // ==================================================
    // ROLE
    // ==================================================

    const roleSelect =
        document.getElementById(
            "userRole"
        );


    /*
     * First use the role stored inside the user.
     *
     * This is the main source of truth.
     */

    let userRole =
        user.role;


    /*
     * If the user's role is not available in
     * current_user, fall back to userRole.
     */

    if (
        userRole !== "customer" &&
        userRole !== "renter"
    ) {

        userRole =
            localStorage.getItem(
                "userRole"
            );

    }


    if (
        roleSelect &&
        (
            userRole === "customer" ||
            userRole === "renter"
        )
    ) {

        roleSelect.value =
            userRole;

    }


    /*
     * Keep localStorage synchronized.
     */

    if (
        userRole === "customer" ||
        userRole === "renter"
    ) {

        localStorage.setItem(
            "userRole",
            userRole
        );

    }


    // ==================================================
    // ADDITIONAL PROFILE INFORMATION
    // ==================================================

    const dob =
        document.getElementById(
            "dob"
        );

    const gender =
        document.getElementById(
            "gender"
        );

    const city =
        document.getElementById(
            "city"
        );

    const address =
        document.getElementById(
            "address"
        );

    const state =
        document.getElementById(
            "state"
        );

    const country =
        document.getElementById(
            "country"
        );

    const pin =
        document.getElementById(
            "pin"
        );

    const bio =
        document.getElementById(
            "bio"
        );


    if (dob) {

        dob.value =
            user.dob || "";

    }


    if (gender) {

        gender.value =
            user.gender || "";

    }


    if (city) {

        city.value =
            user.city || "";

    }


    if (address) {

        address.value =
            user.address || "";

    }


    if (state) {

        state.value =
            user.state || "";

    }


    if (country) {

        country.value =
            user.country || "";

    }


    if (pin) {

        pin.value =
            user.pin || "";

    }


    if (bio) {

        bio.value =
            user.bio || "";

    }


    // ==================================================
    // PROFILE CARD
    // ==================================================

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (profileName) {

        profileName.textContent =
            user.username || "";

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.useremail || "";

    }

}


// ======================================================
// LOAD PROFILE WHEN PAGE IS READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    loadProfile
);


// ======================================================
// PROFILE IMAGE
// ======================================================

const DEFAULT_PROFILE_IMAGE =
    "assets/profile.png";


// ======================================================
// LOAD PROFILE IMAGE
// ======================================================

function loadProfileImage() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );


    if (!profileImage) {
        return;
    }


    const savedImage =
        localStorage.getItem(
            "profileImage"
        );


    if (savedImage) {

        profileImage.src =
            savedImage;

    }

    else {

        profileImage.src =
            DEFAULT_PROFILE_IMAGE;

    }

}


// ======================================================
// UPLOAD PROFILE IMAGE
// ======================================================

function setupProfileImageUpload() {

    const profileImageInput =
        document.getElementById(
            "profileImageInput"
        );

    const profileImage =
        document.getElementById(
            "profileImage"
        );


    if (
        !profileImageInput ||
        !profileImage
    ) {

        return;

    }


    profileImageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            // ==========================================
            // CHECK IMAGE
            // ==========================================

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                return;

            }


            // ==========================================
            // READ IMAGE
            // ==========================================

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const imageData =
                        event.target.result;


                    // Show image

                    profileImage.src =
                        imageData;


                    // Save image

                    localStorage.setItem(
                        "profileImage",
                        imageData
                    );


                    // ==================================
                    // SAVE IMAGE TO CURRENT USER
                    // ==================================

                    const currentUserData =
                        localStorage.getItem(
                            "current_user"
                        );


                    if (currentUserData) {

                        try {

                            const currentUser =
                                JSON.parse(
                                    currentUserData
                                );


                            currentUser.profileImage =
                                imageData;


                            localStorage.setItem(
                                "current_user",
                                JSON.stringify(
                                    currentUser
                                )
                            );


                            updateStoredUser(
                                currentUser
                            );

                        }

                        catch (error) {

                            console.error(
                                "Could not update profile image:",
                                error
                            );

                        }

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// PROFILE IMAGE PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfileImage();

        setupProfileImageUpload();

    }
);


// ======================================================
// EDIT / SAVE CONTROLS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const editToggleBtn =
            document.getElementById(
                "editToggleBtn"
            );

        const editToggleLabel =
            document.getElementById(
                "editToggleLabel"
            );

        const saveBtn =
            document.getElementById(
                "saveBtn"
            );


        // ==========================================
        // PROFILE FIELDS
        // ==========================================

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


        // ==========================================
        // EDIT BUTTON
        // ==========================================

        if (editToggleBtn) {

            editToggleBtn.addEventListener(
                "click",
                function () {

                    console.log(
                        "Edit clicked"
                    );


                    profileFields.forEach(
                        function (id) {

                            const field =
                                document.getElementById(
                                    id
                                );


                            if (field) {

                                field.disabled =
                                    false;

                                field.style.pointerEvents =
                                    "auto";

                                field.style.opacity =
                                    "1";

                                field.removeAttribute(
                                    "readonly"
                                );

                            }

                        }
                    );


                    // ==================================
                    // ENABLE ROLE DROPDOWN
                    // ==================================

                    const roleSelect =
                        document.getElementById(
                            "userRole"
                        );


                    if (roleSelect) {

                        roleSelect.disabled =
                            false;

                        roleSelect.style.pointerEvents =
                            "auto";

                        roleSelect.style.opacity =
                            "1";

                    }


                    // ==================================
                    // CHANGE EDIT LABEL
                    // ==================================

                    if (editToggleLabel) {

                        editToggleLabel.textContent =
                            "Editing";

                    }


                    editToggleBtn.classList.add(
                        "editing"
                    );


                    // ==================================
                    // SHOW SAVE BUTTON
                    // ==================================

                    if (saveBtn) {

                        saveBtn.style.display =
                            "flex";

                    }

                }
            );

        }

    }
);


// ======================================================
// SAVE PROFILE CHANGES
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const profileForm =
            document.getElementById(
                "profileForm"
            );

        const saveBtn =
            document.getElementById(
                "saveBtn"
            );


        if (
            !profileForm ||
            !saveBtn
        ) {

            console.log(
                "Profile form or Save button not found."
            );

            return;

        }


        // ==================================================
        // FORM SUBMIT
        // ==================================================

        profileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                console.log(
                    "Saving profile..."
                );


                // ==========================================
                // GET CURRENT USER
                // ==========================================

                const currentUserData =
                    localStorage.getItem(
                        "current_user"
                    );


                if (!currentUserData) {

                    alert(
                        "User information not found."
                    );

                    return;

                }


                // ==========================================
                // PARSE CURRENT USER
                // ==========================================

                let user;


                try {

                    user =
                        JSON.parse(
                            currentUserData
                        );

                }

                catch (error) {

                    console.error(
                        "Could not parse user:",
                        error
                    );

                    alert(
                        "Could not load your profile."
                    );

                    return;

                }


                // ==========================================
                // STORE OLD EMAIL
                // ==========================================

                const oldEmail =
                    user.useremail;


                // ==========================================
                // GET UPDATED VALUES
                // ==========================================

                const fullName =
                    document.getElementById(
                        "fullName"
                    );

                const email =
                    document.getElementById(
                        "email"
                    );

                const phone =
                    document.getElementById(
                        "phone"
                    );

                const dob =
                    document.getElementById(
                        "dob"
                    );

                const gender =
                    document.getElementById(
                        "gender"
                    );

                const city =
                    document.getElementById(
                        "city"
                    );

                const address =
                    document.getElementById(
                        "address"
                    );

                const state =
                    document.getElementById(
                        "state"
                    );

                const country =
                    document.getElementById(
                        "country"
                    );

                const pin =
                    document.getElementById(
                        "pin"
                    );

                const bio =
                    document.getElementById(
                        "bio"
                    );

                const roleSelect =
                    document.getElementById(
                        "userRole"
                    );


                // ==========================================
                // UPDATE USER DATA
                // ==========================================

                if (fullName) {

                    user.username =
                        fullName.value.trim();

                }


                if (email) {

                    user.useremail =
                        email.value.trim();

                }


                if (phone) {

                    user.userphone =
                        phone.value.trim();

                }


                if (dob) {

                    user.dob =
                        dob.value.trim();

                }


                if (gender) {

                    user.gender =
                        gender.value;

                }


                if (city) {

                    user.city =
                        city.value.trim();

                }


                if (address) {

                    user.address =
                        address.value.trim();

                }


                if (state) {

                    user.state =
                        state.value;

                }


                if (country) {

                    user.country =
                        country.value;

                }


                if (pin) {

                    user.pin =
                        pin.value.trim();

                }


                if (bio) {

                    user.bio =
                        bio.value.trim();

                }


                // ==========================================
                // UPDATE ROLE
                // ==========================================

                if (
                    roleSelect &&
                    (
                        roleSelect.value ===
                            "customer" ||

                        roleSelect.value ===
                            "renter"
                    )
                ) {

                    user.role =
                        roleSelect.value;


                    // Save role separately

                    localStorage.setItem(
                        "userRole",
                        roleSelect.value
                    );

                }


                // ==========================================
                // SAVE CURRENT USER
                // ==========================================

                localStorage.setItem(

                    "current_user",

                    JSON.stringify(user)

                );


                // ==========================================
                // UPDATE USER ARRAY
                // ==========================================

                updateStoredUser(
                    user,
                    oldEmail
                );


                // ==========================================
                // UPDATE PROFILE CARD
                // ==========================================

                const profileName =
                    document.getElementById(
                        "profileName"
                    );

                const profileEmail =
                    document.getElementById(
                        "profileEmail"
                    );


                if (profileName) {

                    profileName.textContent =
                        user.username || "";

                }


                if (profileEmail) {

                    profileEmail.textContent =
                        user.useremail || "";

                }


                // ==========================================
                // DISABLE PROFILE FIELDS
                // ==========================================

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


                profileFields.forEach(
                    function (id) {

                        const field =
                            document.getElementById(
                                id
                            );


                        if (field) {

                            field.disabled =
                                true;

                        }

                    }
                );


                // ==========================================
                // DISABLE ROLE DROPDOWN
                // ==========================================

                if (roleSelect) {

                    roleSelect.disabled =
                        true;

                }


                // ==========================================
                // EDIT BUTTON
                // ==========================================

                const editToggleBtn =
                    document.getElementById(
                        "editToggleBtn"
                    );

                const editToggleLabel =
                    document.getElementById(
                        "editToggleLabel"
                    );


                if (editToggleBtn) {

                    editToggleBtn.classList.remove(
                        "editing"
                    );

                }


                if (editToggleLabel) {

                    editToggleLabel.textContent =
                        "Edit";

                }


                // ==========================================
                // HIDE SAVE BUTTON
                // ==========================================

                saveBtn.style.display =
                    "none";


                // ==========================================
                // SUCCESS
                // ==========================================

                alert(
                    "Profile updated successfully!"
                );

            }
        );

    }
);


// ======================================================
// UPDATE STORED USER
// ======================================================

function updateStoredUser(
    updatedUser,
    oldEmail = null
) {

    const usersData =
        localStorage.getItem(
            "user"
        );


    if (!usersData) {

        console.log(
            "No stored users found."
        );

        return;

    }


    try {

        let users =
            JSON.parse(
                usersData
            );


        if (!Array.isArray(users)) {

            console.error(
                "Stored users is not an array."
            );

            return;

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const emailToFind =
            oldEmail ||
            updatedUser.useremail;


        const userIndex =
            users.findIndex(
                function (storedUser) {

                    return (

                        storedUser.useremail &&
                        emailToFind &&

                        storedUser.useremail
                            .toLowerCase() ===
                        emailToFind
                            .toLowerCase()

                    );

                }
            );


        // ==========================================
        // UPDATE USER
        // ==========================================

        if (userIndex !== -1) {

            users[userIndex] =
                updatedUser;

        }


        // ==========================================
        // SAVE USERS
        // ==========================================

        localStorage.setItem(
            "user",
            JSON.stringify(users)
        );

    }

    catch (error) {

        console.error(
            "Error updating stored user:",
            error
        );

    }

}


// ======================================================
// CURRENT LOCATION - OPENSTREETMAP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const locationBtn =
            document.getElementById(
                "getLocationBtn"
            );


        if (!locationBtn) {

            console.error(
                "Location button not found!"
            );

            return;

        }


        locationBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "Getting current location..."
                );


                // ========================================
                // CHECK GEOLOCATION
                // ========================================

                if (
                    !navigator.geolocation
                ) {

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


                        console.log(
                            "Latitude:",
                            latitude
                        );

                        console.log(
                            "Longitude:",
                            longitude
                        );


                        // ========================================
                        // SAVE COORDINATES
                        // ========================================

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
                                await fetch(
                                    url,
                                    {
                                        headers: {
                                            "Accept":
                                                "application/json"
                                        }
                                    }
                                );


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
                            // ADDRESS
                            // ========================================

                            const fullAddress =
                                data.display_name ||
                                "";


                            // ========================================
                            // CITY
                            // ========================================

                            const city =

                                addressData.city ||

                                addressData.town ||

                                addressData.village ||

                                addressData.municipality ||

                                "";


                            // ========================================
                            // STATE
                            // ========================================

                            const state =
                                addressData.state ||
                                "";


                            // ========================================
                            // COUNTRY
                            // ========================================

                            const country =
                                addressData.country ||
                                "";


                            // ========================================
                            // PIN
                            // ========================================

                            const pin =
                                addressData.postcode ||
                                "";


                            // ========================================
                            // LOG
                            // ========================================

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
                                document.getElementById(
                                    "address"
                                );


                            if (addressInput) {

                                addressInput.value =
                                    fullAddress;

                            }


                            // ========================================
                            // FILL CITY
                            // ========================================

                            const cityInput =
                                document.getElementById(
                                    "city"
                                );


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
                                document.getElementById(
                                    "pin"
                                );


                            if (pinInput) {

                                pinInput.value =
                                    pin;

                            }


                            // ========================================
                            // SAVE LOCATION TEMPORARILY
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


                    // ==========================================
                    // GEOLOCATION ERROR
                    // ==========================================

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

                        enableHighAccuracy:
                            true,

                        timeout:
                            15000,

                        maximumAge:
                            0

                    }

                );

            }
        );

    }
);


// ======================================================
// SET SELECT VALUE
// ======================================================

function setSelectValue(
    elementId,
    value
) {

    const select =
        document.getElementById(
            elementId
        );


    if (
        !select ||
        !value
    ) {

        return;

    }


    let optionExists =
        false;


    // ==========================================
    // CHECK EXISTING OPTIONS
    // ==========================================

    for (
        let i = 0;
        i < select.options.length;
        i++
    ) {

        if (
            select.options[i].value ===
            value
        ) {

            optionExists =
                true;

            break;

        }

    }


    // ==========================================
    // ADD OPTION IF NEEDED
    // ==========================================

    if (!optionExists) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;

        option.textContent =
            value;


        select.appendChild(
            option
        );

    }


    // ==========================================
    // SELECT VALUE
    // ==========================================

    select.value =
        value;

}
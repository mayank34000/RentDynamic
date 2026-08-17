// ======================================================
// NORMAL SIGNUP
// ======================================================

let handleSubmit = () => {

    // ==================================================
    // GET FORM VALUES
    // ==================================================

    let name = document.getElementById("username");
    let email = document.getElementById("email");
    let phone = document.getElementById("phone");
    let password = document.getElementById("password");
    let confirm_password = document.getElementById("confirm_password");
    let terms = document.getElementById("terms");


    // ==================================================
    // USERNAME VALIDATION
    // ==================================================

    if (name.value.trim().length < 3) {
        alert("Username must be at least 3 characters long!");
        return;
    }

    if (name.value.trim().length > 30) {
        alert("Username cannot be more than 30 characters!");
        return;
    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value.trim())) {
        alert("Please enter a valid email address!");
        return;
    }


    // ==================================================
    // PHONE VALIDATION
    // ==================================================

    let phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone.value.trim())) {
        alert("Please enter a valid phone number!");
        return;
    }


    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    if (password.value.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
    }

    if (password.value.length > 50) {
        alert("Password cannot be more than 50 characters!");
        return;
    }


    let upperCase = /[A-Z]/;
    let lowerCase = /[a-z]/;
    let number = /[0-9]/;

    let specialCharacter =
        /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/;


    if (!upperCase.test(password.value)) {
        alert("Password must contain at least one uppercase letter!");
        return;
    }

    if (!lowerCase.test(password.value)) {
        alert("Password must contain at least one lowercase letter!");
        return;
    }

    if (!number.test(password.value)) {
        alert("Password must contain at least one number!");
        return;
    }

    if (!specialCharacter.test(password.value)) {
        alert("Password must contain at least one special character!");
        return;
    }


    // ==================================================
    // CONFIRM PASSWORD
    // ==================================================

    if (password.value !== confirm_password.value) {
        alert("Passwords do not match!");
        return;
    }


    // ==================================================
    // TERMS & CONDITIONS
    // ==================================================

    if (!terms.checked) {
        alert("Please accept the Terms & Conditions!");
        return;
    }


    // ==================================================
    // CREATE NORMAL USER
    // ==================================================
    //
    // IMPORTANT:
    // Role is NOT selected here.
    //
    // The user will select Customer/Renter on
    // role-selection.html.
    //
    // role: null means the account does not have
    // a selected role yet.
    // ==================================================

    let user = {

        username: name.value.trim(),

        useremail: email.value.trim(),

        userphone: phone.value.trim(),

        userpassword: password.value,

        role: "customer"

    };


    // ==================================================
    // GET EXISTING USERS
    // ==================================================

    let get_user = localStorage.getItem("user");

    let user_array = [];


    if (get_user) {

        try {

            user_array = JSON.parse(get_user);

            // Make sure it is actually an array
            if (!Array.isArray(user_array)) {
                user_array = [];
            }

        } catch (error) {

            console.error(
                "Error reading users from localStorage:",
                error
            );

            user_array = [];
        }
    }


    // ==================================================
    // CHECK IF EMAIL ALREADY EXISTS
    // ==================================================

    let isPresent = user_array.some(

        existingUser =>

            existingUser.useremail &&

            existingUser.useremail.toLowerCase() ===
            email.value.trim().toLowerCase()

    );


    if (isPresent) {

        alert("User already exists!");

        return;
    }


    // ==================================================
    // SAVE USER
    // ==================================================

    user_array.push(user);


    localStorage.setItem(
        "user",
        JSON.stringify(user_array)
    );


    // ==================================================
    // CLEAR OLD ROLE
    // ==================================================
    //
    // If another account previously selected a role
    // in this browser, don't accidentally use that
    // role for the new account.
    // ==================================================

    localStorage.removeItem("userRole");


    // ==================================================
    // ACCOUNT CREATED
    // ==================================================

    alert("Account created successfully! Please log in.");


    // ==================================================
    // GO TO LOGIN
    // ==================================================

    window.location.href = "login.html";

};



// ======================================================
// GOOGLE SIGN-IN
// ======================================================

// Your Google OAuth Client ID

const GOOGLE_CLIENT_ID =
    "354423086263-a5p6thqr2udjam895sotpa701180cpp3.apps.googleusercontent.com";



// ======================================================
// GOOGLE LOGIN CALLBACK
// ======================================================

function handleGoogleLogin(response) {

    const payload = parseJwt(response.credential);


    // ==================================================
    // CHECK GOOGLE RESPONSE
    // ==================================================

    if (!payload) {

        alert("Google login failed!");

        return;
    }


    // ==================================================
    // CREATE GOOGLE USER
    // ==================================================
    //
    // Role is intentionally null.
    //
    // Google users must also go through the role
    // selection page.
    // ==================================================

    const googleUser = {

        username: payload.name,

        useremail: payload.email,

        userphone: "",

        userpassword: "",

        role: "customer",

        googleId: payload.sub,

        profileImage:
            payload.picture || "assets/google.png",

        loginMethod: "google"

    };


    // ==================================================
    // GET EXISTING USERS
    // ==================================================

    let users =
        JSON.parse(localStorage.getItem("user")) || [];


    // ==================================================
    // CHECK IF GOOGLE USER ALREADY EXISTS
    // ==================================================

    const index = users.findIndex(

        user =>

            user.useremail?.toLowerCase() ===
            googleUser.useremail.toLowerCase()

    );


    // ==================================================
    // EXISTING GOOGLE USER
    // ==================================================

    if (index !== -1) {

        // Keep existing phone number

        googleUser.userphone =
            users[index].userphone || "";


        /*
         * IMPORTANT
         *
         * Do not overwrite an already selected role
         * with null.
         *
         * If the user already has a role, preserve it.
         */

        googleUser.role =
            users[index].role || "customer";


        users[index] = {

            ...users[index],

            ...googleUser

        };

    }


    // ==================================================
    // NEW GOOGLE USER
    // ==================================================

    else {

        users.push(googleUser);

    }


    // ==================================================
    // SAVE USERS
    // ==================================================

    localStorage.setItem(
        "user",
        JSON.stringify(users)
    );


    // ==================================================
    // GET FINAL USER DATA
    // ==================================================

    const finalUser =

        index !== -1
            ? users[index]
            : googleUser;


    // ==================================================
    // SAVE CURRENT USER
    // ==================================================

    localStorage.setItem(

        "current_user",

        JSON.stringify(finalUser)

    );


    // ==================================================
    // SAVE PROFILE IMAGE
    // ==================================================

    localStorage.setItem(

        "profileImage",

        finalUser.profileImage ||
        "assets/google.png"

    );


    // ==================================================
    // LOGIN STATUS
    // ==================================================

    localStorage.setItem(
        "isLoggedIn",
        "true"
    );


    // ==================================================
    // GOOGLE USER ROLE LOGIC
    // ==================================================

    localStorage.setItem("userRole", finalUser.role);

    // Existing role can continue normally

    window.location.href = "index.html";

}



// ======================================================
// JWT DECODER
// ======================================================

function parseJwt(token) {

    try {

        const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");


        return JSON.parse(

            decodeURIComponent(

                atob(base64)
                    .split("")
                    .map(c =>

                        "%" +
                        ("00" +
                            c.charCodeAt(0)
                            .toString(16))
                            .slice(-2)

                    )
                    .join("")

            )

        );

    }

    catch (error) {

        console.error(
            "JWT error:",
            error
        );

        return null;

    }

}



// ======================================================
// GOOGLE SIGN-IN INITIALIZATION
// ======================================================

window.onload = function () {

    if (

        typeof google === "undefined" ||

        !google.accounts?.id

    ) {

        console.error(
            "Google Identity Services not loaded."
        );

        return;
    }


    // ==================================================
    // INITIALIZE GOOGLE
    // ==================================================

    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin,

        auto_select: false,

        cancel_on_tap_outside: true

    });


    // ==================================================
    // RENDER GOOGLE BUTTON
    // ==================================================

    google.accounts.id.renderButton(

        document.getElementById("google-btn"),

        {

            type: "standard",

            theme: "outline",

            size: "large",

            text: "continue_with",

            shape: "rectangular",

            width: 350

        }

    );

};
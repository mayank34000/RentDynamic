// ======================================================
// NORMAL LOGIN
// ======================================================

let handleLogin = () => {

    // ==================================================
    // GET FORM VALUES
    // ==================================================

    let email =
        document.getElementById("email");

    let password =
        document.getElementById("password");


    // ==================================================
    // GET USERS
    // ==================================================

    let users = [];

    try {

        users =
            JSON.parse(
                localStorage.getItem("user")
            ) || [];


        if (!Array.isArray(users)) {

            users = [];

        }

    }

    catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        users = [];

    }


    // ==================================================
    // FIND USER
    // ==================================================

    let verified_user = users.find(

        user =>

            user.useremail?.toLowerCase() ===
            email.value.trim().toLowerCase()

    );


    // ==================================================
    // VERIFY LOGIN
    // ==================================================

    if (

        verified_user &&

        verified_user.userpassword ===
        password.value

    ) {


        // ==================================================
        // CHECK USER ROLE
        // ==================================================

        const userRole =
            verified_user.role;


        /*
         * A user should have a role because the required
         * workflow is:
         *
         * Signup
         *      ↓
         * Role Selection
         *      ↓
         * Login
         *
         * If somehow the role is missing, send the user
         * back to role selection.
         */

        if (

            userRole !== "customer" &&

            userRole !== "renter"

        ) {

            alert(
                "Please select your account role first."
            );


            // Save the email so role selection knows
            // which user needs to be updated.

            localStorage.setItem(
                "pendingUserEmail",
                verified_user.useremail
            );


            window.location.href =
                "role-selection.html";


            return;

        }


        // ==================================================
        // SAVE USER ROLE
        // ==================================================

        localStorage.setItem(
            "userRole",
            userRole
        );


        // ==================================================
        // SAVE CURRENT USER
        // ==================================================

        localStorage.setItem(

            "current_user",

            JSON.stringify(verified_user)

        );


        // ==================================================
        // LOGIN STATUS
        // ==================================================

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        // ==================================================
        // SAVE PROFILE IMAGE IF AVAILABLE
        // ==================================================

        if (verified_user.profileImage) {

            localStorage.setItem(
                "profileImage",
                verified_user.profileImage
            );

        }


        // ==================================================
        // LOGIN SUCCESS
        // ==================================================

        alert("Login Successful");


        // ==================================================
        // REDIRECT BASED ON ROLE
        // ==================================================

        redirectByRole(userRole);

    }

    else {

        alert("Invalid Credentials");

    }

};



// ======================================================
// REDIRECT USER BASED ON ROLE
// ======================================================

function redirectByRole(role) {

    if (role === "customer") {

        window.location.href =
            "create_listings.html";

    }

    else if (role === "renter") {

        window.location.href =
            "booking.html";

    }

    else {

        console.error(
            "Invalid user role:",
            role
        );

        window.location.href =
            "role-selection.html";

    }

}



// ======================================================
// GOOGLE LOGIN
// ======================================================

const GOOGLE_CLIENT_ID =
    "354423086263-a5p6thqr2udjam895sotpa701180cpp3.apps.googleusercontent.com";



function handleGoogleLogin(response) {

    // ==================================================
    // DECODE GOOGLE RESPONSE
    // ==================================================

    const payload =
        parseJwt(response.credential);


    if (!payload) {

        alert("Google login failed!");

        return;

    }


    // ==================================================
    // GOOGLE USER INFORMATION
    // ==================================================

    const googleEmail =
        payload.email;

    const googleName =
        payload.name;

    const googlePicture =
        payload.picture ||
        "assets/google.png";

    const googleId =
        payload.sub;


    // ==================================================
    // GET REGISTERED USERS
    // ==================================================

    let users = [];

    try {

        users =
            JSON.parse(
                localStorage.getItem("user")
            ) || [];


        if (!Array.isArray(users)) {

            users = [];

        }

    }

    catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        users = [];

    }


    // ==================================================
    // FIND GOOGLE ACCOUNT
    // ==================================================

    const index =
        users.findIndex(

            user =>

                user.useremail?.toLowerCase() ===
                googleEmail.toLowerCase()

        );


    // ==================================================
    // GOOGLE ACCOUNT NOT REGISTERED
    // ==================================================

    if (index === -1) {

        alert(
            "No account found with this Google account. Please sign up first."
        );

        return;

    }


    // ==================================================
    // UPDATE GOOGLE INFORMATION
    // ==================================================

    users[index].username =
        googleName;

    users[index].googleId =
        googleId;

    users[index].profileImage =
        googlePicture;

    users[index].loginMethod =
        "google";


    // ==================================================
    // CHECK ROLE
    // ==================================================

    const userRole =
        users[index].role;


    /*
     * If the Google account was registered but the user
     * somehow doesn't have a role, send them to role
     * selection before allowing them to continue.
     */

    if (

        userRole !== "customer" &&

        userRole !== "renter"

    ) {

        // Save updated user information

        localStorage.setItem(
            "user",
            JSON.stringify(users)
        );


        // Save current Google user

        localStorage.setItem(

            "current_user",

            JSON.stringify(users[index])

        );


        // Save email for role selection

        localStorage.setItem(
            "pendingUserEmail",
            users[index].useremail
        );


        // Remove potentially stale role

        localStorage.removeItem(
            "userRole"
        );


        alert(
            "Please select your account role first."
        );


        window.location.href =
            "role-selection.html";


        return;

    }


    // ==================================================
    // SAVE UPDATED USERS
    // ==================================================

    localStorage.setItem(
        "user",
        JSON.stringify(users)
    );


    // ==================================================
    // SAVE CURRENT USER
    // ==================================================

    localStorage.setItem(

        "current_user",

        JSON.stringify(users[index])

    );


    // ==================================================
    // SAVE USER ROLE
    // ==================================================

    localStorage.setItem(
        "userRole",
        userRole
    );


    // ==================================================
    // SAVE PROFILE IMAGE
    // ==================================================

    localStorage.setItem(

        "profileImage",

        googlePicture

    );


    // ==================================================
    // LOGIN STATUS
    // ==================================================

    localStorage.setItem(
        "isLoggedIn",
        "true"
    );


    // ==================================================
    // LOGIN SUCCESS
    // ==================================================

    alert("Login Successful");


    // ==================================================
    // REDIRECT BASED ON ROLE
    // ==================================================

    redirectByRole(userRole);

}



// ======================================================
// JWT DECODER
// ======================================================

function parseJwt(token) {

    try {

        const base64 =
            token
                .split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        return JSON.parse(

            decodeURIComponent(

                atob(base64)
                    .split("")
                    .map(c =>

                        "%" +

                        (
                            "00" +
                            c.charCodeAt(0)
                                .toString(16)
                        )
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

    // ==================================================
    // CHECK GOOGLE LIBRARY
    // ==================================================

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

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin,

        auto_select:
            false,

        cancel_on_tap_outside:
            true

    });


    // ==================================================
    // RENDER GOOGLE BUTTON
    // ==================================================

    google.accounts.id.renderButton(

        document.getElementById("google-btn"),

        {

            type:
                "standard",

            theme:
                "outline",

            size:
                "large",

            text:
                "continue_with",

            shape:
                "rectangular",

            width:
                350

        }

    );

};
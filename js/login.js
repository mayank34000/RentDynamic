let handleLogin = () => {

    let email = document.getElementById("email");
    let password = document.getElementById("password");


    // Get users from Local Storage
    let users = JSON.parse(localStorage.getItem("user"));


    // Check if users exist
    if (!users) {
        alert("No registered users found!");
        return;
    }


    // Find user by email
    let verified_user = users.find(
        (el) => el.useremail === email.value.trim()
    );

    console.log(verified_user);


    // Verify email and password
    if (verified_user && verified_user.userpassword === password.value) {

        // Save currently logged-in user
        localStorage.setItem("current_user",JSON.stringify(verified_user));

        // Save login status
        localStorage.setItem("isLoggedIn", "true");


        alert("Login Successful");


        window.location.href = "index.html";

        window.location.href = "booking.html";


    } else {

        alert("Invalid Credentials");

    }
};
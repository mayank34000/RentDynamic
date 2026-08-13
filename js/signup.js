let handleSubmit = () => {

<<<<<<< HEAD
=======
    // Get form values
>>>>>>> 892dfb5b9408229c9c2eba33aebaee504fc94436
    let name = document.getElementById("username");
    let email = document.getElementById("email");
    let phone = document.getElementById("phone");
    let password = document.getElementById("password");
    let confirm_password = document.getElementById("confirm_password");
    let terms = document.getElementById("terms");



<<<<<<< HEAD
=======
    // USERNAME VALIDATION

>>>>>>> 892dfb5b9408229c9c2eba33aebaee504fc94436

    if (name.value.trim().length < 3) {
        alert("Username must be at least 3 characters long!");
        return;
    }

    if (name.value.trim().length > 30) {
        alert("Username cannot be more than 30 characters!");
        return;
    }


    // EMAIL VALIDATION


    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value)) {
        alert("Please enter a valid email address!");
        return;
    }

// PHONE VALIDATION

    let phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone.value)) {
<<<<<<< HEAD
        alert("Phone number must contain exactly 10 digits!");
=======
        alert("Please enter a valid phone number!");
>>>>>>> 892dfb5b9408229c9c2eba33aebaee504fc94436
        return;
    }


<<<<<<< HEAD
=======

>>>>>>> 892dfb5b9408229c9c2eba33aebaee504fc94436
    // PASSWORD

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
    let specialCharacter = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/;


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

    if (password.value !== confirm_password.value) {
        alert("Passwords do not match!");
        return;
    }

// TERMS & CONDITIONS

    if (!terms.checked) {
        alert("Please accept the Terms & Conditions!");
        return;
    }

    let user = {
        username: name.value.trim(),
        useremail: email.value.trim(),
        userphone: phone.value.trim(),
        userpassword: password.value,
        role: 'customer'
    };



    let get_user = localStorage.getItem("user");

    console.log(get_user);


    // Create empty array
    let user_array = [];


    // If users already exist
    if (get_user) {
        user_array = JSON.parse(get_user);
    }


    let isPresent = user_array.some(
        user => user.useremail.toLowerCase() === email.value.trim().toLowerCase()
    );


    if (isPresent) {
        alert("User already exists!");
        return;
    }



    user_array.push(user);


    localStorage.setItem(
        "user",
        JSON.stringify(user_array)
    );



    alert("Account created successfully!");

<<<<<<< HEAD
    window.location.href = "bookings.html";
=======
    window.location.href = "login.html";
>>>>>>> 892dfb5b9408229c9c2eba33aebaee504fc94436

};
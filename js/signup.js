// ============================
// NORMAL SIGNUP
// ============================

const GOOGLE_CLIENT_ID = "354423086263-a5p6thqr2udjam895sotpa701180cpp3.apps.googleusercontent.com";

let handleSubmit = () => {
  const name = document.getElementById("username");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm_password");
  const terms = document.getElementById("terms");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10}$/;
  const upperCase = /[A-Z]/;
  const lowerCase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/;

  if (name.value.trim().length < 3) return alert("Username must be at least 3 characters long!");
  if (name.value.trim().length > 30) return alert("Username cannot be more than 30 characters!");
  if (!emailPattern.test(email.value.trim())) return alert("Please enter a valid email address!");
  if (!phonePattern.test(phone.value.trim())) return alert("Please enter a valid phone number!");
  if (password.value.length < 8) return alert("Password must be at least 8 characters long!");
  if (password.value.length > 50) return alert("Password cannot be more than 50 characters!");
  if (!upperCase.test(password.value)) return alert("Password must contain at least one uppercase letter!");
  if (!lowerCase.test(password.value)) return alert("Password must contain at least one lowercase letter!");
  if (!number.test(password.value)) return alert("Password must contain at least one number!");
  if (!specialChar.test(password.value)) return alert("Password must contain at least one special character!");
  if (password.value !== confirmPassword.value) return alert("Passwords do not match!");
  if (!terms.checked) return alert("Please accept the Terms & Conditions!");

  const user = {
    username: name.value.trim(),
    useremail: email.value.trim(),
    userphone: phone.value.trim(),
    userpassword: password.value
  };

  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("user")) || [];
    if (!Array.isArray(users)) users = [];
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    users = [];
  }

  const isPresent = users.some(
    (u) => u.useremail?.toLowerCase() === user.useremail.toLowerCase()
  );
  if (isPresent) return alert("User already exists!");

  users.push(user);
  localStorage.setItem("user", JSON.stringify(users));

  alert("Account created successfully!");
  window.location.href = "login.html";
};


// ============================
// GOOGLE SIGN-IN
// ============================

function handleGoogleLogin(response) {
  const payload = parseJwt(response.credential);
  if (!payload) return alert("Google login failed!");

  const googleUser = {
    username: payload.name,
    useremail: payload.email,
    userphone: "",
    userpassword: "",
    googleId: payload.sub,
    profileImage: payload.picture || "assets/google.png",
    loginMethod: "google"
  };

  let users = JSON.parse(localStorage.getItem("user")) || [];
  const index = users.findIndex(
    (u) => u.useremail?.toLowerCase() === googleUser.useremail.toLowerCase()
  );

  if (index !== -1) {
    googleUser.userphone = users[index].userphone || "";
    users[index] = { ...users[index], ...googleUser };
  } else {
    users.push(googleUser);
  }

  localStorage.setItem("user", JSON.stringify(users));

  const finalUser = index !== -1 ? users[index] : googleUser;
  localStorage.setItem("current_user", JSON.stringify(finalUser));
  localStorage.setItem("profileImage", finalUser.profileImage || "assets/google.png");
  localStorage.setItem("isLoggedIn", "true");

  window.location.href = "index.html";
}

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  } catch (error) {
    console.error("JWT error:", error);
    return null;
  }
}

window.onload = function () {
  if (typeof google === "undefined" || !google.accounts?.id) {
    console.error("Google Identity Services not loaded.");
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleLogin,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  google.accounts.id.renderButton(document.getElementById("google-btn"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    width: 350
  });
};
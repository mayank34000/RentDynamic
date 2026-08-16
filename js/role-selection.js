// ======================================================
// ROLE SELECTION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const roleCards =
        document.querySelectorAll(".role-card");


    // ==================================================
    // ADD CLICK EVENTS TO ROLE CARDS
    // ==================================================

    roleCards.forEach(card => {

        const button =
            card.querySelector(".role-button");


        // ------------------------------------------------
        // BUTTON CLICK
        // ------------------------------------------------

        if (button) {

            button.addEventListener("click", (event) => {

                event.stopPropagation();

                selectRole(card);

            });

        }


        // ------------------------------------------------
        // CARD CLICK
        // ------------------------------------------------

        card.addEventListener("click", () => {

            selectRole(card);

        });

    });


    // ==================================================
    // SELECT ROLE
    // ==================================================

    function selectRole(selectedCard) {

        const role =
            selectedCard.dataset.role;


        // ==================================================
        // VALIDATE ROLE
        // ==================================================

        if (
            role !== "customer" &&
            role !== "renter"
        ) {

            console.error(
                "Invalid role selected:",
                role
            );

            return;
        }


        // ==================================================
        // REMOVE PREVIOUS SELECTION
        // ==================================================

        roleCards.forEach(card => {

            card.classList.remove("selected");

        });


        // ==================================================
        // HIGHLIGHT SELECTED CARD
        // ==================================================

        selectedCard.classList.add("selected");


        // ==================================================
        // SAVE ROLE IN LOCAL STORAGE
        // ==================================================

        localStorage.setItem(
            "userRole",
            role
        );


        // ==================================================
        // GET USER CREATED DURING SIGNUP
        // ==================================================

        const pendingUserEmail =
            localStorage.getItem("pendingUserEmail");


        // ==================================================
        // GET ALL USERS
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
        // UPDATE USER ROLE
        // ==================================================

        if (pendingUserEmail) {

            const userIndex =
                users.findIndex(

                    user =>

                        user.useremail &&

                        user.useremail.toLowerCase() ===
                        pendingUserEmail.toLowerCase()

                );


            // ------------------------------------------------
            // USER FOUND
            // ------------------------------------------------

            if (userIndex !== -1) {

                users[userIndex].role = role;


                // Save updated users

                localStorage.setItem(
                    "user",
                    JSON.stringify(users)
                );


                console.log(
                    "User role updated:",
                    role
                );

            }


            // ------------------------------------------------
            // USER NOT FOUND
            // ------------------------------------------------

            else {

                console.error(
                    "Pending user was not found:",
                    pendingUserEmail
                );

            }

        }


        // ==================================================
        // REMOVE PENDING USER
        // ==================================================
        //
        // We don't need this after the role has been
        // successfully selected.
        // ==================================================

        localStorage.removeItem(
            "pendingUserEmail"
        );


        // ==================================================
        // CONTINUE TO LOGIN
        // ==================================================

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 350);

    }

});
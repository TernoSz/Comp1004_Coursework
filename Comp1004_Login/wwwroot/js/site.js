// Load the test database, created with purposes of simulating the real-world database
// and applying the concept in this Login system during tests.
// Important: it is yet insecure when compared to real databases and should not be used
// in deployment.
let user_db;
fetch("./js/users.json").then((response) => response.json()).then((data) => user_db = data);


// The "flare" effect following the cursour
// The space in which the effect will exist by defining the element
const pageContainer = document.querySelector(".login_page_container");

// Event specified on which the effect will be triggered
window.addEventListener("mousemove", function showxy(e) {
    // Fetch the co-ordinates of the cursor
    let x = e.clientX;
    let y = e.clientY;
    // Create a template of an element that will be added to the page with the effect
    // set the class and position of the element too
    let div = document.createElement("div");
    div.classList.add("login_dot");
    pageContainer.appendChild(div);

    div.style.setProperty("top", `${y}px`);
    div.style.setProperty("left", `${x}px`);

    // Remove the element after 0.7 seconds
    this.setTimeout(() => {
        pageContainer.removeChild(div);
    }, 700)
})

// Specified elements that will have the parallax effect
const loginContainer = document.querySelector(".parallax1");
const signupContainer = document.querySelector(".parallax2")
const parallaxEffect = function (element) {
    const x = event.clientX;
    const y = event.clientY;
    // Fetch the height and width of the document
    const docWidth = document.documentElement.clientWidth;
    const docHeight = document.documentElement.clientHeight;

    // Apply the transformations to the specified element and change its position in relation to the position of the cursor
    element.style.transform = `translate(50%, 10%) rotateY(${((x - docWidth / 2) / 60)}deg) rotateX(${((y - docHeight / 2) / 60) * (-1)}deg)`;
    element.style.top = `${(y - docHeight / 2) / 30}px`;
    element.style.left = `${(x - docWidth / 2) / 30}px`;

} 

window.addEventListener("mousemove", () => {
    parallaxEffect(loginContainer);
    parallaxEffect(signupContainer);
})

// Segment for the transitions between the sign up continar and login container.
// The whole function is based on the ability to switch between element classes
// that have animations attatched to them in css while simultaneously checking if
// the state allows for the transition to happen.
const redirectionSwitch = document.querySelector(".login_redirection_switch");
let flag = 0;
let inTransition = false;

const transitionPages = function () {
    // Check if the element is in transition or not (prevent any issues
    // related with the user "spamming" the signup/login buttons repeatedly)
    if (!inTransition) {
        // Flag check, essentially checking what is being shown to the user, and
        // when clicked the transition is headin the other direction to show
        // the other part/container.
        if (flag) {
            redirectionSwitch.classList.add("login_redirection_animate_left_right");
            const activeSwitch = document.querySelector(".login_active_switch");
            const inactiveSwitch = document.querySelector(".login_redirection_login");
            activeSwitch.classList.remove("login_active_switch");
            inactiveSwitch.classList.add("login_active_switch");

            const signupContainer = document.querySelector(".login_forms_container");
            signupContainer.classList.add("login_page_transition_left_right");

            inTransition = true;
            setTimeout(function () {
                redirectionSwitch.style.right = "1.25%";
                redirectionSwitch.classList.remove("login_redirection_animate_left_right");
                signupContainer.style.right = "0%";
                signupContainer.classList.remove("login_page_transition_left_right");
                inTransition = false;
            }, 1100)
            flag = 0;
        } else if (!flag) {
            redirectionSwitch.classList.add("login_redirection_animate_right_left");
            const activeSwitch = document.querySelector(".login_active_switch");
            const inactiveSwitch = document.querySelector(".login_redirection_register");

            const signupContainer = document.querySelector(".login_forms_container");
            signupContainer.classList.add("login_page_transition_right_left");

            activeSwitch.classList.remove("login_active_switch");
            inactiveSwitch.classList.add("login_active_switch");

            inTransition = true;
            setTimeout(function () {
                redirectionSwitch.style.right = "13.75%";
                redirectionSwitch.classList.remove("login_redirection_animate_right_left");
                signupContainer.style.right = "-125vw";
                signupContainer.classList.remove("login_page_transition_right_left");
                inTransition = false;
            }, 1100)
            flag = 1;
        }}
}

const loginPageButton = document.querySelector(".login_redirection_register");
loginPageButton.addEventListener("click", () => {
    if (!loginPageButton.classList.contains("login_active_switch")) {
        transitionPages();
    }
});


const signupPageButton = document.querySelector(".login_redirection_login");
signupPageButton.addEventListener("click", () => {
    if (!signupPageButton.classList.contains("login_active_switch")) {
        transitionPages();
    }
});

// Slide up transition giving the user access to the rest of the SPA
const slideUpTransition = () => document.querySelector(".login_page_container").classList.add("login_slideUp");


// Segment responsible for gathering inputs and processing them when the user
// is trying to log in, including possible errors.

const loginFailedMessage = function () {
    return alert("Email not found or incorrect password given! Please check your creditentials again.");
}

const inputTable = [];
const user_choice = ["signup", "login"];
const currentUser = [];

const processInputs = function (choice) {
    // Registration
    if (choice == user_choice[0]) {
        const email = document.querySelector("#signup_email");
        const passwd = document.querySelector("#signup_password");
        const passwd_repeat = document.querySelector("#signup_password_repeat");
        inputTable[0] = email.value;
        inputTable[1] = passwd.value;
        inputTable[2] = passwd_repeat.value;

        // Local variable to verify if the requirements for the account creation are met before adding to the
        // database.
        let requirements_check = true;

        if (inputTable[1] != inputTable[2]) {
            requirements_check = false;
            return alert("Passwords do not match!");
        }

        if (inputTable[1].length < 8) {
            requirements_check = false;
            return alert("Password length too short, please use 8 characters or more.");
        }
            

        user_db.users.forEach(user => {
            if (user.email == inputTable[0]) {
                requirements_check = false;
                return alert("This Email has already been used! Please log in!");
            }
                
        });

        if (requirements_check) {
            const new_user = {
                email: inputTable[0],
                password: inputTable[1]
            };

            user_db.users.push(new_user);

            return alert("Registration Successful! Please now log in!")
        }
        

    } // Login
    else if (choice == user_choice[1]) {
        const email = document.querySelector("#login_email");
        const passwd = document.querySelector("#login_password");
        inputTable[0] = email.value;
        inputTable[1] = passwd.value;
        // Routine to check if the input email exists in the database
        let foundEmail = false;
        let confirmedEmail = null;
        for (let i = 0; i < user_db.users.length; i++) {
            if (user_db.users[i].email == inputTable[0]) {
                foundEmail = true;
                confirmedEmail = i;
            }
        }
        if (!foundEmail)
            return loginFailedMessage();

        if (user_db.users[confirmedEmail].password == inputTable[1]) {
            currentUser[0] = confirmedEmail;
            currentUser[1] = inputTable[0];
            return slideUpTransition();
        } else 
            return loginFailedMessage();
    }
}

document.querySelector(".login_button").addEventListener("click", () => processInputs(user_choice[1]));
document.querySelector(".signup_button").addEventListener("click", () => processInputs(user_choice[0]));
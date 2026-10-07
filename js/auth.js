const USERS_KEY = "jaapNewsUsers";
const CURRENT_USER_KEY = "jaapNewsCurrentUser";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const setCurrentUser = (user) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role
    }));
};

const showAuthMessage = (message) => {
    const messageElement = document.querySelector("[data-auth-message]");

    if (messageElement) {
        messageElement.textContent = message;
    }
};

const getFormUser = () => {
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;
    const name = email.split("@")[0] || "Gebruiker";

    return { email, password, name, role: "reader" };
};

const goHome = () => {
    window.location.href = "../index.html";
};

document.querySelector("[data-login-form]").addEventListener("submit", (event) => {
    event.preventDefault();

    const formUser = getFormUser();
    const user = getUsers().find((item) => item.email === formUser.email);

    if (!formUser.email || !formUser.password) {
        showAuthMessage("Vul uw e-mailadres en wachtwoord in.");
        return;
    }

    if (!user || user.password !== formUser.password) {
        showAuthMessage("Dit account bestaat niet of het wachtwoord klopt niet.");
        return;
    }

    setCurrentUser(user);
    goHome();
});

document.querySelector("[data-register]").addEventListener("click", () => {
    const formUser = getFormUser();

    if (!formUser.email || !formUser.password) {
        showAuthMessage("Vul uw e-mailadres en wachtwoord in om te registreren.");
        return;
    }

    const users = getUsers();

    if (users.some((user) => user.email === formUser.email)) {
        showAuthMessage("Er bestaat al een account met dit e-mailadres.");
        return;
    }

    users.push(formUser);
    saveUsers(users);
    setCurrentUser(formUser);
    goHome();
});

document.querySelector("[data-journalist-login]").addEventListener("click", (event) => {
    event.preventDefault();

    const journalist = {
        email: "journalist@jaapnews.nl",
        name: "Journalist",
        role: "journalist"
    };

    setCurrentUser(journalist);
    goHome();
});

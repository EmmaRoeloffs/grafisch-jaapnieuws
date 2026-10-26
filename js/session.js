// These checks control the static demo. Production authorization belongs on a server.
window.JaapAuth = (() => {
    const journalistEmail = "journalist@jaapnieuws.com";
    const sessionVersion = 1;

    const getCurrentUser = () => {
        try {
            const session = JSON.parse(localStorage.getItem("jaapNewsCurrentUser") || "null");
            const users = JSON.parse(localStorage.getItem("jaapNewsUsers") || "[]");

            // Sessions from the old password-free journalist shortcut are invalid.
            if (session?.sessionVersion !== sessionVersion || !Array.isArray(users)) {
                return null;
            }

            const user = users.find((item) => item.email === session.email);
            if (!user) {
                return null;
            }

            return {
                email: user.email,
                name: user.name,
                role: user.email === journalistEmail && user.role === "journalist" ? "journalist" : "reader"
            };
        } catch {
            return null;
        }
    };

    const requireJournalist = () => {
        const user = getCurrentUser();
        if (user?.role === "journalist") {
            return user;
        }

        window.location.replace(user ? "../index.html" : "login.html");
        return null;
    };

    return { journalistEmail, sessionVersion, getCurrentUser, requireJournalist };
})();

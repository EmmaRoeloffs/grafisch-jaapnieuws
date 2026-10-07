const isPagesPath = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
const rootPath = isPagesPath ? ".." : ".";
const params = new URLSearchParams(window.location.search);
const getCurrentUser = () => JSON.parse(localStorage.getItem("jaapNewsCurrentUser") || "null");
const currentUser = getCurrentUser();
const isJournalist = currentUser?.role === "journalist" || params.get("role") === "journalist";

const withRole = (href) => {
    if (!isJournalist) {
        return href;
    }

    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}role=journalist`;
};

class SiteHeader extends HTMLElement {
    connectedCallback() {
        const createLink = this.hasAttribute("show-create")
            ? `<a href="${withRole(`${rootPath}/pages/create-article.html`)}" class="create-btn ${isJournalist ? "" : "hidden"}" aria-label="Nieuw artikel maken">+</a>`
            : "";
        const accountLabel = currentUser || isJournalist ? "Log uit" : "Log in";
        const accountHref = currentUser || isJournalist ? `${rootPath}/index.html` : `${rootPath}/pages/login.html`;
        const accountAttributes = currentUser || isJournalist ? `data-logout` : "";

        this.innerHTML = `
            <header class="header">
                <div class="header-kicker site-container">
                    <span>JaapNews</span>
                    <span>Vandaag in Nederland</span>
                </div>

                <div class="header-inner site-container">
                    <div class="brand-wrap">
                        <a href="${withRole(`${rootPath}/index.html`)}" class="logo-link" aria-label="Ga naar de homepage">
                            <img src="${rootPath}/images/LOGO.png" alt="JaapNews logo" class="logo">
                        </a>

                        <div class="brand-copy">
                            <span class="brand-name"><span class="jaap">Jaap</span><span class="news">News</span></span>
                            <span class="brand-tagline">Snel, dichtbij en duidelijk.</span>
                        </div>
                    </div>

                    <nav class="header-right" aria-label="Hoofdnavigatie">
                        ${createLink}
                        <a href="${withRole(`${rootPath}/pages/search.html`)}" class="search-btn" aria-label="Zoeken">
                            <img src="${rootPath}/images/search.png" alt="" class="search-icon">
                        </a>
                        <a href="${accountHref}" class="logout" ${accountAttributes}>${accountLabel}</a>
                    </nav>
                </div>

                <nav class="category-nav site-container" aria-label="Categorieen">
                    <a href="${withRole(`${rootPath}/index.html`)}">Laatste nieuws</a>
                    <a href="${withRole(`${rootPath}/pages/search.html?q=Regio`)}">Regio</a>
                    <a href="${withRole(`${rootPath}/pages/search.html?q=Nieuws`)}">Nieuws</a>
                </nav>
            </header>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer">
                <div class="footer-inner site-container">
                    <div>
                        <a href="${withRole(`${rootPath}/index.html`)}" class="footer-brand" aria-label="JaapNews homepage">
                            <span class="jaap">Jaap</span><span class="news">News</span>
                        </a>
                        <p>De nieuwsprovider voor korte updates, lokale verhalen en het belangrijkste nieuws van de dag.</p>
                    </div>

                    <nav class="footer-links" aria-label="Footer navigatie">
                        <a href="${withRole(`${rootPath}/index.html`)}">Home</a>
                        <a href="${withRole(`${rootPath}/pages/search.html`)}">Zoeken</a>
                        <a href="${withRole(`${rootPath}/pages/account.html`)}">Account</a>
                    </nav>
                </div>
            </footer>
        `;
    }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);

document.addEventListener("click", (event) => {
    const logout = event.target.closest("[data-logout]");

    if (!logout) {
        return;
    }

    event.preventDefault();
    localStorage.removeItem("jaapNewsCurrentUser");
    window.location.href = `${rootPath}/index.html`;
});

const installImageFallbacks = () => {
    const fallbackTargets = document.querySelectorAll(".news-image, .article-image, .result-card img, .account-article img");

    fallbackTargets.forEach((image) => {
        const showFallback = () => {
            const fallback = document.createElement("div");
            fallback.className = `${image.className} image-fallback`;
            fallback.setAttribute("role", "img");
            fallback.setAttribute("aria-label", image.alt || "Afbeelding niet beschikbaar");
            fallback.textContent = image.alt || "Afbeelding niet beschikbaar";
            image.replaceWith(fallback);
        };

        image.addEventListener("error", showFallback, { once: true });

        if (image.complete && image.naturalWidth === 0) {
            showFallback();
        }
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installImageFallbacks);
} else {
    installImageFallbacks();
}

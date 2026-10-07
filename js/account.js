const ACCOUNT_USER_KEY = "jaapNewsCurrentUser";
const ACCOUNT_ARTICLES_KEY = "jaapNewsArticles";
const ACCOUNT_COMMENTS_KEY = "jaapNewsComments";

const getAccountUser = () => JSON.parse(localStorage.getItem(ACCOUNT_USER_KEY) || "null");
const getAccountArticles = () => JSON.parse(localStorage.getItem(ACCOUNT_ARTICLES_KEY) || "[]");
const saveAccountArticles = (articles) => localStorage.setItem(ACCOUNT_ARTICLES_KEY, JSON.stringify(articles));
const getAccountComments = () => JSON.parse(localStorage.getItem(ACCOUNT_COMMENTS_KEY) || "[]");
const saveAccountComments = (comments) => localStorage.setItem(ACCOUNT_COMMENTS_KEY, JSON.stringify(comments));

const escapeAccountHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const accountImagePath = (path) => path.startsWith("data:") ? path : `../${path}`;

const ownsArticle = (article, user) => (
    article.authorEmail === user.email ||
    (!article.authorEmail && article.author === user.name) ||
    (!article.authorEmail && article.author === user.email)
);

const articleCard = (article) => `
    <article class="account-article" data-account-article="${escapeAccountHtml(article.id)}">
        <img src="${accountImagePath(article.image)}" alt="${escapeAccountHtml(article.imageAlt)}">
        <div class="account-article-copy">
            <p class="story-meta">${escapeAccountHtml(article.category)} &middot; ${escapeAccountHtml(article.label)}</p>
            <h2>${escapeAccountHtml(article.title)}</h2>
            <p>${escapeAccountHtml(article.summary)}</p>
            <div class="account-article-actions">
                <a href="article.html?id=${encodeURIComponent(article.id)}" class="btn btn-secondary">Bekijk</a>
                <button type="button" class="btn btn-danger" data-delete-article="${escapeAccountHtml(article.id)}">Verwijder</button>
            </div>
        </div>
    </article>
`;

const renderLoggedOut = (container) => {
    container.innerHTML = `
        <section class="account-card">
            <h2>Niet ingelogd</h2>
            <p>Log in om uw accountgegevens te bekijken.</p>
            <a href="login.html" class="btn btn-primary account-action">Log in</a>
        </section>
    `;
};

const renderAccount = () => {
    const container = document.querySelector("[data-account-content]");
    const user = getAccountUser();

    if (!user) {
        renderLoggedOut(container);
        return;
    }

    const localArticles = getAccountArticles();
    const ownArticles = localArticles.filter((article) => ownsArticle(article, user));
    const roleLabel = user.role === "journalist" ? "Journalist" : "Lezer";

    container.innerHTML = `
        <section class="account-grid">
            <article class="account-card">
                <span class="eyebrow">Profiel</span>
                <h2>${escapeAccountHtml(user.name || "Gebruiker")}</h2>
                <dl class="account-details">
                    <div>
                        <dt>E-mailadres</dt>
                        <dd>${escapeAccountHtml(user.email)}</dd>
                    </div>
                    <div>
                        <dt>Rol</dt>
                        <dd>${roleLabel}</dd>
                    </div>
                </dl>
                <button type="button" class="btn btn-secondary account-action" data-account-logout>Log uit</button>
            </article>

            ${user.role === "journalist" ? `
                <section class="account-card account-articles" aria-labelledby="my-articles-title">
                    <div class="account-card-heading">
                        <span class="eyebrow">Redactie</span>
                        <h2 id="my-articles-title">Mijn artikelen</h2>
                    </div>
                    ${ownArticles.length
                        ? ownArticles.map(articleCard).join("")
                        : `<p class="empty-results">U heeft nog geen artikelen gemaakt.</p>`}
                </section>
            ` : `
                <section class="account-card">
                    <span class="eyebrow">Reacties</span>
                    <h2>Lezersaccount</h2>
                    <p>Met dit account kunt u reacties plaatsen bij artikelen.</p>
                </section>
            `}
        </section>
    `;

    if (typeof installImageFallbacks === "function") {
        installImageFallbacks();
    }
};

document.addEventListener("click", (event) => {
    const logout = event.target.closest("[data-account-logout]");
    const deleteButton = event.target.closest("[data-delete-article]");

    if (logout) {
        localStorage.removeItem(ACCOUNT_USER_KEY);
        window.location.href = "login.html";
        return;
    }

    if (!deleteButton) {
        return;
    }

    const articleId = deleteButton.dataset.deleteArticle;
    const remainingArticles = getAccountArticles().filter((article) => article.id !== articleId);
    const remainingComments = getAccountComments().filter((comment) => comment.articleId !== articleId);

    saveAccountArticles(remainingArticles);
    saveAccountComments(remainingComments);
    renderAccount();
});

renderAccount();

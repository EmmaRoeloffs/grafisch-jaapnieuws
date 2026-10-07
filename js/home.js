const homeParams = new URLSearchParams(window.location.search);
const homeIsJournalist = homeParams.get("role") === "journalist";

const homePath = (path) => `./${path}`;

const keepHomeRole = (url) => {
    if (!homeIsJournalist) {
        return url;
    }

    return `${url}${url.includes("?") ? "&" : "?"}role=journalist`;
};

const articleLink = (article) => keepHomeRole(`pages/article.html?id=${encodeURIComponent(article.id)}`);

const renderCard = (article, isLead = false) => `
    <a href="${articleLink(article)}" class="news-card${isLead ? " lead-story" : ""}">
        <img src="${homePath(article.image)}" alt="${article.imageAlt}" class="news-image">
        <div class="news-card-body">
            <p class="story-meta">${article.category} &middot; ${article.label}</p>
            <h2>${article.title}</h2>
            <p>${article.summary}</p>
        </div>
    </a>
`;

const renderHome = (articles) => {
    const feed = document.querySelector("[data-home-feed]");
    const trending = document.querySelector("[data-trending-list]");

    const [leadArticle, ...moreArticles] = articles;

    if (!leadArticle) {
        feed.innerHTML = `<p class="empty-results">Geen artikelen gevonden.</p>`;
        trending.innerHTML = "";
        return;
    }

    feed.innerHTML = `
        ${renderCard(leadArticle, true)}

        <section class="news-list" aria-label="Meer nieuws">
            ${moreArticles.map((article) => renderCard(article)).join("")}
        </section>
    `;

    trending.innerHTML = articles.map((article) => `
        <li><a href="${articleLink(article)}">${article.shortTitle || article.title}</a></li>
    `).join("");

    if (typeof installImageFallbacks === "function") {
        installImageFallbacks();
    }
};

fetch("data/articles.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Artikelen konden niet worden geladen.");
        }

        return response.json();
    })
    .then(renderHome)
    .catch(() => {
        const feed = document.querySelector("[data-home-feed]");

        feed.innerHTML = `<p class="empty-results">Start de site via een lokale webserver zodat de artikelen geladen kunnen worden.</p>`;
    });

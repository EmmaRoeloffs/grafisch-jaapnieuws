const searchRootPath = window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? ".." : ".";
const searchParams = new URLSearchParams(window.location.search);
const initialQuery = searchParams.get("q") || "";
const searchIsJournalist = searchParams.get("role") === "journalist";

const searchPath = (path) => `${searchRootPath}/${path}`;

const keepRole = (url) => {
    if (!searchIsJournalist) {
        return url;
    }

    return `${url}${url.includes("?") ? "&" : "?"}role=journalist`;
};

const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const articleUrl = (article) => keepRole(`article.html?id=${encodeURIComponent(article.id)}`);

const matchesQuery = (article, query) => {
    if (!query) {
        return true;
    }

    const searchableText = [
        article.title,
        article.shortTitle,
        article.deck,
        article.summary,
        article.category,
        article.label,
        article.tags.join(" "),
        article.body.join(" ")
    ].join(" ");

    return normalize(searchableText).includes(normalize(query));
};

const renderResults = (articles, query) => {
    const title = document.querySelector("[data-search-heading]");
    const titlePrefix = document.querySelector("[data-search-prefix]");
    const resultsTitle = document.querySelector("[data-search-title]");
    const results = document.querySelector("[data-search-results]");
    const popular = document.querySelector("[data-popular-searches]");

    const shownArticles = articles.filter((article) => matchesQuery(article, query));
    const displayQuery = query || "Alle artikelen";

    title.textContent = displayQuery;
    titlePrefix.textContent = query ? "Zoekresultaten" : "Zoeken";
    resultsTitle.innerHTML = query
        ? `Resultaten voor: <strong>${displayQuery}</strong>`
        : `<strong>Alle artikelen</strong>`;

    results.innerHTML = shownArticles.length
        ? shownArticles.map((article) => `
            <a href="${articleUrl(article)}" class="result-card">
                <img src="${searchPath(article.image)}" alt="${article.imageAlt}">
                <div>
                    <p class="story-meta">${article.category}</p>
                    <h2>${article.title}</h2>
                </div>
            </a>
        `).join("")
        : `<p class="empty-results">Geen artikelen gevonden.</p>`;

    popular.hidden = Boolean(query);

    if (typeof installImageFallbacks === "function") {
        installImageFallbacks();
    }
};

const setupSearchForm = (articles) => {
    const form = document.querySelector("[data-search-form]");
    const input = document.querySelector("[data-search-input]");

    input.value = initialQuery;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = input.value.trim();
        const nextUrl = query
            ? `search.html?q=${encodeURIComponent(query)}`
            : "search.html";

        window.location.href = keepRole(nextUrl);
    });

    renderResults(articles, initialQuery.trim());
};

fetch(searchPath("data/articles.json"))
    .then((response) => {
        if (!response.ok) {
            throw new Error("Artikelen konden niet worden geladen.");
        }

        return response.json();
    })
    .then(setupSearchForm)
    .catch(() => {
        const results = document.querySelector("[data-search-results]");
        results.innerHTML = `<p class="empty-results">Start de site via een lokale webserver zodat de zoekdata geladen kan worden.</p>`;
    });

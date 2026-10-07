const articleRootPath = window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? ".." : ".";
const articleParams = new URLSearchParams(window.location.search);
const articleId = articleParams.get("id");
const LOCAL_COMMENTS_KEY = "jaapNewsComments";
const LOCAL_ARTICLES_KEY = "jaapNewsArticles";
const CURRENT_USER_KEY = "jaapNewsCurrentUser";

const articlePath = (path) => `${articleRootPath}/${path}`;
const getLocalComments = () => JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "[]");
const getLocalArticles = () => JSON.parse(localStorage.getItem(LOCAL_ARTICLES_KEY) || "[]");
const saveLocalComments = (comments) => localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
const getArticleUser = () => JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
const articleImagePath = (path) => path.startsWith("data:") ? path : articlePath(path);

const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const setText = (selector, text) => {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = text;
    }
};

const renderArticleError = (message) => {
    const container = document.querySelector("[data-article]");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <article class="article-content">
            <header class="article-header">
                <p class="story-meta">JaapNews</p>
                <h1>Artikel niet gevonden</h1>
                <p class="article-deck">${message}</p>
            </header>
        </article>
    `;
};

const commentTemplate = (comment) => `
    <div class="comment">
        <h3>${escapeHtml(comment.author)}</h3>
        <p>${escapeHtml(comment.text)}</p>
    </div>
`;

const renderComments = (article, comments) => {
    const list = document.querySelector("[data-comments-list]");
    const articleComments = comments.filter((comment) => comment.articleId === article.id);

    list.innerHTML = articleComments.length
        ? articleComments.map(commentTemplate).join("")
        : `<div class="comment"><p>Nog geen reacties.</p></div>`;
};

const setupCommentForm = (article, jsonComments) => {
    const form = document.querySelector("[data-comment-form]");
    const input = document.querySelector("[data-comment-input]");
    const submit = document.querySelector("[data-comment-submit]");
    const message = document.querySelector("[data-comment-message]");
    const user = getArticleUser();

    if (!user) {
        input.disabled = true;
        submit.disabled = true;
        input.placeholder = "Log in om te reageren";
        message.innerHTML = `<a href="login.html">Log in</a> om een reactie te plaatsen.`;
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const text = input.value.trim();

        if (!text) {
            message.textContent = "Schrijf eerst een reactie.";
            return;
        }

        const localComments = getLocalComments();
        const newComment = {
            id: `local-${Date.now()}`,
            articleId: article.id,
            author: user.name || user.email,
            text,
            createdAt: new Date().toISOString()
        };

        localComments.push(newComment);
        saveLocalComments(localComments);
        input.value = "";
        message.textContent = "Reactie geplaatst.";
        renderComments(article, jsonComments.concat(localComments));
    });
};

const renderArticle = (article, jsonComments) => {
    document.title = `JaapNews - ${article.shortTitle || article.title}`;
    setText("[data-page-title]", article.title);

    const container = document.querySelector("[data-article]");
    const user = getArticleUser();

    container.innerHTML = `
        <article class="article-content">
            <header class="article-header">
                <p class="story-meta">${escapeHtml(article.category)} &middot; ${escapeHtml(article.label)}</p>
                <h1>${escapeHtml(article.title)}</h1>
                <p class="article-deck">${escapeHtml(article.deck)}</p>
            </header>

            <img src="${articleImagePath(article.image)}" alt="${escapeHtml(article.imageAlt)}" class="article-image">

            <div class="article-body">
                ${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
            </div>
        </article>

        <section class="comments" aria-labelledby="comments-title">
            <h2 id="comments-title">Reacties</h2>

            <div data-comments-list></div>

            <form class="comment-field" data-comment-form>
                <span class="visually-hidden">Voeg reactie toe</span>
                <input name="comment" type="text" placeholder="${user ? "Voeg reactie toe" : "Log in om te reageren"}" data-comment-input>
                <button class="btn btn-primary comment-submit" type="submit" data-comment-submit>Plaats</button>
                <p class="comment-message" data-comment-message aria-live="polite"></p>
            </form>
        </section>

        <img src="${articlePath("images/AD-Article.png")}" alt="Advertentie" class="article-ad">
    `;

    if (typeof installImageFallbacks === "function") {
        installImageFallbacks();
    }

    if (typeof window.installDonationPopup === "function") {
        window.installDonationPopup();
    }

    renderComments(article, jsonComments.concat(getLocalComments()));
    setupCommentForm(article, jsonComments);
};

Promise.all([
    fetch(articlePath("data/articles.json")),
    fetch(articlePath("data/comments.json"))
])
    .then((responses) => {
        if (responses.some((response) => !response.ok)) {
            throw new Error("Data kon niet worden geladen.");
        }

        return Promise.all(responses.map((response) => response.json()));
    })
    .then(([articles, jsonComments]) => {
        const allArticles = getLocalArticles().concat(articles);
        const article = allArticles.find((item) => item.id === articleId);

        if (!article) {
            renderArticleError("Controleer de link of zoek opnieuw naar het artikel.");
            return;
        }

        renderArticle(article, jsonComments);
    })
    .catch(() => {
        renderArticleError("Start de site via een lokale webserver zodat de JSON-data geladen kan worden.");
    });

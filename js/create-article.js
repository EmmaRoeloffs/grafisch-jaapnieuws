const LOCAL_ARTICLES_KEY = "jaapNewsArticles";
const CURRENT_USER_KEY = "jaapNewsCurrentUser";

const getLocalArticles = () => JSON.parse(localStorage.getItem(LOCAL_ARTICLES_KEY) || "[]");
const saveLocalArticles = (articles) => localStorage.setItem(LOCAL_ARTICLES_KEY, JSON.stringify(articles));
const getCreateUser = () => JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");

const slugify = (value) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const showCreateMessage = (message) => {
    const messageElement = document.querySelector("[data-create-message]");

    if (messageElement) {
        messageElement.textContent = message;
    }
};

const imageInput = document.querySelector("[data-image-input]");
const imageButton = document.querySelector("[data-image-button]");
const imagePreview = document.querySelector("[data-image-preview]");
const imageLabel = document.querySelector("[data-image-label]");
const categoryButtons = document.querySelectorAll("[data-category]");
let selectedCategory = "";
let selectedImage = "";

imageButton.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
    const [file] = imageInput.files;

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showCreateMessage("Kies een geldig afbeeldingsbestand.");
        return;
    }

    if (file.size > 1500000) {
        showCreateMessage("Kies een afbeelding kleiner dan 1,5 MB, anders past hij niet goed in lokale opslag.");
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        selectedImage = reader.result;
        imagePreview.src = selectedImage;
        imageButton.classList.add("has-image");
        imageLabel.textContent = file.name;
        showCreateMessage("");
    });

    reader.readAsDataURL(file);
});

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        categoryButtons.forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        selectedCategory = button.dataset.category;
    });
});

document.querySelector("[data-create-form]").addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.querySelector("#article-title").value.trim();
    const summary = document.querySelector("#article-summary").value.trim();
    const text = document.querySelector("#article-text").value.trim();

    if (!title || !summary || !text) {
        showCreateMessage("Vul de titel, intro en artikeltekst in.");
        return;
    }

    if (!selectedCategory) {
        showCreateMessage("Kies eerst een categorie.");
        return;
    }

    const user = getCreateUser();
    const idBase = slugify(title) || "nieuw-artikel";
    const id = `${idBase}-${Date.now()}`;
    const paragraphs = text
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    const article = {
        id,
        title,
        shortTitle: title,
        deck: summary,
        summary,
        category: selectedCategory,
        label: "Net geplaatst",
        tags: [selectedCategory, "Nieuws", title],
        image: selectedImage || "images/select-image.png",
        imageAlt: title,
        body: paragraphs,
        author: user?.name || user?.email || "Redactie",
        createdAt: new Date().toISOString()
    };

    const localArticles = getLocalArticles();
    localArticles.unshift(article);

    try {
        saveLocalArticles(localArticles);
    } catch {
        showCreateMessage("Dit artikel past niet in lokale opslag. Kies een kleinere afbeelding.");
        return;
    }

    window.location.href = `article.html?id=${encodeURIComponent(article.id)}`;
});

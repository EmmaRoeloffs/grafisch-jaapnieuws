# Jaap Nieuws

A Dutch-language news website built with HTML, CSS, and vanilla JavaScript. This project is a browser-based demo with a news feed, article pages, search, reader accounts, and a journalist editor.

## Run Locally

You need a modern browser and any static HTTP server. No build step is required. Choose one of the following options:

### Python 3

```powershell
python -m http.server 8000
```

Open <http://localhost:8000/>. Stop the server with `Ctrl+C`.

### Node.js

With Node.js and npm installed, run:

```powershell
npx serve . --listen 8000
```

Allow npm to download `serve` if prompted, then open <http://localhost:8000/>. Stop the server with `Ctrl+C`.

### Editor Web Servers

- **VS Code:** install the Live Server extension, open the repository folder, and set `liveServer.settings.port` to `8000` in VS Code settings. Right-click `index.html` and choose **Open with Live Server**.
- **IntelliJ IDEA:** right-click `index.html` and choose **Open in Browser**. Use the HTTP URL provided by the IDE; its built-in server may use a different port.

The port belongs to the server, not the website. This project has no `.env` file and does not read environment variables. To switch an existing Python server from 8888 to 8000, stop it with `Ctrl+C` and restart it using the command above. Run only one server on port 8000 at a time.

Use the HTTP server rather than opening HTML files directly so the site can load its JSON data.

## Static Hosting

The site can also be hosted on a static hosting service such as GitHub Pages or Netlify. Publish the contents of `grafisch-jaapnieuws` with `index.html` at the site root; no build command or backend is required. Local development server ports do not apply to the hosted URL. Accounts and locally created articles still remain in each visitor's browser rather than being shared through the hosting service.

## Demo Login

Open <http://localhost:8000/pages/login.html> (or `pages/login.html` on your chosen server) and use:

| Field | Value |
| --- | --- |
| Email | `journalist@jaapnieuws.com` |
| Password | `password123` |

The login page initializes this demo journalist account. Other accounts can be created using **Registreer** on the same page.

If login fails, refresh with `Ctrl+F5` and enter the credentials again without extra spaces. An incognito window can help check whether existing browser data is involved.

## Project Structure

```text
index.html       News homepage
pages/           Login, account, search, article, and editor pages
css/             Stylesheets
js/              Page behavior, authentication, and shared layout
data/            Sample articles and comments in JSON format
images/          Image assets
```

## Data and Limitations

Sample content lives in `data/`. Accounts, the current session, and newly created articles are stored in browser `localStorage`. Local changes do not update the JSON files or synchronize with other browsers or devices. Clearing site storage removes locally saved data. Use the same hostname and port to keep accessing the same browser storage.

Authentication and journalist permissions are implemented in client-side JavaScript for demonstration purposes. Passwords are stored in plain text, and the demo credentials are public. Do not use real passwords or deploy this as a secure production authentication system; that requires server-side authentication, authorization, and persistent storage.

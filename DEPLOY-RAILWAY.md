# Deploy Laravel backend (UrbanNxt API) on Railway

Step-by-step to get your Laravel API + MySQL running on Railway so your Vercel frontend can use it.

---

## Before you start

- **GitHub:** This repo is pushed to GitHub (e.g. `phoebeburdeos1/ecommmerce-draft`).
- **Railway account:** Sign up at [railway.app](https://railway.app) (e.g. with GitHub). You get a **$5 trial** without a card; after that it’s pay-as-you-go.
- **Frontend:** Already on Vercel; you’ll set `NEXT_PUBLIC_API_BASE_URL` to your Railway API URL at the end.

---

## 1. Create a Railway project and add MySQL

1. Go to [railway.app](https://railway.app) → **Log in** (with GitHub).
2. Click **New Project**.
3. Click **Add service** (or **+ New**) → **Database** → **MySQL**.
4. Wait for MySQL to deploy. Click the **MySQL** service.
5. Open the **Variables** (or **Connect**) tab and note the variables Railway gives you. You’ll usually see something like:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   (Exact names may vary; use what Railway shows.)

---

## 2. Add the Laravel app (from GitHub)

1. In the **same project**, click **Add service** again.
2. Choose **GitHub Repo** (or **Deploy from GitHub**).
3. Select your repo (e.g. `ecommmerce-draft`). Authorize Railway if asked.
4. **Root Directory:** leave **empty** so Railway uses the repo root (where `artisan`, `composer.json`, `app/` are). A `.railwayignore` in the repo excludes `frontend/` for faster builds.
5. Click **Add** / **Deploy**. The first build may take a few minutes. Railway will detect Laravel and use PHP + Caddy.

---

## 3. Connect Laravel to MySQL (variables)

1. Click your **Laravel service** (the one you just added), then open **Variables**.
2. Click **Add variable** or **Raw Editor** and add the following. For DB values, use **Reference** to link the MySQL service (e.g. `${{MySQL.MYSQL_HOST}}`) or copy the values from the MySQL service’s Variables tab.

**Required variables:**

| Variable       | Value |
|----------------|--------|
| `APP_NAME`     | `UrbanNxt` |
| `APP_ENV`      | `production` |
| `APP_DEBUG`    | `false` |
| `APP_KEY`      | *(see below)* |
| `APP_URL`      | *(set after step 5 – e.g. `https://your-app.up.railway.app`)* |
| `DB_CONNECTION`| `mysql` |
| `DB_HOST`      | `${{MySQL.MYSQL_HOST}}` (or the variable name Railway shows) |
| `DB_PORT`      | `${{MySQL.MYSQL_PORT}}` |
| `DB_DATABASE`  | `${{MySQL.MYSQL_DATABASE}}` |
| `DB_USERNAME`  | `${{MySQL.MYSQL_USER}}` |
| `DB_PASSWORD`  | `${{MySQL.MYSQL_PASSWORD}}` |
| `LOG_CHANNEL`  | `stderr` |

**APP_KEY:** On your PC (in the project folder) run:

```bash
php artisan key:generate --show
```

Copy the output (e.g. `base64:xxxx...`) into the `APP_KEY` variable.

If Railway uses different MySQL variable names (e.g. `MYSQL_URL`), check the MySQL service’s Variables and map them to `DB_HOST`, `DB_DATABASE`, etc. accordingly.

---

## 4. Give the Laravel service a public URL

1. Click your **Laravel** service.
2. Open **Settings** → **Networking** (or the **Networking** tab).
3. Click **Generate domain** (or **Public networking**). You’ll get a URL like:
   `https://ecommmerce-draft-production.up.railway.app`
4. Copy that URL. In **Variables**, set:
   - `APP_URL` = `https://your-actual-domain.up.railway.app` (no trailing slash)

---

## 5. Run migrations

1. In the Laravel service, open **Settings** → **Deploy** (or find **One-off command** / **Run command**).
2. If Railway offers a **one-off command** or **shell**, run:
   ```bash
   php artisan migrate --force
   ```
3. Or install [Railway CLI](https://docs.railway.app/develop/cli), link the project, and run:
   ```bash
   railway run php artisan migrate --force
   ```

If you see “APP_KEY is missing”, run locally `php artisan key:generate --show`, add that value to Variables, and redeploy.

---

## 6. CORS (so Vercel can call the API)

In your **codebase**, edit `config/cors.php` so your frontend origin is allowed:

```php
'allowed_origins' => ['https://urbannext.vercel.app'],
'supports_credentials' => true,
```

Use your real Vercel URL (with or without `/UrbanNext` as in your app). Commit and push so Railway redeploys with the new config.

---

## 7. Point the frontend to the API

Your API base URL is the Railway domain. The frontend already uses `/api` in requests, so:

- **API base URL** = `https://your-railway-app.up.railway.app/api`

In **Vercel** → your project → **Settings** → **Environment Variables**:

- **Name:** `NEXT_PUBLIC_API_BASE_URL`
- **Value:** `https://your-railway-app.up.railway.app/api`

Redeploy the frontend on Vercel so it picks up the new variable.

---

## 8. Quick test

- Open: `https://your-railway-app.up.railway.app/api/categories` (or `/api/products`). You should get JSON (or empty array).
- Use your Vercel site: login, products, cart should talk to the Railway API.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| Build fails (PHP version) | Ensure `composer.json` has `"php": "^8.0"` or `^8.1`. |
| 500 error on API | Check **Logs** in Railway; set `APP_DEBUG=true` temporarily and redeploy to see errors (then set back to `false`). |
| DB connection error | Confirm DB_* variables match the MySQL service (use Reference or copy from MySQL Variables). |
| CORS errors in browser | Update `config/cors.php` with the exact Vercel origin and redeploy. |

---

## Summary

| Step | Action |
|------|--------|
| 1 | New Project → Add MySQL service |
| 2 | Add service → Deploy from GitHub → this repo, root empty |
| 3 | Laravel Variables: APP_*, DB_* (from MySQL), LOG_CHANNEL=stderr |
| 4 | Generate domain → set APP_URL |
| 5 | Run `php artisan migrate --force` |
| 6 | CORS in `config/cors.php` → commit & push |
| 7 | Vercel: `NEXT_PUBLIC_API_BASE_URL` = `https://your-railway-app.up.railway.app/api` |

After this, your backend runs on Railway and the frontend on Vercel uses it.

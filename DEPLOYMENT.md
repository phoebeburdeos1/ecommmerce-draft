# How to Deploy UrbanNxt (Laravel API + Next.js Frontend)

Your app has **two parts**:
1. **Backend (Laravel API)** – PHP, MySQL, auth, products, orders, messages
2. **Frontend (Next.js)** – React app that talks to the API

**XAMPP is for local only.** It runs PHP + MySQL + Apache on your computer for development. You don’t deploy XAMPP to the internet. For a live site you deploy the Laravel API and MySQL on a real server or hosting, and the Next.js app (e.g. on Vercel).

---

## Deploy 100% free (no fee)

You can run the whole app **without paying** by using free tiers only.

| Part      | Service        | Cost   | Notes |
|-----------|----------------|--------|--------|
| Frontend  | **Vercel**     | Free   | Hobby plan: personal/non-commercial, no card. |
| Backend   | **InfinityFree** or **000webhost** | Free | PHP + MySQL, no card. Some limits (see below). |

### Frontend: Vercel (free)

1. Push your code to **GitHub**.
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repo.
3. Set **Root Directory** to `frontend`.
4. Add **Environment Variable:** `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-url/api` (use the URL you get from the backend step below).
5. Deploy. Your app will be at `https://your-project.vercel.app` (or `.../UrbanNext` if you keep the base path).

Vercel’s free Hobby plan is for personal/non-commercial use and does not require a credit card.

### Backend: InfinityFree (free PHP + MySQL)

InfinityFree gives **free PHP and MySQL** with no credit card. Good for school projects and demos.

1. **Sign up** at [infinityfree.net](https://www.infinityfree.net). Verify your email and create a free hosting account. You get a subdomain like `yoursite.infinityfreeapp.com`.

2. **Create a MySQL database** in the control panel (e.g. cPanel or their dashboard). Note:
   - Database name  
   - Username  
   - Password  
   - Host (often something like `sql123.infinityfree.com` – use the one they show, not `localhost`).

3. **Upload your Laravel project** (only the backend; you don’t need to upload the `frontend/` folder for the API):
   - In File Manager, go to **htdocs** (the web root).
   - Upload all Laravel files so that the **`public`** folder is inside **htdocs**.  
   - So you should have e.g. `htdocs/public/index.php`, `htdocs/app/`, `htdocs/config/`, etc.

4. **Point the site to `public`:**  
   Free hosting usually can’t change the document root. So either:
   - **Option A:** Put the *contents* of Laravel’s `public` folder into **htdocs**, and put the rest of Laravel (e.g. `app`, `config`, `routes`, `vendor`) in a folder *above* or *beside* htdocs if the host allows (then adjust `public/index.php` paths).  
   - **Option B:** In **htdocs**, add an **.htaccess** that redirects everything to `public`:
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ public/$1 [L]
   ```
   (Only if your Laravel app is in htdocs with a `public` subfolder.)

5. **Configure `.env`** (create it from `.env.example` on the server or upload a prepared one):
   - `APP_ENV=production`, `APP_DEBUG=false`
   - `APP_URL=https://yoursite.infinityfreeapp.com`
   - `APP_KEY=` (run `php artisan key:generate --show` locally and paste)
   - `DB_CONNECTION=mysql`
   - `DB_HOST=` (the MySQL host from step 2)
   - `DB_DATABASE=`, `DB_USERNAME=`, `DB_PASSWORD=` from step 2

6. **Run migrations:**  
   If the host gives you **SSH** or a **PHP command runner**, run `php artisan migrate --force`.  
   If not, export your local database (structure + data) and **import** it in phpMyAdmin on InfinityFree so the tables exist.

7. **Get your API URL.** Your Laravel API will be at e.g. `https://yoursite.infinityfreeapp.com`. The API routes are under `/api`, so the base URL for the frontend is `https://yoursite.infinityfreeapp.com/api`. Use that for `NEXT_PUBLIC_API_BASE_URL` on Vercel (with `/api` at the end as in your frontend code).

8. **CORS:** In Laravel `config/cors.php`, set:
   ```php
   'allowed_origins' => ['https://your-project.vercel.app'],
   'supports_credentials' => true,
   ```

### Free backend alternatives (also no fee)

- **000webhost** – Free PHP + MySQL, similar to InfinityFree. Upload Laravel and set document root to `public` if possible, or use .htaccess.
- **Render** – Free tier for web services; can run PHP. Free instances *sleep* after inactivity (first request may be slow). No MySQL on free tier; you’d need a free DB elsewhere (e.g. free MySQL hosting) or use SQLite if Render allows.
- **Oracle Cloud Free Tier** – Free VPS + MySQL that doesn’t expire, but setup is more advanced (you manage the server yourself).

### Limitations of free hosting

- **InfinityFree / 000webhost:** May show ads on free subdomains, limited RAM/CPU, and sometimes no SSH (so you rely on File Manager and phpMyAdmin).
- **Vercel:** Free plan is for personal/non-commercial use; commercial use needs a paid plan.
- **Uptime/speed:** Free tiers can be slower or have occasional downtime. Fine for school projects and demos.

---

## Deploy with Vercel (frontend) + backend elsewhere

Vercel hosts **only the Next.js frontend**. It does **not** run PHP or MySQL, so your Laravel API and database must be hosted somewhere else (e.g. free PHP hosting, or a small VPS).

### Step 1: Deploy the Laravel API and MySQL

You need a place that runs **PHP** and **MySQL**:

- **Free/cheap options:** InfinityFree, 000webhost, or a free tier on **Railway** / **Render** (they can run PHP + MySQL).
- **School/server:** If your school gives you a server or web space with PHP and MySQL, put Laravel there.
- **VPS:** DigitalOcean, Linode, etc. (you install PHP, MySQL, Nginx yourself).

On that host:

1. Upload your project (or clone from Git), but **only the Laravel part** (the root folder, not necessarily the `frontend/` folder for this step).
2. Set up a MySQL database and put the credentials in Laravel’s `.env`.
3. Run `composer install --no-dev`, `php artisan key:generate`, `php artisan migrate --force`.
4. Point the domain or URL to the Laravel `public` folder (e.g. `https://your-api.com` or `https://yourdomain.com/api`).

Write down the **full API URL** (e.g. `https://your-api.com` or `https://yourdomain.com/api`). The frontend will call this.

### Step 2: Deploy the Next.js frontend on Vercel

1. Push your code to **GitHub** (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) and sign in → **Add New** → **Project**.
3. **Import** your repository.
4. **Branch:** If you want to deploy from a branch other than `main` (e.g. `deploy`), click the branch name next to the repo (where it says "main") and select your branch. You can also change the **Production Branch** later in **Project → Settings → Git**.
5. **Root Directory:** click **Edit** and set to **`frontend`** (not `./`). This is required so Vercel builds the Next.js app, not the Laravel root.
6. **Environment Variables:** add one:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`  
   - **Value:** your Laravel API URL + `/api`, e.g. `https://your-api.com/api`
7. Click **Deploy**. Vercel will run `npm install` and `npm run build` for the `frontend` folder.

After deploy, your site will be at something like `https://your-project.vercel.app`. If you use `basePath: '/UrbanNext'` in `frontend/next.config.js`, open `https://your-project.vercel.app/UrbanNext`.

### Step 3: CORS (so the browser can call your API)

Your Laravel API must allow requests from the Vercel URL. In the Laravel project, edit **`config/cors.php`**:

```php
'allowed_origins' => ['https://your-project.vercel.app'],
'supports_credentials' => true,
```

Use your real Vercel URL (or custom domain if you add one). Then clear config cache on the server: `php artisan config:clear`.

### Summary

| Part        | Where it runs        | Notes                                      |
|------------|----------------------|--------------------------------------------|
| Frontend   | **Vercel**           | Next.js only; set `NEXT_PUBLIC_API_BASE_URL` |
| Backend    | **PHP + MySQL host**| Not on Vercel; use any PHP hosting or VPS  |
| XAMPP      | **Local only**      | For development on your PC, not for deploy |

---

## Deploy backend (Laravel + MySQL) on Railway

### Is Railway free?

- **Trial:** Railway gives a **30-day trial with $5 in credits**, no credit card required. Good for testing and school projects.
- **After trial:** Railway is **paid**. You pay for what you use (often a few dollars per month for a small Laravel + MySQL app). There is no permanent free tier; check [railway.app/pricing](https://railway.app/pricing) for current plans.

So you can use Railway **free for the trial**, then either add a card and pay a small amount or move the backend elsewhere (e.g. free PHP hosting).

### Step 1: Push your code to GitHub

Make sure your project (Laravel root with `app/`, `config/`, `routes/`, etc.) is in a GitHub repo. Railway will deploy from this repo. You can use the **root** of the repo (Railway will detect Laravel); the `frontend/` folder can stay in the repo—Railway will only build/run the Laravel part if you set the root correctly.

### Step 2: Create a Railway project and add MySQL

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. Click **New Project**.
3. Click **Add service** (or “+ New”) and choose **Database** → **MySQL**. Railway will create a MySQL instance and give you connection variables.
4. Click your **MySQL** service → **Variables** (or **Connect**) and note the variables Railway provides (e.g. `MYSQL_URL`, or `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`). You’ll map these to Laravel’s `.env` names next.

### Step 3: Deploy Laravel from GitHub

1. In the same project, click **Add service** again → **GitHub Repo** (or **Deploy from GitHub**).
2. Select your repository. If your Laravel app is in the **root** of the repo, leave **Root Directory** empty. If Laravel is in a subfolder, set **Root Directory** to that folder.
3. Railway usually **auto-detects** Laravel and uses PHP. If it doesn’t, you may need to add a **Nixpacks** or **Dockerfile** config (Railway docs have Laravel examples).
4. After the service is created, open it and go to **Variables** (or **Settings** → **Environment**).

### Step 4: Set environment variables for Laravel

In your **Laravel service** on Railway, add variables. Reference the MySQL service so Railway injects DB credentials:

- **Laravel variables** (you set these):
  - `APP_NAME` = `UrbanNxt` (or your app name)
  - `APP_ENV` = `production`
  - `APP_DEBUG` = `false`
  - `APP_KEY` = run `php artisan key:generate --show` locally and paste the key, or leave empty and run a one-off command later
  - `APP_URL` = you’ll set this after you get the public URL (e.g. `https://your-app.up.railway.app`)

- **Database:** Railway often exposes MySQL as a single URL or separate vars. Map them to Laravel’s names:
  - If Railway gives `MYSQL_HOST`, `MYSQL_USER`, etc., add in Laravel service:
    - `DB_CONNECTION` = `mysql`
    - `DB_HOST` = `${{MySQL.MYSQL_HOST}}` (or the variable name Railway shows when you “Reference” the MySQL service)
    - `DB_PORT` = `${{MySQL.MYSQL_PORT}}`
    - `DB_DATABASE` = `${{MySQL.MYSQL_DATABASE}}`
    - `DB_USERNAME` = `${{MySQL.MYSQL_USER}}`
    - `DB_PASSWORD` = `${{MySQL.MYSQL_PASSWORD}}`
  - Or if Railway gives `MYSQL_URL`, some setups use that directly; check Railway’s Laravel guide for the exact variable names.

### Step 5: Public URL and run migrations

1. In your **Laravel** service, open **Settings** → **Networking** (or **Generate domain**) and create a **public URL**. You’ll get something like `https://your-app-production.up.railway.app`.
2. Set `APP_URL` in Variables to that URL (with no trailing slash).
3. Run migrations. In Railway you can:
   - Use **Settings** → **Deploy** → run a one-off command, e.g. `php artisan migrate --force`, or
   - Use **Railway CLI**: `railway run php artisan migrate --force` (after linking the project).

If `APP_KEY` is missing, run `php artisan key:generate --show` in that one-off shell and add the key to Variables.

### Step 6: Point your frontend to the API

Your Laravel API base URL is the Railway public URL. The API routes are under `/api`, so:

- **API base URL** = `https://your-app-production.up.railway.app`
- **Frontend env (e.g. on Vercel):** `NEXT_PUBLIC_API_BASE_URL` = `https://your-app-production.up.railway.app/api`

### Step 7: CORS

In your Laravel codebase, set **`config/cors.php`** so your frontend (e.g. Vercel) can call the API:

```php
'allowed_origins' => ['https://your-vercel-app.vercel.app'],
'supports_credentials' => true,
```

Redeploy Laravel on Railway after changing config (or run `php artisan config:clear` in a one-off command if you have cache).

### Quick reference

| Item | Where |
|------|--------|
| Railway pricing | [railway.app/pricing](https://railway.app/pricing) – trial then paid |
| Laravel on Railway | [docs.railway.com/guides/laravel](https://docs.railway.com/guides/laravel) |
| MySQL on Railway | Add “MySQL” service in the same project, then reference its variables in the Laravel service |

---

## Option 1: One server (VPS, e.g. DigitalOcean / Linode / your school server)

### 1. Server requirements
- PHP 8.1+
- Composer
- Node.js 18+ (for building and running Next.js)
- MySQL 8 (or MariaDB)
- Nginx or Apache

### 2. Deploy Laravel API

```bash
# On the server
cd /var/www  # or your web root
git clone <your-repo-url> urbannext
cd urbannext

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Copy env and configure
cp .env.example .env
php artisan key:generate

# Edit .env with production values:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://yourdomain.com  (or https://api.yourdomain.com)
# DB_DATABASE=...
# DB_USERNAME=...
# DB_PASSWORD=...
```

```bash
# Run migrations
php artisan migrate --force

# Optional: seed roles/categories if you have seeders
# php artisan db:seed --force

# Permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

**Nginx example** (API at `yourdomain.com/api` or `api.yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;   # or api.yourdomain.com
    root /var/www/urbannext/public;

    add_header X-Frame-Options "SAMEORIGIN";
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Then point the domain to the server and use HTTPS (e.g. Let’s Encrypt with Certbot).

### 3. Deploy Next.js frontend

```bash
cd /var/www/urbannext/frontend

# Install dependencies and build
npm ci
npm run build
```

Set the API URL at build time (create `frontend/.env.production` or export before build):

```bash
# frontend/.env.production
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
# If you use a subpath, e.g. https://yourdomain.com/UrbanNext
# NEXT_PUBLIC_BASE_PATH=/UrbanNext  (already in next.config.js as basePath)
```

Then build:

```bash
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api npm run build
```

Run the app (e.g. with PM2 so it restarts):

```bash
npm install -g pm2
pm2 start npm --name "urbannext-frontend" -- start
pm2 save
pm2 startup
```

**Nginx in front of Next.js** (app on port 3000, optional base path `/UrbanNext`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location /UrbanNext {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

So:
- **API**: `https://yourdomain.com` (Laravel in `public/`)
- **Frontend**: `https://yourdomain.com/UrbanNext` (Next.js via proxy to port 3000)

If you don’t want `/UrbanNext`, remove `basePath` from `frontend/next.config.js` and deploy the frontend at the root of the domain.

### 4. CORS (if frontend and API are on different domains)

If the frontend is e.g. `https://shop.yourdomain.com` and API is `https://api.yourdomain.com`, set in Laravel:

**`config/cors.php`**:

```php
'allowed_origins' => ['https://shop.yourdomain.com'],
'supports_credentials' => true,
```

Restart PHP-FPM after changing config.

---

## Option 2: Frontend on Vercel, API on a server

Good if you want free, easy hosting for the Next.js app.

### 1. Deploy Laravel API
Deploy the Laravel app as in Option 1 (VPS or any PHP host). Note the public API URL, e.g. `https://api.yourdomain.com`.

### 2. Deploy Next.js on Vercel

1. Push your code to GitHub (include `frontend/` and the rest of the repo, or only the frontend if you split later).
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo.
3. Set **Root Directory** to `frontend`.
4. **Environment variables** in Vercel:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://api.yourdomain.com/api`
5. Deploy. Vercel will run `npm run build` and host the app.

If you keep `basePath: '/UrbanNext'` in `next.config.js`, the app will be at `https://your-app.vercel.app/UrbanNext`. If you want the app at the root, remove `basePath` and the redirect that sends `/` to `basePath`.

### 3. CORS
On the Laravel server, set `config/cors.php`:

```php
'allowed_origins' => ['https://your-app.vercel.app'],
'supports_credentials' => true,
```

Use your real Vercel URL (or custom domain).

---

## Environment variables checklist

### Laravel (`.env` on the server)
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=` URL where the API is served
- `APP_KEY=` (from `php artisan key:generate`)
- `DB_*` – database connection
- Optional: `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` if you use cookie-based auth later

### Next.js (build-time, e.g. Vercel env or `.env.production`)
- `NEXT_PUBLIC_API_BASE_URL` – full API base URL, e.g. `https://yourdomain.com/api` or `https://api.yourdomain.com/api`

---

## Quick recap

| Step | What to do |
|------|------------|
| 1 | Deploy Laravel: clone repo, `composer install`, `.env`, `php artisan migrate`, point Nginx to `public/` |
| 2 | Set `NEXT_PUBLIC_API_BASE_URL` to your live API URL |
| 3 | Build frontend: `cd frontend && npm ci && npm run build` |
| 4 | Run frontend: `npm start` (or PM2) or deploy to Vercel |
| 5 | Set CORS `allowed_origins` in Laravel to your frontend URL if they’re on different domains |

If you tell me your target (e.g. “one server at school”, “Vercel + free PHP host”), I can narrow this to exact commands and URLs for you.

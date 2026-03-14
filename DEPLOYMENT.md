# How to Deploy UrbanNxt (Laravel API + Next.js Frontend)

Your app has **two parts**:
1. **Backend (Laravel API)** – PHP, MySQL, auth, products, orders, messages
2. **Frontend (Next.js)** – React app that talks to the API

You can deploy them together on one server or use separate services.

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

# Deploy Your Laravel Backend on InfinityFree (Step-by-Step)

Use this guide from the InfinityFree dashboard. Your frontend is already on Vercel; this gets your API online so the site can load products, login, and orders.

---

## Step 1: Create your first hosting account

1. On the **Hosting Accounts** page, click **"+ Create Account"** (or **"Create your first account now"**).
2. Choose **Free** hosting.
3. Pick a **subdomain** (e.g. `urbannext` → you’ll get `urbannext.infinityfreeapp.com`) or use a domain if you have one.
4. Set a **password** for the control panel and finish signup.
5. Wait for the account to be created (often 1–2 minutes). You’ll get a link to the **control panel** (often **cPanel** or **DirectAdmin**).

---

## Step 2: Create a MySQL database

1. Open your hosting **control panel** (from the InfinityFree dashboard, click your account → **Login to control panel** or similar).
2. Find **MySQL Databases** (or **Databases** → **MySQL**).
3. **Create a new database:**
   - Database name: e.g. `epiz_12345678_urbannext` (the host may add a prefix like `epiz_12345678_`).
   - Note the **full database name** they show.
4. **Create a database user:**
   - Username: e.g. `epiz_12345678_user` (again, note the full username).
   - Password: choose a strong password and **save it**.
5. **Add the user to the database** with **All Privileges**.
6. Write down:
   - **DB_HOST** – often `sql123.infinityfree.com` or similar (shown in the DB section, **not** `localhost`).
   - **DB_DATABASE** – full name (with prefix).
   - **DB_USERNAME** – full name (with prefix).
   - **DB_PASSWORD** – the password you set.

---

## Step 3: Prepare Laravel on your computer

On your PC (in your project folder, e.g. `c:\ecommmerce-draft`):

1. **Generate an app key** (run in the project root, where `artisan` is):
   ```bash
   php artisan key:generate --show
   ```
   Copy the long key (e.g. `base64:xxxxx...`).

2. **Create a production `.env`** for InfinityFree:
   - Copy `.env.example` to something like `.env.production`.
   - Set these (use your real DB values from Step 2 and your future site URL):
   ```env
   APP_NAME=UrbanNxt
   APP_ENV=production
   APP_KEY=paste_the_key_from_above
   APP_DEBUG=false
   APP_URL=https://yoursite.infinityfreeapp.com

   DB_CONNECTION=mysql
   DB_HOST=sqlXXX.infinityfree.com
   DB_DATABASE=epiz_XXXXX_urbannext
   DB_USERNAME=epiz_XXXXX_user
   DB_PASSWORD=your_db_password
   ```
   Replace `yoursite` with your real subdomain and use the DB host/name/user/password from Step 2.

3. **Install dependencies** (no dev packages):
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

4. **Export your database** (so you can import it on InfinityFree):
   - If you use XAMPP/MySQL locally: open **phpMyAdmin** → select your Laravel database → **Export** → **Quick** → **SQL** → Go. Save the `.sql` file.
   - Or from command line: `mysqldump -u root -p your_database_name > backup.sql`  
   You’ll import this in Step 5.

---

## Step 4: Upload Laravel to the server

1. In the **control panel**, open **File Manager** (or **FTP**).
2. Go to **htdocs** (the web root – this is what visitors see at `https://yoursite.infinityfreeapp.com`).
3. **Upload your Laravel project** so that the **contents** of your project are **inside** `htdocs`:
   - You should end up with: `htdocs/app/`, `htdocs/config/`, `htdocs/public/`, `htdocs/routes/`, `htdocs/vendor/`, `htdocs/.env`, `htdocs/artisan`, etc.
   - **Do not** upload the `frontend/` folder (optional; it’s not needed for the API).
4. **Rename** your uploaded `.env.production` to **`.env`** in `htdocs` (or create `.env` on the server and paste the same content). Make sure **DB_*** and **APP_*** match Step 2 and your site URL.
5. **Point the site to Laravel’s `public` folder:**
   - In **htdocs** (same level as `public`), create or edit **`.htaccess`** so all requests go to `public`:
   ```apache
   <IfModule mod_rewrite.c>
   RewriteEngine On
   RewriteRule ^(.*)$ public/$1 [L]
   </IfModule>
   ```
   So: `htdocs/.htaccess` with that content, and keep `htdocs/public/index.php` and the rest of Laravel as-is.

---

## Step 5: Create tables in MySQL (migrations or import)

InfinityFree usually doesn’t give SSH, so use one of these:

**Option A – Import your local database**

1. In the control panel, open **phpMyAdmin**.
2. Select the database you created in Step 2.
3. **Import** the `.sql` file you exported in Step 3. All Laravel tables (users, products, orders, etc.) will be created.

**Option B – Run migrations (if the host has “Run PHP script” or similar)**

- Some free hosts let you run a single PHP file. You could create a one-time script that runs `require 'vendor/autoload.php'; $app = require 'bootstrap/app.php'; $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap(); Artisan::call('migrate', ['--force' => true]);` then delete the file. If you’re not sure, use Option A.

---

## Step 6: Set permissions (if needed)

- Make sure **storage** and **bootstrap/cache** are writable. In File Manager, right‑click `storage` and `bootstrap/cache` → **Permissions** (or **Change permissions**) → set to **755** or **775** if available. Not all free hosts allow this; if you get “permission denied” errors, check the host’s help.

---

## Step 7: Test your API URL

1. Your Laravel API base URL is: **`https://yoursite.infinityfreeapp.com`** (use your real subdomain).
2. Open in the browser: **`https://yoursite.infinityfreeapp.com/api/products`**  
   - If you see JSON (or an empty list), the API is working.
   - If you see 500 or a blank page, check the host’s error log (often in cPanel → Errors or File Manager → `storage/logs/laravel.log` if you can access it).

---

## Step 8: Connect Vercel frontend to this API

1. In **Vercel** → your project (**urban-next**) → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://yoursite.infinityfreeapp.com/api` (your real InfinityFree URL + `/api`).
3. **Redeploy:** Deployments → **⋯** on the latest → **Redeploy**.

Your live site at **https://urbannext.vercel.app/UrbanNext** will then use this backend for products, login, cart, and orders.

---

## Step 9: CORS (so the browser allows API calls)

On your computer, in the Laravel project, edit **`config/cors.php`**:

```php
'allowed_origins' => ['https://urbannext.vercel.app'],
'supports_credentials' => true,
```

Then **re-upload** the updated `config/cors.php` to the server (overwrite the old one). If you use Git, commit, then re-upload the file or re-upload the whole project.

---

## Quick checklist

- [ ] Create InfinityFree account and note your site URL.
- [ ] Create MySQL database and user; note host, database name, username, password.
- [ ] Prepare `.env` with `APP_KEY`, `APP_URL`, and DB credentials.
- [ ] Upload Laravel to `htdocs` and add `.htaccess` to redirect to `public`.
- [ ] Import `.sql` in phpMyAdmin (or run migrations).
- [ ] Test `https://yoursite.infinityfreeapp.com/api/products`.
- [ ] Add `NEXT_PUBLIC_API_BASE_URL` on Vercel and redeploy.
- [ ] Set CORS `allowed_origins` to `https://urbannext.vercel.app` and re-upload `config/cors.php`.

If something doesn’t work, say which step you’re on and what you see (error message or screenshot), and we can fix it step by step.

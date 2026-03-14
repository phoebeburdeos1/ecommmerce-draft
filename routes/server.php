<?php

/**
 * Laravel entry point for php artisan serve and for PaaS (e.g. Railway).
 * Forwards all requests to public/index.php.
 * This file must live in the PROJECT ROOT (next to artisan), not in routes/.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

require_once __DIR__.'/public/index.php';

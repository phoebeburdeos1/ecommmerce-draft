<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthWebController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// The Laravel backend no longer renders Blade templates for the storefront.
// The React/Next frontend lives in the `frontend` directory and is served
// either by its own Node.js process (http://localhost:3000 by default) or
// as a static build.  All requests that would previously hit a Blade view
// should instead be redirected to the frontend application.

Route::get('/', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:3000'));
});

// catch-all fallback for any other web route that isn't handled by the API
// (helps when the frontend uses client-side routing)
Route::fallback(function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:3000'));
});

// NOTE: individual pages such as /UrbanNext or /about are now managed by the
// React app; you can remove the Blade templates and corresponding routes.

// Auth routes
Route::get('/login', function () {
    return view('login');
})->name('login.form');

Route::post('/login', [AuthWebController::class, 'loginStore'])->name('auth.login');

Route::get('/register', function () {
    return view('register');
})->name('register.form');

Route::post('/register', [AuthWebController::class, 'registerStore'])->name('auth.register');

Route::post('/logout', [AuthWebController::class, 'logout'])->name('logout');

// Shop Routes (protected)
Route::middleware('auth.web')->group(function () {
    Route::get('/shop', [ProductController::class, 'shop'])->name('shop');
    Route::get('/product/{product}', [ProductController::class, 'show'])->name('product.show');
    
    // Cart Routes
    Route::post('/cart/add', [CartController::class, 'addToCart'])->name('cart.add');
    Route::get('/cart', [CartController::class, 'viewCart'])->name('cart.view');
    Route::put('/cart/{cartItem}', [CartController::class, 'updateCart'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'removeFromCart'])->name('cart.remove');
});

// Customer Routes (protected) - redirect to shop for now
Route::prefix('customer')->middleware('customer.auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('shop');
    })->name('customer.dashboard');
    Route::get('/orders', [CustomerController::class, 'orders'])->name('customer.orders');
    Route::get('/wishlist', [CustomerController::class, 'wishlist'])->name('customer.wishlist');
    Route::get('/settings', [CustomerController::class, 'settings'])->name('customer.settings');
});

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCustomerAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = session('user');

        if (!$user || !isset($user['role']) || $user['role']['name'] !== 'customer') {
            return redirect()->route('login.form')->with('message', 'Please log in as a customer to access that page.');
        }

        return $next($request);
    }
}

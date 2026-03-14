<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AddCorsHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        if ($origin) {
            $origin = rtrim($origin, '/');
        }
        // Allow Vercel, localhost, or any vercel.app subdomain
        $allowed = $origin && (
            str_contains($origin, 'vercel.app')
            || str_contains($origin, 'localhost')
            || str_contains($origin, '127.0.0.1')
        );

        if ($request->is('api/*') || $request->is('sanctum/*')) {
            if ($request->isMethod('OPTIONS')) {
                $response = response('', 200);
            } else {
                $response = $next($request);
            }
            if ($allowed && $origin) {
                $response->header('Access-Control-Allow-Origin', $origin);
                $response->header('Access-Control-Allow-Credentials', 'true');
                $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
                $response->header('Access-Control-Max-Age', '86400');
            } else {
                // If no Origin (e.g. same-origin or Postman), still allow API to respond
                $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            }
            return $response;
        }

        return $next($request);
    }
}

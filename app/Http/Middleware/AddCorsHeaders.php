<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AddCorsHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $allowed = $origin && (
            in_array($origin, [
                'https://urbannext.vercel.app',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
            ], true)
            || preg_match('#^https://[a-z0-9.-]+\.vercel\.app$#', $origin)
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
            }
            return $response;
        }

        return $next($request);
    }
}

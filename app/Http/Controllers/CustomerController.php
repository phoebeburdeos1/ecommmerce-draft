<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\Order;

class CustomerController extends Controller
{
    /**
     * Show customer dashboard
     */
    public function dashboard(Request $request)
    {
        // Get user from session
        $user = session('user');
        
        if (!$user || $user['role']['name'] !== 'customer') {
            return redirect('/login')->with('message', 'You need to log in as a customer');
        }

        // Get customer stats from DB
        $totalOrders = Order::where('customer_id', $user['id'])->count();
        $totalSpent = Order::where('customer_id', $user['id'])->sum('total_amount');
        $recentOrders = Order::with('items.product')
            ->where('customer_id', $user['id'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return view('customer.dashboard', compact('user', 'totalOrders', 'totalSpent', 'recentOrders'));
    }

    /**
     * Show customer orders
     */
    public function orders(Request $request)
    {
        $user = session('user');
        
        if (!$user || $user['role']['name'] !== 'customer') {
            return redirect('/login');
        }

        return view('customer.orders', compact('user'));
    }

    /**
     * Show customer wishlist
     */
    public function wishlist(Request $request)
    {
        $user = session('user');
        
        if (!$user || $user['role']['name'] !== 'customer') {
            return redirect('/login');
        }

        return view('customer.wishlist', compact('user'));
    }

    /**
     * Show customer settings
     */
    public function settings(Request $request)
    {
        $user = session('user');
        
        if (!$user || $user['role']['name'] !== 'customer') {
            return redirect('/login');
        }

        return view('customer.settings', compact('user'));
    }
}

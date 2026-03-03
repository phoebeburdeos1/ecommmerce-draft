<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalOrders' => Order::count(),
            'totalRevenue' => Order::sum('total_amount'),
        ];

        return response()->json([
            'stats' => $stats,
        ], 200);
    }

    /**
     * Get all users
     */
    public function users()
    {
        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
        ], 200);
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user->update(array_filter($validated));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('role'),
        ], 200);
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ], 200);
    }
}

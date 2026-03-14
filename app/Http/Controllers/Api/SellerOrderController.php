<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class SellerOrderController extends Controller
{
    /**
     * Get orders that contain the seller's products.
     */
    public function index(Request $request)
    {
        $sellerId = $request->user()->id;
        if (!$request->user()->hasRole('seller')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $orders = Order::with(['customer:id,name,email', 'items' => function ($q) use ($sellerId) {
            $q->with('product:id,name,image,slug,seller_id')
                ->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        }])
            ->whereHas('items.product', fn ($q) => $q->where('seller_id', $sellerId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['orders' => $orders], 200);
    }

    /**
     * Seller updates order status to shipped or delivered (for orders containing their products).
     */
    public function updateStatus(Request $request, $id)
    {
        if (!$request->user()->hasRole('seller')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $sellerId = $request->user()->id;
        $order = Order::whereHas('items.product', fn ($q) => $q->where('seller_id', $sellerId))
            ->findOrFail($id);
        $validated = $request->validate(['status' => 'required|string|in:shipped,delivered']);

        $status = strtolower($validated['status']);
        $current = strtolower($order->status ?? 'pending');

        if ($status === 'shipped') {
            if (!in_array($current, ['pending', 'confirmed', 'processing'], true)) {
                return response()->json(['message' => 'Order cannot be marked as shipped from current status.'], 422);
            }
            $order->update(['status' => 'shipped']);
        } elseif ($status === 'delivered') {
            if ($current !== 'shipped') {
                return response()->json(['message' => 'Order must be shipped before marking delivered.'], 422);
            }
            $order->update(['status' => 'delivered']);
        }

        return response()->json([
            'message' => 'Order status updated.',
            'order' => $order->fresh(['items.product']),
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Get customer orders
     */
    public function customerOrders(Request $request)
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ], 200);
    }

    /**
     * Get all orders (Admin)
     */
    public function index(Request $request)
    {
        $orders = Order::with('customer', 'items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ], 200);
    }

    /**
     * Store a new order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'total_amount' => 'required|numeric|min:0',
            'shipping_address' => 'required|string',
            'phone' => 'required|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'order_number' => 'ORD-' . time(),
            'total_amount' => $validated['total_amount'],
            'shipping_address' => $validated['shipping_address'],
            'phone' => $validated['phone'],
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('items'),
        ], 201);
    }

    /**
     * Customer cancels their own order (only if still pending/confirmed/processing).
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::where('customer_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate(['status' => 'required|string|in:cancelled,delivered']);

        $status = strtolower($validated['status']);
        $current = strtolower($order->status ?? 'pending');

        // Customer can only cancel; shipped/delivered are for seller/admin
        if ($status === 'cancelled') {
            if (!in_array($current, ['pending', 'confirmed', 'processing'], true)) {
                return response()->json(['message' => 'Order can no longer be cancelled.'], 422);
            }
            $order->update(['status' => 'cancelled']);
            return response()->json(['message' => 'Order cancelled.', 'order' => $order->fresh('items.product')], 200);
        }

        // Allow customer to mark as delivered (e.g. "I received it") for their own order
        if ($status === 'delivered' && $current === 'shipped') {
            $order->update(['status' => 'delivered']);
            return response()->json(['message' => 'Order marked as delivered.', 'order' => $order->fresh('items.product')], 200);
        }

        return response()->json(['message' => 'Invalid status update.'], 422);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Add product to cart
     */
    public function addToCart(Request $request)
    {
        // Get authenticated user from session
        $user = session('user');
        if (!$user) {
            return redirect('/login')->with('error', 'Please login first');
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:100',
            'size' => 'required|string',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Check if item already in cart
        $cartItem = CartItem::where('user_id', $user['id'])
            ->where('product_id', $validated['product_id'])
            ->where('size', $validated['size'])
            ->first();

        if ($cartItem) {
            // Update quantity
            $cartItem->update(['quantity' => $cartItem->quantity + $validated['quantity']]);
        } else {
            // Create new cart item
            CartItem::create([
                'user_id' => $user['id'],
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'size' => $validated['size'],
            ]);
        }

        return back()->with('success', ucfirst($product->name) . ' added to cart!');
    }

    /**
     * Display cart page
     */
    public function viewCart()
    {
        $user = session('user');
        if (!$user) {
            return redirect('/login');
        }

        $cartItems = CartItem::where('user_id', $user['id'])
            ->with('product')
            ->get();

        $total = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        return view('shop.cart', [
            'cartItems' => $cartItems,
            'total' => $total,
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function updateCart(Request $request, CartItem $cartItem)
    {
        $user = session('user');
        if (!$user || $cartItem->user_id != $user['id']) {
            return back()->with('error', 'Unauthorized');
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        $cartItem->update($validated);

        return back()->with('success', 'Cart updated');
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(CartItem $cartItem)
    {
        $user = session('user');
        if (!$user || $cartItem->user_id != $user['id']) {
            return back()->with('error', 'Unauthorized');
        }

        $cartItem->delete();

        return back()->with('success', 'Item removed from cart');
    }
}

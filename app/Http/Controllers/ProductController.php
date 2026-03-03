<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display shop page with products and filters
     */
    public function shop(Request $request)
    {
        // Get all categories
        $categories = Category::all();
        
        // Start building query
        $query = Product::query()->where('is_active', true);

        // Filter by category
        if ($request->has('category') && $request->category != '') {
            $query->where('category_id', $request->category);
        }

        // Filter by price range
        $minPrice = $request->min_price ?? 0;
        $maxPrice = $request->max_price ?? 500;
        $query->whereBetween('price', [$minPrice, $maxPrice]);

        // Filter by color
        if ($request->has('color') && $request->color != '') {
            $query->where('color', $request->color);
        }

        // Sort
        $sort = $request->sort ?? 'newest';
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('stock', 'desc');
                break;
            case 'newest':
            default:
                $query->latest('id');
                break;
        }

        // Paginate results
        $products = $query->paginate(12);

        // Get all colors for filter
        $colors = Product::distinct()->pluck('color')->filter()->sort();

        return view('shop.index', [
            'products' => $products,
            'categories' => $categories,
            'colors' => $colors,
            'selectedCategory' => $request->category,
            'selectedColor' => $request->color,
            'minPrice' => $minPrice,
            'maxPrice' => $maxPrice,
            'sortBy' => $sort,
        ]);
    }

    /**
     * Display single product details
     */
    public function show(Product $product)
    {
        return view('shop.show', ['product' => $product]);
    }
}

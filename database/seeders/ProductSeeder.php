<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create seller
        $seller = User::where('email', 'seller@example.com')->first();
        if (!$seller) {
            $sellerRole = \App\Models\Role::where('name', 'seller')->first();
            $seller = User::create([
                'name' => 'Urban Store',
                'email' => 'seller@example.com',
                'password' => bcrypt('password'),
                'role_id' => $sellerRole->id,
            ]);
        }

        // Create categories (clothes only: Men, Women, Kids)
        $categories = [
            ['name' => 'Men', 'slug' => 'men'],
            ['name' => 'Women', 'slug' => 'women'],
            ['name' => 'Kids', 'slug' => 'kids'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // Get categories
        $menCat = Category::where('slug', 'men')->first();
        $womenCat = Category::where('slug', 'women')->first();
        $kidsCat = Category::where('slug', 'kids')->first();

        // Remove all existing products so we only have these 6 clothing items
        Product::query()->delete();

        // Men's clothing (2)
        $menProducts = [
            ['name' => 'Classic Denim Jacket', 'slug' => 'classic-denim-jacket', 'price' => 89.00, 'category_id' => $menCat->id, 'color' => 'Blue', 'sizes' => json_encode(['XS', 'S', 'M', 'L', 'XL', 'XXL']), 'image' => 'images/classic-denim-jacket.jpg'],
            ['name' => 'Utility Field Jacket', 'slug' => 'utility-field-jacket', 'price' => 120.00, 'category_id' => $menCat->id, 'color' => 'Green', 'sizes' => json_encode(['S', 'M', 'L', 'XL', 'XXL']), 'image' => 'images/utility-field-jacket.jpg'],
        ];

        foreach ($menProducts as $prod) {
            Product::create(array_merge($prod, [
                'stock' => 50,
                'seller_id' => $seller->id,
                'description' => 'High-quality men\'s clothing.',
            ]));
        }

        // Women's clothing (2)
        $womenProducts = [
            ['name' => 'Floral Summer Dress', 'slug' => 'floral-summer-dress', 'price' => 55.00, 'category_id' => $womenCat->id, 'color' => 'Floral', 'sizes' => json_encode(['XS', 'S', 'M', 'L', 'XL']), 'image' => 'images/floral-summer-dress.jpg'],
            ['name' => 'Classic Denim Jacket', 'slug' => 'classic-denim-jacket-women', 'price' => 75.00, 'category_id' => $womenCat->id, 'color' => 'Blue', 'sizes' => json_encode(['XS', 'S', 'M', 'L', 'XL']), 'image' => 'images/classic-denim-jacket-women.jpg'],
        ];

        foreach ($womenProducts as $prod) {
            Product::create(array_merge($prod, [
                'stock' => 50,
                'seller_id' => $seller->id,
                'description' => 'Premium women\'s clothing.',
            ]));
        }

        // Kids' clothing (2)
        $kidsProducts = [
            ['name' => 'Kids Cotton Hoodie', 'slug' => 'kids-cotton-hoodie', 'price' => 35.00, 'category_id' => $kidsCat->id, 'color' => 'Grey', 'sizes' => json_encode(['2-4Y', '4-6Y', '6-8Y', '8-10Y']), 'image' => 'images/kids-cotton-hoodie.jpg'],
            ['name' => 'Kids Graphic Tee', 'slug' => 'kids-graphic-tee', 'price' => 22.00, 'category_id' => $kidsCat->id, 'color' => 'White', 'sizes' => json_encode(['2-4Y', '4-6Y', '6-8Y', '8-10Y']), 'image' => 'images/kids-graphic-tee.jpg'],
        ];

        foreach ($kidsProducts as $prod) {
            Product::create(array_merge($prod, [
                'stock' => 50,
                'seller_id' => $seller->id,
                'description' => 'Comfortable kids\' clothing.',
            ]));
        }
    }
}

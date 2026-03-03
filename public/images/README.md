# Product Images

Add your product images here. Supported formats: **JPG, PNG**

## How to Use

1. **Add your image file** to this folder
   - Example: `classic-denim-jacket.jpg`

2. **Update ProductSeeder.php**
   - Change the image path like: `'image' => 'images/classic-denim-jacket.jpg'`
   - The system will automatically use `asset('images/classic-denim-jacket.jpg')`

3. **Re-seed the database**
   ```bash
   php artisan db:seed --class=ProductSeeder
   ```

## Image Guidelines

- **Format**: JPG or PNG
- **Size**: 600x600px recommended (responsive)
- **File name**: Use lowercase with hyphens (e.g., `classic-denim-jacket.jpg`)

## Example

```php
'image' => 'images/classic-denim-jacket.jpg'
```

In the shop view, it will display as:
```blade
<img src="{{ asset($product->image) }}" alt="{{ $product->name }}">
```

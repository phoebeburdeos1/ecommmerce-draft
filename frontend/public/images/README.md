# Static images

Put your image files here. Next.js serves everything in `public/` from the site root.

**Use in code:** paths must start with `/images/`
- `public/images/hero.jpg` → `src="/images/hero.jpg"`
- Do **not** use `./images/` or `images/` alone.

---

## Product images (for the 6 seeded products)

Add these files so product pages show your photos instead of placeholders:

| File name | Product |
|-----------|--------|
| `classic-denim-jacket.jpg` | Men – Classic Denim Jacket |
| `utility-field-jacket.jpg` | Men – Utility Field Jacket |
| `floral-summer-dress.jpg` | Women – Floral Summer Dress |
| `classic-denim-jacket-women.jpg` | Women – Classic Denim Jacket |
| `kids-cotton-hoodie.jpg` | Kids – Kids Cotton Hoodie |
| `kids-graphic-tee.jpg` | Kids – Kids Graphic Tee |

**Folder:** `frontend/public/images/`  
**Format:** JPG or PNG. Names must match exactly (case-sensitive).

If a file is missing, the app will show a placeholder image for that product.

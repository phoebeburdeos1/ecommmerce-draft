export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <div className="thumb" />
      <div className="info">
        <div className="title">{product.name}</div>
        <div className="price">₱{product.price.toFixed(2)}</div>
        <button className="btn" onClick={() => onAdd?.(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

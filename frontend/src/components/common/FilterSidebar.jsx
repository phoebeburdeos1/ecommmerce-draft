export default function FilterSidebar() {
  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>
      <div className="filter">
        <div className="label">Price Range</div>
        <div className="options">
          <label><input type="checkbox"/> Low</label>
          <label><input type="checkbox"/> Mid</label>
          <label><input type="checkbox"/> High</label>
        </div>
      </div>
      <div className="filter">
        <div className="label">Size</div>
        <div className="options">
          <label><input type="checkbox"/> S</label>
          <label><input type="checkbox"/> M</label>
          <label><input type="checkbox"/> L</label>
        </div>
      </div>
    </aside>
  );
}

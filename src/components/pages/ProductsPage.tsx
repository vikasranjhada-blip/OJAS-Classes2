import React, { useState } from 'react';
import { Product } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Package,
  Plus,
  Search,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  BookOpen,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Study Modules' as 'Study Modules' | 'Question Bank Book' | 'Formula Sheet' | 'Test Series Kit',
    price: 1499,
    mrp: 2499,
    stock: 50,
    minStockAlert: 15,
    status: 'In Stock' as 'In Stock' | 'Low Stock' | 'Out of Stock',
    description: '',
    targetExam: 'JEE & NEET',
    badge: 'Bestseller',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setProducts(storage.getProducts());
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetExam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStock = stockFilter === 'All' || p.status === stockFilter;
    return matchesSearch && matchesCat && matchesStock;
  });

  const categories = ['All', 'Study Modules', 'Question Bank Book', 'Formula Sheet', 'Test Series Kit'];

  const openAddModal = () => {
    const nextSku = `MOD-${new Date().getFullYear()}-${String(products.length + 1).padStart(2, '0')}`;
    setFormData({
      sku: nextSku,
      name: '',
      category: 'Study Modules',
      price: 1999,
      mrp: 2999,
      stock: 40,
      minStockAlert: 10,
      status: 'In Stock',
      description: '',
      targetExam: 'IIT-JEE / NEET',
      badge: 'New Edition',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      status: p.status,
      description: p.description,
      targetExam: p.targetExam,
      badge: p.badge || '',
    });
    setFormErrors({});
  };

  const updateStock = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    let nextStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (newStock === 0) nextStatus = 'Out of Stock';
    else if (newStock <= product.minStockAlert) nextStatus = 'Low Stock';

    storage.saveProduct({
      ...product,
      stock: newStock,
      status: nextStatus,
    });
    reloadData();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (formData.price < 0) errs.price = 'Valid price required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let computedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (Number(formData.stock) === 0) computedStatus = 'Out of Stock';
    else if (Number(formData.stock) <= Number(formData.minStockAlert)) computedStatus = 'Low Stock';

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stock: Number(formData.stock),
        minStockAlert: Number(formData.minStockAlert),
        status: computedStatus,
        description: formData.description,
        targetExam: formData.targetExam,
        badge: formData.badge,
      };
      storage.saveProduct(updated);
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: `prd-${Date.now()}`,
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stock: Number(formData.stock),
        minStockAlert: Number(formData.minStockAlert),
        status: computedStatus,
        description: formData.description,
        targetExam: formData.targetExam,
        badge: formData.badge,
      };
      storage.saveProduct(newProduct);
      setIsAddModalOpen(false);
    }
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove product "${name}"?`)) {
      storage.deleteProduct(id);
      reloadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Study Material & Physical Store
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage printed classroom booklets, mock test kits, formula wall charts, and stock thresholds
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Material</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, exam..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Stock Filter Segmented */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStockFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  stockFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="No study modules or products match your current filters."
          actionLabel="Add Study Material"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.status === 'Out of Stock';
            const isLowStock = product.status === 'Low Stock';

            return (
              <div
                key={product.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {product.sku}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {product.badge && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {product.badge}
                        </span>
                      )}
                      <Badge
                        variant={
                          isOutOfStock
                            ? 'danger'
                            : isLowStock
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Target Exam */}
                  <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                    {product.name}
                  </h3>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    {product.targetExam} · {product.category}
                  </div>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Pricing */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Count Gauge */}
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Available Stock:</span>
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Stock Increment/Decrement & Edit */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Quick Stock Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateStock(product, -5)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      title="Decrease stock by 5"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => updateStock(product, -1)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      title="Decrease stock by 1"
                    >
                      -1
                    </button>
                    <span className="px-1 text-[11px] font-mono font-semibold text-slate-600">
                      Qty
                    </span>
                    <button
                      onClick={() => updateStock(product, 1)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      title="Add stock by 1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateStock(product, 10)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      title="Add stock by 10"
                    >
                      +10
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Remove Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Physical Study Material'}
          subtitle="Configure coaching modules, answer key books, retail prices, and inventory alerts"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {editingProduct ? 'Save Product' : 'Add to Inventory'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Product / Kit Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Complete Physics Theory & Problem Modules (6-Book Boxset)"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SKU Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="MOD-JEE-PHY-01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Study Modules">Study Modules (Bookset)</option>
                  <option value="Question Bank Book">Question Bank / PYQ Book</option>
                  <option value="Formula Sheet">Formula Sheet & Charts</option>
                  <option value="Test Series Kit">All India Test Series Kit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Original MRP (₹)</label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Stock Qty</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={(e) =>
                    setFormData({ ...formData, minStockAlert: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Exam</label>
                <input
                  type="text"
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  placeholder="e.g. JEE Advanced / NEET-UG"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marketing Tag</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Bestseller / Essential / 2026 Edition"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe book contents, exercises, solution index, and author credentials..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

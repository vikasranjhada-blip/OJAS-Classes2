import React, { useState } from 'react';
import { Order, OrderItem } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Receipt,
  Search,
  Download,
  Plus,
  Eye,
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  Printer,
  CheckCircle,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const students = storage.getStudents();
  const courses = storage.getCourses();
  const products = storage.getProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Course' | 'Physical Product'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed' | 'Refunded'>('All');

  // Modals
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);

  // Form State for Manual Offline Fee Collection
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    studentName: students[0]?.name || '',
    studentPhone: students[0]?.phone || '',
    studentEmail: students[0]?.email || '',
    orderType: 'Course' as 'Course' | 'Physical Product',
    selectedItemId: courses[0]?.id || '',
    amount: courses[0]?.price || 14999,
    paymentMethod: 'Offline Cash' as 'UPI' | 'Netbanking' | 'Card' | 'Offline Cash',
    status: 'Paid' as 'Paid' | 'Pending' | 'Failed' | 'Refunded',
    shippingAddress: 'Direct In-Person Classroom Handout',
  });

  const reloadData = () => {
    setOrders(storage.getOrders());
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentPhone.includes(searchQuery);
    const matchesType = typeFilter === 'All' || o.orderType === typeFilter;
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStudentSelect = (stdId: string) => {
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setFormData((prev) => ({
        ...prev,
        studentId: std.id,
        studentName: std.name,
        studentPhone: std.phone,
        studentEmail: std.email,
        shippingAddress: `${std.city}, ${std.state}`,
      }));
    }
  };

  const handleItemSelect = (itemId: string) => {
    if (formData.orderType === 'Course') {
      const c = courses.find((x) => x.id === itemId);
      if (c) {
        setFormData((prev) => ({
          ...prev,
          selectedItemId: c.id,
          amount: c.price,
        }));
      }
    } else {
      const p = products.find((x) => x.id === itemId);
      if (p) {
        setFormData((prev) => ({
          ...prev,
          selectedItemId: p.id,
          amount: p.price,
        }));
      }
    }
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();

    let itemName = 'Educational Item';
    if (formData.orderType === 'Course') {
      const c = courses.find((x) => x.id === formData.selectedItemId);
      if (c) itemName = c.title;
    } else {
      const p = products.find((x) => x.id === formData.selectedItemId);
      if (p) itemName = p.name;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${String(orders.length + 8817)}`,
      studentId: formData.studentId,
      studentName: formData.studentName,
      studentPhone: formData.studentPhone,
      studentEmail: formData.studentEmail,
      orderType: formData.orderType,
      items: [
        {
          id: formData.selectedItemId,
          name: itemName,
          type: formData.orderType,
          quantity: 1,
          price: Number(formData.amount),
        },
      ],
      totalAmount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      transactionId: `RECEIPT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      shippingAddress: formData.shippingAddress,
    };

    storage.saveOrder(newOrder);
    setIsManualOrderModalOpen(false);
    reloadData();
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Orders & Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of tuition fee collections, course enrolments, and physical book shipments
          </p>
        </div>
        <button
          onClick={() => setIsManualOrderModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Record Offline Payment</span>
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
            placeholder="Search by order ID, student name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Order Type Segmented */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'Course', 'Physical Product'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'All Items' : t === 'Course' ? 'Courses' : 'Books & Kits'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Orders Found"
          description="No orders match your filter criteria. Create or import transactions."
          actionLabel="Record Offline Payment"
          onAction={() => setIsManualOrderModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice & Date</th>
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Purchased Items</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Payment Mode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.createdAt}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.studentPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-xs">
                        {order.items.map((it) => it.name).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.orderType} · {order.items.length} item(s)
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          order.status === 'Paid'
                            ? 'success'
                            : order.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice View Drawer/Modal */}
      {viewingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setViewingOrder(null)}
          title={`Tax Invoice: ${viewingOrder.orderNumber}`}
          subtitle={`Issued on ${viewingOrder.createdAt} · Status: ${viewingOrder.status}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Invoice Header */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-white p-1 rounded-md border border-slate-200 shrink-0">
                  <img
                    src="/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg"
                    alt="OJAS Classes"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">OJAS Classes Private Limited</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    GSTIN: 08AAAAA0000A1Z5 · Education Hub, Vigyan Nagar, Kota (Raj)
                  </p>
                  <p className="text-[11px] text-slate-500">Contact: contact@ojasclasses.edu.in</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 block">
                  {viewingOrder.orderNumber}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Ref: {viewingOrder.transactionId}
                </span>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 p-4 border border-slate-200 rounded-xl bg-white">
              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                  Billed To (Student)
                </span>
                <div className="font-bold text-slate-900">{viewingOrder.studentName}</div>
                <div className="font-mono text-slate-600">{viewingOrder.studentPhone}</div>
                <div className="text-slate-500">{viewingOrder.studentEmail}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                  Payment Details
                </span>
                <div className="text-slate-800">
                  <span className="font-medium">Method:</span> {viewingOrder.paymentMethod}
                </div>
                <div className="text-slate-800">
                  <span className="font-medium">Status:</span> {viewingOrder.status}
                </div>
                {viewingOrder.shippingAddress && (
                  <div className="text-slate-500 mt-1 truncate">
                    <span className="font-medium">Address:</span> {viewingOrder.shippingAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4 text-center">Type</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{it.name}</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">{it.type}</td>
                      <td className="py-2.5 px-4 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{it.price.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
                <span className="font-semibold text-slate-700">Total Amount Received (INR):</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{viewingOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Manual Offline Order Modal */}
      {isManualOrderModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsManualOrderModalOpen(false)}
          title="Record Offline Fee Collection"
          subtitle="Generate invoice for cash, demand draft, or bank transfer payments received at center"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsManualOrderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateManualOrder}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Generate Receipt
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Category</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'Course' | 'Physical Product';
                    setFormData((prev) => ({
                      ...prev,
                      orderType: nextType,
                      selectedItemId: nextType === 'Course' ? courses[0]?.id || '' : products[0]?.id || '',
                      amount: nextType === 'Course' ? courses[0]?.price || 14999 : products[0]?.price || 1299,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Course">Course Tuition Fee</option>
                  <option value="Physical Product">Study Material & Book Set</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Select Item Package</label>
                <select
                  value={formData.selectedItemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {formData.orderType === 'Course'
                    ? courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} — ₹{c.price.toLocaleString('en-IN')}
                        </option>
                      ))
                    : products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{p.price.toLocaleString('en-IN')}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Collected Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Instrument</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Offline Cash">Center Counter Cash</option>
                  <option value="Netbanking">NEFT / RTGS Bank Transfer</option>
                  <option value="UPI">Center UPI QR Scanner</option>
                  <option value="Card">POS Card Machine</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

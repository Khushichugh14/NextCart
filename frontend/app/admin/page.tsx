"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, REGIONS } from '@/context/AuthContext';
import { 
  FaBoxOpen, 
  FaUserFriends, 
  FaChartLine, 
  FaCog, 
  FaPlus, 
  FaTrashAlt, 
  FaEdit, 
  FaArrowLeft, 
  FaTimes, 
  FaCheck, 
  FaSearch 
} from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  items: string;
  total: number;
  status: 'Processing' | 'In Transit' | 'Delivered';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  status: 'Active' | 'Suspended';
}

const initialOrders: Order[] = [
  { id: "ORD-9284-A", customer: "Alex Johnson", date: "June 10, 2026", items: "1x Apple iPhone 15", total: 1044.00, status: "Delivered" },
  { id: "ORD-1849-C", customer: "David Chen", date: "June 08, 2026", items: "1x Sony WH-1000XM5", total: 399.00, status: "In Transit" },
  { id: "ORD-0283-F", customer: "Sarah Miller", date: "May 25, 2026", items: "1x Slim Fit Jeans, 1x Beanie Hat", total: 75.00, status: "Processing" },
];

const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", role: "ROLE_USER", status: "Active" },
  { id: 2, name: "Admin User", email: "admin@nextcart.com", role: "ROLE_ADMIN", status: "Active" },
  { id: 3, name: "Sarah Miller", email: "sarah.m@example.com", role: "ROLE_USER", status: "Active" },
  { id: 4, name: "Spammer Jack", email: "jack@spam.com", role: "ROLE_USER", status: "Suspended" },
];

export default function AdminDashboard() {
  const { user, token, formatPrice } = useAuth();
  const regionKey = user?.region || 'US';
  const regionConfig = REGIONS[regionKey as keyof typeof REGIONS] || REGIONS.US;
  const [activeTab, setActiveTab] = useState<'hub' | 'overview' | 'orders' | 'products' | 'users'>('hub');
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);


  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form States
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Electronics');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');

  const fetchProducts = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('nc_products', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.warn('Backend API failed to load in admin, checking local storage...', err);
        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem('nc_products');
          if (stored) {
            setProducts(JSON.parse(stored));
            return;
          }
        }
        fetch('/data/products.json')
          .then((res) => res.json())
          .then((data) => setProducts(data))
          .catch((jsonErr) => console.error('Failed to load products in admin', jsonErr));
      });
  };

  const fetchOrders = () => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(data => {
        const mappedOrders = data.map((o: any) => ({
          id: o.razorpayOrderId || o.id.toString(),
          customer: o.userId ? `User #${o.userId}` : 'Guest',
          date: new Date(o.createdAt).toLocaleDateString(),
          items: 'Items hidden (mock)',
          total: o.amount / 100,
          status: o.status
        }));
        setOrders(mappedOrders);
      })
      .catch(err => {
        console.error('Failed to fetch orders', err);
        setOrders([]);
      });
  };

  const fetchUsers = () => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => {
        console.error('Failed to fetch users', err);
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchProducts();
    if (user && user.role === 'ROLE_ADMIN') {
      fetchOrders();
      fetchUsers();
    }
  }, [user, token]);

  const saveProductsLocal = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nc_products', JSON.stringify(updatedProducts));
    }
  };

  // Create Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const priceInUSD = (parseFloat(newProductPrice) || 0) / regionConfig.rate;
    const addedProduct: Product = {
      id: newId,
      name: newProductName,
      category: newProductCategory,
      price: priceInUSD,
      imageUrl: newProductImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      description: newProductDesc,
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(addedProduct),
    })
      .then(() => {
        fetchProducts();
      })
      .catch((err) => {
        console.error('Failed to save to backend, saving locally only', err);
        const updated = [addedProduct, ...products];
        saveProductsLocal(updated);
      });
    
    // Reset fields
    setNewProductName('');
    setNewProductPrice('');
    setNewProductImage('');
    setNewProductDesc('');
    setIsAddModalOpen(false);
  };

  // Update Product
  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingProduct),
    })
      .then(() => {
        fetchProducts();
      })
      .catch((err) => {
        console.error('Failed to update on backend, updating locally only', err);
        const updated = products.map((p) => {
          if (p.id === editingProduct.id) {
            return editingProduct;
          }
          return p;
        });
        saveProductsLocal(updated);
      });

    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => {
          fetchProducts();
        })
        .catch((err) => {
          console.error('Failed to delete on backend, deleting locally only', err);
          const updated = products.filter(p => p.id !== id);
          saveProductsLocal(updated);
        });
    }
  };

  // Toggle Order Status
  const handleNextStatus = (orderId: string) => {
    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        let nextStatus: Order['status'] = o.status;
        if (o.status === 'Processing') nextStatus = 'In Transit';
        else if (o.status === 'In Transit') nextStatus = 'Delivered';
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  // Toggle User Role
  const handleToggleRole = (userId: number) => {
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;
    const newRole = userToToggle.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role: newRole })
    })
      .then(res => {
        if (res.ok) fetchUsers();
      })
      .catch(err => console.error('Failed to update role', err));
  };

  // Toggle User Status
  const handleToggleStatus = (userId: number) => {
    setUsers(users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    }));
  };

  // Product categories list
  const productCategories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'All' || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  // Check role before rendering
  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent py-24 px-4 text-center text-foreground">
        <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <FaTimes className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Access Denied</h2>
          <p className="text-sm text-slate-400 font-semibold leading-relaxed">
            You do not have administrative privileges to access this area. Please sign in as an administrator.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link 
              href="/login" 
              className="w-full inline-flex items-center justify-center py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition shadow-lg shadow-cyan-600/20 active:scale-95 text-sm"
            >
              Sign In as Admin
            </Link>
            <Link 
              href="/" 
              className="w-full inline-flex items-center justify-center py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-350 font-bold rounded-2xl transition border border-slate-200 dark:border-slate-800 active:scale-95 text-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {activeTab !== 'hub' && (
              <button 
                onClick={() => setActiveTab('hub')}
                className="p-3 rounded-2xl glass-panel border border-white/20 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-sm font-semibold text-slate-400">
                {activeTab === 'hub' ? 'Control center for NextCart store management' : `Dashboard > ${activeTab.toUpperCase()}`}
              </p>
            </div>
          </div>
          
          {/* Quick tab switcher when outside the main hub */}
          {activeTab !== 'hub' && (
            <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 text-xs sm:text-sm">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-bold rounded-xl transition ${activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 font-bold rounded-xl transition ${activeTab === 'orders' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 font-bold rounded-xl transition ${activeTab === 'products' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-bold rounded-xl transition ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Users
              </button>
            </div>
          )}
        </div>

        {/* VIEW 1: HUB / SELECT PANEL */}
        {activeTab === 'hub' && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="p-8 glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl hover:scale-105 active:scale-98 transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-cyan-600 dark:text-cyan-400 mb-4 bg-cyan-500/10 p-4 rounded-2xl"><FaChartLine className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Overview</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">Quick stats, sales indicators, and event activity log.</p>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="p-8 glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl hover:scale-105 active:scale-98 transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-cyan-600 dark:text-cyan-400 mb-4 bg-cyan-500/10 p-4 rounded-2xl"><FaBoxOpen className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Orders</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">Fulfillment queue, status updates, and tracking.</p>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="p-8 glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl hover:scale-105 active:scale-98 transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-cyan-600 dark:text-cyan-400 mb-4 bg-cyan-500/10 p-4 rounded-2xl"><FaCog className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Products</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">Add new, edit attributes, or delete catalogue items.</p>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className="p-8 glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl hover:scale-105 active:scale-98 transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-cyan-600 dark:text-cyan-400 mb-4 bg-cyan-500/10 p-4 rounded-2xl"><FaUserFriends className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Users</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">Manage user roles, ban/suspend accounts, view emails.</p>
            </button>
          </div>
        )}

        {/* VIEW 2: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-lg space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
                <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{formatPrice(12450.00)}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 w-[78%] h-full rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500">+12% vs last month</span>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-lg space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders Fulfilling</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{orders.length}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 w-[60%] h-full rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">3 processing currently</span>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-lg space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Products Active</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{products.length}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 w-[90%] h-full rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500">Just added {products.filter(p => p.id > 35).length} new items</span>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-lg space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Users</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{users.length}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-[70%] h-full rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500">1 suspended account</span>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                Recent Store Activity
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <div className="text-sm font-semibold">
                    <p className="text-slate-800 dark:text-slate-200">Order <span className="font-bold text-cyan-600">ORD-9284-A</span> was marked as <span className="text-emerald-500">Delivered</span></p>
                    <span className="text-[10px] text-slate-400">10 minutes ago</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <div className="w-2 h-2 mt-1.5 bg-cyan-500 rounded-full shrink-0" />
                  <div className="text-sm font-semibold">
                    <p className="text-slate-800 dark:text-slate-200">New Product <span className="font-bold text-slate-700 dark:text-slate-300">"Cozy Hoodie"</span> added to catalogue</p>
                    <span className="text-[10px] text-slate-400">1 hour ago</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-2">
                  <div className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full shrink-0" />
                  <div className="text-sm font-semibold">
                    <p className="text-slate-800 dark:text-slate-200">User role updated for <span className="font-bold">admin@nextcart.com</span> to Administrator</p>
                    <span className="text-[10px] text-slate-400">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Order Fulfillment Queue</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/60">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Items</th>
                    <th className="py-4 px-6">Total Paid</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Fulfill Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-semibold">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition">
                      <td className="py-4 px-6 text-slate-900 dark:text-slate-100 font-bold">{o.id}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{o.customer}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs font-medium">{o.items}</td>
                      <td className="py-4 px-6 text-cyan-600 dark:text-cyan-400">{formatPrice(o.total)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          o.status === 'Delivered' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : o.status === 'In Transit'
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {o.status !== 'Delivered' ? (
                          <button
                            onClick={() => handleNextStatus(o.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-cyan-600/10"
                          >
                            <FaCheck className="w-2.5 h-2.5" />
                            <span>{o.status === 'Processing' ? 'Ship Item' : 'Deliver'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">Fulfillment Complete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Search/Filters & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-xl">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 w-3.5 h-3.5" />
                </div>

                {/* Category Dropdown Filter */}
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                >
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Add New Product Trigger */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-lg shadow-cyan-600/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Catalogue Table */}
            <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/60">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Product details</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-semibold">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition">
                        <td className="py-4 px-6 text-slate-400 font-bold">#{p.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200/50 dark:border-slate-800">
                              <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-800 dark:text-slate-100 font-bold truncate max-w-[200px]">{p.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{p.category}</td>
                        <td className="py-4 px-6 text-cyan-600 dark:text-cyan-400 font-extrabold">{formatPrice(p.price)}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition cursor-pointer"
                              aria-label="Edit product"
                            >
                              <FaEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                              aria-label="Delete product"
                            >
                              <FaTrashAlt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No products match your search/filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: USERS */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Customer & Administrator Accounts</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/60">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-semibold">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition">
                      <td className="py-4 px-6 text-slate-900 dark:text-slate-100 font-bold">{u.name}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'ROLE_ADMIN' 
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2 text-xs font-bold">
                          <button
                            onClick={() => handleToggleRole(u.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all hover:scale-102 cursor-pointer"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-3 py-1.5 rounded-xl transition-all hover:scale-102 cursor-pointer ${
                              u.status === 'Active'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl relative space-y-6">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add New Product</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Keyboard"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Books">Books</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ({regionConfig.symbol} {regionConfig.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 59.99"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Enter detailed description..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-600/20 hover:scale-102 active:scale-95 cursor-pointer"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Product Attributes</h3>
            
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Books">Books</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ({regionConfig.symbol} {regionConfig.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price ? (editingProduct.price * regionConfig.rate).toFixed(2) : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: (parseFloat(e.target.value) || 0) / regionConfig.rate })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-600/20 hover:scale-102 active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}

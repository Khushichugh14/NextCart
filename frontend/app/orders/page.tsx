"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiPackage, FiArrowRight, FiCheckCircle, FiClock, FiTruck } from 'react-icons/fi';

const mockOrders = [
  {
    id: "ORD-9284-A",
    date: "June 10, 2026",
    status: "Delivered",
    total: 1044.00,
    items: [
      { name: "Apple iPhone 15", qty: 1, price: 999 },
      { name: "Cozy Hoodie", qty: 1, price: 45 }
    ]
  },
  {
    id: "ORD-1849-C",
    date: "June 08, 2026",
    status: "In Transit",
    total: 399.00,
    items: [
      { name: "Sony WH-1000XM5", qty: 1, price: 399 }
    ]
  },
  {
    id: "ORD-0283-F",
    date: "May 25, 2026",
    status: "Processing",
    total: 75.00,
    items: [
      { name: "Slim Fit Jeans", qty: 1, price: 55 },
      { name: "Beanie Hat", qty: 1, price: 20 }
    ]
  }
];

const statusMeta = {
  "Delivered": { icon: FiCheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
  "In Transit": { icon: FiTruck, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10" },
  "Processing": { icon: FiClock, color: "text-amber-500 bg-amber-500/10" }
};

export default function OrdersPage() {
  const { formatPrice } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nc_orders');
      const customOrders = stored ? JSON.parse(stored) : [];
      setOrders([...customOrders, ...mockOrders]);
    } catch (err) {
      console.error("Failed to load custom orders from localStorage", err);
      setOrders(mockOrders);
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
          <FiPackage className="text-cyan-600 dark:text-cyan-400" />
          <span>My Orders</span>
        </h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const meta = statusMeta[order.status as keyof typeof statusMeta] || statusMeta["Processing"];
            const StatusIcon = meta.icon;
            const statusColor = meta.color;

            return (
              <div
                key={order.id}
                className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">{order.id}</h3>
                    <p className="text-xs text-slate-400 font-medium">{order.date}</p>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${statusColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{order.status}</span>
                    </div>
                    <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 text-sm font-semibold">
                        <div className="text-slate-600 dark:text-slate-300">
                          {item.name} <span className="text-xs text-slate-400">x{item.qty}</span>
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

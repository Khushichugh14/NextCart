"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  FiCheckCircle, 
  FiArrowLeft, 
  FiCreditCard, 
  FiSmartphone, 
  FiMapPin, 
  FiInfo,
  FiShoppingBag,
  FiLock
} from 'react-icons/fi';

type PaymentMethod = 'card' | 'upi' | 'qr' | 'cod';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { formatPrice, user, isLoggedIn, token } = useAuth();
  const router = useRouter();

  // Checkout Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [upiId, setUpiId] = useState('');
  
  // Flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Cart summary calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 15; // Free shipping above $100
  const total = subtotal + tax + shipping;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total,
          currency: 'USD'
        })
      });

      if (!res.ok) throw new Error('Failed to create order');

      const data = await res.json();

      // 2. Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'NextCart',
        description: 'Purchase from NextCart',
        order_id: data.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              setIsProcessing(false);
              setIsSuccess(true);
              setOrderId(data.id);
              clearCart();
            } else {
              alert('Payment verification failed. Please contact support.');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error('Verification error', err);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName || user?.name,
          email: email || user?.email,
          contact: phone || user?.phone
        },
        theme: {
          color: '#0891b2'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Order creation error', err);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent py-24 px-4 text-center text-foreground">
        <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
            <FiLock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Login Required</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">
              Please sign in to your NextCart account to complete your checkout and secure your items.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/cart"
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold transition text-sm text-center"
            >
              Back to Cart
            </Link>
            <Link
              href="/login?redirect=/checkout"
              className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold transition shadow-lg shadow-cyan-600/20 text-sm text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent py-24 px-4 text-center text-foreground">
        <div className="glass-panel max-w-lg w-full p-8 sm:p-12 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Success Confetti/Glitter Effect (Simulated via divs) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <FiCheckCircle className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Your order has been placed successfully. Thank you for choosing NextCart!
            </p>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Order ID</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Payment Method</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">
                {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'qr' ? 'QR Code' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Amount Paid</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatPrice(total)}</span>
            </div>
          </div>

          {/* SMS Notification Message Banner */}
          <div className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 p-4 rounded-2xl border border-cyan-500/25 text-xs font-semibold text-left space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold">
              <span>💬 SMS Confirmation Sent</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Sent to: <span className="font-bold text-slate-700 dark:text-slate-300">{phone ? `${countryCode} ${phone}` : (user?.phone || '+1 (555) 000-0000')}</span>
            </p>
            <p className="italic bg-slate-900/5 dark:bg-black/20 p-2 rounded-lg text-slate-650 dark:text-slate-300 font-medium">
              "Hi {fullName || user?.name || 'Customer'}, your NextCart order {orderId} of {formatPrice(total)} has been successfully confirmed and is being packaged!"
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold transition text-center"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="flex-1 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold transition shadow-lg shadow-cyan-600/20 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-24 px-4 sm:px-6 lg:px-8 text-foreground">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 font-semibold mb-8 transition-colors">
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <FiLock className="text-cyan-600 dark:text-cyan-400" />
          <span>Secure Checkout</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
            <p className="text-slate-400 text-lg font-medium">No items to checkout.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <FiArrowLeft /> Go to Products
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Billing / Shipping / Payment Info */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Shipping Details */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <FiMapPin className="text-cyan-500" />
                  <span>Shipping Address</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-2.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition cursor-pointer text-sm font-semibold"
                      >
                        <option value="+1">+1 (US)</option>
                        <option value="+91">+91 (IN)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+33">+33 (FR)</option>
                        <option value="+49">+49 (DE)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Luxury Ave, Apt 4B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="10001"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <FiCreditCard className="text-cyan-500" />
                  <span>Choose Payment Method</span>
                </h2>

                {/* Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                    }`}
                  >
                    <FiCreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                    }`}
                  >
                    <FiSmartphone className="w-4 h-4" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      paymentMethod === 'qr'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 4h6v6H4V4zm2 2v2h2V6H6zm8-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6z" />
                    </svg>
                    <span>QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                    }`}
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    <span>COD</span>
                  </button>
                </div>

                {/* Form fields depending on method */}
                <div className="space-y-4 pt-2">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                          />
                          <FiCreditCard className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CVC / CVV</label>
                          <input
                            type="password"
                            required
                            placeholder="123"
                            maxLength={3}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="username@bank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:focus:ring-cyan-400 transition"
                          />
                          <FiSmartphone className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                          <FiInfo className="w-3.5 h-3.5" /> Enter your Virtual Payment Address (VPA) to pay instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'qr' && (
                    <div className="space-y-4 animate-fadeIn flex flex-col items-center justify-center text-center p-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Scan the QR Code to Pay
                      </p>
                      <div className="relative w-48 h-48 bg-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                        <Image 
                          src="/pay_qr.png" 
                          alt="Payment QR Code" 
                          fill 
                          className="object-contain p-2" 
                          unoptimized 
                        />
                      </div>
                      <div className="text-xs font-semibold text-slate-400 max-w-xs space-y-1">
                        <p className="text-cyan-600 dark:text-cyan-400 font-bold">Amount to scan: {formatPrice(total)}</p>
                        <p>Scan using any UPI, banking app, or mobile wallet. The payment status will update automatically once verified.</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-cyan-500/5 dark:bg-cyan-500/10 p-5 rounded-2xl border border-cyan-500/20 text-slate-600 dark:text-slate-300 text-sm font-semibold space-y-1">
                      <p>💵 Pay with cash upon delivery of your products.</p>
                      <p className="text-slate-400 text-xs font-medium">An additional {formatPrice(2.50)} COD fee may apply depending on location.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right side: Summary & Submit */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Items Review */}
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  Review Order
                </h2>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-white/10">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{item.name}</h4>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Details Summary */}
              <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  Summary
                </h3>
                
                <div className="space-y-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800 dark:text-slate-100">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-slate-800 dark:text-slate-100">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-slate-100 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                    <span>Total</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 mt-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 disabled:bg-slate-400 text-white rounded-2xl font-bold shadow-lg shadow-cyan-600/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Securely...</span>
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4" />
                      <span>Pay {formatPrice(total)}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>
        )}
      </div>
    </div>
  );
}

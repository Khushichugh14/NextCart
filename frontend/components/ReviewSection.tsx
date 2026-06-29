"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiStar, FiUser } from 'react-icons/fi';

interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewSection({ productId }: { productId: number }) {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to leave a review.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, rating, comment })
      });

      if (!res.ok) throw new Error('Failed to submit review');
      
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(5);
    } catch (err) {
      setError('Failed to submit review. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {user ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5">
              <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Write a Review</h3>
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <FiStar className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Comment</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 transition"
                    placeholder="What did you like or dislike?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-white/5 text-center">
              <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Sign in to review</h3>
              <p className="text-sm text-slate-500 mb-4">You must be logged in to leave a review.</p>
              <a href="/login" className="inline-block py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition">
                Log In
              </a>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p className="text-slate-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 glass-panel rounded-2xl border border-white/20 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{rev.userName}</p>
                      <p className="text-xs text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} className={`w-4 h-4 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

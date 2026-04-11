import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { reviewAPI } from '../../services/api';
import StarRating from './StarRating';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

export default function ReviewForm({ vendorId, onSuccess }) {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    if (!isAuthenticated) {
        return (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
                <p className="text-sm text-gray-600">Please <a href="/login" className="text-orange-500 font-semibold">login</a> to write a review.</p>
            </div>
        );
    }

    const onSubmit = async ({ comment }) => {
        setLoading(true);
        try {
            const { data } = await reviewAPI.create({ vendor_id: vendorId, rating, comment });
            toast.success('Review submitted! 🌟');
            reset();
            setRating(5);
            onSuccess && onSuccess(data.review);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit review.';
            toast.error(msg);
            if (msg.toLowerCase().includes('already')) {
                onSuccess && onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="text-sm text-gray-500 mb-2 block">Your Rating</label>
                <StarRating rating={rating} onChange={setRating} size={28} />
            </div>

            <div className="mb-4">
                <textarea
                    {...register('comment')}
                    rows={4}
                    placeholder="Share your experience — what did you eat? Was the quality good? Would you recommend it?"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none transition"
                />
                {errors.comment && <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

import { motion } from 'framer-motion';
import { ThumbsUp, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { formatDate, getInitials } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReviewCard({ review, onDelete }) {
    const { user } = useAuth();
    const canDelete = user && (user.id === review.user_id || user.role === 'admin');

    const handleHelpful = async () => {
        try {
            await reviewAPI.markHelpful(review.id);
            toast.success('Marked as helpful!');
        } catch {
            toast.error('Failed to mark as helpful');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await reviewAPI.delete(review.id);
            toast.success('Review deleted.');
            onDelete && onDelete(review.id);
        } catch {
            toast.error('Failed to delete review');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #c23b0a)' }}>
                    {review.user_avatar
                        ? <img src={review.user_avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        : getInitials(review.user_name)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.user_name}</p>
                            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                        </div>
                        <StarRating rating={review.rating} readonly size={14} />
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

            <div className="flex items-center justify-between">
                <button onClick={handleHelpful} className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors">
                    <ThumbsUp size={13} />
                    <span>Helpful ({review.helpful_count || 0})</span>
                </button>
                {canDelete && (
                    <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={13} /> Delete
                    </button>
                )}
            </div>
        </motion.div>
    );
}

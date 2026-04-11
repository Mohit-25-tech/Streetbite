import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Clock, Navigation, CheckCircle, Package, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewForm from '../components/review/ReviewForm';

export default function PastOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewingOrderId, setReviewingOrderId] = useState(null);
    const [completedReviews, setCompletedReviews] = useState(new Set());

    useEffect(() => {
        orderAPI.getMyOrders()
            .then(res => setOrders(res.data.orders))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-orange-100 text-brand rounded-full flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                            Past Orders
                        </h1>
                        <p className="text-gray-500 font-medium">Your complete taste history.</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 font-medium mb-6">Looks like you haven't ordered anything. Let's fix that!</p>
                        <Link to="/explore" className="px-6 py-3 bg-brand text-white font-bold rounded-xl shadow-sm hover:bg-brand-dark transition-colors inline-block">
                            Explore Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                            {order.vendor_logo ? (
                                                <img src={order.vendor_logo} alt={order.vendor_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🥘</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{order.vendor_name}</h3>
                                            <p className="text-[12px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                                <Clock size={12} /> {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-gray-900 text-lg">₹{order.total_amount}</span>
                                        <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                                            <CheckCircle size={10} /> {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-sm text-gray-600 mb-4 font-medium uppercase tracking-wider">Order Details ({order.items.length} items)</div>
                                    <div className="space-y-3">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-[15px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[12px] font-bold text-gray-700">
                                                        {item.quantity}x
                                                    </div>
                                                    <span className="font-medium text-gray-800">{item.item_name}</span>
                                                </div>
                                                <span className="text-gray-500">₹{item.unit_price}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-500">
                                            Paid via <span className="text-gray-800 font-bold">{order.payment_method}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {order.delivery_distance_km && (
                                                <div className="hidden sm:flex text-sm font-medium text-gray-500 items-center gap-1">
                                                    <Navigation size={14} className="text-brand" /> {order.delivery_distance_km} km away
                                                </div>
                                            )}
                                            {reviewingOrderId !== order.id && !completedReviews.has(order.vendor_id) && (
                                                <button onClick={() => setReviewingOrderId(order.id)} className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
                                                    <MessageSquare size={14} className="text-brand" /> Leave Feedback
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {reviewingOrderId === order.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[14px] font-bold text-gray-900">Review {order.vendor_name}</span>
                                                <button onClick={() => setReviewingOrderId(null)} className="text-[12px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest bg-gray-50 px-2 rounded">Cancel</button>
                                            </div>
                                            <ReviewForm 
                                                vendorId={order.vendor_id} 
                                                onSuccess={() => {
                                                    setReviewingOrderId(null);
                                                    setCompletedReviews(prev => new Set([...prev, order.vendor_id]));
                                                }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

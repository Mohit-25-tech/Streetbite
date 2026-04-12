/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit3, Save, X, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, favoritesAPI, reviewAPI } from '../services/api';
import VendorCard from '../components/vendor/VendorCard';
import ReviewCard from '../components/review/ReviewCard';
import { getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', avatar_url: user?.avatar_url || '' });
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('favorites');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            favoritesAPI.getAll(),
            reviewAPI.getUserReviews(),
        ]).then(([fRes, rRes]) => {
            setFavorites(fRes.data.favorites);
            setReviews(rRes.data.reviews);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            const { data } = await authAPI.updateProfile(form);
            updateUser(data.user);
            setEditing(false);
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 py-10 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center text-3xl font-bold bg-brand text-white">
                        {user?.avatar_url
                            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            : getInitials(user?.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mt-2 relative w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>{user?.name}</h1>
                                <p className="text-gray-500 font-medium">{user?.email}</p>
                                <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-brand-bg text-brand uppercase tracking-wider">{user?.role}</span>
                            </div>

                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="flex items-center justify-center gap-2 text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors shrink-0">
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex justify-center md:justify-start gap-2">
                                    <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-[14px] transition-colors"><X size={16} /></button>
                                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-medium text-[14px] transition-colors"><Save size={16} /> Save</button>
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {editing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
                                >
                                    <div>
                                        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Full Name</label>
                                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-brand bg-white" />
                                    </div>
                                    <div>
                                        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Avatar URL</label>
                                        <input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-brand bg-white" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-center md:justify-start gap-8 mt-6">
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-black text-gray-900 leading-none">{favorites.length}</p>
                                <p className="text-[13px] text-gray-500 font-medium tracking-tight">Favorites</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-black text-gray-900 leading-none">{reviews.length}</p>
                                <p className="text-[13px] text-gray-500 font-medium tracking-tight">Reviews</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-black text-gray-900 leading-none">{formatDate(user?.created_at, true) || '2026'}</p>
                                <p className="text-[13px] text-gray-500 font-medium tracking-tight">Joined</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    {[
                        { key: 'favorites', label: 'Liked Places', icon: Heart },
                        { key: 'reviews', label: 'My Reviews', icon: MessageCircle },
                    ].map(({ key, label, icon: TabIcon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 pb-4 pt-2 px-2 text-[15px] font-bold border-b-2 transition-all outline-none ${activeTab === key
                                ? 'border-brand text-brand'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <TabIcon size={18} className={activeTab === key ? 'fill-brand/20' : ''} /> {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'favorites' && (
                        loading ? <div className="text-center py-12 text-gray-400 font-medium">Loading your favorites...</div>
                            : favorites.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                                    <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mb-4">
                                        <Heart size={32} className="text-brand fill-brand/20" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                                    <p className="text-gray-500 text-[15px] font-medium max-w-sm">Tap the heart icon on any street food spot to save it here for later.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map(v => <VendorCard key={v.id} vendor={v} />)}
                                </div>
                            )
                    )}

                    {activeTab === 'reviews' && (
                        loading ? <div className="text-center py-12 text-gray-400 font-medium">Loading your reviews...</div>
                            : reviews.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                                    <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle size={32} className="text-brand" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't left any reviews</h3>
                                    <p className="text-gray-500 text-[15px] font-medium max-w-sm">Share your street food experiences to help the community discover great places.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-2xl">
                                    {reviews.map(r => (
                                        <div key={r.id} className="relative modern-card p-0 border-transparent shadow-sm hover:shadow-md transition-shadow">
                                            <ReviewCard review={r} hideUser={true} />
                                            {r.vendor_name && (
                                                <div className="px-4 pb-4 pt-1">
                                                    <p className="text-[13px] text-gray-500 font-medium bg-gray-50 inline-block px-3 py-1.5 rounded-lg border border-gray-100">
                                                        Reviewed: <span className="font-bold text-gray-900">{r.vendor_name}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                    )}
                </div>
            </div>
        </div>
    );
}

/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, BarChart3, Star, Heart, Eye, X, Save } from 'lucide-react';
import { vendorAPI, menuAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatRating, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function MenuItemModal({ item, vendorId, onClose, onSave }) {
    const [form, setForm] = useState(item || { name: '', description: '', price: '', category: 'Main', is_veg: true, image_url: '', is_available: true, vendor_id: vendorId });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
        setLoading(true);
        try {
            const data = { ...form, price: parseFloat(form.price), vendor_id: vendorId };
            if (item?.id) {
                const res = await menuAPI.update(item.id, data);
                onSave(res.data.item, true);
            } else {
                const res = await menuAPI.create(data);
                onSave(res.data.item, false);
            }
            toast.success(item?.id ? 'Item updated!' : 'Item added!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg text-gray-900">{item?.id ? 'Edit Item' : 'Add Menu Item'}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Item Name', key: 'name', type: 'text', placeholder: 'e.g., Pani Puri' },
                        { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '50' },
                        { label: 'Image URL', key: 'image_url', type: 'text', placeholder: 'https://...' },
                    ].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">{label}</label>
                            <input
                                type={type}
                                value={form[key]}
                                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Description</label>
                        <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description..." rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Category</label>
                            <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none">
                                {['Main', 'Starter', 'Snacks', 'Drinks', 'Desserts', 'Other'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Type</label>
                            <div className="flex gap-2">
                                {[{ label: '🟢 Veg', val: true }, { label: '🔴 Non-Veg', val: false }].map(({ label, val }) => (
                                    <button key={String(val)} type="button" onClick={() => setForm(prev => ({ ...prev, is_veg: val }))}
                                        className={`flex-1 py-2 text-xs rounded-xl border transition-all ${form.is_veg === val ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium' : 'border-gray-200 text-gray-500'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_available} onChange={e => setForm(prev => ({ ...prev, is_available: e.target.checked }))} className="accent-orange-500" />
                        <span className="text-sm text-gray-600">Currently available</span>
                    </label>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                        <Save size={14} /> {loading ? 'Saving...' : 'Save Item'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [modalItem, setModalItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [editVendor, setEditVendor] = useState(false);
    const [vendorForm, setVendorForm] = useState({});

    useEffect(() => {
        if (user?.role !== 'vendor') { navigate('/'); return; }
        vendorAPI.getMyVendor()
            .then(({ data }) => {
                setVendor(data.vendor);
                setVendorForm(data.vendor);
                return Promise.all([
                    menuAPI.getByVendor(data.vendor.id),
                    vendorAPI.getAnalytics(data.vendor.id),
                ]).then(([mRes, aRes]) => {
                    setMenuItems(mRes.data.items);
                    setAnalytics(aRes.data.analytics);
                });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user]);

    const toggleOpen = async () => {
        if (!vendor) return;
        setToggling(true);
        try {
            const { data } = await vendorAPI.update(vendor.id, { is_open: !vendor.is_open });
            setVendor(data.vendor);
            toast.success(data.vendor.is_open ? 'You\'re now Open! 🟢' : 'Marked as Closed 🔴');
        } catch { toast.error('Failed to update status'); }
        finally { setToggling(false); }
    };

    const handleMenuSave = (item, isUpdate) => {
        if (isUpdate) setMenuItems(prev => prev.map(m => m.id === item.id ? item : m));
        else setMenuItems(prev => [item, ...prev]);
    };

    const deleteMenuItem = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await menuAPI.delete(id);
            setMenuItems(prev => prev.filter(m => m.id !== id));
            toast.success('Item deleted.');
        } catch { toast.error('Failed to delete item'); }
    };

    const saveVendorProfile = async () => {
        try {
            const { data } = await vendorAPI.update(vendor.id, vendorForm);
            setVendor(data.vendor);
            setEditVendor(false);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to update profile'); }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="text-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400">Loading dashboard...</p></div>
        </div>
    );

    if (!vendor) return (
        <div className="min-h-screen pt-24 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-5xl mb-4">🏪</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vendor Profile</h2>
                <p className="text-gray-500 mb-6">You haven't set up your vendor profile yet. Create one to start listing your street food stall on StreetBite.</p>
                <button
                    onClick={() => navigate('/dashboard/create')}
                    className="px-8 py-3 rounded-2xl text-white font-semibold hover:scale-105 transition-transform shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}
                >
                    🚀 Create Vendor Profile
                </button>
            </div>
        </div>
    );

    const tabs = ['overview', 'menu', 'profile'];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-orange-100">
                                {vendor.logo ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-400 text-lg">🍽️</div>}
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>{vendor.name}</h1>
                                <p className="text-sm text-gray-400">{vendor.category} · {vendor.city}</p>
                            </div>
                        </div>
                        <button onClick={toggleOpen} disabled={toggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${vendor.is_open ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                            {vendor.is_open ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {toggling ? 'Updating...' : vendor.is_open ? 'Open · Click to Close' : 'Closed · Click to Open'}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4">
                        {tabs.map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`capitalize px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                style={activeTab === t ? { background: 'linear-gradient(135deg, #FF6B35, #e85520)' } : {}}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === 'overview' && analytics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Avg Rating', value: formatRating(analytics.avg_rating), icon: '⭐', color: 'orange' },
                                { label: 'Total Reviews', value: analytics.reviews, icon: '💬', color: 'blue' },
                                { label: 'Favorites', value: analytics.favorites, icon: '❤️', color: 'red' },
                                { label: 'Menu Items', value: analytics.menu_items, icon: '🍽️', color: 'green' },
                            ].map(({ label, value, icon, color }) => (
                                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <div className="text-2xl mb-2">{icon}</div>
                                    <div className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit' }}>{value}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Rating breakdown */}
                        {analytics.rating_breakdown?.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                                <div className="space-y-2.5">
                                    {[5, 4, 3, 2, 1].map(s => {
                                        const bd = analytics.rating_breakdown.find(b => parseInt(b.rating) === s);
                                        const count = parseInt(bd?.count || 0);
                                        const pct = analytics.reviews > 0 ? (count / analytics.reviews) * 100 : 0;
                                        return (
                                            <div key={s} className="flex items-center gap-3 text-sm">
                                                <span className="w-4 text-gray-500 text-right">{s}</span>
                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="w-5 text-gray-400 text-xs">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── MENU TAB ─── */}
                {activeTab === 'menu' && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-gray-900 text-lg">Menu Items ({menuItems.length})</h2>
                            <button onClick={() => { setModalItem(null); setShowModal(true); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                                style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                                <Plus size={15} /> Add Item
                            </button>
                        </div>
                        {menuItems.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <p className="text-4xl mb-3">🍽️</p>
                                <p className="text-gray-500 text-sm mb-4">No menu items yet.</p>
                                <button onClick={() => { setModalItem(null); setShowModal(true); }}
                                    className="px-5 py-2 rounded-xl text-white text-sm font-medium"
                                    style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>Add First Item</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {menuItems.map(item => (
                                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 shrink-0">
                                            {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🍽️</div>'} />
                                                : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                                                <div className={`w-3 h-3 rounded-full border border-current ${item.is_veg ? 'text-green-500' : 'text-red-500'}`} style={{ background: item.is_veg ? '#22c55e' : '#ef4444' }} />
                                            </div>
                                            <p className="text-xs text-gray-400">{item.category}</p>
                                            <p className="text-orange-500 font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                                            {!item.is_available && <span className="text-xs text-red-400">Unavailable</span>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <button onClick={() => { setModalItem(item); setShowModal(true); }} className="p-1.5 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"><Edit3 size={15} /></button>
                                            <button onClick={() => deleteMenuItem(item.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-gray-900">Vendor Profile</h2>
                            {!editVendor
                                ? <button onClick={() => setEditVendor(true)} className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600"><Edit3 size={15} /> Edit</button>
                                : <div className="flex gap-2">
                                    <button onClick={() => setEditVendor(false)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
                                    <button onClick={saveVendorProfile} className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-sm font-medium">Save</button>
                                </div>
                            }
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Vendor Name', key: 'name' },
                                { label: 'City', key: 'city' },
                                { label: 'Address', key: 'address' },
                                { label: 'Category', key: 'category' },
                                { label: 'Cuisine Type', key: 'cuisine_type' },
                                { label: 'Opening Time', key: 'opening_time', type: 'time' },
                                { label: 'Closing Time', key: 'closing_time', type: 'time' },
                                { label: 'Cover Image URL', key: 'cover_image' },
                                { label: 'Logo URL', key: 'logo' },
                            ].map(({ label, key, type = 'text' }) => (
                                <div key={key}>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                                    {editVendor
                                        ? <input type={type} value={vendorForm[key] || ''} onChange={e => setVendorForm(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                                        : <p className="text-sm text-gray-800 py-2">{vendor[key] || '—'}</p>
                                    }
                                </div>
                            ))}
                            {editVendor && (
                                <>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Latitude</label>
                                        <input type="number" step="any" value={vendorForm.latitude || ''} onChange={e => setVendorForm(p => ({ ...p, latitude: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Longitude</label>
                                        <input type="number" step="any" value={vendorForm.longitude || ''} onChange={e => setVendorForm(p => ({ ...p, longitude: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-4">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                            {editVendor
                                ? <textarea value={vendorForm.description || ''} onChange={e => setVendorForm(p => ({ ...p, description: e.target.value }))} rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
                                : <p className="text-sm text-gray-800">{vendor.description || '—'}</p>
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <MenuItemModal
                        item={modalItem}
                        vendorId={vendor.id}
                        onClose={() => setShowModal(false)}
                        onSave={handleMenuSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

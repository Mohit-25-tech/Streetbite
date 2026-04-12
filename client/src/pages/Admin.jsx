/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, MessageCircle, Tag, CheckCircle, XCircle, Shield, Trash2, Plus } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatRating } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState({ name: '', icon: '', description: '' });

    useEffect(() => {
        if (user?.role !== 'admin') { navigate('/'); return; }
        const fetchData = async () => {
            try {
                const [sRes, vRes, uRes, cRes] = await Promise.all([
                    adminAPI.getStats(), adminAPI.getAllVendors(), adminAPI.getAllUsers(), adminAPI.getCategories(),
                ]);
                setStats(sRes.data.stats);
                setVendors(vRes.data.vendors);
                setUsers(uRes.data.users);
                setCategories(cRes.data.categories);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    const verifyVendor = async (id, isVerified) => {
        try {
            await adminAPI.verifyVendor(id, { is_verified: isVerified });
            setVendors(prev => prev.map(v => v.id === id ? { ...v, is_verified: isVerified } : v));
            toast.success(isVerified ? 'Vendor verified ✅' : 'Vendor unverified');
        } catch { toast.error('Failed to update vendor'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('User deleted.');
        } catch { toast.error('Failed to delete user'); }
    };

    const addCategory = async () => {
        if (!newCat.name) { toast.error('Category name required'); return; }
        try {
            const { data } = await adminAPI.createCategory(newCat);
            setCategories(prev => [...prev, data.category]);
            setNewCat({ name: '', icon: '', description: '' });
            toast.success('Category added!');
        } catch { toast.error('Failed to add category'); }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const tabs = ['stats', 'vendors', 'users', 'categories'];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Shield size={20} style={{ color: '#FF6B35' }} />
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </div>
                    <div className="flex gap-1">
                        {tabs.map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`capitalize px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                style={activeTab === t ? { background: 'linear-gradient(135deg, #FF6B35, #e85520)' } : {}}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* STATS */}
                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'blue' },
                            { label: 'Verified Vendors', value: stats.total_vendors, icon: '🏪', color: 'orange' },
                            { label: 'Reviews', value: stats.total_reviews, icon: '⭐', color: 'yellow' },
                            { label: 'Categories', value: stats.total_categories, icon: '🏷️', color: 'purple' },
                            { label: 'Pending Vendors', value: stats.pending_vendors, icon: '⏳', color: 'red' },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                <div className="text-3xl mb-2">{icon}</div>
                                <div className="text-2xl font-black text-gray-900">{value}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VENDORS */}
                {activeTab === 'vendors' && (
                    <div>
                        <div className="flex gap-3 mb-4">
                            {['all', 'pending', 'verified'].map(f => (
                                <button key={f} className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 capitalize hover:border-orange-400 hover:text-orange-500 transition-colors">
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {['Name', 'Owner', 'City', 'Category', 'Rating', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vendors.map(v => (
                                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                                                <td className="px-4 py-3 text-gray-500">{v.owner_name}</td>
                                                <td className="px-4 py-3 text-gray-500">{v.city}</td>
                                                <td className="px-4 py-3 text-gray-500">{v.category}</td>
                                                <td className="px-4 py-3"><span className="text-yellow-600 font-semibold">★ {formatRating(v.avg_rating)}</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {v.is_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {v.is_verified
                                                            ? <button onClick={() => verifyVendor(v.id, false)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors" title="Unverify"><XCircle size={16} /></button>
                                                            : <button onClick={() => verifyVendor(v.id, true)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-400 hover:text-green-500 transition-colors" title="Verify"><CheckCircle size={16} /></button>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'vendor' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                                            <td className="px-4 py-3">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CATEGORIES */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Add New Category</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[{ label: 'Name', key: 'name' }, { label: 'Icon (emoji)', key: 'icon' }, { label: 'Description', key: 'description' }].map(({ label, key }) => (
                                    <div key={key}>
                                        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                        <input value={newCat[key]} onChange={e => setNewCat(p => ({ ...p, [key]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={addCategory} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                                <Plus size={15} /> Add Category
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {categories.map(c => (
                                <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                    <div className="text-3xl mb-2">{c.icon}</div>
                                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

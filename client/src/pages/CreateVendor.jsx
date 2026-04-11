import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Store, Clock, Image, ChefHat, ArrowRight, ArrowLeft } from 'lucide-react';
import { vendorAPI } from '../services/api';
import { CATEGORIES } from '../utils/helpers';
import { useLocation } from '../context/LocationContext';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Location', 'Hours & Media'];

export default function CreateVendor() {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: CATEGORIES[0].name,
        cuisine_type: '',
        address: '',
        city: '',
        latitude: location?.lat?.toString() || '',
        longitude: location?.lng?.toString() || '',
        opening_time: '08:00',
        closing_time: '22:00',
        cover_image: '',
        logo: '',
    });

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const handleSubmit = async () => {
        if (!form.name || !form.address || !form.city || !form.latitude || !form.longitude) {
            toast.error('Please fill all required fields (name, address, city, latitude, longitude)');
            return;
        }
        setLoading(true);
        try {
            await vendorAPI.create({
                ...form,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
            });
            toast.success('🎉 Vendor profile created! Awaiting admin verification.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create vendor profile');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24 px-4 pb-10">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                        <ChefHat size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Create Your Vendor Profile
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Set up your street food stall on StreetBite</p>
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
                                style={i <= step ? { background: 'linear-gradient(135deg, #FF6B35, #e85520)' } : {}}>
                                {i + 1}
                            </div>
                            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 rounded-full ${i < step ? 'bg-orange-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step label */}
                <p className="text-center text-sm font-semibold text-gray-600 mb-6">{STEPS[step]}</p>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                >
                    {/* Step 0: Basic Info */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Stall / Vendor Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input value={form.name} onChange={e => set('name', e.target.value)}
                                        placeholder="e.g., Ramesh's Pani Puri Corner"
                                        className={`${inputClass} pl-9`} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.name} type="button" onClick={() => set('category', cat.name)}
                                            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs border-2 transition-all ${form.category === cat.name ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                                            <span className="text-xl mb-1">{cat.icon}</span>
                                            <span className="text-center leading-tight text-gray-600">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Cuisine Type</label>
                                <input value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}
                                    placeholder="e.g., North Indian Street Food"
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                    placeholder="Tell customers what makes your stall special..."
                                    rows={3}
                                    className={`${inputClass} resize-none`} />
                            </div>
                        </div>
                    )}

                    {/* Step 1: Location */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Full Address <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input value={form.address} onChange={e => set('address', e.target.value)}
                                        placeholder="Shop No. 12, Near Bus Stand..."
                                        className={`${inputClass} pl-9`} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    City <span className="text-red-400">*</span>
                                </label>
                                <input value={form.city} onChange={e => set('city', e.target.value)}
                                    placeholder="Mumbai" className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Latitude <span className="text-red-400">*</span>
                                    </label>
                                    <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)}
                                        placeholder="19.0760" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Longitude <span className="text-red-400">*</span>
                                    </label>
                                    <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)}
                                        placeholder="72.8777" className={inputClass} />
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                                💡 Tip: Go to <strong>maps.google.com</strong>, right-click on your location, and copy the coordinates.
                            </div>
                        </div>
                    )}

                    {/* Step 2: Hours & Media */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        <Clock size={14} className="inline mr-1" />Opening Time
                                    </label>
                                    <input type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        <Clock size={14} className="inline mr-1" />Closing Time
                                    </label>
                                    <input type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)}
                                        className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    <Image size={14} className="inline mr-1" />Cover Image URL
                                </label>
                                <input value={form.cover_image} onChange={e => set('cover_image', e.target.value)}
                                    placeholder="https://example.com/cover.jpg"
                                    className={inputClass} />
                                {form.cover_image && (
                                    <img src={form.cover_image} alt="Preview"
                                        className="mt-2 h-24 w-full object-cover rounded-xl"
                                        onError={e => e.target.style.display = 'none'} />
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Logo URL (optional)</label>
                                <input value={form.logo} onChange={e => set('logo', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className={inputClass} />
                            </div>
                            <div className="bg-orange-50 rounded-xl p-3 text-xs text-orange-700">
                                🔔 Your profile will be reviewed by an admin before going live. This usually takes 24 hours.
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <ArrowLeft size={15} /> Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setStep(s => s + 1)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold"
                                style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                                Next <ArrowRight size={15} />
                            </motion.button>
                        ) : (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit} disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                                {loading ? 'Creating...' : <><Store size={15} /> Create Vendor Profile</>}
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

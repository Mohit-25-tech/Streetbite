/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, CreditCard, CheckCircle, Store, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const vendorIcon = L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:var(--color-brand);border:3px solid white;box-shadow:0 4px 12px rgba(239,79,95,0.4);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;">🥘</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const userIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

function MapBoundsFitter({ vendors }) {
    const map = useMap();
    useEffect(() => {
        if (!vendors || vendors.length === 0) return;
        const bounds = L.latLngBounds();
        vendors.forEach(v => {
            if (v.latitude && v.longitude) bounds.extend([parseFloat(v.latitude), parseFloat(v.longitude)]);
        });
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [map, vendors]);
    return null;
}

export default function GlobalCart() {
    const { isCartOpen, setIsCartOpen, groupedCart, cartTotal, clearCart, clearCartItemsForVendor, cartCount, addToCart, removeFromCart } = useCart();
    const { location } = useLocation();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    const vendorGroups = Object.values(groupedCart);
    const vendors = vendorGroups.map(g => g.vendor);

    // Reset step when closed
    useEffect(() => {
        if (!isCartOpen) {
            setTimeout(() => setStep(1), 300);
        }
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    const handleClose = () => setIsCartOpen(false);

    const handleProceedToMap = () => {
        if (!isAuthenticated) {
            handleClose();
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }
        setStep(2);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Process ALL orders via Promise.all (Multi-vendor support)
            const orderPromises = vendorGroups.map(async (group) => {
                const mappedItems = group.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, unit_price: i.price }));
                return orderAPI.createOrder({
                    vendorId: group.vendor.id,
                    items: mappedItems,
                    totalAmount: group.total,
                    paymentMethod,
                    distanceKm: group.vendor.distance_km || 0
                });
            });

            await Promise.all(orderPromises);
            setStep(4);
            clearCart();
        } catch (err) {
            console.error('Order creation error:', err);
            toast.error('Failed to place some or all orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        handleClose();
        navigate('/orders');
    };

    const mapCenter = vendors.length > 0 && vendors[0].latitude 
        ? [parseFloat(vendors[0].latitude), parseFloat(vendors[0].longitude)] 
        : [28.6139, 77.2090]; // Default Delhi

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={handleClose}>
                <motion.div
                    className="bg-gray-50 shadow-2xl w-full max-w-md h-full flex flex-col overflow-hidden"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 bg-white border-b border-gray-100 shrink-0 shadow-sm z-10">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                                {step === 1 ? 'Your Cart' : step === 2 ? 'Vendor Locations' : step === 3 ? 'Payment' : 'Complete'}
                            </h2>
                            {step === 1 && cartCount > 0 && <p className="text-sm font-medium text-gray-500">{cartCount} items</p>}
                        </div>
                        {step !== 4 && (
                            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                        
                        {/* STEP 1: CART SUMMARY */}
                        {step === 1 && (
                            <div className="p-5 pb-24">
                                {vendorGroups.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center mt-32">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                                            <span className="text-3xl">🛒</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">Your cart is empty</h3>
                                        <p className="text-gray-500 text-sm mt-1">Add items from your favorite street vendors.</p>
                                        <button onClick={handleClose} className="mt-6 px-6 py-2.5 bg-brand text-white rounded-full font-bold shadow-sm">
                                            Browse Food
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {vendorGroups.map((group) => (
                                            <div key={group.vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Store size={16} className="text-brand shrink-0" />
                                                        <span className="font-bold text-gray-900 line-clamp-1">{group.vendor.name}</span>
                                                    </div>
                                                    <button onClick={() => clearCartItemsForVendor(group.vendor.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Clear this vendor">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    {group.items.map(item => (
                                                        <div key={item.id} className="flex gap-3 relative">
                                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                                <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between">
                                                                    <p className="font-semibold text-gray-900 text-[14px] leading-tight pr-2">{item.name}</p>
                                                                    <p className="font-bold text-gray-900 whitespace-nowrap text-[14px]">₹{item.price}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded text-[13px] font-bold">
                                                                        <button onClick={() => removeFromCart(item.id)} className="px-2.5 py-1 text-brand hover:bg-gray-100 transition-colors">-</button>
                                                                        <span className="px-2">{item.quantity}</span>
                                                                        <button onClick={() => addToCart(item, group.vendor)} className="px-2.5 py-1 text-brand hover:bg-gray-100 transition-colors">+</button>
                                                                    </div>
                                                                    <span className="text-[13px] font-bold text-gray-600">₹{parseFloat(item.price) * item.quantity}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                                    <span className="font-bold text-gray-900">₹{group.total}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: MULTI-VENDOR MAP */}
                        {step === 2 && (
                            <div className="p-5 pb-24">
                                <h3 className="font-bold text-gray-900 text-[18px] mb-2 leading-tight">Validate Restaurant Locations</h3>
                                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                    You are ordering from {vendors.length} vendor{vendors.length > 1 ? 's' : ''}. Check their locations on the map before proceeding to payment.
                                </p>
                                
                                <div className="h-64 rounded-2xl overflow-hidden mb-5 border border-gray-200 shadow-sm shadow-gray-200/50">
                                    <MapContainer center={mapCenter} zoom={13} className="w-full h-full" zoomControl={false}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapBoundsFitter vendors={vendors} />
                                        {vendors.map(v => v.latitude && v.longitude && (
                                            <Marker key={v.id} position={[parseFloat(v.latitude), parseFloat(v.longitude)]} icon={vendorIcon}>
                                                <Popup>{v.name}</Popup>
                                            </Marker>
                                        ))}
                                        {location && (
                                            <Marker position={[location.lat, location.lng]} icon={userIcon}>
                                                <Popup>Your Location</Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {vendors.map(v => (
                                        <div key={v.id} className="flex items-start gap-2 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                            <MapPin size={16} className="text-brand shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{v.name}</p>
                                                <p className="text-[12px] text-gray-500 font-medium">{v.address || 'Address hidden'}, {v.city}</p>
                                                {v.distance_km && <p className="text-[12px] text-brand font-bold mt-1">{v.distance_km.toFixed(1)} km away</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT METHOD */}
                        {step === 3 && (
                            <div className="p-5 pb-24">
                                <h3 className="font-bold text-gray-900 text-[18px] mb-2">Payment Details</h3>
                                <p className="text-sm text-gray-500 mb-6">How would you like to pay the total of ₹{cartTotal}?</p>
                                
                                <div className="space-y-3 mb-8">
                                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-brand bg-brand/5 shadow-sm shadow-brand/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'border-brand' : 'border-gray-300'}`}>
                                            {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-[15px]">Cash on Delivery</p>
                                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Pay at the stall or upon delivery</p>
                                        </div>
                                    </label>
                                    
                                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-brand bg-brand/5 shadow-sm shadow-brand/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${paymentMethod === 'CARD' ? 'border-brand' : 'border-gray-300'}`}>
                                            {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-[15px]">Credit / Debit Card</p>
                                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Mock online payment</p>
                                        </div>
                                        <CreditCard size={20} className={paymentMethod === 'CARD' ? 'text-brand' : 'text-gray-400'} />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {step === 4 && (
                            <div className="h-full flex items-center justify-center p-5 pb-24 text-center mt-20">
                                <div>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner shadow-green-200">
                                        <CheckCircle size={40} className="text-green-600" />
                                    </motion.div>
                                    <h3 className="text-[24px] font-black text-gray-900 mb-2 leading-tight">Order Placed!</h3>
                                    <p className="text-gray-500 font-medium mb-6">Your order has been seamlessly routed to the vendors!</p>
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm inline-block w-full max-w-xs space-y-2 mb-8">
                                        {vendors.map(v => (
                                            <div key={v.id} className="flex justify-between items-center text-[13px]">
                                                <span className="text-gray-600 font-bold truncate pr-3">{v.name}</span>
                                                <span className="text-brand flex shrink-0 items-center gap-1"><CheckCircle size={12} /> Sent</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleDone} className="w-full max-w-xs mx-auto py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                                        View Past Orders
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer Logic */}
                    {step !== 4 && cartCount > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <span className="text-[14px] font-bold text-gray-500 uppercase tracking-widest leading-none">Total Amount</span>
                                <span className="text-[22px] font-black text-gray-900 leading-none">₹{cartTotal}</span>
                            </div>

                            {step === 1 && (
                                <button onClick={handleProceedToMap} className="w-full py-4 bg-brand text-white rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 transition-opacity">
                                    Proceed to Checkout
                                </button>
                            )}

                            {step === 2 && (
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="px-5 py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 py-4 bg-brand text-white rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 transition-opacity">
                                        Next: Payment
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} disabled={loading} className="px-5 py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50">
                                        Back
                                    </button>
                                    <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-4 bg-brand text-white rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 relative overflow-hidden">
                                        {loading ? 'Processing...' : 'Pay & Order'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, CreditCard, CheckCircle, Store, Trash2, Smartphone, Wallet, Building2, BadgeCheck, QrCode, ShieldCheck } from 'lucide-react';
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
    const [paymentForm, setPaymentForm] = useState({
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        upiId: '',
        walletProvider: 'PhonePe',
        bankName: 'HDFC Bank',
    });
    const [loading, setLoading] = useState(false);

    const vendorGroups = Object.values(groupedCart);
    const vendors = vendorGroups.map(g => g.vendor);
    const checkoutLabel = paymentMethod === 'COD' ? 'Confirm Order' : 'Pay Securely & Place Order';
    const paymentBadge = paymentMethod === 'COD' ? 'Pay later' : 'Mock secure checkout';

    const paymentOptions = [
        { id: 'CARD', label: 'Credit / Debit Card', description: '3D Secure mock card flow', icon: CreditCard, badge: 'Popular' },
        { id: 'UPI', label: 'UPI', description: 'Scan and pay instantly', icon: QrCode, badge: 'Fastest' },
        { id: 'WALLET', label: 'Wallet', description: 'PhonePe, Paytm, Amazon Pay', icon: Wallet, badge: 'One tap' },
        { id: 'NETBANKING', label: 'Net Banking', description: 'Choose your bank and confirm', icon: Building2, badge: 'Secure' },
        { id: 'COD', label: 'Cash on Delivery', description: 'Pay at the stall or upon arrival', icon: BadgeCheck, badge: 'Fallback' },
    ];

    const buildPaymentMetadata = () => {
        const checkoutReference = `SB-${Date.now().toString(36).toUpperCase()}`;

        if (paymentMethod === 'CARD') {
            return {
                paymentStatus: 'paid',
                paymentProvider: 'StreetBite Pay • Card',
                paymentReference: checkoutReference,
                paymentDetails: {
                    method: 'CARD',
                    cardName: paymentForm.cardName,
                    cardLast4: paymentForm.cardNumber.slice(-4),
                    cardExpiry: paymentForm.cardExpiry,
                    cardBrand: 'Visa / Mastercard',
                },
            };
        }

        if (paymentMethod === 'UPI') {
            return {
                paymentStatus: 'paid',
                paymentProvider: 'StreetBite Pay • UPI',
                paymentReference: checkoutReference,
                paymentDetails: {
                    method: 'UPI',
                    upiId: paymentForm.upiId,
                    flow: 'QR Scan',
                },
            };
        }

        if (paymentMethod === 'WALLET') {
            return {
                paymentStatus: 'paid',
                paymentProvider: `StreetBite Pay • ${paymentForm.walletProvider}`,
                paymentReference: checkoutReference,
                paymentDetails: {
                    method: 'WALLET',
                    walletProvider: paymentForm.walletProvider,
                },
            };
        }

        if (paymentMethod === 'NETBANKING') {
            return {
                paymentStatus: 'paid',
                paymentProvider: `StreetBite Pay • ${paymentForm.bankName}`,
                paymentReference: checkoutReference,
                paymentDetails: {
                    method: 'NETBANKING',
                    bankName: paymentForm.bankName,
                },
            };
        }

        return {
            paymentStatus: 'pending',
            paymentProvider: 'Cash on Delivery',
            paymentReference: checkoutReference,
            paymentDetails: {
                method: 'COD',
            },
        };
    };

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
        if (paymentMethod === 'CARD' && (!paymentForm.cardName || !paymentForm.cardNumber || !paymentForm.cardExpiry || !paymentForm.cardCvv)) {
            toast.error('Please complete the card details first.');
            return;
        }

        if (paymentMethod === 'UPI' && !paymentForm.upiId) {
            toast.error('Please enter a UPI ID.');
            return;
        }

        setLoading(true);
        try {
            const paymentMeta = buildPaymentMetadata();
            // Process ALL orders via Promise.all (Multi-vendor support)
            const orderPromises = vendorGroups.map(async (group) => {
                const mappedItems = group.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, unit_price: i.price }));
                return orderAPI.createOrder({
                    vendorId: group.vendor.id,
                    items: mappedItems,
                    totalAmount: group.total,
                    paymentMethod,
                    paymentStatus: paymentMeta.paymentStatus,
                    paymentProvider: paymentMeta.paymentProvider,
                    paymentReference: `${paymentMeta.paymentReference}-${group.vendor.id.slice(0, 6).toUpperCase()}`,
                    paymentDetails: {
                        ...paymentMeta.paymentDetails,
                        checkoutReference: paymentMeta.paymentReference,
                        vendorId: group.vendor.id,
                        vendorName: group.vendor.name,
                    },
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
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 mb-5 shadow-lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">Secure Demo Checkout</p>
                                            <h3 className="font-black text-[20px] mt-1 leading-tight">Choose how you want to pay</h3>
                                            <p className="text-white/70 text-[13px] mt-2">{paymentBadge}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                            <ShieldCheck size={22} className="text-brand-light" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mt-5 text-[12px] font-semibold">
                                        <div className="rounded-xl bg-white/8 border border-white/10 px-3 py-2">
                                            <p className="text-white/55 uppercase tracking-widest text-[10px] mb-1">Orders</p>
                                            <p>{vendors.length} vendor{vendors.length > 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="rounded-xl bg-white/8 border border-white/10 px-3 py-2">
                                            <p className="text-white/55 uppercase tracking-widest text-[10px] mb-1">Total</p>
                                            <p>₹{cartTotal}</p>
                                        </div>
                                        <div className="rounded-xl bg-white/8 border border-white/10 px-3 py-2">
                                            <p className="text-white/55 uppercase tracking-widest text-[10px] mb-1">Mode</p>
                                            <p>{paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 text-[18px] mb-2">Payment Methods</h3>
                                <p className="text-sm text-gray-500 mb-4">How would you like to pay the total of ₹{cartTotal}?</p>

                                <div className="space-y-3 mb-5">
                                    {paymentOptions.map(({ id, label, description, icon: Icon, badge }) => (
                                        <label key={id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === id ? 'border-brand bg-brand/5 shadow-sm shadow-brand/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                            <input type="radio" name="payment" className="hidden" checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${paymentMethod === id ? 'border-brand' : 'border-gray-300'}`}>
                                                {paymentMethod === id && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900 text-[15px]">{label}</p>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-gray-100 text-gray-500">{badge}</span>
                                                </div>
                                                <p className="text-[13px] text-gray-500 font-medium mt-0.5">{description}</p>
                                            </div>
                                            <Icon size={20} className={paymentMethod === id ? 'text-brand' : 'text-gray-400'} />
                                        </label>
                                    ))}
                                </div>

                                {paymentMethod === 'CARD' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900">Card details</h4>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Demo only</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input value={paymentForm.cardName} onChange={(e) => setPaymentForm(prev => ({ ...prev, cardName: e.target.value }))} placeholder="Cardholder name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                                            <input value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))} placeholder="1234 5678 9012 3456" inputMode="numeric" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(prev => ({ ...prev, cardExpiry: e.target.value }))} placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                                                <input value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(prev => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="CVV" inputMode="numeric" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'UPI' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900">UPI payment</h4>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">Scan flow</span>
                                        </div>
                                        <input value={paymentForm.upiId} onChange={(e) => setPaymentForm(prev => ({ ...prev, upiId: e.target.value }))} placeholder="yourname@upi" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                                    </div>
                                )}

                                {paymentMethod === 'WALLET' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900">Wallet provider</h4>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Instant</span>
                                        </div>
                                        <select value={paymentForm.walletProvider} onChange={(e) => setPaymentForm(prev => ({ ...prev, walletProvider: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white">
                                            <option>PhonePe</option>
                                            <option>Paytm</option>
                                            <option>Amazon Pay</option>
                                        </select>
                                    </div>
                                )}

                                {paymentMethod === 'NETBANKING' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900">Choose your bank</h4>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Secure bank flow</span>
                                        </div>
                                        <select value={paymentForm.bankName} onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white">
                                            <option>HDFC Bank</option>
                                            <option>ICICI Bank</option>
                                            <option>State Bank of India</option>
                                            <option>Axis Bank</option>
                                        </select>
                                    </div>
                                )}

                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-[13px] text-orange-900 mb-5">
                                    <p className="font-bold mb-1">Demo payment note</p>
                                    <p>This checkout is simulated end-to-end. Your selection is stored with the order so the history feels like a real payment ledger.</p>
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
                                        {loading ? 'Processing Payment...' : checkoutLabel}
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

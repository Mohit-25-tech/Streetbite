import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, Heart, Share2, Phone, ChevronLeft, Leaf, CheckCircle, Navigation } from 'lucide-react';
import { vendorAPI, menuAPI, reviewAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import ReviewCard from '../components/review/ReviewCard';
import StarRating from '../components/review/StarRating';
import { formatDistance, formatRating, formatTime, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

function RatingBar({ label, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-4 font-medium text-gray-700 text-right">{label}</span>
            <Star size={11} className="text-gray-400 fill-gray-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#24963f] rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: label >= 4 ? '#24963f' : label === 3 ? '#73b526' : label === 2 ? '#e5a93d' : '#e23744' }} />
            </div>
            <span className="w-6 text-gray-500 text-xs font-medium">{count}</span>
        </div>
    );
}

export default function VendorDetail() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const { location } = useLocation();
    const { addToCart, removeFromCart, cartItems } = useCart();

    const [vendor, setVendor] = useState(null);
    const [menu, setMenu] = useState({ items: [], grouped: {} });
    const [reviews, setReviews] = useState([]);
    const [reviewBreakdown, setReviewBreakdown] = useState([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeMenuCat, setActiveMenuCat] = useState(null);

    useEffect(() => {
        const params = location ? { lat: location.lat, lng: location.lng } : {};

        Promise.all([
            vendorAPI.getById(id, params),
            menuAPI.getByVendor(id).catch(() => ({ data: { items: [], grouped: {} } })),
            reviewAPI.getByVendor(id, { limit: 20 }).catch(() => ({ data: { reviews: [], breakdown: [], total: 0 } })),
            isAuthenticated ? favoritesAPI.check(id).catch(() => ({ data: { isFavorite: false } })) : Promise.resolve({ data: { isFavorite: false } }),
        ]).then(([vRes, mRes, rRes, fRes]) => {
            setVendor(vRes.data.vendor);
            setMenu(mRes.data);
            setActiveMenuCat(Object.keys(mRes.data.grouped)[0] || 'All');
            setReviews(rRes.data.reviews);
            setReviewBreakdown(rRes.data.breakdown || []);
            setTotalReviews(rRes.data.total || 0);
            setIsFav(fRes.data.isFavorite);
        }).catch((err) => {
            console.error('Promise.all error:', err);
            setVendor(null);
        }).finally(() => setLoading(false));
    }, [id, location, isAuthenticated]);

    const toggleFav = async () => {
        if (!isAuthenticated) { toast.error('Login to save favorites'); return; }
        try {
            if (isFav) {
                await favoritesAPI.remove(id);
                setIsFav(false);
                toast.success('Removed from favorites');
            } else {
                await favoritesAPI.add(id);
                setIsFav(true);
                toast.success('Added to favorites ❤️');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };



    const handleReviewDelete = (reviewId) => {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setTotalReviews(prev => Math.max(0, prev - 1));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                    <div className="skeleton h-[300px] rounded-2xl" />
                    <div className="space-y-4">
                        <div className="skeleton h-10 w-1/2 rounded-lg" />
                        <div className="skeleton h-5 w-1/3 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-6xl mb-6">🏜️</p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor not found</h2>
                    <p className="text-gray-500 mb-6 font-medium">This place might have been removed or doesn't exist.</p>
                    <Link to="/explore" className="text-white bg-brand hover:bg-brand-dark px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
                        Discover other places
                    </Link>
                </div>
            </div>
        );
    }

    const rating = parseFloat(vendor.avg_rating || 0);
    const getRatingBg = (val) => {
        if (val >= 4.0) return 'bg-[#24963f]';
        if (val >= 3.0) return 'bg-[#73b526]';
        if (val >= 2.0) return 'bg-[#e5a93d]';
        if (val > 0) return 'bg-[#e23744]';
        return 'bg-gray-400';
    };

    const ratingColorHex = rating >= 4.0 ? '#24963f' : rating >= 3 ? '#73b526' : rating >= 2 ? '#e5a93d' : '#e23744';

    const menuCategories = ['All', ...Object.keys(menu.grouped)];
    const displayItems = activeMenuCat === 'All' ? menu.items : (menu.grouped[activeMenuCat] || []);

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Breadcrumb & Navigation */}
            <div className="bg-white sticky top-[72px] z-20 border-b border-gray-100 py-3 hidden md:block">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center text-[13px] font-medium text-gray-500">
                        <Link to="/" className="hover:text-brand transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/explore" className="hover:text-brand transition-colors">Explore</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{vendor.city}</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-400 truncate max-w-[200px]">{vendor.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto md:px-6 md:pt-6">
                {/* Hero Gallery Structure */}
                <div className="relative h-64 md:h-[400px] w-full md:rounded-2xl overflow-hidden group bg-gray-100">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                    <img
                        src={vendor.cover_image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200'}
                        alt={vendor.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200'; }}
                    />

                    {/* Mobile Back Button */}
                    <div className="absolute top-4 left-4 z-20 md:hidden">
                        <Link to="/explore" className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm">
                            <ChevronLeft size={20} />
                        </Link>
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex gap-3">
                        <button
                            onClick={toggleFav}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${isFav ? 'bg-white' : 'bg-white/90 hover:bg-white'}`}
                        >
                            <Heart size={20} className={isFav ? 'fill-brand text-brand' : 'text-gray-700'} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all text-gray-700"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Vendor Identity Section */}
                <div className="px-4 md:px-0 py-6 md:pt-8 md:pb-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-[32px] md:text-[40px] font-black text-gray-900 leading-none tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                                    {vendor.name}
                                </h1>
                                {vendor.is_verified && (
                                    <div className="bg-blue-50 text-blue-600 p-1 rounded-full" title="Verified by StreetBite">
                                        <CheckCircle size={20} className="fill-blue-600 text-white" />
                                    </div>
                                )}
                            </div>

                            <p className="text-[17px] text-gray-600 mb-2 font-medium">
                                {vendor.cuisine_type} {vendor.category ? `· ${vendor.category}` : ''}
                            </p>

                            <p className="text-[15px] text-gray-500 font-medium">
                                {vendor.address}, {vendor.city} {vendor.distance_km && <span className="ml-1 text-brand font-bold">({formatDistance(vendor.distance_km)})</span>}
                            </p>

                            <div className="flex items-center gap-4 mt-5">
                                <div className="flex items-center gap-2 text-[14px] font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Clock size={16} className={vendor.is_open ? 'text-[#24963f]' : 'text-gray-400'} />
                                    <span className={vendor.is_open ? 'text-[#24963f] font-bold' : 'text-gray-600'}>
                                        {vendor.is_open ? 'Open Now' : 'Closed'}
                                    </span>
                                    <span className="text-gray-400 ml-1 font-normal">
                                        • {formatTime(vendor.opening_time)} to {formatTime(vendor.closing_time)}
                                    </span>
                                </div>

                                <a href={`https://maps.google.com/?q=${vendor.address}, ${vendor.city}`} target="_blank" rel="noreferrer"
                                    className="hidden sm:flex items-center gap-1.5 text-[14px] font-bold text-gray-700 hover:text-brand transition-colors bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg">
                                    <Navigation size={14} /> Direction
                                </a>
                            </div>
                        </div>

                        {/* Rating block top right */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center min-w-[100px] hover:shadow-md transition-shadow cursor-default group">
                                <div className="flex items-center gap-1.5 mb-1 text-white px-2 py-0.5 rounded" style={{ backgroundColor: ratingColorHex }}>
                                    <span className="text-[20px] font-bold leading-none mt-1">{rating > 0 ? rating.toFixed(1) : '-'}</span>
                                    <Star size={14} className="fill-white relative -top-[1px]" />
                                </div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-dashed border-gray-300 w-full text-center pb-1 group-hover:border-gray-400 transition-colors">
                                    {totalReviews} Ratings
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="px-4 md:px-0 py-8 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-10">

                    {/* Left Column: Menu */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-[24px] font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>Order Online</h2>
                        </div>

                        {menu.items.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 border-dashed">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                                <h3 className="text-[16px] font-bold text-gray-900 mb-1">Menu not added yet</h3>
                                <p className="text-[14px] text-gray-500 font-medium">Check back later for exciting dishes from this vendor.</p>
                            </div>
                        ) : (
                            <>
                                {/* Menu Categories Navigation */}
                                <div className="sticky top-[120px] z-10 bg-white/95 backdrop-blur-sm pb-4 mb-2 flex overflow-x-auto gap-3 no-scrollbar hide-scroll">
                                    {menuCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveMenuCat(cat)}
                                            className={`px-5 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all outline-none ${activeMenuCat === cat
                                                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat} {cat !== 'All' && menu.grouped[cat] ? <span className="opacity-80 font-medium ml-1">({menu.grouped[cat].length})</span> : ''}
                                        </button>
                                    ))}
                                </div>

                                {/* Menu Items List */}
                                <div className="space-y-6">
                                    {displayItems.map((item, idx) => (
                                        <div key={item.id} className="group">
                                            <div className="flex gap-4">
                                                {/* Details */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {/* Veg/Non-veg icon indicator */}
                                                        <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                                                        </div>
                                                        <h3 className="text-[17px] font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</h3>
                                                    </div>

                                                    <div className="text-[15px] font-bold text-gray-800 mb-2 flex items-center gap-3">
                                                        ₹{item.price}
                                                        {!item.is_available && (
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider">
                                                                Unavailable
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.description && (
                                                        <p className="text-[14px] text-gray-500 font-medium leading-relaxed line-clamp-3 md:line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Image */}
                                                <div className="relative w-[130px] h-[130px] shrink-0">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-[16px]" onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-50 rounded-[16px] flex items-center justify-center text-3xl border border-gray-100">🍽️</div>
                                                    )}

                                                    {/* Add Button Logic */}
                                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24">
                                                        {cartItems.find(c => c.id === item.id) ? (
                                                            <div className="flex items-center justify-between w-full h-8 bg-white border border-[#24963f] rounded-lg shadow-sm font-bold text-[14px]">
                                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-full text-gray-500 hover:bg-gray-50 rounded-l-lg">-</button>
                                                                <span className="text-[#24963f]">{cartItems.find(c => c.id === item.id)?.quantity}</span>
                                                                <button onClick={() => addToCart(item, vendor)} className="w-8 h-full text-[#24963f] hover:bg-gray-50 rounded-r-lg">+</button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => {
                                                                    if (!isAuthenticated) return toast.error('Please login to place an order.');
                                                                    addToCart(item, vendor);
                                                                }}
                                                                className={`w-full py-1.5 rounded-lg border font-black text-[14px] shadow-sm transition-all focus:outline-none bg-white ${item.is_available ? 'text-[#24963f] border-[#24963f]/20 hover:bg-[#24963f]/5' : 'text-gray-400 border-gray-200 cursor-not-allowed'}`} disabled={!item.is_available}>
                                                                ADD
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {idx < displayItems.length - 1 && <div className="border-b border-gray-100 border-dashed mt-8" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column: Reviews & Info sidebar */}
                    <div className="space-y-8">

                        {/* About Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hidden md:block">
                            <h3 className="text-[18px] font-black text-gray-900 tracking-tight mb-3" style={{ fontFamily: 'var(--font-brand)' }}>About this place</h3>
                            <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-4">{vendor.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-50 border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-1 rounded-full">{vendor.cuisine_type}</span>
                                {vendor.category && <span className="bg-gray-50 border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-1 rounded-full">{vendor.category}</span>}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div id="reviews">
                            <h3 className="text-[20px] font-black text-gray-900 tracking-tight mb-4" style={{ fontFamily: 'var(--font-brand)' }}>Reviews</h3>



                            {/* Review Stats */}
                            {totalReviews > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm flex flex-col items-center">
                                    <h4 className="font-bold text-gray-900 mb-4 text-[15px]">Review Summary</h4>
                                    <div className="flex w-full items-center justify-between gap-6">
                                        <div className="text-center flex-1">
                                            <p className="text-[42px] font-black leading-none mb-1 text-gray-900">{rating > 0 ? rating.toFixed(1) : '-'}</p>
                                            <div className="flex justify-center mb-1">
                                                <StarRating rating={rating} readonly size={14} />
                                            </div>
                                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{totalReviews} Reviews</p>
                                        </div>
                                        <div className="flex-[2] space-y-1">
                                            {[5, 4, 3, 2, 1].map(s => {
                                                const bd = reviewBreakdown.find(b => parseInt(b.rating) === s);
                                                return <RatingBar key={s} label={s} count={parseInt(bd?.count || 0)} total={totalReviews} />;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                        <p className="text-gray-400 font-medium text-[14px]">No reviews written yet.</p>
                                    </div>
                                ) : (
                                    reviews.map(r => (
                                        <div key={r.id} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            <ReviewCard review={r} onDelete={handleReviewDelete} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>


        </div>
    );
}

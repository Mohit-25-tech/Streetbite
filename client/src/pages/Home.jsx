import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, MapPin, ChevronRight, Star, ArrowRight, Navigation2, Flame } from 'lucide-react';
import { vendorAPI } from '../services/api';
import { useLocation as useAppLocation } from '../context/LocationContext';
import VendorCard from '../components/vendor/VendorCard';
import { CATEGORIES } from '../utils/helpers';

// Animated counter
function Counter({ end, label, suffix = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1500; // ms
        const steps = 60;
        const stepTime = duration / steps;
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [inView, end]);

    return (
        <div ref={ref} className="text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-gray-500 text-sm font-medium">{label}</div>
        </div>
    );
}

// Category circle
function CategoryCircle({ cat, active, onClick }) {
    return (
        <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex flex-col items-center gap-3 transition-opacity hover:opacity-100"
            style={{ opacity: active ? 1 : 0.8 }}
        >
            <div className={`w-[84px] h-[84px] rounded-full flex items-center justify-center text-[38px] shadow-sm bg-white border-2 hover:border-brand-light transition-all ${active ? 'border-brand shadow-md' : 'border-gray-100'}`}>
                {cat.icon}
            </div>
            <span className={`text-[15px] font-medium ${active ? 'text-brand' : 'text-gray-700'}`}>
                {cat.name}
            </span>
        </motion.button>
    );
}

// Skeleton card
function SkeletonCard() {
    return (
        <div className="modern-card h-full flex flex-col pointer-events-none">
            <div className="skeleton h-[200px] w-full" />
            <div className="p-4 space-y-3 flex flex-col flex-grow">
                <div className="flex justify-between">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-5 w-10 rounded" />
                </div>
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="mt-auto border-t border-gray-100/80 pt-3">
                    <div className="skeleton h-3 w-2/3 rounded" />
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { location, detectLocation, locationLoading } = useAppLocation();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [featuredVendors, setFeaturedVendors] = useState([]);
    const [nearbyVendors, setNearbyVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    useEffect(() => {
        vendorAPI.getFeatured()
            .then(({ data }) => setFeaturedVendors(data.vendors))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!location) return;
        setNearbyLoading(true);
        vendorAPI.getNearby({ lat: location.lat, lng: location.lng, radius: 10, limit: 8 })
            .then(({ data }) => setNearbyVendors(data.vendors))
            .catch(() => { })
            .finally(() => setNearbyLoading(false));
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (activeCategory) params.set('category', activeCategory);
        navigate(`/explore?${params.toString()}`);
    };

    const handleCategoryClick = (catName) => {
        const next = activeCategory === catName ? null : catName;
        setActiveCategory(next);
        navigate(`/explore?category=${encodeURIComponent(catName)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ─── ENHANCED HERO SECTION ─────────────────────────────── */}
            <section className="relative overflow-hidden bg-brand-bg pt-20 pb-28 md:pt-32 md:pb-36 border-b border-brand-light/30">
                {/* Background Details */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#fbbf24]/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                        <h1 className="text-[44px] sm:text-[56px] md:text-[72px] font-black text-gray-900 leading-[1.1] tracking-tight mb-6" style={{ fontFamily: 'var(--font-brand)' }}>
                            Discover India's Best<br />
                            <span className="text-brand">Street Food</span> Near You
                        </h1>

                        <p className="text-[18px] md:text-[20px] text-gray-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                            Craving authentic flavors? Find highly-rated food carts, stalls, and local hidden gems instantly.
                        </p>
                    </motion.div>

                    {/* Prominent Search Bar */}
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        className="bg-white rounded-2xl p-2.5 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto shadow-[0_12px_40px_-10px_rgba(239,79,95,0.25)] border border-gray-100"
                    >
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="flex items-center gap-2 px-5 py-3.5 sm:py-0 bg-brand-bg/50 hover:bg-brand-bg text-brand rounded-xl text-[15px] font-semibold transition-colors shrink-0 whitespace-nowrap"
                        >
                            <Navigation2 size={18} className={locationLoading ? 'animate-pulse' : ''} />
                            {locationLoading ? 'Locating...' : 'Near Me'}
                        </button>

                        <div className="flex items-center gap-3 flex-1 px-4 py-3 sm:py-0 bg-gray-50 sm:bg-transparent rounded-xl">
                            <Search size={22} className="text-gray-400 shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search 'Momos', 'Vada Pav', 'Chaat'..."
                                className="flex-1 text-[16px] outline-none bg-transparent text-gray-900 placeholder-gray-500 font-medium"
                            />
                        </div>

                        <button type="submit" className="bg-brand text-white rounded-xl px-8 py-4 sm:py-0 text-[16px] font-bold hover:bg-brand-dark transition-colors shadow-sm focus:ring-4 focus:ring-brand-light">
                            Search
                        </button>
                    </motion.form>
                </div>
            </section>

            {/* ─── QUICK EXPLORE PORTION (CATEGORIES) ──────────────────── */}
            <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-16 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100 flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar scroll-smooth hide-scroll"
                >
                    <div className="flex-1 flex justify-center sm:justify-between items-center min-w-max gap-8 sm:gap-12 mx-auto">
                        {CATEGORIES.slice(0, 6).map(cat => (
                            <CategoryCircle
                                key={cat.name}
                                cat={cat}
                                active={activeCategory === cat.name}
                                onClick={() => handleCategoryClick(cat.name)}
                            />
                        ))}
                        <button
                            onClick={() => navigate('/explore')}
                            className="flex flex-col items-center gap-3 transition-opacity opacity-80 hover:opacity-100"
                        >
                            <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center text-gray-400 shadow-sm bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all">
                                <ArrowRight size={30} />
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">View All</span>
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ─── NEARBY VENDORS ────────────────────────────────────── */}
            {location && (
                <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-[28px] font-black text-gray-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
                                <MapPin className="text-brand" size={28} /> Places Around You
                            </h2>
                            <p className="text-gray-500 text-[15px] mt-1 font-medium">Top picks based on your location</p>
                        </div>
                        <Link to="/explore" className="hidden sm:flex items-center gap-1.5 text-brand text-[15px] font-bold hover:text-brand-dark transition-colors bg-brand-bg px-4 py-2 rounded-lg">
                            See all nearby <ChevronRight size={16} />
                        </Link>
                    </div>

                    {nearbyLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : nearbyVendors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {nearbyVendors.map(v => <VendorCard key={v.id} vendor={v} />)}
                        </div>
                    ) : (
                        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 border-dashed">
                            <div className="inline-flex w-16 h-16 bg-gray-50 items-center justify-center rounded-full mb-4">
                                <MapPin size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No vendors found nearby!</h3>
                            <p className="text-gray-500">Try searching in a different area or removing location filters.</p>
                        </div>
                    )}
                </section>
            )}

            {/* ─── FEATURED VENDORS ──────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-[28px] font-black text-gray-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
                            <Flame className="text-orange-500 fill-orange-500" size={26} /> Trending This Week
                        </h2>
                        <p className="text-gray-500 text-[15px] mt-1 font-medium">Highly-rated street food spots gaining popularity</p>
                    </div>
                    <Link to="/explore" className="hidden sm:flex items-center gap-1.5 text-gray-700 text-[15px] font-bold hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow">
                        Explore all <ChevronRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : featuredVendors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredVendors.slice(0, 8).map(v => <VendorCard key={v.id} vendor={v} showDistance={false} />)}
                    </div>
                ) : (
                    <div className="text-center bg-white py-16 rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">🍜</p>
                        <p className="text-gray-500 font-medium">No vendors listed yet. Be the first to add your favorite!</p>
                        <Link to="/register" className="inline-block mt-4 px-6 py-3 rounded-lg text-white text-[15px] font-bold bg-brand shadow-sm hover:bg-brand-dark transition-colors">
                            Register as Vendor
                        </Link>
                    </div>
                )}
            </section>

            {/* ─── PROMOTIONAL BANNER ────────────────────────────────── */}
            <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="bg-brand rounded-[32px] overflow-hidden relative shadow-lg">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-light rounded-full blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#fbbf24] rounded-full blur-[60px] opacity-20 -translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10 px-8 py-16 md:p-[72px] flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-xl text-center md:text-left">
                            <h2 className="text-[36px] md:text-[48px] font-black text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-brand)' }}>
                                Become a Partner Vendor
                            </h2>
                            <p className="text-[18px] text-white/90 font-medium mb-8">
                                Give your street food stall a digital presence. Reach more customers, collect reviews, and grow your business today. Zero fees.
                            </p>
                            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand font-bold text-[16px] px-8 py-4 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                                Partner with Us <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="hidden lg:block relative w-[350px] shrink-0">
                            {/* App visualization Mockup */}
                            <div className="w-[300px] h-[350px] bg-white rounded-t-3xl shadow-2xl overflow-hidden mx-auto mt-[40px] transform rotate-3 origin-bottom p-4">
                                <div className="space-y-4">
                                    <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-40 w-full bg-brand-bg rounded-2xl flex items-center justify-center text-4xl">🥘</div>
                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── STATS SECTION ───────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-[32px] font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                            StreetBite in Numbers
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Counter end={1250} label="Verified Vendors" suffix="+" />
                        <Counter end={45} label="Cities Covered" suffix="+" />
                        <Counter end={25000} label="Happy Reviews" suffix="+" />
                        <Counter end={99} label="Real Food Lovers" suffix="%" />
                    </div>
                </div>
            </section>
        </div>
    );
}

import { useState, useEffect } from 'react';
/* eslint-disable no-unused-vars */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, User, Heart, LogOut, Menu, X, LayoutDashboard, ShieldCheck, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { getInitials } from '../../utils/helpers';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { location, locationLoading, detectLocation } = useLocation();
    const { cartCount, setIsCartOpen } = useCart();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
            setMenuOpen(false);
        }
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/explore', label: 'Explore' },
        { to: '/map', label: 'Map View' },
    ];

    if (isAuthenticated) {
        navLinks.push({ to: '/orders', label: 'Orders' });
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white shadow-sm' : 'bg-white border-b border-gray-100'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-[72px] gap-6">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <span className="text-white font-extrabold text-[16px] tracking-tight">SB</span>
                        </div>
                        <span className="font-bold text-[22px] tracking-tight text-gray-900 hidden sm:block" style={{ fontFamily: 'var(--font-brand)' }}>
                            Street<span className="text-brand">Bite</span>
                        </span>
                    </Link>

                    {/* Desktop Search Center */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all focus-within:shadow-md focus-within:border-brand-light divide-x divide-gray-200">
                        {/* Location Toggle */}
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="flex items-center gap-2 pl-4 pr-3 py-3 text-sm font-medium hover:bg-gray-50 transition-colors shrink-0 text-gray-700 whitespace-nowrap rounded-l-lg"
                        >
                            <MapPin size={18} className={locationLoading ? 'text-gray-400 animate-pulse' : 'text-brand'} />
                            <span className="w-[120px] text-left truncate">
                                {locationLoading ? 'Detecting...' : location ? 'Location Active' : 'Set Location'}
                            </span>
                        </button>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex flex-1 items-center px-4 py-3 gap-2 bg-transparent rounded-r-lg">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search for vendors, chaat, momos..."
                                className="flex-1 text-[15px] outline-none bg-transparent text-gray-900 w-full placeholder-gray-400"
                            />
                        </form>
                    </div>

                    {/* Right Side Navigation & Profile */}
                    <div className="flex items-center gap-6 shrink-0">
                        {/* Nav Links (Desktop) */}
                        <div className="hidden lg:flex items-center gap-4">
                            {navLinks.map(l => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    end={l.to === '/'}
                                    className={({ isActive }) =>
                                        `text-[16px] font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-600 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                        </div>

                        {/* Cart Button */}
                        <button 
                            onClick={() => setIsCartOpen(true)} 
                            className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors outline-none cursor-pointer flex items-center justify-center"
                        >
                            <ShoppingCart size={22} className="text-gray-800" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-brand text-white text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Auth / Profile Area */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(v => !v)}
                                    className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm"
                                        style={{ backgroundColor: 'var(--color-swiggy)' }}>
                                        {user?.avatar_url
                                            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                            : getInitials(user?.name)}
                                    </div>
                                    <span className="text-[15px] font-medium hidden sm:block text-gray-800 tracking-tight">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            key="profile-dropdown"
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.15, ease: 'easeOut' }}
                                            className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 origin-top-right overflow-hidden"
                                        >
                                            <div className="px-4 py-2 mb-1 border-b border-gray-50 flex flex-col">
                                                <span className="text-[15px] font-semibold text-gray-900 truncate">{user?.name}</span>
                                                <span className="text-[13px] text-gray-500 truncate">{user?.email}</span>
                                            </div>

                                            <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
                                                <User size={18} className="text-gray-400" /> My Profile
                                            </Link>
                                            <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
                                                <Package size={18} className="text-gray-400" /> Past Orders
                                            </Link>
                                            <Link to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
                                                <Heart size={18} className="text-gray-400" /> Favorites
                                            </Link>

                                            {user?.role === 'vendor' && (
                                                <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <LayoutDashboard size={18} className="text-gray-400" /> Dashboard
                                                </Link>
                                            )}
                                            {user?.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <ShieldCheck size={18} className="text-gray-400" /> Admin Panel
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-brand hover:bg-brand-bg transition-colors w-full text-left font-medium">
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {profileOpen && (
                                    <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setProfileOpen(false)} />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                                    Log in
                                </Link>
                                <Link to="/register" className="text-[15px] font-medium text-white px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                                    Sign up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Slide-down Content */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="flex flex-col gap-2">
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 gap-2">
                                    <Search size={18} className="text-gray-400" />
                                    <input
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search vendors..."
                                        className="flex-1 text-[15px] outline-none bg-transparent placeholder-gray-400"
                                    />
                                </div>
                                <button type="submit" className="hidden">Search</button>
                            </form>

                            {/* Mobile Location */}
                            <button onClick={() => { detectLocation(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-3 text-[15px] font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <MapPin size={18} className="text-brand" /> {locationLoading ? 'Detecting Location...' : location ? 'Location Updated - Update Again' : 'Detect My Location'}
                            </button>

                            {/* Mobile Navigation Links */}
                            <div className="pt-2 border-t border-gray-100 flex flex-col">
                                {navLinks.map(l => (
                                    <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-3 text-[16px] font-medium rounded-lg transition-colors ${isActive ? 'text-brand bg-brand-bg' : 'text-gray-800 hover:bg-gray-50'}`}>
                                        {l.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

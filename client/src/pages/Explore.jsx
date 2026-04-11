import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, LayoutGrid, Map, X, ChevronDown } from 'lucide-react';
import { vendorAPI } from '../services/api';
import VendorCard from '../components/vendor/VendorCard';
import { CATEGORIES, debounce } from '../utils/helpers';
import { useLocation } from '../context/LocationContext';

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

export default function Explore() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { location } = useLocation();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        rating: searchParams.get('rating') || '',
        sort: searchParams.get('sort') || 'rating',
        open_now: searchParams.get('open_now') || '',
        page: 1,
    });

    const fetchVendors = useCallback(async (f) => {
        setLoading(true);
        try {
            const params = { ...f };
            if (location) { params.lat = location.lat; params.lng = location.lng; }
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
            const { data } = await vendorAPI.getAll(params);
            setVendors(data.vendors);
            setPagination(data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [location]);

    useEffect(() => { fetchVendors(filters); }, [filters, fetchVendors]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const debouncedSearch = useCallback(debounce((val) => updateFilter('search', val), 400), []);

    const clearFilters = () => {
        setFilters({ search: '', category: '', rating: '', sort: 'rating', open_now: '', page: 1 });
        setSearchParams({});
    };

    const activeFilterCount = [filters.category, filters.rating, filters.open_now].filter(Boolean).length;

    const sortOptions = [
        { value: 'rating', label: 'Top Rated' },
        { value: 'distance', label: 'Nearest First' },
        { value: 'newest', label: 'Newest' },
        { value: 'popularity', label: 'Most Popular' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Sticky Filter Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">

                        {/* Search Input */}
                        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2.5 flex-1 w-full min-w-[280px] border border-gray-300 focus-within:border-brand focus-within:shadow-sm focus-within:ring-1 focus-within:ring-brand transition-all">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                defaultValue={filters.search}
                                onChange={e => debouncedSearch(e.target.value)}
                                placeholder="Search by name, cuisine, or item..."
                                className="flex-1 text-[15px] outline-none bg-transparent placeholder-gray-400 font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                            {/* Sort Dropdown */}
                            <div className="relative shrink-0">
                                <select
                                    value={filters.sort}
                                    onChange={e => updateFilter('sort', e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 hover:border-gray-400 rounded-lg pl-4 pr-10 py-2.5 text-[14px] font-medium outline-none cursor-pointer focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                                >
                                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(v => !v)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[14px] font-medium transition-colors shrink-0 ${showFilters || activeFilterCount > 0
                                        ? 'bg-brand text-white border-brand'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeFilterCount > 0 && <span className="bg-white text-brand rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold ml-1">{activeFilterCount}</span>}
                            </button>

                            {/* View Toggle */}
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
                                <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-brand' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <LayoutGrid size={18} />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-brand' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <Map size={18} />
                                </button>
                            </div>

                            {/* Clear All */}
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-red-500 px-3 py-2 shrink-0 transition-colors">
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-5 pb-2 flex flex-col md:flex-row gap-6 border-t border-gray-100 mt-4">
                                    {/* Categories */}
                                    <div className="flex-1">
                                        <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">Cuisines</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => updateFilter('category', filters.category === cat.name ? '' : cat.name)}
                                                    className={`flex items-center gap-2 text-[14px] px-4 py-2 rounded-lg font-medium border transition-all ${filters.category === cat.name
                                                            ? 'bg-brand-bg text-brand border-brand'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="text-[16px]">{cat.icon}</span>{cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Rating */}
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">Rating</p>
                                            <select
                                                value={filters.rating}
                                                onChange={e => updateFilter('rating', e.target.value)}
                                                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-[14px] font-medium outline-none cursor-pointer focus:border-brand min-w-[160px]"
                                            >
                                                <option value="">Any Rating</option>
                                                <option value="4.5">4.5+ Excellent</option>
                                                <option value="4">4.0+ Very Good</option>
                                                <option value="3.5">3.5+ Good</option>
                                            </select>
                                        </div>

                                        {/* Open Now */}
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">Availability</p>
                                            <label className={`flex items-center gap-3 text-[14px] font-medium cursor-pointer bg-white border rounded-lg px-4 py-2 transition-colors ${filters.open_now === 'true' ? 'border-brand bg-brand-bg text-brand' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.open_now === 'true'}
                                                    onChange={e => updateFilter('open_now', e.target.checked ? 'true' : '')}
                                                    className="w-4 h-4 accent-brand cursor-pointer focus:ring-brand"
                                                />
                                                Open Now
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
                    <h2 className="text-[20px] font-bold text-gray-900">
                        {loading ? 'Finding the best spots...' : `${pagination.total} Places Found`}
                    </h2>
                </div>

                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Search size={40} className="text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-2xl mb-2">No matches found</h3>
                        <p className="text-gray-500 font-medium mb-6">Try adjusting your filters or search terms</p>
                        <button onClick={clearFilters} className="px-6 py-3 rounded-xl text-white text-[15px] font-bold bg-brand shadow-sm hover:bg-brand-dark transition-colors">
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                            {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                                        className={`w-10 h-10 rounded-lg text-[15px] font-bold transition-all ${p === filters.page
                                                ? 'bg-brand text-white shadow-sm'
                                                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

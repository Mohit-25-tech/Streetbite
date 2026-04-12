/* eslint-disable no-unused-vars */
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';

// Example formatting helpers assuming they exist. If missing, they just stringify.
import { formatDistance, formatTime, truncate } from '../../utils/helpers';

export default function VendorCard({ vendor, showDistance = true }) {
    const rating = parseFloat(vendor.avg_rating || 0);
    const reviewCount = vendor.total_reviews || 0;

    // Zomato style rating colors
    const getRatingBg = (val) => {
        if (val >= 4.0) return 'bg-[#24963f]'; // strong green
        if (val >= 3.0) return 'bg-[#73b526]'; // light green
        if (val >= 2.0) return 'bg-[#e5a93d]'; // yellow
        if (val > 0) return 'bg-[#e23744]'; // red
        return 'bg-gray-400'; // unrated
    };

    return (
        <Link to={`/vendors/${vendor.id}`} className="block group">
            <div className="modern-card h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-[200px] w-full overflow-hidden bg-gray-100">
                    <img
                        src={vendor.cover_image || `https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600`}
                        alt={vendor.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600'; }}
                    />

                    {/* Dark gradient overlay for bottom text */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                    {/* Promoted / Ad / Status Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {!vendor.is_open && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-gray-900/80 text-white backdrop-blur-sm border border-gray-700">
                                Closed
                            </span>
                        )}
                        {vendor.category && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-brand text-white shadow-sm">
                                {vendor.category}
                            </span>
                        )}
                    </div>

                    {/* Offer / Timing on image bottom */}
                    {vendor.opening_time && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-[13px] font-medium">
                            <Clock size={14} className="text-white/80" />
                            <span>{formatTime(vendor.opening_time)} – {formatTime(vendor.closing_time)}</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                    {/* Header: Name and Rating */}
                    <div className="flex justify-between items-start gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 text-[18px] leading-tight line-clamp-1 group-hover:text-brand transition-colors">
                            {vendor.name}
                        </h3>
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded shrink-0 ${getRatingBg(rating)} text-white`}>
                            <span className="text-[12px] font-bold leading-none mt-[1px]">
                                {rating > 0 ? rating.toFixed(1) : 'New'}
                            </span>
                            <Star size={10} className="fill-white" />
                        </div>
                    </div>

                    {/* Cuisine & Cost */}
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[14px] text-gray-500 truncate mt-0.5">
                            {vendor.cuisine_type || 'Street Food'}
                        </p>
                        <p className="text-[12px] text-gray-400 whitespace-nowrap ml-2">
                            {reviewCount} reviews
                        </p>
                    </div>

                    <div className="mt-auto border-t border-gray-100/80 pt-3">
                        <div className="flex items-center justify-between text-[13px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-full bg-gray-50">
                                    <MapPin size={12} className="text-gray-400" />
                                </div>
                                <span className="line-clamp-1 max-w-[140px]">{vendor.city}</span>
                            </div>

                            {showDistance && vendor.distance_km && (
                                <span className="font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded text-[12px]">
                                    {formatDistance(vendor.distance_km)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

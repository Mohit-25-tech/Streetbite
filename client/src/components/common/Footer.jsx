import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                                <span className="text-white font-bold">SB</span>
                            </div>
                            <span className="font-bold text-xl text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>StreetBite</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            Discover the best street food vendors, food carts, and local stalls near you. Real food, real flavors.
                        </p>
                        <div className="flex gap-3">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {[['Home', '/'], ['Explore', '/explore'], ['Map View', '/map'], ['Register as Vendor', '/register']].map(([label, to]) => (
                                <li key={to}><Link to={to} className="text-sm hover:text-orange-400 transition-colors">{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {['Chaat', 'Momos', 'Biryani', 'Rolls', 'Sandwiches', 'Sweets'].map(c => (
                                <li key={c}>
                                    <Link to={`/explore?category=${c}`} className="text-sm hover:text-orange-400 transition-colors">{c}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm"><MapPin size={15} className="text-orange-400 mt-0.5 shrink-0" />123 Food Street, Mumbai, Maharashtra</li>
                            <li className="flex items-center gap-2 text-sm"><Mail size={15} className="text-orange-400 shrink-0" />hello@streetbite.com</li>
                            <li className="flex items-center gap-2 text-sm"><Phone size={15} className="text-orange-400 shrink-0" />+91 98765 43210</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">© 2026 StreetBite. All rights reserved.</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <a href="#" className="hover:text-orange-400">Privacy Policy</a>
                        <a href="#" className="hover:text-orange-400">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

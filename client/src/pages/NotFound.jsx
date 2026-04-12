import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="text-8xl mb-6">🍜</div>
                <h1 className="text-6xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>404</h1>
                <h2 className="text-xl font-bold text-gray-700 mb-2">Page not found</h2>
                <p className="text-gray-500 mb-8">Looks like this street food stall doesn't exist. Let's get you back on the right path!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/" className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                        <Home size={18} /> Go Home
                    </Link>
                    <button onClick={() => window.history.back()} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

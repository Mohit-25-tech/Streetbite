import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

export default function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);
        if (result.success) {
            if (result.user.role === 'vendor') navigate('/dashboard');
            else if (result.user.role === 'admin') navigate('/admin');
            else navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-4 pt-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                            <span className="text-white font-black text-2xl">SB</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Welcome back!</h1>
                        <p className="text-gray-400 text-sm mt-1">Log in to your StreetBite account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    id="login-email"
                                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    id="login-password"
                                    className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            id="login-submit"
                            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}
                        >
                            {loading ? 'Logging in...' : <><span>Login</span> <ArrowRight size={16} /></>}
                        </motion.button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-4 p-3 bg-orange-50 rounded-xl text-xs text-gray-600 space-y-0.5">
                        <p className="font-semibold text-orange-600 mb-1">Demo Accounts:</p>
                        <p>Admin: admin@streetbite.com / admin123</p>
                        <p>Vendor: ramesh@vendor.com / vendor123</p>
                        <p>User: user1@example.com / user1234</p>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-orange-500 font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

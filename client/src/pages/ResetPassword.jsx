import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        try {
            await authAPI.resetPassword({ token, password: data.password });
            setSuccess(true);
            toast.success('Password updated successfully.');
            setTimeout(() => navigate('/login'), 1200);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not reset password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(252,128,25,0.14),_transparent_38%),linear-gradient(135deg,#fffaf5_0%,#ffffff_50%,#fff4f4_100%)] px-4 pt-16">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-8 border border-white/70 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-swiggy to-brand shadow-lg shadow-swiggy/20">
                            <Lock size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>Create a new password</h1>
                        <p className="text-gray-500 text-sm mt-2">Enter a strong password to finish the reset.</p>
                    </div>

                    {success ? (
                        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
                            <CheckCircle size={32} className="text-green-600 mx-auto mb-3" />
                            <p className="font-bold text-gray-900">Password updated</p>
                            <p className="text-sm text-gray-600 mt-1">Redirecting you back to login.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">New password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm password</label>
                                <input
                                    {...register('confirmPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition bg-gradient-to-r from-brand to-swiggy"
                            >
                                <span>Update password</span> <ArrowRight size={16} />
                            </motion.button>
                        </form>
                    )}

                    <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck size={18} className="text-brand mt-0.5 shrink-0" />
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">Token-backed reset</p>
                                <p className="mt-1">The backend verifies the link token, marks it as used, and stores the new hash securely.</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Need a new link?{' '}
                        <Link to="/forgot-password" className="text-brand font-semibold hover:underline">Request another reset</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
});

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [resetLink, setResetLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const { data: response } = await authAPI.requestPasswordReset(data);
            if (response.resetLink) {
                setResetLink(response.resetLink);
            }
            toast.success(response.message || 'Reset link generated.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not generate reset link.');
        } finally {
            setSubmitting(false);
        }
    };

    const openResetLink = () => {
        if (!resetLink) return;
        const url = new URL(resetLink, window.location.origin);
        navigate(`${url.pathname}${url.search}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(239,79,95,0.12),_transparent_35%),linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#fff1f2_100%)] px-4 pt-16">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-8 border border-white/70 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-brand to-swiggy shadow-lg shadow-brand/20">
                            <KeyRound size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>Reset password</h1>
                        <p className="text-gray-500 text-sm mt-2">We will generate a secure demo reset link for your account.</p>
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
                                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 bg-gradient-to-r from-brand to-swiggy"
                        >
                            {submitting ? 'Generating link...' : <><span>Generate reset link</span> <ArrowRight size={16} /></>}
                        </motion.button>
                    </form>

                    <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck size={18} className="text-brand mt-0.5 shrink-0" />
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">Demo reset flow</p>
                                <p className="mt-1">This project does not send email. The backend returns a reset link so you can complete the flow inside the app.</p>
                            </div>
                        </div>
                    </div>

                    {resetLink && (
                        <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm">
                            <p className="font-semibold text-gray-900">Reset link ready</p>
                            <p className="text-gray-600 mt-1 break-all">{resetLink}</p>
                            <button onClick={openResetLink} className="mt-3 px-4 py-2 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors">
                                Open reset page
                            </button>
                        </div>
                    )}

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Remembered it?{' '}
                        <Link to="/login" className="text-brand font-semibold hover:underline">Back to login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

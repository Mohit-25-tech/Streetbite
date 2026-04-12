/* eslint-disable */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ChefHat, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'vendor']),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function Register() {
    const { register: authRegister, loading } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: 'user' },
    });

    const role = watch('role');

    const onSubmit = async (data) => {
        const { confirmPassword: _pwd, ...rest } = data;
        const result = await authRegister(rest);
        if (result.success) {
            if (result.user.role === 'vendor') navigate('/dashboard');
            else navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-4 py-8 pt-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}>
                            <span className="text-white font-black text-2xl">SB</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Join StreetBite</h1>
                        <p className="text-gray-400 text-sm mt-1">Discover & share amazing street food</p>
                    </div>

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { value: 'user', icon: User, label: 'Food Lover', desc: 'Discover vendors' },
                            { value: 'vendor', icon: ChefHat, label: 'Vendor', desc: 'List my stall' },
                        ].map(({ value, icon: RoleIcon, label, desc }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setValue('role', value)}
                                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${role === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                            >
                                <RoleIcon size={22} className={role === value ? 'text-orange-500' : 'text-gray-400'} />
                                <span className={`font-semibold text-sm mt-1.5 ${role === value ? 'text-orange-600' : 'text-gray-700'}`}>{label}</span>
                                <span className="text-xs text-gray-400">{desc}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {[
                            { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe', id: 'reg-name' },
                            { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com', id: 'reg-email' },
                        ].map(({ name, label, type, icon: InputIcon, placeholder, id }) => (
                            <div key={name}>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                                <div className="relative">
                                    <InputIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input {...register(name)} type={type} placeholder={placeholder} id={id}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                    />
                                </div>
                                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
                            </div>
                        ))}

                        {[
                            { name: 'password', label: 'Password', placeholder: '••••••••', id: 'reg-password' },
                            { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', id: 'reg-confirm' },
                        ].map(({ name, label, placeholder, id }) => (
                            <div key={name}>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input {...register(name)} type={showPass ? 'text' : 'password'} placeholder={placeholder} id={id}
                                        className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                    />
                                    {name === 'password' && (
                                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
                            </div>
                        ))}

                        <motion.button
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            type="submit" disabled={loading} id="reg-submit"
                            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #e85520)' }}
                        >
                            {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight size={16} /></>}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-500 font-semibold hover:underline">Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

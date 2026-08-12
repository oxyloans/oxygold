import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, LoaderCircle, LockKeyhole, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminGoldBg from '../../assets/admin_gold_bg.png';
import { deliveryBoyLogin, saveDeliveryBoySession } from '../services/deliveryBoyService';

const DeliveryBoyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your registered email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await deliveryBoyLogin(email.trim(), password);
      saveDeliveryBoySession(email.trim(), result);
      navigate('/delivery-boy/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F1EA] px-4 py-6 font-sans">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:min-h-[520px] md:grid-cols-[1fr_.95fr]">
        <section className="relative hidden overflow-hidden md:block">
          <img src={adminGoldBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F8E38A] text-[#5C430B]"><Truck size={21} /></div>
              <div><p className="font-serif text-xl font-bold">OxyGold</p><p className="text-[10px] uppercase tracking-[.24em] text-white/60">Delivery Portal</p></div>
            </div>
            <div>
              <h1 className="max-w-sm font-serif text-3xl font-semibold leading-tight">Manage deliveries<br /><span className="text-[#F0C96E]">with confidence.</span></h1>
            </div>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-9">
          <form className="w-full" onSubmit={handleLogin}>
            <div className="mb-8 md:hidden"><div className="flex items-center gap-2 text-[#8B6914]"><Truck size={22} /><span className="font-serif text-xl font-bold">OxyGold Delivery</span></div></div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your delivery partner credentials.</p>

            <div className="mt-6 space-y-4">
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email address</span><input type="email" autoComplete="username" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="delivery@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9993A] focus:bg-white focus:ring-4 focus:ring-[#C9993A]/10" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Password</span><div className="relative"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#C9993A] focus:bg-white focus:ring-4 focus:ring-[#C9993A]/10" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            </div>

            {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={17} /><div><p className="font-bold">We couldn’t sign you in</p><p className="mt-0.5 text-xs leading-5 text-rose-700">{error}</p></div></div>}
            <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B8872B] to-[#D4AF37] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <LoaderCircle className="animate-spin" size={17} /> : <LockKeyhole size={16} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default DeliveryBoyLogin;

import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hiddenLogin } from './physicalGoldService';
import adminGoldBg from '../assets/admin_gold_bg.png';

const HIDDEN_LOGIN_PASSWORD = 'admin0306';
type FieldErrors = { mobileNumber?: string; password?: string };

const HiddenLogin = () => {
    const navigate = useNavigate();
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (loading) return;

        const normalizedNumber = mobileNumber.replace(/\D/g, '');
        setError('');
        setFieldErrors({});

        if (!/^[6-9]\d{9}$/.test(normalizedNumber)) {
            setFieldErrors({ mobileNumber: 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' });
            return;
        }
        if (password !== HIDDEN_LOGIN_PASSWORD) {
            setFieldErrors({ password: 'The access password is incorrect.' });
            return;
        }

        setLoading(true);
        try {
            const result = await hiddenLogin(normalizedNumber);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    ...result,
                    isLoggedIn: true,
                    phone: normalizedNumber,
                }),
            );
            navigate('/physical-gold', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Unable to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-start justify-center overflow-y-auto bg-[#F4F1EA] px-4 py-6 font-sans sm:items-center sm:py-8">
            <div className="my-auto grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:min-h-[500px] md:grid-cols-[1fr_0.9fr]">
                <section className="relative hidden overflow-hidden md:block">
                    <img src={adminGoldBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-black/85" />
                    <div className="relative flex h-full flex-col justify-between p-10 text-white">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F8E38A] text-[#5C430B]"><Smartphone size={20} /></div>
                            <div><p className="font-serif text-xl font-bold">OxyGold</p><p className="text-[10px] uppercase tracking-[.24em] text-white/60">Physical Gold</p></div>
                        </div>
                        <div>
                            <h1 className="max-w-sm font-serif text-4xl font-semibold leading-tight">Your gold,<br /><span className="text-[#F0C96E]">within reach.</span></h1>
                            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">Access your physical gold experience securely from one trusted place.</p>
                        </div>
                    </div>
                </section>

                <section className="flex items-center p-6 sm:p-10">
                    <form className="w-full" onSubmit={handleSubmit} noValidate>
                        <div className="mb-6 md:hidden"><div className="flex items-center gap-2 text-[#8B6914]"><Smartphone size={22} /><span className="font-serif text-xl font-bold">OxyGold</span></div></div>
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B8872B]">Secure access</p>
                            <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">Welcome back</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your registered mobile number to continue to physical gold.</p>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Mobile number <span className="text-rose-600" aria-hidden="true">*</span></span>
                            <div className={`flex overflow-hidden rounded-xl border bg-slate-50 transition focus-within:border-[#C9993A] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#C9993A]/10 ${fieldErrors.mobileNumber ? 'border-rose-300' : 'border-slate-200'}`}>
                                <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-500">+91</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    maxLength={10}
                                    required
                                    value={mobileNumber}
                                    onChange={event => { setMobileNumber(event.target.value.replace(/\D/g, '')); setError(''); setFieldErrors({}); }}
                                    placeholder="Enter 10-digit number"
                                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none"
                                    aria-invalid={Boolean(fieldErrors.mobileNumber)}
                                    aria-describedby={fieldErrors.mobileNumber ? 'hidden-login-mobile-error' : undefined}
                                />
                            </div>
                            {fieldErrors.mobileNumber && <span id="hidden-login-mobile-error" className="mt-2 block text-xs text-rose-700">{fieldErrors.mobileNumber}</span>}
                        </label>

                        <label className="mt-5 block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Access password <span className="text-rose-600" aria-hidden="true">*</span></span>
                            <div className={`flex items-center rounded-xl border bg-slate-50 transition focus-within:border-[#C9993A] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#C9993A]/10 ${fieldErrors.password ? 'border-rose-300' : 'border-slate-200'}`}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    required
                                    onChange={event => { setPassword(event.target.value); setError(''); setFieldErrors({}); }}
                                    placeholder="Enter access password"
                                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none"
                                    aria-invalid={Boolean(fieldErrors.password)}
                                    aria-describedby={fieldErrors.password ? 'hidden-login-password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(value => !value)}
                                    className="mr-3 rounded-md p-1 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#C9993A]/40"
                                    aria-label={showPassword ? 'Hide access password' : 'Show access password'}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {fieldErrors.password && <span id="hidden-login-password-error" className="mt-2 block text-xs text-rose-700">{fieldErrors.password}</span>}
                        </label>

                        {error && <div id="hidden-login-error" role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={17} /><span>{error}</span></div>}

                        <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B8872B] to-[#D4AF37] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowRight size={17} />}
                            {loading ? 'Signing you in...' : 'Continue securely'}
                        </button>

                        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-400"><ShieldCheck size={15} className="text-[#B8872B]" /> Your session is securely protected.</p>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default HiddenLogin;

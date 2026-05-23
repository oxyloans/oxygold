import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../Config';
import { X, Bell, CheckCircle } from 'lucide-react';

const SubscribeLivePrice = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState({ name: '', email: '', mobileNumber: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name' && value.trim()) setErrors((prev) => ({ ...prev, name: '' }));
    if (name === 'email' && value.trim()) setErrors((prev) => ({ ...prev, email: '' }));
    if (name === 'mobileNumber' && value.trim()) setErrors((prev) => ({ ...prev, mobileNumber: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', email: '', mobileNumber: '' };
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\+?[0-9]{10,15}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) newErrors.mobileNumber = 'Enter a valid mobile number';

    if (newErrors.name || newErrors.email || newErrors.mobileNumber) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch existing users to check for uniqueness
      const usersResponse = await fetch(`${API_BASE_URL}/product-service/getAllSubscriptionUsers`);
      if (!usersResponse.ok) {
        throw new Error('Failed to verify user details. Please try again.');
      }
      
      const existingUsers = await usersResponse.json();
      
      const userExists = existingUsers.some((user: any) => 
        (user.email && user.email.toLowerCase() === formData.email.trim().toLowerCase()) || 
        (user.mobileNumber && user.mobileNumber.replace(/\s+/g, '') === formData.mobileNumber.replace(/\s+/g, ''))
      );

      if (userExists) {
        setError('You are already subscribed to live price alerts with this email or mobile number.');
        setLoading(false);
        return;
      }

      // 2. Proceed with subscription if user doesn't exist
      const response = await fetch(`${API_BASE_URL}/product-service/savingSubcriptionData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to subscribe. Please try again.');

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFormData({ name: '', email: '', mobileNumber: '' });
        setErrors({ name: '', email: '', mobileNumber: '' });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-15deg); }
          20%, 40% { transform: rotate(15deg); }
          50% { transform: rotate(0deg); }
        }
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 8px 2px rgba(240,187,58,0.25), 0 4px 18px rgba(217,160,32,0.15);
          }
          50% {
            box-shadow: 0 0 22px 6px rgba(240,187,58,0.55), 0 4px 32px rgba(217,160,32,0.40);
          }
        }
        @keyframes borderShimmer {
          0%, 100% { border-color: rgba(240,187,58,0.30); }
          50% { border-color: rgba(240,187,58,0.85); }
        }
        .bell-icon {
          animation: bellRing 2s ease-in-out infinite;
        }
        .subscribe-btn {
          animation: glowPulse 2s ease-in-out infinite, borderShimmer 2s ease-in-out infinite;
        }
        .subscribe-btn:hover .bell-icon {
          animation: bellRing 0.5s ease-in-out infinite;
        }
        .subscribe-btn:hover {
          animation: none;
          box-shadow: 0 0 28px 8px rgba(240,187,58,0.60), 0 4px 24px rgba(217,160,32,0.35) !important;
        }
        .subscribe-btn-text-full {
          display: inline;
        }
        .subscribe-btn-text-short {
          display: none;
        }
        @media (max-width: 640px) {
          .subscribe-btn-text-full {
            display: none;
          }
          .subscribe-btn-text-short {
            display: inline;
          }
        }
      `}</style>

      <button
        onClick={() => setIsOpen(true)}
        className="subscribe-btn inline-flex cursor-pointer items-center gap-2 px-5 py-3 bg-[rgba(13,31,60,0.72)] hover:bg-[rgba(13,31,60,0.9)] text-[#f0bb3a] font-semibold rounded-xl border border-[rgba(240,187,58,0.30)] transition-all duration-300 hover:scale-[1.02]"
      >
        <Bell size={18} className="bell-icon" />
        <span className="subscribe-btn-text-full">Subscribe Live Price</span>
        <span className="subscribe-btn-text-short">Subscribe</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-[#112347] to-[#0d1f3c] w-full max-w-2xl rounded-2xl border border-[rgba(240,187,58,0.2)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.08)] bg-[#0d1f3c]/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(240,187,58,0.1)] flex items-center justify-center">
                  <Bell className="text-[#f0bb3a]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">OxyGold-AI</h3>
                  <p className="text-[#f0bb3a] text-xs font-semibold tracking-wider uppercase mt-0.5">Live Pricing Alerts</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 cursor-pointer hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2">Subscribed Successfully!</h4>
                  <p className="text-white/60 text-sm">You will now receive live price updates twice daily.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-white/70 text-sm mb-4">
                    Get the latest gold prices delivered straight to your inbox and WhatsApp twice daily. Never miss a buying opportunity.
                  </p>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-[#0d1f3c] border ${errors.name ? 'border-red-400' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f0bb3a] focus:ring-1 focus:ring-[#f0bb3a] transition-all`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-[#0d1f3c] border ${errors.email ? 'border-red-400' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f0bb3a] focus:ring-1 focus:ring-[#f0bb3a] transition-all`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">WhatsApp Number</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className={`w-full bg-[#0d1f3c] border ${errors.mobileNumber ? 'border-red-400' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f0bb3a] focus:ring-1 focus:ring-[#f0bb3a] transition-all`}
                        placeholder="+91 9876543210"
                      />
                      {errors.mobileNumber && <p className="text-red-400 text-xs mt-1">{errors.mobileNumber}</p>}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer bg-gradient-to-r from-[#f0bb3a] to-[#d9a020] hover:from-[#f6cc50] hover:to-[#e8920a] text-[#0d1f3c] font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-[#0d1f3c]/30 border-t-[#0d1f3c] rounded-full animate-spin" />
                      ) : (
                        'Confirm Subscription'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SubscribeLivePrice;
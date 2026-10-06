import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { partnerAdminLogin } from "../services/partnerAdminService";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import oxygoldLogo from "../../assets/oxygoldlogo-bk.png";

export const PartnerAdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your partner email address.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address (e.g. partner@example.com).");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Default loginRole is PARTNER in code
      const res = await partnerAdminLogin(trimmedEmail, password, "PARTNER");

      if (res.success && res.data?.accessToken) {
        navigate("/partner-admin/products", { replace: true });
      } else {
        setErrorMsg(res.message || "Invalid credentials or unauthorized partner login.");
      }
    } catch (err: any) {
      console.error("[PartnerAdminLogin] Login submission error:", err);
      setErrorMsg("Failed to log in. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center p-4 relative font-sans">
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Login Card in Existing Project Light Theme */}
        <div className="bg-white border border-[#E8E0D5] rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          
          {/* Header */}
          <div className="border-b border-[#F0EBE1] pb-4 text-center">
            <img
              src={oxygoldLogo}
              alt="OXYGOLD.AI Logo"
              className="h-16 w-48 mx-auto mb-3 object-contain"
            />
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">
              Partner Sign In
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Enter your credentials to access the partner inventory dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your partner email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl text-xs font-semibold text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl text-xs font-semibold text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-[#8B6914] hover:bg-[#7A5C10] transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-stone-500 text-[11px] mt-6">
          © 2026 OXYGOLD.AI Partner Portal. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default PartnerAdminLogin;

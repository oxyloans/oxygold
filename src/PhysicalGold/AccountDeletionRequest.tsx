import React, { FormEvent, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { writeQuery } from "./physicalGoldService";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const AccountDeletionRequest: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const profile = user?.data?.body || user?.data || user || {};
  const userId = Number(user?.data?.userId || profile?.userId || profile?.id || 0);
  const email = String(profile?.email || user?.email || "");
  const displayName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();

  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const isSignedIn = Boolean(userId && email);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!userId || !email) {
      setError("We could not verify your account details. Please sign in again and try once more.");
      return;
    }
    if (!reason.trim()) {
      setError("Please tell us why you want to close your account.");
      return;
    }
    if (!confirmed) {
      setError("Please confirm that you want to raise an account deletion request.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await writeQuery({
        userId,
        email,
        query: `Account Deletion Request\n\nReason: ${reason.trim()}`,
      });
      setTicketId(response.randomTicketId || String(response.ticketId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F2EE] px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/physical-gold/profile")}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A8A] transition hover:text-[#8B6914]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Account
        </button>

        <section className="rounded-xl border border-[#E8E0D5] bg-white p-5 shadow-sm sm:p-8">
          {ticketId ? (
            <div className="py-8 text-center sm:py-12">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">Request submitted</h1>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#6F6A64]">
                We have received your account deletion request. Our support team will review it and contact you at {email}.
              </p>
              <div className="mx-auto mt-6 max-w-xs rounded-lg border border-[#E8E0D5] bg-[#FAFAF8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">Request reference</p>
                <p className="mt-1 text-[15px] font-semibold text-[#8B6914]">{ticketId}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/physical-gold/profile")}
                className="mt-8 rounded-lg bg-[#8B6914] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#76580E]"
              >
                Return to Account
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-[24px] font-semibold text-[#1A1A1A]">Delete account request</h1>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8A8A8A]">
                    Submit a request to close your OxyGold account and remove your personal information.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Submitting this form starts a support review. Your account is not deleted immediately, and open orders, payments, or legal records may need to be completed or retained.</p>
                </div>
              </div>

              <div className="mt-7 space-y-4 rounded-lg border border-[#E8E0D5] bg-[#FAFAF8] p-4 text-[13px] leading-relaxed text-[#4A4A4A]">
                <p className="font-semibold text-[#1A1A1A]">How to request deletion</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Sign in to your OxyGold account.</li>
                  <li>Explain why you want to close the account.</li>
                  <li>Submit the request and keep the support reference number.</li>
                </ol>
                <p><strong>Deleted:</strong> account profile details, saved addresses, and marketing preferences, subject to verification.</p>
                <p><strong>Retained:</strong> transaction, payment, tax, and fraud-prevention records where required by law or legitimate business needs.</p>
              </div>

              {!isSignedIn ? (
                <div className="mt-7 rounded-lg border border-[#E8E0D5] bg-white p-4 text-center">
                  <p className="text-[13px] text-[#6F6A64]">Sign in to verify your account and submit a deletion request.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-4 rounded-lg bg-[#8B6914] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#76580E]"
                  >
                    Sign in to continue
                  </button>
                </div>
              ) : <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#4A4A4A]">Account</label>
                  <div className="rounded-lg border border-[#E8E0D5] bg-[#FAFAF8] px-3 py-2.5 text-[13px] text-[#6F6A64]">
                    <span className="font-medium text-[#1A1A1A]">{displayName || "Signed-in account"}</span>
                    <span className="mx-2 text-[#C8BFB4]">·</span>
                    {email || "Email unavailable"}
                  </div>
                </div>

                <div>
                  <label htmlFor="deletion-reason" className="mb-1.5 block text-[12px] font-semibold text-[#4A4A4A]">
                    Why are you closing your account?
                  </label>
                  <textarea
                    id="deletion-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="Tell us anything that will help us process your request."
                    className="w-full resize-y rounded-lg border border-[#E8E0D5] bg-white px-3 py-2.5 text-[13px] text-[#1A1A1A] outline-none transition placeholder:text-[#BEB5AA] focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10"
                  />
                  <p className="mt-1 text-right text-[11px] text-[#A39A91]">{reason.length}/1000</p>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#E8E0D5] p-3.5">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#8B6914]"
                  />
                  <span className="text-[13px] leading-relaxed text-[#4A4A4A]">
                    I understand that account deletion may be irreversible and that some transaction records may be retained where required by law.
                  </span>
                </label>

                {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting request..." : "Submit deletion request"}
                </button>
              </form>}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default AccountDeletionRequest;

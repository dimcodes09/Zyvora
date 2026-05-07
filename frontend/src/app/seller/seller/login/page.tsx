"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOTP, verifyOTP, registerSeller } from "@/services/sellerApi";
import { useSeller } from "@/context/SellerContext";
import type { SellerInfo } from "@/context/SellerContext";

type Step = "phone" | "otp" | "register";

const getErrMsg = (e: unknown, fallback = "Something went wrong"): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e &&
    typeof (e as Record<string, unknown>).message === "string")
    return (e as Record<string, string>).message;
  return fallback;
};

export default function SellerLoginPage() {
  const router = useRouter();
  const { login } = useSeller();

  const [step, setStep]   = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [regData, setRegData] = useState({
    name: "", shopName: "", location: "", gst: "", upiId: "",
  });

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOTP = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Enter a valid 10-digit phone number."); return; }
    setLoading(true);
    try { await sendOTP(phone); setStep("otp"); startResendTimer(); }
    catch (e: unknown) { setError(getErrMsg(e)); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }
    setLoading(true);
    try {
      const res = await verifyOTP(phone, otp);
      if (res.needsRegistration) { setStep("register"); }
      else { login(res.token, res.seller as SellerInfo); router.push("/seller/seller/dashboard"); }
    } catch (e: unknown) { setError(getErrMsg(e)); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError("");
    const { name, shopName, location } = regData;
    if (!name || !shopName || !location) { setError("Name, shop name, and location are required."); return; }
    setLoading(true);
    try {
      const res = await registerSeller({ phone, otp, ...regData });
      login(res.token, res.seller as SellerInfo);
      router.push("/seller/seller/dashboard");
    } catch (e: unknown) { setError(getErrMsg(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #2d0a15 0%, #4a1020 50%, #3d0c1e 100%)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #e8b4b8 0%, transparent 60%)" }} />
        <div className="relative z-10 text-center">
          <div className="text-7xl font-serif font-bold text-rose-200 mb-4 tracking-widest">Z</div>
          <h2 className="text-3xl font-serif text-rose-100 mb-3">Zyvora Seller</h2>
          <p className="text-rose-300/70 text-sm leading-relaxed max-w-xs">
            Manage your shop, track orders, and grow your business — all in one beautiful place.
          </p>
          <div className="mt-10 space-y-3">
            {["📦 Manage products", "📋 Track live orders", "📈 View earnings"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-rose-200/80 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl font-serif font-bold text-rose-200">Zyvora</span>
            <p className="text-rose-400/70 text-xs mt-1">Seller Portal</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-rose-800/40 rounded-3xl p-8 shadow-2xl">

            {/* Step 1 — Phone */}
            {step === "phone" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold text-rose-50">Welcome back</h1>
                  <p className="text-rose-300/70 text-sm mt-1">Enter your number to continue</p>
                </div>
                <div className="flex border border-rose-700/50 rounded-2xl overflow-hidden focus-within:border-rose-400 transition-colors bg-white/5">
                  <span className="px-3 py-3.5 text-rose-300 text-sm border-r border-rose-700/50 flex items-center bg-white/5">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3.5 outline-none text-rose-50 text-sm bg-transparent placeholder-rose-700"
                    inputMode="numeric"
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button onClick={handleSendOTP} disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #9f1239, #be123c)" }}>
                  {loading ? "Sending OTP…" : "Send OTP →"}
                </button>
              </div>
            )}

            {/* Step 2 — OTP */}
            {step === "otp" && (
              <div className="space-y-5">
                <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="text-rose-400 text-xs flex items-center gap-1 hover:text-rose-300">
                  ← Back
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-rose-50">Enter OTP</h1>
                  <p className="text-rose-300/70 text-sm mt-1">Sent to +91 {phone}</p>
                </div>
                <input type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  className="w-full border border-rose-700/50 rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none bg-white/5 text-rose-50 focus:border-rose-400 transition-colors placeholder-rose-800"
                  inputMode="numeric" autoFocus />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button onClick={handleVerifyOTP} disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #9f1239, #be123c)" }}>
                  {loading ? "Verifying…" : "Continue →"}
                </button>
                <button onClick={() => { setOtp(""); handleSendOTP(); }} disabled={resendTimer > 0 || loading}
                  className="w-full text-rose-400 text-xs disabled:text-rose-800 py-1">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Step 3 — Register */}
            {step === "register" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold text-rose-50">Create your shop</h1>
                  <p className="text-rose-300/70 text-xs mt-1">First time here? Fill in your details.</p>
                </div>
                {([
                  { key: "name",     label: "Full Name *",         placeholder: "e.g. Ramesh Kumar" },
                  { key: "shopName", label: "Shop Name *",          placeholder: "e.g. Ramesh Kirana" },
                  { key: "location", label: "Location / Address *", placeholder: "e.g. Bilaspur, CG" },
                  { key: "upiId",    label: "UPI ID (optional)",    placeholder: "name@upi" },
                  { key: "gst",      label: "GST (optional)",       placeholder: "22AAAAA0000A1Z5" },
                ] as const).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-rose-300/70 mb-1 block">{label}</label>
                    <input value={regData[key]}
                      onChange={(e) => setRegData((d) => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border border-rose-700/50 rounded-xl px-4 py-2.5 text-sm outline-none bg-white/5 text-rose-50 focus:border-rose-400 transition-colors placeholder-rose-800" />
                  </div>
                ))}
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button onClick={handleRegister} disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #9f1239, #be123c)" }}>
                  {loading ? "Creating account…" : "Create Shop 🎉"}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-rose-700 mt-6">
            By signing in you agree to our{" "}
            <a href="/terms" className="text-rose-400 underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  registerSeller,
  sendOTP,
  setSellerToken,
  verifyOTP,
} from "@/services/sellerApi";
import type { SellerInfo } from "@/context/SellerContext";

type AuthMode = "login" | "register";
type AccountRole = "customer" | "seller";
type SellerLoginStep = "phone" | "otp";
type SellerRegisterStep = "phone" | "details";

const roleCopy = {
  customer: {
    eyebrow: "Curated gifting",
    title: "Welcome back to Zyvora",
    body: "Sign in to continue shopping, track your orders, and keep your cart close.",
  },
  seller: {
    eyebrow: "Seller studio",
    title: "Manage your Zyvora shop",
    body: "Use OTP access for inventory, orders, and daily shop activity.",
  },
};

const getErrMsg = (e: unknown, fallback = "Something went wrong"): string => {
  if (e instanceof Error) return e.message;
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    return String((e as Record<string, unknown>).message);
  }
  return fallback;
};

const cleanPhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);

const saveSellerSession = (token: string, seller: SellerInfo) => {
  setSellerToken(token);
  localStorage.setItem("sellerInfo", JSON.stringify(seller));
  window.dispatchEvent(new Event("sellerAuthChanged"));
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B9828A]">
      {children}
    </span>
  );
}

function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}
    </p>
  );
}

export default function ZyvoraAuthPanel({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "seller" ? "seller" : "customer";

  const [role, setRole] = useState<AccountRole>(initialRole);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerOtp, setSellerOtp] = useState("");
  const [sellerLoginStep, setSellerLoginStep] = useState<SellerLoginStep>("phone");
  const [sellerRegisterStep, setSellerRegisterStep] =
    useState<SellerRegisterStep>("phone");
  const [sellerForm, setSellerForm] = useState({
    name: "",
    shopName: "",
    location: "",
    gst: "",
    upiId: "",
  });
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState("");
  const [sellerNotice, setSellerNotice] = useState("");

  const {
    login: customerLogin,
    register: customerRegister,
    loading: customerLoading,
    error: customerError,
  } = useAuthStore();

  const isLogin = mode === "login";
  const copy = roleCopy[role];

  const switchRole = (nextRole: AccountRole) => {
    setRole(nextRole);
    setSellerError("");
    setSellerNotice("");
  };

  const submitCustomer = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await customerLogin(customerForm.email, customerForm.password);
      } else {
        await customerRegister(
          customerForm.name,
          customerForm.email,
          customerForm.password
        );
      }
      router.replace("/");
    } catch {
      /* store owns the error message */
    }
  };

  const sendSellerCode = async () => {
    setSellerError("");
    setSellerNotice("");

    if (!/^[6-9]\d{9}$/.test(sellerPhone)) {
      setSellerError("Enter a valid 10-digit Indian phone number.");
      return;
    }

    setSellerLoading(true);
    try {
      await sendOTP(sellerPhone);
      setSellerOtp("");
      if (isLogin) {
        setSellerLoginStep("otp");
      } else {
        setSellerRegisterStep("details");
      }
      setSellerNotice(`Code sent to +91 ${sellerPhone}.`);
    } catch (e) {
      setSellerError(getErrMsg(e, "Could not send OTP."));
    } finally {
      setSellerLoading(false);
    }
  };

  const submitSellerLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (sellerLoginStep === "phone") {
      await sendSellerCode();
      return;
    }

    setSellerError("");
    setSellerNotice("");

    if (sellerOtp.length !== 6) {
      setSellerError("Enter the 6-digit OTP.");
      return;
    }

    setSellerLoading(true);
    try {
      const res = await verifyOTP(sellerPhone, sellerOtp);
      if (res.needsRegistration) {
        setSellerError("No seller account found for this number.");
        return;
      }
      saveSellerSession(res.token, res.seller as SellerInfo);
      router.replace("/seller/seller/dashboard");
    } catch (e) {
      setSellerError(getErrMsg(e, "Invalid or expired OTP."));
    } finally {
      setSellerLoading(false);
    }
  };

  const submitSellerRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (sellerRegisterStep === "phone") {
      await sendSellerCode();
      return;
    }

    setSellerError("");
    setSellerNotice("");

    if (sellerOtp.length !== 6) {
      setSellerError("Enter the 6-digit OTP.");
      return;
    }

    const { name, shopName, location } = sellerForm;
    if (!name || !shopName || !location) {
      setSellerError("Name, shop name, and location are required.");
      return;
    }

    setSellerLoading(true);
    try {
      const res = await registerSeller({
        phone: sellerPhone,
        otp: sellerOtp,
        ...sellerForm,
      });
      saveSellerSession(res.token, res.seller as SellerInfo);
      router.replace("/seller/seller/dashboard");
    } catch (e) {
      setSellerError(getErrMsg(e, "Could not create seller account."));
    } finally {
      setSellerLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[#FDF8F5] px-4 pb-16 pt-[110px] text-[#3D2A2D]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(123,23,40,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(123,23,40,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#8B1E31]">
            <span className="h-px w-9 bg-[#8B1E31]" />
            {copy.eyebrow}
          </p>

          <h1
            className="max-w-xl text-6xl font-black leading-[0.9] text-[#7B1728]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {copy.title}
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-[#7A5C60]">
            {copy.body}
          </p>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3 text-sm">
            {["Premium packaging", "Fast checkout", "Trusted shops"].map((item) => (
              <div
                key={item}
                className="border border-rose-100 bg-white/60 px-4 py-3 text-center font-semibold text-[#7B1728]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="relative mt-10 h-[320px] max-w-lg overflow-hidden border border-rose-100 bg-white shadow-[0_28px_80px_rgba(123,23,40,0.12)]">
            <Image
              src="/images/p3.png"
              alt="Curated Zyvora gift box"
              fill
              priority
              sizes="(max-width: 1024px) 0px, 480px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl border border-rose-100 bg-white/92 p-5 shadow-[0_24px_70px_rgba(123,23,40,0.10)] backdrop-blur sm:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C97B84]">
                {isLogin ? "Account access" : "Create account"}
              </p>
              <h2
                className="mt-2 text-3xl font-black text-[#2A1418]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {isLogin ? "Login" : "Register"}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B1E31] text-white shadow-lg shadow-rose-900/20">
              {role === "seller" ? <Store size={20} /> : <ShoppingBag size={20} />}
            </div>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-2 rounded-full border border-rose-100 bg-[#FDF8F5] p-1">
            {(["customer", "seller"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchRole(item)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors ${
                  role === item
                    ? "bg-[#7B1728] text-white shadow-md shadow-rose-900/20"
                    : "text-[#7A5C60] hover:bg-white"
                }`}
              >
                {item === "customer" ? <User size={16} /> : <Building2 size={16} />}
                {item === "customer" ? "Customer" : "Seller"}
              </button>
            ))}
          </div>

          {role === "customer" ? (
            <form onSubmit={submitCustomer} className="space-y-4">
              {!isLogin && (
                <label className="relative block">
                  <FieldIcon>
                    <User size={17} />
                  </FieldIcon>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                  />
                </label>
              )}

              <label className="relative block">
                <FieldIcon>
                  <Mail size={17} />
                </FieldIcon>
                <input
                  type="email"
                  placeholder="Email"
                  value={customerForm.email}
                  onChange={(e) =>
                    setCustomerForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <label className="relative block">
                <FieldIcon>
                  <Lock size={17} />
                </FieldIcon>
                <input
                  type="password"
                  placeholder="Password"
                  value={customerForm.password}
                  onChange={(e) =>
                    setCustomerForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <ErrorText message={customerError} />

              <button
                type="submit"
                disabled={customerLoading}
                className="flex h-14 w-full items-center justify-center gap-2 bg-[#7B1728] text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-rose-900/20 transition hover:bg-[#5C1020] disabled:opacity-60"
              >
                {customerLoading
                  ? isLogin
                    ? "Logging in..."
                    : "Creating..."
                  : isLogin
                    ? "Login"
                    : "Register"}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : isLogin ? (
            <form onSubmit={submitSellerLogin} className="space-y-4">
              <label className="relative block">
                <FieldIcon>
                  <Phone size={17} />
                </FieldIcon>
                <input
                  type="tel"
                  placeholder="10-digit seller phone"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(cleanPhone(e.target.value))}
                  disabled={sellerLoginStep === "otp"}
                  className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100 disabled:bg-[#F9F2F0]"
                  inputMode="numeric"
                />
              </label>

              {sellerLoginStep === "otp" && (
                <label className="relative block">
                  <FieldIcon>
                    <ShieldCheck size={17} />
                  </FieldIcon>
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={sellerOtp}
                    onChange={(e) => setSellerOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium tracking-[0.35em] outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                    inputMode="numeric"
                  />
                </label>
              )}

              {sellerNotice && (
                <p className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  {sellerNotice}
                </p>
              )}
              <ErrorText message={sellerError} />

              {sellerError.includes("No seller account") && (
                <Link
                  href="/register?role=seller"
                  className="block text-sm font-semibold text-[#8B1E31] underline"
                >
                  Create seller account
                </Link>
              )}

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                {sellerLoginStep === "otp" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSellerLoginStep("phone");
                      setSellerOtp("");
                      setSellerError("");
                    }}
                    className="h-14 border border-rose-100 px-5 text-sm font-bold text-[#7A5C60] transition hover:border-[#C97B84] hover:text-[#8B1E31]"
                  >
                    Change phone
                  </button>
                )}
                <button
                  type="submit"
                  disabled={sellerLoading}
                  className="flex h-14 items-center justify-center gap-2 bg-[#7B1728] px-7 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-rose-900/20 transition hover:bg-[#5C1020] disabled:opacity-60"
                >
                  {sellerLoading
                    ? "Please wait..."
                    : sellerLoginStep === "phone"
                      ? "Send OTP"
                      : "Login"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={submitSellerRegister} className="space-y-4">
              <label className="relative block">
                <FieldIcon>
                  <Phone size={17} />
                </FieldIcon>
                <input
                  type="tel"
                  placeholder="10-digit seller phone"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(cleanPhone(e.target.value))}
                  disabled={sellerRegisterStep === "details"}
                  className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100 disabled:bg-[#F9F2F0]"
                  inputMode="numeric"
                />
              </label>

              {sellerRegisterStep === "details" && (
                <>
                  <label className="relative block">
                    <FieldIcon>
                      <ShieldCheck size={17} />
                    </FieldIcon>
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      value={sellerOtp}
                      onChange={(e) => setSellerOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium tracking-[0.35em] outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                      inputMode="numeric"
                    />
                  </label>

                  {[
                    { key: "name", label: "Owner full name", icon: <User size={17} /> },
                    { key: "shopName", label: "Shop name", icon: <Store size={17} /> },
                    { key: "location", label: "Shop location", icon: <Building2 size={17} /> },
                    { key: "upiId", label: "UPI ID optional", icon: <ShieldCheck size={17} /> },
                    { key: "gst", label: "GST optional", icon: <ShieldCheck size={17} /> },
                  ].map((field) => (
                    <label key={field.key} className="relative block">
                      <FieldIcon>{field.icon}</FieldIcon>
                      <input
                        type="text"
                        placeholder={field.label}
                        value={sellerForm[field.key as keyof typeof sellerForm]}
                        onChange={(e) =>
                          setSellerForm((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="h-14 w-full border border-rose-100 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#C97B84] focus:ring-4 focus:ring-rose-100"
                      />
                    </label>
                  ))}
                </>
              )}

              {sellerNotice && (
                <p className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  {sellerNotice}
                </p>
              )}
              <ErrorText message={sellerError} />

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                {sellerRegisterStep === "details" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSellerRegisterStep("phone");
                      setSellerOtp("");
                      setSellerError("");
                    }}
                    className="h-14 border border-rose-100 px-5 text-sm font-bold text-[#7A5C60] transition hover:border-[#C97B84] hover:text-[#8B1E31]"
                  >
                    Change phone
                  </button>
                )}
                <button
                  type="submit"
                  disabled={sellerLoading}
                  className="flex h-14 items-center justify-center gap-2 bg-[#7B1728] px-7 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-rose-900/20 transition hover:bg-[#5C1020] disabled:opacity-60"
                >
                  {sellerLoading
                    ? "Please wait..."
                    : sellerRegisterStep === "phone"
                      ? "Send OTP"
                      : "Create seller"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          <div className="mt-7 border-t border-rose-100 pt-5 text-center text-sm text-[#7A5C60]">
            {isLogin ? "New to Zyvora?" : "Already have an account?"}{" "}
            <Link
              href={`${isLogin ? "/register" : "/login"}${role === "seller" ? "?role=seller" : ""}`}
              className="font-bold text-[#8B1E31] underline"
            >
              {isLogin ? "Register" : "Login"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

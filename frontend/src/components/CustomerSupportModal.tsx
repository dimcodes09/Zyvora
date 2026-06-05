"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

const CATEGORIES = [
  "Refund & Return Assistance",
  "Product Request",
  "Bulk Order Enquiries",
  "Delivery & Shipping Queries",
  "Feedback & Suggestions"
];

export default function CustomerSupportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuthStore();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<string>("");
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !category || !message) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, orderId, message })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCategory("");
    setOrderId("");
    setMessage("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-lightBg dark:bg-brand-darkBg text-brand-lightText dark:text-brand-darkText p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative border border-brand-lightBg/20 dark:border-brand-darkBg/20">
        
        {/* Close Button */}
        <button 
          onClick={reset}
          className="absolute top-4 right-4 text-brand-lightText/60 dark:text-brand-darkText/60 hover:text-[#7B1728] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-2xl font-playfair italic font-bold mb-6 text-[#7B1728]">Customer Support</h2>

        {success ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="opacity-80">Our AI has generated a response and sent it to your email. We will follow up if necessary.</p>
            <button onClick={reset} className="mt-6 w-full py-3 bg-[#7B1728] text-white rounded-full font-semibold hover:bg-[#5C3A3A] transition-colors">Close</button>
          </div>
        ) : step === 1 ? (
          <div>
            <p className="mb-4 text-sm opacity-80">How can we help you today? Please select a category:</p>
            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-[#7B1728]/20 hover:border-[#7B1728] hover:bg-[#7B1728]/5 transition-colors font-medium text-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7B1728]">{category}</span>
              <button type="button" onClick={() => setStep(1)} className="text-xs underline opacity-70 hover:opacity-100">Change</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border border-[#7B1728]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B1728]" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Email *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border border-[#7B1728]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B1728]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 opacity-80">Order ID (Optional)</label>
              <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-transparent border border-[#7B1728]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B1728]" placeholder="e.g. ZYV-12345" />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 opacity-80">Description *</label>
              <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full bg-transparent border border-[#7B1728]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B1728] resize-none" placeholder="Please describe your issue in detail..." />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#7B1728] text-white rounded-full font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Sending..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

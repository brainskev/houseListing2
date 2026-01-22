import ContactForm from "@/components/Contact/ContactForm";
import { FaEnvelope, FaPhone, FaClock } from "react-icons/fa";

export const metadata = {
  title: "Contact Brickly",
  description: "Get in touch with Brickly for enquiries, support, and partnerships.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-brand-100 text-lg">We&apos;re here to help with enquiries, support, and partnerships.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 md:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Contact Info</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2"><FaEnvelope className="text-brand-700" /> support@brickly.example</li>
                <li className="flex items-center gap-2"><FaPhone className="text-brand-700" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2"><FaClock className="text-brand-700" /> Mon–Fri, 9am–5pm</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Prefer email?</h2>
              <p className="mt-2 text-sm text-slate-700">Drop us a line and we&apos;ll get back within 1 business day.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

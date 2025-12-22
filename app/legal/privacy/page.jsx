export const metadata = {
  title: "Privacy Policy",
  description: "Brickly privacy policy outlining how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-slate-200">How we collect, use, and protect your information.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="prose max-w-none">
            <p>
              We respect your privacy. This page describes how Brickly collects, uses, and safeguards personal data provided through the platform.
            </p>
            <h2>Information We Collect</h2>
            <p>
              We may collect account information, messages, enquiries, and usage data to deliver and improve our services.
            </p>
            <h2>How We Use Information</h2>
            <p>
              Information is used to operate the platform, provide support, and enhance features. We do not sell your personal data.
            </p>
            <h2>Data Security</h2>
            <p>
              We implement reasonable safeguards to protect data. No method of transmission or storage is 100% secure.
            </p>
            <h2>Your Rights</h2>
            <p>
              Depending on your region, you may have rights to access, update, or delete your data. Contact us for requests.
            </p>
            <h2>Contact</h2>
            <p>
              For privacy questions, reach us at privacy@brickly.example.
            </p>
            <p className="text-sm text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

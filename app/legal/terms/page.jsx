export const metadata = {
  title: "Terms of Service",
  description: "Brickly terms governing your use of the platform.",
};

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-slate-200">Please read these terms carefully before using Brickly.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="prose max-w-none">
            <p>
              These terms govern your use of Brickly. By accessing or using the platform, you agree to these terms.
            </p>
            <h2>Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and for all activities under it.
            </p>
            <h2>Listings & Content</h2>
            <p>
              You must have rights to any content you upload. We may moderate content to ensure quality and compliance.
            </p>
            <h2>Acceptable Use</h2>
            <p>
              Do not misuse the platform. Prohibited activities include fraud, harassment, and illegal content.
            </p>
            <h2>Liability</h2>
            <p>
              The platform is provided "as is." To the extent permitted by law, we disclaim warranties and limit liability.
            </p>
            <h2>Changes</h2>
            <p>
              We may update these terms from time to time. Continued use signifies acceptance of changes.
            </p>
            <h2>Contact</h2>
            <p>
              For questions about these terms, contact legal@brickly.example.
            </p>
            <p className="text-sm text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

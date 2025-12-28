export const metadata = {
  title: "Privacy Policy",
  description: "Brickly privacy policy outlining how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-700 to-brand-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-slate-200">How we collect, use, and protect your information.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
         <div className="prose prose-slate prose-headings:font-serif prose-a:text-brand-600 max-w-none">
  <p>
    We respect your privacy. This Privacy Policy explains how <strong>Brickly</strong> collects, uses,
    stores, and protects personal information when you use our real estate platform, including
    property listings, enquiries, bookings, and account features.
  </p>

  <h2>Information We Collect</h2>
  <p>
    We collect information necessary to operate and improve our services, including:
  </p>
  <ul>
    <li>Account information such as name, email address, phone number, and login details</li>
    <li>Property enquiries, messages, and viewing or site-visit booking requests</li>
    <li>Property listing details submitted by agents, owners, or administrators</li>
    <li>Usage data such as pages visited, interactions, and device or browser information</li>
  </ul>

  <h2>How We Use Your Information</h2>
  <p>
    We use collected information to:
  </p>
  <ul>
    <li>Display property listings and connect users with agents or property owners</li>
    <li>Process enquiries, bookings, and communications made through the platform</li>
    <li>Manage user accounts, dashboards, and publishing workflows</li>
    <li>Improve platform performance, security, and user experience</li>
    <li>Respond to support requests and communicate important service updates</li>
  </ul>
  <p>
    We do <strong>not</strong> sell or rent your personal information to third parties.
  </p>

  <h2>Sharing of Information</h2>
  <p>
    Your information may be shared only where necessary, including:
  </p>
  <ul>
    <li>With property agents or owners when you submit an enquiry or booking request</li>
    <li>With trusted service providers (e.g. hosting, image storage, analytics) strictly for platform operations</li>
    <li>When required by law or to protect the rights, safety, or integrity of the platform</li>
  </ul>

  <h2>Data Storage and Security</h2>
  <p>
    We implement reasonable administrative, technical, and organizational safeguards to protect
    personal data from unauthorized access, loss, or misuse. However, no method of online
    transmission or electronic storage is completely secure, and we cannot guarantee absolute security.
  </p>

  <h2>User Accounts and Responsibilities</h2>
  <p>
    Users are responsible for maintaining the confidentiality of their login credentials.
    Any activity carried out under your account is your responsibility unless otherwise required by law.
  </p>

  <h2>Your Rights</h2>
  <p>
    Depending on your jurisdiction, you may have the right to:
  </p>
  <ul>
    <li>Access the personal data we hold about you</li>
    <li>Request corrections or updates to your information</li>
    <li>Request deletion of your account or personal data, subject to legal or operational requirements</li>
  </ul>
  <p>
    Requests can be made by contacting us using the details below.
  </p>

  <h2>Third-Party Links</h2>
  <p>
    Our platform may contain links to third-party websites or services. We are not responsible
    for the privacy practices or content of those third parties.
  </p>

  <h2>Changes to This Policy</h2>
  <p>
    We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements.
    Updates will be posted on this page with a revised date.
  </p>

  <h2>Contact Us</h2>
  <p>
    If you have questions or concerns about this Privacy Policy or how your data is handled,
    please contact us at <strong>privacy@brickly.example</strong>.
  </p>

  <p className="text-sm text-slate-600">
    Last updated: {new Date().toLocaleDateString()}
  </p>
</div>

        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "Terms of Service",
  description: "Brickly terms governing your use of the platform.",
};

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-brand-100">Please read these terms carefully before using Brickly.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="prose max-w-none">
  <p>
    These Terms of Service govern your access to and use of <strong>Brickly</strong>, a real estate
    platform that enables property listings, enquiries, bookings, and related services.
    By accessing or using the platform, you agree to be bound by these terms.
  </p>

  <h2>Accounts and Registration</h2>
  <p>
    To access certain features, you may be required to create an account. You are responsible
    for maintaining the confidentiality of your login credentials and for all activities
    that occur under your account.
  </p>

  <h2>Listings and Content</h2>
  <p>
    Users who create or manage property listings must ensure that all information provided is
    accurate, lawful, and up to date. You confirm that you have the necessary rights or
    authorization to upload property details, images, and other content.
  </p>
  <p>
    Brickly reserves the right to review, moderate, edit, or remove listings or content that
    violate these terms, applicable laws, or our platform guidelines.
  </p>

  <h2>Enquiries and Bookings</h2>
  <p>
    The platform facilitates communication between prospective buyers or tenants and property
    agents or owners. Brickly does not guarantee the availability, condition, pricing, or
    completion of any property transaction.
  </p>

  <h2>Acceptable Use</h2>
  <p>
    You agree not to misuse the platform. Prohibited activities include, but are not limited to:
  </p>
  <ul>
    <li>Submitting false, misleading, or fraudulent information</li>
    <li>Harassing, abusing, or impersonating other users</li>
    <li>Uploading illegal, offensive, or infringing content</li>
    <li>Attempting to access restricted areas or systems without authorization</li>
  </ul>

  <h2>Intellectual Property</h2>
  <p>
    All platform content, branding, and software (excluding user-submitted content) are the
    property of Brickly or its licensors and may not be copied, modified, or distributed
    without prior written consent.
  </p>

  <h2>Limitation of Liability</h2>
  <p>
    The platform is provided on an “as is” and “as available” basis. To the maximum extent
    permitted by law, Brickly disclaims all warranties and shall not be liable for any indirect,
    incidental, or consequential damages arising from your use of the platform.
  </p>

  <h2>Termination</h2>
  <p>
    We reserve the right to suspend or terminate accounts that violate these terms or engage
    in conduct that harms the platform, other users, or third parties.
  </p>

  <h2>Changes to These Terms</h2>
  <p>
    We may update these Terms of Service from time to time. Any changes will be posted on this
    page, and continued use of the platform after updates constitutes acceptance of the revised terms.
  </p>

  <h2>Contact</h2>
  <p>
    If you have questions or concerns regarding these Terms of Service, please contact us at
    <strong> legal@brickly.example</strong>.
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

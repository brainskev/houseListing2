import Link from "next/link";
import { CredentialsSignupForm } from "@/components/Auth/CredentialsAuthForms";

export const metadata = {
  title: "Sign Up | Brickly",
  description: "Create your Brickly account to list properties, save favorites, and more.",
};

export default function SignUpPage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-brand-100 mx-auto">
            Join Brickly to explore properties, publish posts, and stay on top of the market.
          </p>
        </div>
      </section>

      {/* Form Card */}
      <section className="-mt-8 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-md rounded-2xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-black/5 p-6 sm:p-8">
            <CredentialsSignupForm />

            {/* Helper text */}
            <p className="mt-4 text-xs text-slate-600">
              By creating an account, you agree to our{" "}
              <Link href="/legal/terms" className="underline hover:text-slate-800">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline hover:text-slate-800">Privacy Policy</Link>.
            </p>

            <div className="mt-6 text-center">
              <span className="text-xs text-slate-600">Already have an account?</span>{" "}
              <Link href="/login" className="text-xs font-semibold text-brand-700 hover:text-brand-800 underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

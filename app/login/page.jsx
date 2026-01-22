import CredentialsLoginForm from "@/components/Auth/CredentialsAuthForms";

export const metadata = {
  title: "Login | Brickly",
};

const LoginPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-3 text-brand-100 text-lg">Log in to manage properties, messages, and more.</p>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="mx-auto max-w-md">
          <CredentialsLoginForm />
        </div>
      </section>
    </div>
  );
};

export default LoginPage;

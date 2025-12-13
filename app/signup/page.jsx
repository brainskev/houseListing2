import { CredentialsSignupForm } from "@/components/Auth/CredentialsAuthForms";

export const metadata = {
  title: "Sign Up | Valles Real Estate",
};

const SignupPage = () => {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create your account</h1>
        <CredentialsSignupForm />
      </div>
    </div>
  );
};

export default SignupPage;

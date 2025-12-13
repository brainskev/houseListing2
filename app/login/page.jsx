import CredentialsLoginForm from "@/components/Auth/CredentialsAuthForms";

export const metadata = {
  title: "Login | Valles Real Estate",
};

const LoginPage = () => {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login</h1>
        <CredentialsLoginForm />
      </div>
    </div>
  );
};

export default LoginPage;

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href =
      `${import.meta.env.VITE_API_URL}/auth/login/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="bg-white p-10 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Bienvenido</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white p-3 rounded-lg"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}

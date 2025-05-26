// src/components/LoginScreen.jsx
import React, { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { AlertTriangle } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [error, setError]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const newsanRed               = '#E30613';

  const handleGoogleSignInClick = async () => {
    setError('');
    setLoading(true);
    // espera 800ms para simular petición
    await new Promise(r => setTimeout(r, 800));
    const success = onLogin('usuario@newsan.com.ar', '1234');
    setLoading(false);
    if (!success) {
      setError('Hubo un problema al iniciar sesión con Google.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        {/* Logo Newsan */}
        <div className="flex justify-center mb-6">
          <img
            src="/Logo_Negro_1.png"
            alt="Logo Newsan"
            className="h-12 w-auto"
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/150x50/ffffff/E30613?text=NEWSAN';
            }}
          />
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
          Plataforma Control Calidad
        </h2>

        <button
          onClick={handleGoogleSignInClick}
          disabled={isLoading}
          className={`
            w-full flex justify-center items-center px-4 py-2 border border-gray-300
            rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-[${newsanRed}] transition duration-150 ease-in-out
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          {isLoading
            ? <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"
                  />
                </svg>
                Verificando...
              </>
            : <>
                <GoogleIcon />
                Iniciar sesión con Google
              </>
          }
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center text-sm">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}


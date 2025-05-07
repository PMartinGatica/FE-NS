// frontend/src/components/WelcomeMessage.jsx
import React, { useState, useEffect } from 'react';

export default function WelcomeMessage({ user, onFadeComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const newsanRed = '#E30613';

  useEffect(() => {
    const fadeOut = setTimeout(() => setIsVisible(false), 1500);
    const done   = setTimeout(onFadeComplete, 2000);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [onFadeComplete]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gray-100 z-50
        transition-opacity duration-500 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <h1 className={`text-3xl font-semibold`} style={{ color: newsanRed }}>
        ¡Bienvenido, {user?.name || 'Usuario'}!
      </h1>
    </div>
  );
}

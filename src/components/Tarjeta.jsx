import React from 'react';

const Tarjeta = ({ titulo, children }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
    <h3 className="text-md font-semibold mb-3 text-gray-700">{titulo}</h3>
    {children}
  </div>
);

export default Tarjeta;
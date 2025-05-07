import React from 'react';

const TablaPrimeNtf = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-gray-500 uppercase">
          <th className="pb-1 pr-2 font-medium">Testcode</th>
          <th className="pb-1 pr-2 font-medium">Family</th>
          <th className="pb-1 pr-2 font-medium">Prime</th>
          <th className="pb-1 pr-2 font-medium">NTF</th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ testcode, family, primeCount, ntfCount }, i) => (
          <tr key={i} className="border-t border-gray-100">
            <td className="py-1.5 pr-2 font-medium text-gray-600">{testcode}</td>
            <td className="py-1.5 pr-2 text-gray-600">{family}</td>
            <td className="py-1.5 pr-2 text-gray-600">{primeCount}</td>
            <td className="py-1.5 pr-2 text-gray-600">{ntfCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TablaPrimeNtf;
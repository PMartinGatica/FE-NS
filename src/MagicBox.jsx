import React from 'react'
import { MagicMotion, spring } from 'react-magic-motion'

export default function MagicBox() {
  return (
    <MagicMotion
      defaultStyles={{
        opacity: 0,
        transform: 'scale(0.5)',
      }}
      styles={{
        opacity: spring(1, { stiffness: 120, damping: 14 }),
        transform: spring('scale(1)', { stiffness: 120, damping: 14 }),
      }}
    >
      {styles => (
        <div
          style={{
            ...styles,
            backgroundColor: '#60A5FA',  // azul Tailwind 400
            padding: '2rem',
            borderRadius: '0.5rem',
            color: 'white',
          }}
        >
          <h2 className="text-2xl font-bold">¡Hola, Magic Motion!</h2>
          <p>Esta caja aparece con una animación suave.</p>
        </div>
      )}
    </MagicMotion>
  )
}

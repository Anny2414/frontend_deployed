
import React, { useState } from 'react';
import axios from 'axios';
export function  PasswordResetForm () {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = () => {
    axios.post('http://127.0.0.1:8000/yourburger/password-reset/', { email })
      .then(response => {
        setMessage(response.data.success);
      })
      .catch(error => {
        setMessage(error.response.data.error);
      });
  };

  return (
    <div>
      <h2>Recuperación de contraseña</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handlePasswordReset}>Enviar</button>
      {message && <p>{message}</p>}
    </div>
  );
};



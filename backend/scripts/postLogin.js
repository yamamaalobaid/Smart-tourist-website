// LoginForm.js

import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form validation and submit the form data
    // You can make API calls or perform any other necessary actions here
    console.log({ email, password });
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div>
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
        <button type="button" onClick={toggleForm}>
          {isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
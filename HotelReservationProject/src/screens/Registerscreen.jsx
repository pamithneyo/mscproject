import React, { useState } from 'react';
import Success from '../components/Success'; // Fixed typo in the import
import axios from 'axios'
function Registerscreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [success, setSuccess] = useState(false); // Renamed for clarity and consistency

  async function register() {
    if (password === cpassword) {
      const user = { name, email, password };
      try {
        // Await the axios POST request
        const response = await axios.post('http://localhost:5000/api/users/register', user);
        setSuccess(true); // Set success state
        setName('');
        setEmail('');
        setPassword('');
        setCPassword('');
        console.log(response.data); // Log for debugging
      } catch (error) {
        console.error(error.response?.data || error.message); // Log detailed error
        alert('Registration failed');
      }
    } else {
      alert('Passwords do not match');
    }
  }

  return (
    <div className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 mt-5">
        {success && <Success message="Registration Successful" />} {/* Fixed component usage */}
          <div className="bs">
            <h2>Register</h2>
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={cpassword}
              onChange={(e) => setCPassword(e.target.value)}
            />
            <button className="btn btn-primary mt-3" onClick={register}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registerscreen;

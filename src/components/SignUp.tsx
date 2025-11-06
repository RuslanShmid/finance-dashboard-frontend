import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { SIGN_UP_MUTATION } from '../lib/graphql/mutations';
import './SignIn.css';

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

interface SignUpResult {
  signUp: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    token: string | null;
    errors: string[] | null;
  };
}

export const SignUp = ({ onSwitchToSignIn }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signUpMutation, { loading }] = useMutation<SignUpResult>(SIGN_UP_MUTATION);

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password !== passwordConfirmation) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const { data } = await signUpMutation({
        variables: {
          input: {
            email: email.trim(),
            password,
            passwordConfirmation,
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
          },
        },
      });

      if (data?.signUp.errors && data.signUp.errors.length > 0) {
        setError(data.signUp.errors[0]);
        return;
      }

      if (data?.signUp.token && data.signUp.user) {
        // Auto sign in after successful sign up
        localStorage.setItem('auth_token', data.signUp.token);
        window.location.reload(); // Reload to trigger auth context update
      } else {
        setError('Sign up failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during sign up');
      console.error('Sign up error:', err);
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-confirmation">Confirm Password</label>
            <input
              type="password"
              id="password-confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          {onSwitchToSignIn && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};


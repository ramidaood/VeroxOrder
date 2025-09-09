import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-bg">
      <div className="login-container">
        <div className="login-content" style={{ zIndex: 20 }}>
          {/* Site Name */}
          <div className="login-header">
            <h1 className="auth-title">VeroxOrder</h1>
            <p className="auth-subtitle">מערכת הזמנות מקצועית</p>
          </div>

          {/* Login Card */}
          <div className="auth-card">
            <div className="login-form-header">
              <h2 className="login-form-title">התחברות לחשבון</h2>
              <p className="login-form-subtitle">הזן את פרטי הכניסה שלך כדי להמשיך</p>
            </div>
            
            {error && (
              <div className="auth-error">
                <div className="login-error-icon">⚠️</div>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" className="login-form-label">
                  כתובת אימייל
                </label>
                <div className="login-input-container">
                  <div className="login-input-icon">
                    <Mail />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="your.email@example.com"
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="password" className="login-form-label">
                  סיסמה
                </label>
                <div className="login-input-container">
                  <div className="login-input-icon">
                    <Lock />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="הזן את הסיסמה שלך"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="auth-button"
                style={{ marginBottom: '1.5rem' }}
              >
                {loading ? (
                  <>
                    <div className="login-spinner"></div>
                    מתחבר...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    התחבר
                  </>
                )}
              </button>
            </form>
            
            <div className="login-footer">
              <p className="login-footer-text">
                אין לך חשבון?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: '#0ea5e9', 
                    fontWeight: '600', 
                    textDecoration: 'none' 
                  }}
                  className="hover:underline"
                >
                  הירשם כאן
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

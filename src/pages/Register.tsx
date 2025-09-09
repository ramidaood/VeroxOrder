import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('הסיסמאות אינן תואמות');
    }
    
    if (password.length < 6) {
      return setError('הסיסמה חייבת להכיל לפחות 6 תווים');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, businessName);
      navigate('/dashboard');
    } catch (error: any) {
      setError('שגיאה ביצירת חשבון: ' + error.message);
      console.error('Registration error:', error);
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

          {/* Register Card */}
          <div className="auth-card">
            <div className="login-form-header">
              <h2 className="login-form-title">צור חשבון עסקי</h2>
              <p className="login-form-subtitle">הזן את פרטי העסק שלך כדי להתחיל</p>
            </div>
          
          {error && (
            <div className="auth-error">
              <div className="login-error-icon">⚠️</div>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="businessName" className="login-form-label">
                שם העסק
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Building  />
                </div>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="הזן את שם העסק שלך"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" className="login-form-label">
                כתובת אימייל
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Mail  />
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" className="login-form-label">
                סיסמה
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Lock  />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="הזן סיסמה (לפחות 6 תווים)"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="confirmPassword" className="login-form-label">
                אישור סיסמה
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Lock  />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="אשר את הסיסמה שלך"
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
                  יוצר חשבון...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  צור חשבון
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p className="login-footer-text">
              יש לך כבר חשבון?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#0ea5e9', 
                  fontWeight: '600', 
                  textDecoration: 'none' 
                }}
                className="hover:underline"
              >
                התחבר כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;

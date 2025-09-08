// src/components/Login.js
import React, { useState } from 'react';
import { Input } from '../components/components';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../contexts/ThemeContext';

export default function Login({ onLogin }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(email && password)) {
      setLoginError('לא בא לך למלא גם אימייל וגם סיסמא? פשוט טיפש....');
      return;
    }

    setIsLoading(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError('טעית באחד מפרטי ההזדהות טמבל!');
      setIsLoading(false);
    } else {
      onLogin(data.session);
      setIsLoading(false);
      navigate("/recipes");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = {
    subContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: isMobile ? 'auto' : '60vh',
      padding: isMobile ? '1rem 0' : '2rem 0',
    },
    form: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
      borderRadius: isMobile ? '16px' : '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: isMobile ? '100%' : isTablet ? '400px' : '450px',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden',
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
      position: 'relative',
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '1.75rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #8b6914 0%, #b8860b 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: '400',
    },
    inputGroup: {
      marginBottom: '1.5rem',
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s ease',
      zIndex: 10,
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.8rem',
      marginTop: '0.25rem',
      marginRight: '0.5rem',
      display: 'block',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '14px 24px',
      background: isLoading
        ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
        : 'linear-gradient(135deg, #8b6914 0%, #b8860b 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isLoading
        ? 'none'
        : '0 4px 16px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      transform: isLoading ? 'scale(0.98)' : 'scale(1)',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(139, 105, 20, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    loadingSpinner: {
      width: '18px',
      height: '18px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: '#ffffff',
      animation: 'spin 1s linear infinite',
    },
    decorativeElement: {
      position: 'absolute',
      top: '-50px',
      right: '-50px',
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(139, 105, 20, 0.1) 0%, rgba(184, 134, 11, 0.05) 100%)',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    submitError: {
      background: `${theme.accent.error}33`,
      border: `1px solid ${theme.accent.error}`,
      color: theme.accent.error,
      padding: '0.75rem',
      borderRadius: '8px',
      fontSize: '0.9rem',
      marginBottom: '1rem',
      textAlign: 'center',
      animation: loginError ? 'shake 0.4s ease-in-out' : 'none',
    },
  };

  return (
    <Container>
      <div style={styles.subContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.decorativeElement} />

          <div style={styles.formHeader}>
            <h2 style={styles.title}>התחברות</h2>
            <p style={styles.subtitle}>היכנס לחשבון שלך כדי להמשיך</p>
          </div>

          {loginError && (
            <div style={styles.submitError}>
              {loginError}
            </div>
          )}

          <div style={styles.inputGroup}>
            <Input
              label="אימייל"
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<User size={18} />}
              style={{
                width: '100%',
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={{ position: 'relative' }}>
              <Input
                label="סיסמה"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                style={{
                  width: '100%',
                  paddingLeft: '45px',
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  ...styles.passwordToggle,
                  color: showPassword ? '#8b6914' : '#64748b',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#8b6914';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = showPassword ? '#8b6914' : '#64748b';
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.button}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 105, 20, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 16px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={styles.loadingSpinner} />
                מתחבר...
              </>
            ) : (
              <>
                <User size={16} />
                התחבר
              </>
            )}
          </button>
        </form>
      </div>
    </Container>
  );
}
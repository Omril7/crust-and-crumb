import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';

function InventoryAlert() {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();

  const [visible, setVisible] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // trigger fade-in after mount
    setFadeIn(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 229, 204, 0.6)',
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid rgba(217, 160, 102, 0.4)`,
        marginBottom: 12,
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        // width: 'fit-content'
      }}
    >
      <AlertCircle size={isMobile ? 18 : 20} color={theme.accent.primary} />

      <span style={{
        fontSize: isMobile ? '0.85rem' : '0.9rem',
        color: theme.colors.textSecondary,
        lineHeight: 1.4,
        flex: 1
      }}>
        אם יש מוצר עם מלאי בלתי מוגבל (כמו מים), ניתן להזין <strong>1-</strong> בערך המלאי
      </span>

      <button
        onClick={() => setVisible(false)}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: theme.colors.textSecondary,
          padding: 4,
          display: 'flex',
          alignItems: 'center'
        }}
        aria-label="סגור הודעה"
      >
        <X size={isMobile ? 16 : 18} />
      </button>
    </div>
  );
}

export default InventoryAlert;

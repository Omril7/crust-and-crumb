import { useTheme } from "../contexts/ThemeContext";
import { useScreenSize } from "../hooks/useScreenSize";


const Modal = ({ title, handleClose, modalStyles, children }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const styles = {
    modalBackdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease',
      padding: isMobile ? '10px' : '20px',
      overflowY: isMobile ? 'auto' : 'hidden',
      paddingTop: isMobile ? '20px' : '20px',
      paddingBottom: isMobile ? '20px' : '20px',
    },
    modal: {
      background: '#fff',
      borderRadius: theme.borderRadius?.navbar || '12px',
      boxShadow: theme.shadows?.navbar || '0 4px 12px rgba(0,0,0,0.2)',
      maxWidth: isMobile ? '100%' : isTablet ? '600px' : '700px',
      width: '100%',
      maxHeight: isMobile ? 'calc(90vh - 40px)' : '85%',
      minHeight: isMobile ? 'auto' : 'auto',
      overflowY: 'auto',
      padding: isMobile ? '16px' : isTablet ? '18px 20px' : '20px 24px',
      animation: 'slideUp 0.3s ease',
      marginTop: isMobile ? '10px' : '0',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      ...(modalStyles || {})
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: `2px solid ${theme.colors?.activeButtonBg || '#eee'}`,
      paddingBottom: 10,
    },
    modalTitle: {
      margin: 0,
      fontSize: isMobile ? '1.2rem' : '1.4rem',
      wordBreak: 'break-word',
      flex: isMobile ? '1 1 100%' : 'none',
      marginBottom: isMobile ? '8px' : '0',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      fontSize: isMobile ? '1.3rem' : '1.5rem',
      cursor: 'pointer',
      color: '#999',
      padding: isMobile ? '5px' : '0',
      minWidth: isMobile ? '30px' : 'auto',
      minHeight: isMobile ? '30px' : 'auto',
    }
  }

  return (
    <div style={styles.modalBackdrop} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button
            onClick={handleClose}
            style={styles.closeButton}
            title="סגור"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
};

export default Modal;
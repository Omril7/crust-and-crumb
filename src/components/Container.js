import { useScreenSize } from "../hooks/useScreenSize";

const Container = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  const style = {
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    margin: 'auto',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    maxWidth: isMobile ? '95dvw' : isTablet ? '85dvw' : '70dvw',
    minWidth: isMobile ? '320px' : 'auto',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : isTablet ? '0 3px 10px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: isMobile ? 8 : isTablet ? 10 : 12,
    overflow: 'hidden',
    // Mobile-specific optimizations
    ...(isMobile && {
      position: 'relative',
      marginTop: '8px',
      marginBottom: '8px',
    }),
    // Tablet-specific optimizations
    ...(isTablet && {
      marginTop: '12px',
      marginBottom: '12px',
    }),
  }

  return (
    <div style={style}>
      {children}
    </div>
  );
}

export default Container;
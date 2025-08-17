import { useTheme } from "../contexts/ThemeContext";
import { useScreenSize } from "../hooks/useScreenSize";

const Header = ({ title, icon }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  const style = {
    textAlign: 'center',
    width: isMobile ? '90%' : isTablet ? '70%' : '50%',
    margin: isMobile ? '0 auto 16px auto' : '0 auto 20px auto',
    fontSize: isMobile ? 20 : isTablet ? 24 : 26,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? 6 : 8,
    color: theme.colors.textLight,
    background: theme.colors.primaryGradient,
    padding: isMobile ? '12px 16px' : isTablet ? '13px 20px' : '14px 0',
    borderRadius: theme.borderRadius.button,
    boxShadow: theme.shadows.activeButton,
    userSelect: 'none',
    minWidth: isMobile ? '280px' : 'auto',
    maxWidth: isMobile ? '100%' : 'none',
  }

  return (
    <header style={style}>
      {icon}
      {title}
    </header>
  );
}

export default Header;
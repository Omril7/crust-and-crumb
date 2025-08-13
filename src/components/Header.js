import { useTheme } from "../contexts/ThemeContext";

const Header = ({ title, icon }) => {
  const { theme } = useTheme();

  const style = {
    textAlign: 'center',
    width: '50%',
    margin: '0 auto 20px auto',
    fontSize: 26,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    color: theme.colors.textLight,
    background: theme.colors.primaryGradient,
    padding: '14px 0',
    borderRadius: theme.borderRadius.button,
    boxShadow: theme.shadows.activeButton,
    userSelect: 'none',
  }
  return (
    <header style={style}>
      {icon}
      {title}
    </header>
  );
}

export default Header;
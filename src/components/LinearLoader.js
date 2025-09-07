import { useTheme } from "../contexts/ThemeContext"

export default function LinearLoader() {
  const { theme } = useTheme();
  const styles = {
    linearLoader: {
      position: 'relative',
      height: '4px',
      width: '100%',
      background: '#ddd',
      overflow: 'hidden',
      borderRadius: '2px'
    },
    bar: {
      position: 'absolute',
      height: '100%',
      width: '30%',
      background: theme.accent.primary,
      animation: 'slide 1.5s infinite'
    }
  };

  return (
    <div style={styles.linearLoader}>
      <div style={styles.bar} />
    </div>
  )
}
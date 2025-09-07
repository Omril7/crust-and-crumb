import { useTheme } from "../contexts/ThemeContext";

export default function CircularLoader() {
  const { theme } = useTheme();

  const styles = {
    circularLoader: {
      display: "inline-block",
      width: "40px",
      height: "40px",
      border: "3px solid #ddd",
      borderTop: `3px solid ${theme.accent.primary}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
  };

  return (
    <div style={styles.circularLoader}></div>
  );
}

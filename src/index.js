import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AlertProvider } from './contexts/AlertContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <ConfirmProvider>
      <AlertProvider>
        <App />
      </AlertProvider>
    </ConfirmProvider>
  </ThemeProvider>
);

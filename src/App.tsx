import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes/>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

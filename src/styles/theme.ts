// src/contexts/theme.ts
import { createTheme } from '@mui/material/styles';

// Tema claro (principal)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#395195',     // azul escuro
      contrastText: '#ffffff', // texto branco
    },
    secondary: {
      main: '#ffffff',     // branco
      contrastText: '#395195', // texto azul escuro
    },
    background: {
      default: '#d9d9d9ff',  // fundo branco
      paper: '#ffffff',    // papel branco
    },
    text: {
      primary: '#000000',  // texto preto
      secondary: '#505050',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
  },
});

// Tema escuro (opcional)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#395195',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      contrastText: '#395195',
    },
    background: {
      default: '#343434ff',
      paper: '#0d1117',
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbbbbb',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
  },
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import axios from 'axios';
import App from './App';
import { ConversationProvider } from './contexts/ConversationContext';
import { ModelProvider } from './contexts/ModelContext';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

// Configuration de l'URL de base pour Axios
const apiUrl = import.meta.env.VITE_API_URL || '';
if (apiUrl) {
  console.log(`Connecting to API at: ${apiUrl}`);
  axios.defaults.baseURL = apiUrl;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider 
      theme={{
        fontFamily: 'Poppins, sans-serif',
        primaryColor: 'blue',
        defaultRadius: 'md',
        colors: {
          blue: [
            '#E6F7FF', // 0
            '#BAE7FF', // 1
            '#91D5FF', // 2
            '#69C0FF', // 3
            '#40A9FF', // 4
            '#1890FF', // 5
            '#096DD9', // 6
            '#0050B3', // 7
            '#003A8C', // 8
            '#002766', // 9
          ],
        },
      }}
    >
      <Notifications position="top-right" />
      <BrowserRouter>
        <ModelProvider>
          <ConversationProvider>
            <App />
          </ConversationProvider>
        </ModelProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
); 
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Equipment from './components/Equipment';
import CreateRequest from './components/CreateRequest';
import MyRequests from './components/MyRequests';
import AdminPanel from './components/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MainApp() {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [authMode, setAuthMode] = useState('login');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VK Equipment Rental - {user.fio}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Роль: {user.role}
          </Typography>
          <button onClick={logout} style={{ 
            background: 'none', 
            border: '1px solid white', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Выйти
          </button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="Снаряжение" />
          <Tab label="Создать заявку" />
          <Tab label="Мои заявки" />
          {user.role === 'admin' && <Tab label="Админка" />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Equipment />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <CreateRequest />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <MyRequests />
      </TabPanel>
      {user.role === 'admin' && (
        <TabPanel value={tabValue} index={3}>
          <AdminPanel />
        </TabPanel>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

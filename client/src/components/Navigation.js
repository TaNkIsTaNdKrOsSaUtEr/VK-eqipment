import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

function Navigation({ currentView, setCurrentView, userRole }) {
    const handleChange = (event, newValue) => {
        setCurrentView(newValue);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentView} onChange={handleChange} aria-label="navigation tabs">
                <Tab label="Снаряжение" value="equipment" />
                <Tab label="Мои заявки" value="requests" />
                <Tab label="Создать заявку" value="create-request" />
                {userRole === 'Заведующий снаряжением' && (
                    <Tab label="Администрирование" value="admin" />
                )}
            </Tabs>
        </Box>
    );
}

export default Navigation;

import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, Box, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Tabs, Tab, Grid, Card, CardContent, IconButton, Tooltip, Badge,
  TablePagination, InputAdornment, Collapse, Avatar, List, ListItem,
  ListItemText, ListItemAvatar, Divider, Switch, FormControlLabel
} from '@mui/material';
import {
  Search, FilterList, Download, Visibility, Edit, Delete,
  TrendingUp, People, Assignment, Settings, Notifications,
  ExpandMore, ExpandLess, Email, Phone, CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояния для заявок
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  
  // Состояния для фильтрации и поиска
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Состояния для пользователей
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllRequests(),
        fetchAllUsers(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      setError('Ошибка загрузки заявок');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      setError('Ошибка загрузки пользователей');
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      setError('Ошибка загрузки статистики');
    }
  };

  const handleStatusChange = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/requests/${selectedRequest.id_request}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          admin_comment: adminComment
        })
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchAllRequests();
        setSelectedRequest(null);
        setNewStatus('');
        setAdminComment('');
        
        // Отправка уведомления пользователю
        await sendNotificationToUser(selectedRequest.user_id, newStatus);
      }
    } catch (error) {
      setError('Ошибка обновления статуса');
    }
  };

  const sendNotificationToUser = async (userId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          message: `Статус вашей заявки изменен на: ${status}`,
          type: 'status_change'
        })
      });
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      if (response.ok) {
        fetchAllUsers();
      }
    } catch (error) {
      setError('Ошибка изменения статуса пользователя');
    }
  };

  const exportData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/export/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
      }
    } catch (error) {
      setError('Ошибка экспорта данных');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id_request.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || request.status_name === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openStatusDialog = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status_name);
    setAdminComment(request.admin_comment || '');
    setDialogOpen(true);
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'новая': return 'primary';
      case 'одобрена': return 'success';
      case 'отклонена': return 'error';
      case 'в работе': return 'warning';
      case 'завершена': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Компонент статистики
  const StatisticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Assignment color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{statistics.totalRequests || 0}</Typography>
                <Typography color="textSecondary">Всего заявок</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <People color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{statistics.totalUsers || 0}</Typography>
                <Typography color="textSecondary">Пользователей</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{statistics.totalRevenue || 0} ₽</Typography>
                <Typography color="textSecondary">Общий доход</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Notifications color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{statistics.pendingRequests || 0}</Typography>
                <Typography color="textSecondary">Ожидают обработки</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Компонент управления пользователями
  const UsersTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Управление пользователями</Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => exportData('users')}
        >
          Экспорт
        </Button>
      </Box>
      
      <List>
        {users.map((user) => (
          <React.Fragment key={user.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={user.vk_photo} alt={user.name}>
                  {user.name?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <Box>
                    <Typography variant="body2">ID: {user.vk_id}</Typography>
                    <Typography variant="body2">
                      Регистрация: {formatDate(user.created_at)}
                    </Typography>
                  </Box>
                }
              />
              <Box display="flex" alignItems="center" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.is_active}
                      onChange={() => toggleUserStatus(user.id, user.is_active)}
                    />
                  }
                  label="Активен"
                />
                <IconButton
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                >
                  {expandedUser === user.id ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </ListItem>
            
            <Collapse in={expandedUser === user.id}>
              <Box pl={4} pr={2} pb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Статистика пользователя:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Заявок: {user.requests_count || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Потрачено: {user.total_spent || 0} ₽
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Последняя активность: {user.last_activity ? formatDate(user.last_activity) : 'Нет данных'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  // Компонент заявок с расширенным функционалом
  const RequestsTab = () => (
    <Box>
      {/* Панель фильтров */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Поиск по имени или номеру заявки"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Статус"
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="новая">Новая</MenuItem>
                <MenuItem value="одобрена">Одобрена</MenuItem>
                <MenuItem value="отклонена">Отклонена</MenuItem>
                <MenuItem value="в работе">В работе</MenuItem>
                <MenuItem value="завершена">Завершена</MenuItem>
              </Select>
                          </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Период</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Период"
              >
                <MenuItem value="all">Все время</MenuItem>
                <MenuItem value="today">Сегодня</MenuItem>
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
                <MenuItem value="quarter">Квартал</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={() => exportData('requests')}
            >
              Экспорт
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица заявок */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Период</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((request) => (
                <TableRow key={request.id_request} hover>
                  <TableCell>{request.id_request}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={request.user_photo} 
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {request.user_name?.charAt(0)}
                      </Avatar>
                      {request.user_name}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(request.request_date)}</TableCell>
                  <TableCell>
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {request.total_price} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status_name} 
                      color={getStatusColor(request.status_name)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Просмотреть детали">
                        <IconButton 
                          size="small" 
                          onClick={() => openRequestDetails(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Изменить статус">
                        <IconButton 
                          size="small" 
                          onClick={() => openStatusDialog(request)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </TableContainer>
    </Box>
  );

  // Компонент настроек
  const SettingsTab = () => {
    const [settings, setSettings] = useState({
      autoApproval: false,
      emailNotifications: true,
      maxRequestAmount: 100000,
      workingHours: '9:00-18:00',
      supportEmail: 'support@example.com'
    });

    const handleSettingChange = async (key, value) => {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ [key]: value })
        });
        
        setSettings(prev => ({ ...prev, [key]: value }));
      } catch (error) {
        setError('Ошибка сохранения настроек');
      }
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Настройки системы
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Общие настройки
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoApproval}
                      onChange={(e) => handleSettingChange('autoApproval', e.target.checked)}
                    />
                  }
                  label="Автоматическое одобрение заявок"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email уведомления"
                />
                
                <TextField
                  fullWidth
                  label="Максимальная сумма заявки"
                  type="number"
                  value={settings.maxRequestAmount}
                  onChange={(e) => handleSettingChange('maxRequestAmount', e.target.value)}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Контактная информация
                </Typography>
                
                <TextField
                  fullWidth
                  label="Рабочие часы"
                  value={settings.workingHours}
                  onChange={(e) => handleSettingChange('workingHours', e.target.value)}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email поддержки"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  margin="normal"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          У вас нет прав доступа к панели администратора
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Панель администратора
        </Typography>
        <Box display="flex" gap={2}>
          <Badge badgeContent={statistics.pendingRequests || 0} color="error">
            <Button
              variant="outlined"
              startIcon={<Notifications />}
            >
              Уведомления
            </Button>
          </Badge>
          <Button 
            variant="outlined" 
            onClick={fetchAllData}
            disabled={loading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Табы */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<TrendingUp />} label="Статистика" />
          <Tab icon={<Assignment />} label="Заявки" />
          <Tab icon={<People />} label="Пользователи" />
          <Tab icon={<Settings />} label="Настройки" />
        </Tabs>
      </Paper>

      {/* Контент табов */}
      <Box>
        {activeTab === 0 && <StatisticsTab />}
        {activeTab === 1 && <RequestsTab />}
        {activeTab === 2 && <UsersTab />}
        {activeTab === 3 && <SettingsTab />}
      </Box>

      {/* Диалог изменения статуса */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Изменить статус заявки №{selectedRequest?.id_request}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Статус</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Статус"
            >
              <MenuItem value="новая">Новая</MenuItem>
              <MenuItem value="одобрена">Одобрена</MenuItem>
              <MenuItem value="отклонена">Отклонена</MenuItem>
              <MenuItem value="в работе">В работе</MenuItem>
              <MenuItem value="завершена">Завершена</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Комментарий администратора"
            multiline
            rows={3}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            margin="normal"
            placeholder="Добавьте комментарий для пользователя..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleStatusChange} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог деталей заявки */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Детали заявки №{selectedRequest?.id_request}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Информация о пользователе
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    src={selectedRequest.user_photo} 
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {selectedRequest.user_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{selectedRequest.user_name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      VK ID: {selectedRequest.user_vk_id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Детали заявки
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Создана: {formatDate(selectedRequest.request_date)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Период: {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Сумма: <strong>{selectedRequest.total_price} ₽</strong>
                </Typography>
                <Box mt={1}>
                  <Chip 
                    label={selectedRequest.status_name} 
                    color={getStatusColor(selectedRequest.status_name)} 
                  />
                </Box>
              </Grid>
              
              {selectedRequest.admin_comment && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Комментарий администратора
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedRequest.admin_comment}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedRequest.items && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Состав заявки
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Услуга</TableCell>
                          <TableCell>Количество</TableCell>
                          <TableCell>Цена</TableCell>
                          <TableCell>Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRequest.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.service_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price} ₽</TableCell>
                            <TableCell>{item.quantity * item.price} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Закрыть
          </Button>
          <Button 
            onClick={() => {
                            setDetailsOpen(false);
              openStatusDialog(selectedRequest);
            }}
            variant="contained"
          >
            Изменить статус
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;



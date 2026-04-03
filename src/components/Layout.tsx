import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
  Receipt as ReceiptIcon,
  Repeat as RepeatIcon,
  PieChart as PieChartIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 80;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard' },
    { divider: true },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Recurring', icon: <RepeatIcon />, path: '/recurring-transactions' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { divider: true },
    { text: 'Budgets', icon: <PieChartIcon />, path: '/budgets' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Expense Management
          </Typography>

          {/* User Menu */}
          {user && (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer/Sidebar - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" component="div">
            Menu
          </Typography>
        </Box>
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {(item as any).divider ? (
                <Divider />
              ) : (
                <ListItem
                  onClick={() => {
                    navigate((item as any).path);
                    setMobileDrawerOpen(false);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>{(item as any).icon}</ListItemIcon>
                  <ListItemText primary={(item as any).text} />
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Drawer/Sidebar - Desktop (Collapsible) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: desktopSidebarOpen ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: desktopSidebarOpen ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {/* Sidebar Header with Collapse Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          {desktopSidebarOpen && (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Menu
            </Typography>
          )}
          <Tooltip title={desktopSidebarOpen ? 'Collapse' : 'Expand'}>
            <IconButton
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              size="small"
              sx={{
                transition: 'transform 0.3s ease',
                transform: desktopSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {(item as any).divider ? (
                <Divider sx={{ my: 1 }} />
              ) : (
                <Tooltip
                  title={desktopSidebarOpen ? '' : (item as any).text}
                  placement="right"
                  arrow
                >
                  <ListItem
                    onClick={() => navigate((item as any).path)}
                    sx={{
                      cursor: 'pointer',
                      justifyContent: desktopSidebarOpen ? 'flex-start' : 'center',
                      px: desktopSidebarOpen ? 2 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: desktopSidebarOpen ? 40 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {(item as any).icon}
                    </ListItemIcon>
                    {desktopSidebarOpen && (
                      <ListItemText
                        primary={(item as any).text}
                        sx={{ ml: 2 }}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin-left 0.3s ease',
          width: {
            xs: '100%',
            sm: desktopSidebarOpen
              ? `calc(100% - ${DRAWER_WIDTH_EXPANDED}px)`
              : `calc(100% - ${DRAWER_WIDTH_COLLAPSED}px)`,
          },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

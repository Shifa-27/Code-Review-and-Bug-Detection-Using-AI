import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'Code Review', path: '/code-review' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static" sx={{
      background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            mr: 3
          }}>
            <CodeIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CODE REVIEW AI
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  mt: 1.5
                }
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu} component={RouterLink} to={page.path} sx={{
                  '&:hover': {
                    background: 'rgba(106, 17, 203, 0.05)'
                  }
                }}>
                  <Typography textAlign="center" sx={{ fontWeight: 500 }}>{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <CodeIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CODE AI
          </Typography>
          {/* Navigation Links - Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  mx: 0.5,
                  color: 'white', 
                  display: 'block',
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'right',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    '&::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'left'
                    }
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Avatar 
                    alt={user?.firstName } 
                    src="/static/images/avatar/2.jpg"
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
                    }}
                  />
                </IconButton>
                <Menu
                  sx={{ 
                    mt: '45px',
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden'
                    }
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to="/code-review" 
                    onClick={handleCloseUserMenu}
                    sx={{
                      '&:hover': {
                        background: 'rgba(106, 17, 203, 0.05)'
                      }
                    }}
                  >
                    <Typography textAlign="center" sx={{ fontWeight: 500 }}>Upload Code</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.05)'
                      }
                    }}
                  >
                    <Typography textAlign="center" sx={{ fontWeight: 500, color: '#f44336' }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ 
                    mr: 2,
                    color: 'white',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    borderRadius: 2,
                    px: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
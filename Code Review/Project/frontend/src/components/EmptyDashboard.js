import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CodeIcon from '@mui/icons-material/Code';

const EmptyDashboard = () => {
  return (
    <Paper elevation={3} sx={{ 
      p: 5, 
      textAlign: 'center', 
      my: 4, 
      borderRadius: 4,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    }}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.2) 0%, rgba(37, 117, 252, 0.2) 100%)',
            filter: 'blur(15px)',
            opacity: 0.7,
            zIndex: -1
          }
        }}>
          <CloudUploadIcon sx={{ 
            fontSize: 60, 
            color: '#6a11cb'
          }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          No Projects Yet
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'text.secondary', 
          fontSize: '1.1rem',
          maxWidth: '80%',
          margin: '0 auto 24px'
        }}>
          Upload your first code snippet to get started with AI-powered code review.
        </Typography>
        <Button
          className="gradient-button"
          variant="contained"
          size="large"
          component={RouterLink}
          to="/code-review"
          startIcon={<CloudUploadIcon />}
          sx={{ 
            mt: 2,
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
            boxShadow: '0 8px 20px rgba(106, 17, 203, 0.3)',
            '&:hover': {
              background: 'linear-gradient(90deg, #5a0cb6 0%, #1565e6 100%)',
              boxShadow: '0 10px 25px rgba(106, 17, 203, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Upload Code
        </Button>
      </Box>
    </Paper>
  );
};

export default EmptyDashboard;
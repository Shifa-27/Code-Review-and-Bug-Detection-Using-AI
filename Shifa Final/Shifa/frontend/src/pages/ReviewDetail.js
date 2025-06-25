import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CodeIcon from '@mui/icons-material/Code';

const ReviewDetail = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        // Call the backend API to get review details
        const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',  // Include credentials for CORS requests
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setReview(data);
      } catch (err) {
        setError(`Failed to load review details: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [reviewId]);

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'success.light';
    if (score >= 60) return 'warning.light';
    return 'error.light';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box className="fade-in">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          color: '#6a11cb',
          '&:hover': {
            background: 'rgba(106, 17, 203, 0.05)'
          }
        }}
      >
        Back to Dashboard
      </Button>
      
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 3
      }}>
        Code Review Details
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#6a11cb' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Paper elevation={3} sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  color: '#6a11cb'
                }}>
                  Project Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {review.name || 'Unnamed Project'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Language
                  </Typography>
                  <Chip 
                    label={review.language} 
                    size="small" 
                    sx={{
                      borderRadius: 10,
                      background: 'linear-gradient(90deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
                      color: '#6a11cb',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reviewed On
                  </Typography>
                  <Typography variant="body1">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    color: '#6a11cb'
                  }}>
                    Quality Score
                  </Typography>
                  
                  <Box sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${review.quality_score >= 80 ? '#4caf50' : review.quality_score >= 60 ? '#ff9800' : '#f44336'} 0%, ${review.quality_score >= 80 ? '#8bc34a' : review.quality_score >= 60 ? '#ffc107' : '#ff5722'} 100%)`,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '2.2rem',
                    boxShadow: `0 8px 20px ${review.quality_score >= 80 ? 'rgba(76, 175, 80, 0.4)' : review.quality_score >= 60 ? 'rgba(255, 152, 0, 0.4)' : 'rgba(244, 67, 54, 0.4)'}`,
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${review.quality_score >= 80 ? '#4caf50' : review.quality_score >= 60 ? '#ff9800' : '#f44336'} 0%, ${review.quality_score >= 80 ? '#8bc34a' : review.quality_score >= 60 ? '#ffc107' : '#ff5722'} 100%)`,
                      filter: 'blur(15px)',
                      opacity: 0.4,
                      zIndex: -1
                    }
                  }}>
                    {review.quality_score}%
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    color: review.quality_score >= 80 ? '#4caf50' : review.quality_score >= 60 ? '#ff9800' : '#f44336'
                  }}>
                    {review.quality_score >= 80 ? "Excellent" : review.quality_score >= 60 ? "Good" : "Needs Improvement"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper elevation={3} sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center'
            }}>
              <CodeIcon sx={{ mr: 1, color: '#6a11cb' }} />
              Code Sample
            </Typography>
            
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              background: 'rgba(40, 44, 52, 0.95)',
              color: '#f8f8f2',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {review.code}
              </pre>
            </Paper>
          </Paper>
          
          {review.bugs && review.bugs.length > 0 ? (
            <Paper elevation={3} sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BugReportIcon sx={{ mr: 1, color: '#f44336' }} />
                Identified Issues ({review.bugs.length})
              </Typography>
              
              <List sx={{ 
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 2,
                p: 0
              }}>
                {review.bugs.map((bug, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      mb: 1.5,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'rgba(244, 67, 54, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BugReportIcon sx={{ color: '#f44336' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, color: '#f44336' }}>
                          {bug.message}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: '#6a11cb' }}>
                            Line {bug.line}: 
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {bug.suggestion}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />}
              sx={{ 
                mt: 2, 
                mb: 4, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: '#4caf50'
                }
              }}
            >
              No issues found in your code. Great job!
            </Alert>
          )}
          
          {review.suggestions && review.suggestions.length > 0 && (
            <Paper elevation={3} sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <LightbulbIcon sx={{ mr: 1, color: '#ffc107' }} />
                Suggestions
              </Typography>
              
              <Paper sx={{ 
                p: 3, 
                borderRadius: 2, 
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px dashed rgba(106, 17, 203, 0.2)'
              }}>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {review.suggestions.map((suggestion, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">{suggestion}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ReviewDetail;
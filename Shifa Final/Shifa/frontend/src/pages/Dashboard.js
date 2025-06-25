import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmptyDashboard from '../components/EmptyDashboard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasUploadedCode, setHasUploadedCode] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    bugsDetected: 0,
    avgQualityScore: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has uploaded code before (fallback to localStorage)
    const hasAnalyzed = localStorage.getItem('hasAnalyzedCode');
    setHasUploadedCode(hasAnalyzed === 'true');
    
    // Fetch user's stats and projects from the backend
    const fetchUserData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:8000/api/user/${user.id}/reviews`, {
          credentials: 'include'  // Include credentials for CORS requests
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state with fetched data
        setStats(data.stats);
        setRecentProjects(data.recentProjects);
        
        // If we have reviews, set hasUploadedCode to true
        if (data.stats.totalReviews > 0) {
          setHasUploadedCode(true);
          localStorage.setItem('hasAnalyzedCode', 'true');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your dashboard data. Using cached data instead.');
        
        // Fallback to localStorage and mock data
        const hasAnalyzed = localStorage.getItem('hasAnalyzedCode');
        setHasUploadedCode(hasAnalyzed === 'true');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, isAuthenticated, navigate]);

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 3
      }}>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#6a11cb' }} />
        </Box>
      ) : !hasUploadedCode ? (
        <EmptyDashboard />
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card className="stats-card hover-card" sx={{ textAlign: 'center', p: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <CodeIcon sx={{ 
                      fontSize: 40, 
                      color: '#6a11cb'
                    }} />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.totalReviews}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Code Reviews Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card className="stats-card hover-card" sx={{ textAlign: 'center', p: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <BugReportIcon sx={{ 
                      fontSize: 40, 
                      color: '#f44336'
                    }} />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.bugsDetected}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Bugs Detected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card className="stats-card hover-card" sx={{ textAlign: 'center', p: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <AssessmentIcon sx={{ 
                      fontSize: 40, 
                      color: '#4caf50'
                    }} />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.avgQualityScore}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Average Quality Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Recent Projects */}
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}>
            Recent Projects
          </Typography>
          <Grid container spacing={2}>
            {recentProjects.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent projects found.
                  </Typography>
                </Paper>
              </Grid>
            ) : recentProjects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <Paper 
                  onClick={() => navigate(`/review/${project.id}`)}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    borderLeft: `4px solid ${project.score >= 80 ? '#4caf50' : project.score >= 60 ? '#ff9800' : '#f44336'}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reviewed on {project.date}
                      </Typography>
                      {project.language && (
                        <Typography variant="body2" sx={{
                          display: 'inline-block',
                          mt: 1,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 10,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(90deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%)',
                          color: '#6a11cb'
                        }}>
                          {project.language}
                        </Typography>
                      )}
                    </Grid>
                <Grid item xs={4} textAlign="right">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${project.score >= 80 ? '#4caf50' : project.score >= 60 ? '#ff9800' : '#f44336'} 0%, ${project.score >= 80 ? '#8bc34a' : project.score >= 60 ? '#ffc107' : '#ff5722'} 100%)`,
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: `0 4px 10px ${project.score >= 80 ? 'rgba(76, 175, 80, 0.4)' : project.score >= 60 ? 'rgba(255, 152, 0, 0.4)' : 'rgba(244, 67, 54, 0.4)'}`
                      }}
                    >
                      {project.score}%
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        color: '#6a11cb',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/review/${project.id}`);
                      }}
                    >
                      View Details
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
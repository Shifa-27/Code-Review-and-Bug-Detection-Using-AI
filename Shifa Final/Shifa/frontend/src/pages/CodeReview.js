import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import CodeIcon from '@mui/icons-material/Code';
// These imports are used in the results section
// import WarningIcon from '@mui/icons-material/Warning';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeReview = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeCode();
  };

  // Function to call the backend API for code analysis
  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Include credentials for CORS requests
        body: JSON.stringify({
          language: language,
          code: code,
          user_id: user?.id || 1 // Use user ID from auth context or default to 1 if not logged in
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our frontend structure
      const analysisResult = {
        qualityScore: data.quality_score,
        bugs: data.bugs.map(bug => ({
          id: bug.id,
          line: bug.line,
          severity: bug.severity,
          message: bug.message,
          suggestion: bug.suggestion
        })),
        suggestions: data.suggestions
      };

      setResults(analysisResult);
      
      // Save to localStorage that user has analyzed code
      localStorage.setItem('hasAnalyzedCode', 'true');
    } catch (err) {
      setError(`An error occurred during analysis: ${err.message}. Please try again.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'success.light';
    if (score >= 60) return 'warning.light';
    return 'error.light';
  };

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 3
      }}>
        Code Review
      </Typography>
      
      <Paper elevation={3} sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="language-select-label" sx={{ 
                  fontWeight: 500,
                  color: '#6a11cb'
                }}>Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(106, 17, 203, 0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(106, 17, 203, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6a11cb'
                    }
                  }}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="csharp">C#</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="php">PHP</MenuItem>
                  <MenuItem value="ruby">Ruby</MenuItem>
                  <MenuItem value="go">Go</MenuItem>
                  <MenuItem value="swift">Swift</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="code-input"
                label="Paste your code here"
                multiline
                rows={12}
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="code-input"
                InputProps={{
                  style: { fontFamily: 'monospace' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '& fieldset': {
                      borderColor: 'rgba(106, 17, 203, 0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(106, 17, 203, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6a11cb'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6a11cb',
                    fontWeight: 500
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CodeIcon />}
                className="gradient-button"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontSize: '1rem',
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
                {loading ? 'Analyzing...' : 'Analyze Code'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {results && (
        <Paper 
          elevation={3} 
          className="results-container" 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.5s ease-out'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}>
            Analysis Results
          </Typography>
          
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${results.qualityScore >= 80 ? '#4caf50' : results.qualityScore >= 60 ? '#ff9800' : '#f44336'} 0%, ${results.qualityScore >= 80 ? '#8bc34a' : results.qualityScore >= 60 ? '#ffc107' : '#ff5722'} 100%)`,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.8rem',
              boxShadow: `0 8px 20px ${results.qualityScore >= 80 ? 'rgba(76, 175, 80, 0.4)' : results.qualityScore >= 60 ? 'rgba(255, 152, 0, 0.4)' : 'rgba(244, 67, 54, 0.4)'}`,
              mr: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${results.qualityScore >= 80 ? '#4caf50' : results.qualityScore >= 60 ? '#ff9800' : '#f44336'} 0%, ${results.qualityScore >= 80 ? '#8bc34a' : results.qualityScore >= 60 ? '#ffc107' : '#ff5722'} 100%)`,
                filter: 'blur(15px)',
                opacity: 0.4,
                zIndex: -1
              }
            }}>
              {results.qualityScore}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quality Score
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={results.qualityScore} 
                color={results.qualityScore >= 80 ? "success" : results.qualityScore >= 60 ? "warning" : "error"}
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  mb: 1,
                  background: 'rgba(0, 0, 0, 0.05)'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {results.qualityScore >= 80 ? "Excellent" : results.qualityScore >= 60 ? "Good" : "Needs Improvement"}
              </Typography>
            </Box>
          </Box>
          
          {results.bugs.length > 0 ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BugReportIcon sx={{ mr: 1, color: '#f44336' }} />
                Potential Issues ({results.bugs.length})
              </Typography>
              
              <List sx={{ 
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 2,
                p: 0
              }}>
                {results.bugs.map((bug, index) => (
                  <ListItem 
                    key={index} 
                    className="bug-item"
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
            </Box>
          ) : (
            <Alert 
              severity="success" 
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
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
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
                {results.suggestions.map((suggestion, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography variant="body1">{suggestion}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CodeReview;
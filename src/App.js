import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  Container, 
  TextField,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Tabs, 
  Tab, 
  Paper, 
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Button,
  CssBaseline
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import PlaceIcon from '@mui/icons-material/Place';

const App = () => {
  // State management
  const [data, setData] = useState({
    restaurants: [],
    gas_stations: [],
    government: []
  });
  const [activeCategory, setActiveCategory] = useState('restaurants');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [debug, setDebug] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadCsvFiles();
  }, []);

  // Data loading function
  const loadCsvFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    const files = {
      restaurants: '/data/R8_google_maps_data.csv',
      gas_stations: '/data/gas_stations_google_maps_data.csv',
      government: '/data/government_departments_google_maps_data.csv'
    };

    try {
      const loadedData = {};
      
      for (const [category, filePath] of Object.entries(files)) {
        setDebug(prev => prev + `\nFetching ${category} data from ${filePath}`);
        
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        setDebug(prev => prev + `\nLoaded ${category} data, length: ${text.length}`);
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setDebug(prev => prev + `\nParsed ${results.data.length} rows for ${category}`);
            loadedData[category] = results.data;
          },
          error: (error) => {
            throw new Error(`Parse error for ${category}: ${error.message}`);
          }
        });
      }
      
      setData(loadedData);
    } catch (error) {
      setDebug(prev => prev + `\nError: ${error.message}`);
      setError(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search term
  const getFilteredData = () => {
    const currentData = data[activeCategory] || [];
    
    // Return empty array if neither searching nor showing all
    if (!searchTerm.trim() && !showAll) {
      return [];
    }

    // Return all data if show all is clicked and no search term
    if (showAll && !searchTerm.trim()) {
      return currentData;
    }

    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    return currentData.filter(item => 
      (item.Name?.toLowerCase().includes(searchLower) ||
       item.Address?.toLowerCase().includes(searchLower))
    );
  };

  // Event handlers
  const handleShowAll = () => {
    setShowAll(prev => !prev);
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowAll(false);
  };

  // Get filtered data
  const filteredData = getFilteredData();

  return (
    <>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
          pt: 4,
          pb: 8
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white',
              mb: 4,
              textAlign: 'center',
              fontWeight: 300,
              '& strong': { fontWeight: 600 }
            }}
          >
            <strong>Maps</strong> Directory
          </Typography>

          {/* Main Content Paper */}
          <Paper 
            elevation={24}
            sx={{ 
              background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Search and Controls Section */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.3)',
                      opacity: 1,
                    },
                  }}
                />
                <Button
                  variant={showAll ? "contained" : "outlined"}
                  onClick={handleShowAll}
                  startIcon={<ViewListIcon />}
                  sx={{
                    minWidth: '120px',
                    color: showAll ? '#1a1a1a' : 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: showAll ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: showAll ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {showAll ? 'Hide All' : 'Show All'}
                </Button>
              </Box>

              {/* Category Tabs */}
              <Tabs 
                value={activeCategory} 
                onChange={(e, newValue) => {
                  setActiveCategory(newValue);
                  setShowAll(false);
                  setSearchTerm('');
                }}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    minWidth: 120,
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab label="Restaurants" value="restaurants" />
                <Tab label="Gas Stations" value="gas_stations" />
                <Tab label="Government" value="government" />
              </Tabs>
            </Box>

            {/* Results Section */}
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              {error ? (
                <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
              ) : isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              ) : (
                <>
                  <Typography 
                    sx={{ 
                      mb: 3,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem'
                    }}
                  >
                    Showing {filteredData.length} results
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Phone</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Hours</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Rating</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Address</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.map((item, index) => (
                          <TableRow 
                            key={index} 
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                transition: 'background-color 0.2s ease'
                              },
                              '& td': { 
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                              }
                            }}
                          >
                            <TableCell sx={{ color: 'white' }}>{item.Name}</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.Phone}</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.Hours}</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.Rating}</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.Address}</TableCell>
                            <TableCell>
                              {item.URL ? (
                                <Button
                                  variant="contained"
                                  href={item.URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  startIcon={<PlaceIcon />}
                                  sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: '#90caf9',
                                    textTransform: 'none',
                                    '&:hover': {
                                      backgroundColor: 'rgba(144, 202, 249, 0.2)',
                                    }
                                  }}
                                >
                                  Maps
                                </Button>
                              ) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default App;
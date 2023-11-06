import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Link from 'next/link';

interface HistoryItemProps {
  unit1?: string;
  unit2?: string;
  prompt?: string;
  pageLink: string;
}

const HistoryBubble: React.FC<HistoryItemProps> = ({ unit1, unit2, prompt, pageLink }) => {
  const displayText = unit1 && unit2 ? `Convert: ${unit1} to ${unit2}` : `Prompt: ${prompt}`;
  
  return (
    <Link href={`/${pageLink}`} passHref>
      <Button
        sx={{
          display: 'block',
          width: '100%',
          padding: '16px',
          borderRadius: '20px',
          textAlign: 'left',
          boxShadow: 'none',
          backgroundColor: '#f5f5f5',
          color: 'black',
          '&:hover': {
            backgroundColor: '#e0e0e0',
            boxShadow: 'none',
          },
          marginBottom: '10px',
        }}
      >
        <Typography variant="subtitle1" component="div" gutterBottom>
          {displayText}
        </Typography>
        <Typography variant="subtitle2" component="div">
          Go to page: {pageLink}
        </Typography>
      </Button>
    </Link>
  );
};

const CreateConvertPage: React.FC = () => {
  const [unit1, setUnit1] = useState('');
  const [unit2, setUnit2] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItemProps[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory).reverse());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleUnit1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnit1(event.target.value);
  };

  const handleUnit2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnit2(event.target.value);
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
    if (event.target.value) {
      setUnit1('');
      setUnit2('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const endpoint = unit1 && unit2 ? '/api/create_unit_conversion_page' : '/api/create_convert_page';
      const data = unit1 && unit2 ? { unit1, unit2 } : { prompt };
      
      const response = await axios.post(`http://localhost:5000${endpoint}`, data);
      const newHistoryItem: HistoryItemProps = {
        unit1,
        unit2,
        prompt,
        pageLink: response.data.file_name,
      };
      setHistory([newHistoryItem, ...history]);
      
      setUnit1('');
      setUnit2('');
      setPrompt('');
    } catch (error) {
      console.error('There was an error creating the page', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('history');
    try {
      await axios.post('http://localhost:5000/api/clear_history');
    } catch (error) {
      console.error('There was an error clearing the history', error);
    }
  };

  // Check if any of the inputs is filled
  const promptDisabled = Boolean(unit1 || unit2);
  const unitsDisabled = Boolean(prompt);
  
  return (
    <Box sx={{ margin: '0 auto', maxWidth: '600px', textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Conversion Page
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <TextField
          label="Unit 1"
          variant="outlined"
          value={unit1}
          onChange={handleUnit1Change}
          fullWidth
          disabled={unitsDisabled}
          sx={{ marginRight: '10px', flex: 1 }}
        />
        <TextField
          label="Unit 2"
          variant="outlined"
          value={unit2}
          onChange={handleUnit2Change}
          fullWidth
          disabled={unitsDisabled}
          sx={{ marginLeft: '10px', flex: 1 }}
        />
      </Box>
      <TextField
        label="Prompt for Conversion Page"
        variant="outlined"
        value={prompt}
        onChange={handlePromptChange}
        fullWidth
        disabled={promptDisabled}
        sx={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isLoading || !(unit1 && unit2) && !prompt}
        size="large"
        sx={{ marginBottom: '20px' }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Create Page'}
      </Button>
      <IconButton onClick={handleClearHistory} sx={{ marginBottom: '20px' }}>
        <DeleteIcon />
      </IconButton>
      <Box sx={{ marginTop: '20px' }}>
        {history.map((item, index) => (
          <HistoryBubble key={index} {...item} />
        ))}
      </Box>
    </Box>
  );
};

export default CreateConvertPage;

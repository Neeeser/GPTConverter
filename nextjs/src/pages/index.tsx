import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const CreateConvertPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLink, setPageLink] = useState('');

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmitPrompt = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/create_convert_page', {
        prompt: prompt,
      });
      setPageLink(response.data.fileName);
    } catch (error) {
      console.error('There was an error creating the page', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ margin: '0 auto', maxWidth: '600px', textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Conversion Page
      </Typography>
      <Box sx={{ marginBottom: '20px' }}>
        <TextField
          label="Prompt for Conversion Page"
          variant="outlined"
          value={prompt}
          onChange={handlePromptChange}
          fullWidth
          sx={{ marginBottom: '20px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitPrompt}
          disabled={!prompt || isLoading}
          size="large"
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Page'}
        </Button>
      </Box>
      {pageLink && (
        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="h5" gutterBottom>
            Page Created:
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <a href={`/${pageLink}`}>{`Visit the page: ${pageLink}`}</a>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CreateConvertPage;

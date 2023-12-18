import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import HistoryBubble from '../components/HistoryBubble';
import { HistoryItemProps } from '../types/types'; // Adjust the path as necessary

const API_URL = 'http://localhost:5000'; // Change this to your desired API URL

const CreateConvertPage: React.FC = () => {
  const [unit1, setUnit1] = useState('');
  const [unit2, setUnit2] = useState('');
  const [prompt, setPrompt] = useState('');
  const [additionalContent, setAdditionalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItemProps[]>([]);
  const [inputType, setInputType] = useState('units');
  const [addToPrompt, setAddToPrompt] = useState(false);
  const [model, setModel] = useState('GPT-3.5'); // Set default model here
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/get_models`);
        setModelOptions(response.data.models);

        // Optional: Set the default model if it's in the response
        if (response.data.models.includes('GPT-3.5')) {
          setModel('GPT-3.5');
        }
      } catch (error) {
        console.error('Error fetching models', error);
      }
    };

    fetchModels();
  }, []);

  
  useEffect(() => {
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
      const loadedHistory = JSON.parse(savedHistory);
      setHistory(loadedHistory.sort((a, b) => b.timestamp - a.timestamp));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleAppendToPrompt = (content: string) => {
    setAdditionalContent(content);
  };

  // Define the getFileContent method in the parent component
  const getFileContent = async (pageLink: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/get_file_content/${pageLink}`);
      return response.data.content; // Make sure this corresponds to how your API sends the file content
    } catch (error) {
      console.error('Error fetching file content', error);
      return ''; // Return an empty string or handle the error as appropriate
    }
  };

  
  const handleSubmit = async () => {
    setIsLoading(true);
    let combinedPrompt = prompt;

    /// Find the active HistoryBubble and get its content
    const activeBubble = history.find(item => item.pageLink === activeBubbleId);
    if (activeBubbleId) {
      const activeBubbleContent = await getFileContent(activeBubbleId);
      combinedPrompt += `\n\n${activeBubbleContent}`;
    }

    const endpoint = unit1 && unit2 ? '/api/create_unit_conversion_page' : '/api/create_convert_page';

    // Include the model in the data being sent
    const data = unit1 && unit2 ? { unit1, unit2, model } : { prompt: combinedPrompt, model };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data);
      const newHistoryItem: HistoryItemProps = {
        unit1,
        unit2,
        prompt: prompt, // Make sure to use the combined prompt
        model, // Store the model in the history as well, if needed
        pageLink: response.data.file_name,
        timestamp: Date.now(),
      };

      setHistory([newHistoryItem, ...history]);
      setUnit1('');
      setUnit2('');
      setPrompt('');
      setAdditionalContent('');
      setActiveBubbleId(null); // Reset the active history bubble
      // Reset the model to default if needed, or leave as is if you want to keep the selection
      // setModel('GPT-3.5');
    } catch (error) {
      console.error('Error creating the page', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveBubbleId = (id: string | null) => {
    // If the id is the same as the active one, it means we are unchecking and want to set to null
    // Otherwise, we set the active bubble to the one that was just checked
    setActiveBubbleId(activeBubbleId === id ? null : id);
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('history');
    try {
      await axios.post(`${API_URL}/api/clear_history`);
    } catch (error) {
      console.error('Error clearing the history', error);
    }
  };

  return (
    <Box sx={{ margin: '0 auto', maxWidth: '600px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Create Conversion Page
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <FormControl fullWidth sx={{ marginRight: '10px' }}>
          <InputLabel id="input-type-select-label">Input Type</InputLabel>
          <Select
            labelId="input-type-select-label"
            id="input-type-select"
            value={inputType}
            label="Input Type"
            onChange={(event) => setInputType(event.target.value as string)}
          >
            <MenuItem value="units">Units</MenuItem>
            <MenuItem value="prompt">Prompt</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ marginLeft: '10px' }}>
          <InputLabel id="model-select-label">Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={model}
            label="Model"
            onChange={(event) => setModel(event.target.value as string)}
          >
            {modelOptions.map((modelName) => (
              <MenuItem key={modelName} value={modelName}>
                {modelName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {inputType === 'units' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <TextField label="Unit 1" variant="outlined" value={unit1} onChange={handleChange(setUnit1)} fullWidth sx={{ marginRight: '10px', flex: 1 }} />
          <TextField label="Unit 2" variant="outlined" value={unit2} onChange={handleChange(setUnit2)} fullWidth sx={{ marginLeft: '10px', flex: 1 }} />
        </Box>
      )}

      {inputType === 'prompt' && (
        <TextField label="Prompt for Conversion Page" variant="outlined" value={prompt} onChange={handleChange(setPrompt)} fullWidth sx={{ marginBottom: '20px' }} />
      )}

      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading || (!unit1 && !unit2 && !prompt)} size="large" sx={{ marginBottom: '20px' }}>
        {isLoading ? <CircularProgress size={24} /> : 'Create Page'}
      </Button>

      <IconButton onClick={handleClearHistory} sx={{ marginBottom: '20px' }}>
        <DeleteIcon />
      </IconButton>

      <Box sx={{ marginTop: '20px' }}>
        {history.map(item => (
          <HistoryBubble
            key={item.timestamp}
            {...item}
            isActive={activeBubbleId === item.pageLink}
            setActiveBubbleId={() => handleSetActiveBubbleId(item.pageLink)}
            onAppendToPrompt={handleAppendToPrompt}
            applyToPromptDisabled={inputType !== 'prompt'} // Add this line
          />
        ))}
      </Box>
    </Box>
  );

};

export default CreateConvertPage;

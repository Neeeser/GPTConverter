import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Popover,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Link from 'next/link';

interface HistoryItemProps {
  unit1?: string;
  unit2?: string;
  prompt?: string;
  pageLink: string;
  onAppendToPrompt?: (content: string) => void;
  addToPrompt: boolean;
  setAddToPrompt: React.Dispatch<React.SetStateAction<boolean>>;
}


const HistoryBubble: React.FC<HistoryItemProps> = ({
  unit1,
  unit2,
  prompt,
  pageLink,
  onAppendToPrompt,
  addToPrompt,
  setAddToPrompt,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (editorOpen && addToPrompt && onAppendToPrompt) {
      onAppendToPrompt(fileContent);
    }
  }, [editorOpen, addToPrompt, fileContent, onAppendToPrompt]);

  const handleEditorClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setEditorOpen(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/get_file_content/${pageLink}`);
      setFileContent(response.data.content);
    } catch (error) {
      console.error('Error fetching file content', error);
    }
  };

  const handleClose = () => {
    setEditorOpen(false);
    setAnchorEl(null);
    if (addToPrompt && onAppendToPrompt) {
      onAppendToPrompt(fileContent);
    }
  };


  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:5000/api/save_file_content/${pageLink}`, { content: fileContent });
      alert('File saved successfully');
      if (addToPrompt && onAppendToPrompt) {
        onAppendToPrompt(fileContent);
      }
    } catch (error) {
      console.error('Error saving file', error);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const displayText = unit1 && unit2 ? `Convert: ${unit1} to ${unit2}` : `Prompt: ${prompt}`;

  return (
    <Box sx={{ marginBottom: '10px' }}>
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
            marginBottom: '5px',
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
      <Button size="small" onClick={handleEditorClick} sx={{ width: '100%' }}>
        Edit File
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ padding: '10px' }}>
          <MonacoEditor
            height="400px"
            width="600px"
            language="javascript"
            value={fileContent}
            onChange={(value) => setFileContent(value || '')}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Checkbox checked={addToPrompt} onChange={(e) => setAddToPrompt(e.target.checked)} />}
              label="Add to Prompt"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ marginLeft: 'auto' }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

const CreateConvertPage: React.FC = () => {
  const [unit1, setUnit1] = useState('');
  const [unit2, setUnit2] = useState('');
  const [prompt, setPrompt] = useState('');
  const [additionalContent, setAdditionalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItemProps[]>([]);
  const [addToPrompt, setAddToPrompt] = useState(false); // State for tracking checkbox status

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
  };

  const handleAppendToPrompt = (content: string) => {
    setAdditionalContent(content);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const combinedPrompt = `${prompt}\n\n${additionalContent}`;
    try {
      const endpoint = unit1 && unit2 ? '/api/create_unit_conversion_page' : '/api/create_convert_page';
      const data = unit1 && unit2 ? { unit1, unit2 } : { prompt: combinedPrompt };

      const response = await axios.post(`http://localhost:5000${endpoint}`, data);
      const newHistoryItem: HistoryItemProps = {
        unit1: unit1, // or just unit1 if using shorthand property names
        unit2: unit2,
        prompt: prompt,
        pageLink: response.data.file_name,
        onAppendToPrompt: handleAppendToPrompt, // This should be a function
        addToPrompt: addToPrompt, // This is a boolean
        setAddToPrompt: setAddToPrompt, // This is a function to update the boolean
      };



      setHistory([newHistoryItem, ...history]);

      setUnit1('');
      setUnit2('');
      setPrompt('');
      setAdditionalContent(''); // Clear the additional content after successful submission
    } catch (error) {
      console.error('There was an error creating the page', error);
    } finally {
      setIsLoading(false);
    }
    setAddToPrompt(false); // Reset addToPrompt state
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
          <HistoryBubble
            key={index}
            {...item}
            onAppendToPrompt={handleAppendToPrompt}
            addToPrompt={addToPrompt}
            setAddToPrompt={setAddToPrompt}
          />))}
      </Box>
    </Box>
  );
};

export default CreateConvertPage;

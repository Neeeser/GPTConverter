// HistoryBubble.tsx
import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import {
  Button,
  Box,
  Typography,
  Popover,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import Link from 'next/link';

// In both HistoryBubble.tsx and index.tsx
import { HistoryItemProps } from '../types/types'; // Adjust the path as necessary


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

export default HistoryBubble;

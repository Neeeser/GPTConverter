import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Button, Box, Typography, Popover, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { HistoryItemProps } from '../types/types'; // Ensure the path is correct

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
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/save_file_content/${pageLink}`, { content: fileContent });
      alert('File saved successfully');
    } catch (error) {
      console.error('Error saving file', error);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const displayText = unit1 && unit2 ? `Convert: ${unit1} to ${unit2}` : `Prompt: ${prompt}`;

  return (
    <Box sx={{
      marginBottom: '10px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <Link href={`/${pageLink}`} passHref>
        <Button sx={{
          display: 'block',
          width: '100%',
          padding: '16px',
          textAlign: 'left',
          backgroundColor: '#f5f5f5',
          color: 'black',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
          marginBottom: '5px',
        }}>
          <Typography variant="subtitle1" gutterBottom>
            {displayText}
          </Typography>
        </Button>
      </Link>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 16px' }}>
        <Button
          size="small"
          variant="outlined" // Added for Material UI button style
          color="primary" // Added for Material UI button style
          onClick={handleEditorClick}
        >
          Edit File
        </Button>
        <FormControlLabel
          control={<Checkbox checked={addToPrompt} onChange={(e) => setAddToPrompt(e.target.checked)} />}
          label="Apply to Prompt"
        />
      </Box>
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ marginTop: '10px', float: 'right' }}
          >
            Save
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default HistoryBubble;

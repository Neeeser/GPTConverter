import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Button, Box, Typography, Popover, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { HistoryItemProps } from '../types/types'; // Ensure the path is correct

// Add the new props in the HistoryItemProps type definition
interface HistoryBubbleProps extends HistoryItemProps {
  isActive: boolean;
  setActiveBubbleId: () => void;
}
const API_URL = 'https://sitegen.cs.vt.edu'; // Change this to your desired API URL

const HistoryBubble: React.FC<HistoryItemProps> = ({
  unit1,
  unit2,
  prompt,
  model,
  isActive,
  setActiveBubbleId,
  applyToPromptDisabled, // Add this prop
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
      const response = await axios.get(`${API_URL}/api/get_file_content/${pageLink}`);
      setFileContent(response.data.content);
    } catch (error) {
      console.error('Error fetching file content', error);
    }
  };

  // Adjust the checkbox onChange handler
  const handleCheckboxChange = () => {
    // Toggle the active state based on the current active state
    if (isActive) {
      setActiveBubbleId(null); // Uncheck and set to no active bubble
    } else {
      setActiveBubbleId(); // Check and set this bubble as active
    }
  };



  const handleClose = () => {
    setEditorOpen(false);
    setAnchorEl(null);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/save_file_content/${pageLink}`, { content: fileContent });
      alert('File saved successfully');
    } catch (error) {
      console.error('Error saving file', error);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const displayText = unit1 && unit2 ? `Convert: ${unit1} to ${unit2}` : `Prompt: ${prompt}`;
  const modelText = model ? `Model: ${model}` : '';

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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px 16px',
        '& > *': {
          margin: 'auto', // This will center the elements
        }
      }}>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={handleEditorClick}
        >
          Edit File
        </Button>
        <Typography variant="subtitle2" sx={{
          color: 'gray',
          textAlign: 'center',
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {modelText}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={isActive}
              onChange={(e) => setActiveBubbleId(e.target.checked ? pageLink : null)}
              disabled={applyToPromptDisabled} // Use the prop here
            />
          }
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
}

export default HistoryBubble;

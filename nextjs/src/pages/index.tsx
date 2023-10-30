import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, stackoverflow, ghcolors, prism } from 'react-syntax-highlighter/dist/cjs/styles/prism';


interface ChatBubbleProps {
  prompt: string;
  functionName: string;
  functionCode: string;
  onClick: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ prompt, functionName, functionCode, onClick }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        overflowX: 'auto',
        fontSize: '0.875rem',
        lineHeight: 1.43,
        borderRadius: '20px',
        fontFamily: "Consolas, 'Courier New', monospace",
        cursor: 'pointer',
        marginBottom: '10px',
      }}
      onClick={onClick}
    >
      <Typography variant="subtitle1" gutterBottom>
        {functionName}
      </Typography>
    </Box>
  );
};

const ChatHistory: React.FC<{
  chatHistory: { prompt: string; functionName: string; functionCode: string }[];
  onClick: (index: number) => void;
}> = ({ chatHistory, onClick }) => {
  return (
    <Box sx={{ marginTop: '20px' }}>
      <Typography variant="subtitle1" gutterBottom>
        Chat History:
      </Typography>
      {chatHistory.map((chat, index) => (
        <ChatBubble
          key={index}
          prompt={chat.prompt}
          functionName={chat.functionName}
          functionCode={chat.functionCode}
          onClick={() => onClick(index)}
        />
      ))}
    </Box>
  );
};

const Converter: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [isPromptSubmitted, setIsPromptSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [functionCode, setFunctionCode] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [chatHistory, setChatHistory] = useState<{ prompt: string; functionName: string; functionCode: string }[]>([]);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (inputValue && isPromptSubmitted) {
      performConversion();
    }
  }, [inputValue]);

  const performConversion = async () => {
    try {
      const requestData = {
        code: functionCode,
        function_name: functionName,
        input: inputValue,
      };

      const response = await axios.post('http://localhost:5000/api/convert', requestData);
      setOutputValue(response.data.output);
    } catch (error) {
      console.error('There was an error performing the conversion', error);
    }
  };

  const submitPrompt = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/process-prompt', {
        prompt: prompt,
      });
      const { output, function_name } = response.data;
      setFunctionCode(output);
      setFunctionName(function_name);
      setIsPromptSubmitted(true);
      setChatHistory([...chatHistory, { prompt, functionName: function_name, functionCode: output }]);
    } catch (error) {
      console.error('There was an error submitting the prompt', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatBubbleClick = (index: number) => {
    const { prompt, functionName, functionCode } = chatHistory[index];
    setPrompt(prompt);
    setFunctionName(functionName);
    setFunctionCode(functionCode);
  };

  return (
    <Box sx={{ margin: '0 auto', maxWidth: '600px', textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Unit Converter
      </Typography>
      <Box sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <TextField
          label="New Prompt"
          variant="outlined"
          value={prompt}
          onChange={handlePromptChange}
          sx={{ flex: '1', marginRight: '20px' }}
        />
        <Button variant="contained" color="primary" onClick={submitPrompt} disabled={!prompt || isLoading} size="large">
          {isLoading ? <CircularProgress size={24} /> : 'Submit Prompt'}
        </Button>
      </Box>
      {isPromptSubmitted && (
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={6}>
            <TextField fullWidth label="Input" variant="outlined" value={inputValue} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Output"
              variant="outlined"
              value={outputValue}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      )}
      {isPromptSubmitted && functionCode && (
        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Generated Function:
          </Typography>
          <SyntaxHighlighter
            language="python"
            style={prism}
            customStyle={{
              margin: '0 auto', backgroundColor: '#f5f5f5', padding: '16px',
              overflowX: 'auto',
              fontSize: '0.875rem',
              lineHeight: 1.43,
              borderRadius: '20px', borderColor: '#f5f5f5',
            }}
          >
            {functionCode}
          </SyntaxHighlighter>

        </Box>
      )}
      <ChatHistory chatHistory={chatHistory} onClick={handleChatBubbleClick} />
    </Box>
  );
};

export default Converter;

import React, { useState } from 'react';
import { Container, Grid, TextField, Typography } from '@mui/material';

const App: React.FC = () => {
  const [inchesPerHour, setInchesPerHour] = useState<number | ''>('');
  const [micrometersPerSecond, setMicrometersPerSecond] = useState<number | ''>('');

  const convertInchesToMicrometers = (value: number | ''): void => {
    if (value === '') {
      setMicrometersPerSecond('');
    } else {
      const micrometersValue = (value as number) * 2540000;
      setMicrometersPerSecond(micrometersValue.toFixed(2));
    }
  };

  const convertMicrometersToInches = (value: number | ''): void => {
    if (value === '') {
      setInchesPerHour('');
    } else {
      const inchesValue = (value as number) / 2540000;
      setInchesPerHour(inchesValue.toFixed(2));
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Inches per Hour to Micrometers per Second Converter
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            type="number"
            label="Inches per Hour"
            fullWidth
            value={inchesPerHour}
            onChange={(e) => {
              setInchesPerHour(e.target.value);
              convertInchesToMicrometers(parseFloat(e.target.value));
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            type="number"
            label="Micrometers per Second"
            fullWidth
            value={micrometersPerSecond}
            onChange={(e) => {
              setMicrometersPerSecond(e.target.value);
              convertMicrometersToInches(parseFloat(e.target.value));
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;

import React from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingAndErrorDisplay = (props) => (
  <>
    {Boolean(props.isLoading || props.status === 'loading') && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        <CircularProgress />
        <span>&nbsp;{props.text || 'Loading'}...</span>
      </div>
    )}
    {Boolean(props.error) && <Alert severity="error">{props.error}</Alert>}
  </>
);
export default LoadingAndErrorDisplay;

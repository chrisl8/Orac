import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import LoadingAndErrorDisplay from './loadingAndErrorDisplay';
import useFetchWithAbort from '../utils/useFetchWithAbort';
import perSiteSettings from '../utils/perSiteSettings';

const PasswordSelector = (props) => {
  const passwordOptions = useFetchWithAbort({
    url: `${perSiteSettings.apiURL}admin/passwords/${props.groupId}`,
  });

  return (
    <>
      <LoadingAndErrorDisplay {...passwordOptions} />
      {Boolean(passwordOptions.fetchedData) && (
        <FormControl style={{ marginTop: 15, marginBottom: 10, minWidth: 250 }}>
          <InputLabel id="simple-select-label">
            {props.value.variable_name}
          </InputLabel>
          <Select
            style={{ minWidth: 250 }}
            labelId="simple-select-label"
            id="simple-select"
            value={props.value.value}
            label={props.value.variable_name}
            onChange={(event) =>
              props.handleVariableInput(event, props.value.id)
            }
          >
            {passwordOptions.fetchedData.map((entry) => (
              <MenuItem key={entry.id} value={entry.id}>
                {entry.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default PasswordSelector;

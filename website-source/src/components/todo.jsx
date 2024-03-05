import React from 'react';
import Button from '@mui/material/Button';

const Todo = (props) => {
  const todoList = [];
  if (props?.siteDataModel?.todo) {
    for (const [key, value] of Object.entries(props.siteDataModel.todo)) {
      if (value.pending) {
        todoList.push({ name: key, entryText: value.todoListEntryText });
      }
    }
  }

  const handleDoneButton = (e, name) => {
    props.sendDataToOrac('todo', { name, pending: false });
  };

  return (
    <>
      <h1>Todo</h1>
      {Boolean(todoList.length) && (
        <ul>
          {todoList.map((item) => (
            <li key={item.name}>
              {item.entryText}&nbsp;
              <Button
                variant="contained"
                onClick={(event) => handleDoneButton(event, item.name)}
              >
                Done
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Todo;

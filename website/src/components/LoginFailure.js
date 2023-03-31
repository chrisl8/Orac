import React from 'react';

const LoginFailure = (props) => (
  <div style={{ textAlign: 'center' }}>
    <h1>Login Failure</h1>
    <br />
    {props.errorText}
  </div>
);

export default LoginFailure;

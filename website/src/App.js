import React, { useEffect, useState } from 'react';
import openSocket from 'socket.io-client';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Base from './base';
import Home from './routes/home';
import store from './app/store';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [siteDataModel, setSiteDataModel] = useState({
    status: 'Offline',
    siteName: 'Orac',
  });

  useEffect(() => {
    // componentDidMount
    // https://medium.com/@felippenardi/how-to-do-componentdidmount-with-react-hooks-553ba39d1571

    // TODO: For Production
    // const newSocket = openSocket({
    //   transports: ['websocket'],
    // });
    // For local testing on the robot:
    // const newSocket = openSocket(`http://${window.location.hostname}:8080`);
    // For testing on my laptop with remote robot:
    const newSocket = openSocket(`http://192.168.1.123:8080`, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('disconnect', () => {
      setSiteDataModel({
        status: 'Offline',
      });
    });

    // TODO: Replace with something real.
    newSocket.on('robotModel', (data) => {
      setSiteDataModel(JSON.parse(data));
    });
  }, []);

  return (
    <Provider store={store}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Base />}>
            <Route index element={<Home />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

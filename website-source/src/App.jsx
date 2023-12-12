import React, { useEffect, useState } from 'react';
import openSocket from 'socket.io-client';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Base from './base';
import Home from './routes/home';

const App = () => {
  const [, setSocket] = useState(null);
  const [siteDataModel, setSiteDataModel] = useState({
    status: 'Offline',
    siteName: 'Orac',
  });

  useEffect(() => {
    // componentDidMount
    // https://medium.com/@felippenardi/how-to-do-componentdidmount-with-react-hooks-553ba39d1571

    let newSocket;
    if (window.location.hostname === 'localhost') {
      // For testing on my laptop with remote Orac
      newSocket = openSocket(`http://192.168.1.123:8080/`);
    } else {
      // For production on Orac
      newSocket = openSocket({
        transports: ['websocket'],
      });
    }

    setSocket(newSocket);

    newSocket.on('disconnect', () => {
      setSiteDataModel({
        status: 'Offline',
      });
    });

    newSocket.on('status', (data) => {
      setSiteDataModel(JSON.parse(data));
    });
  }, []);

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Base />}>
            <Route index element={<Home siteDataModel={siteDataModel} />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

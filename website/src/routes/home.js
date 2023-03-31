import React from 'react';
import perSiteSettings from '../utils/perSiteSettings';

const Home = () => (
  <>
    <p>Welcome to {perSiteSettings.applicationName}.</p>
    <p>Please choose an option from the menu on the left.</p>
  </>
);

export default Home;

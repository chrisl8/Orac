import React from 'react';
import perSiteSettings from '../utils/perSiteSettings';

const Home = (props) => (
  <>
    <p>Welcome to {perSiteSettings.applicationName}.</p>
    <p>Please choose an option from the menu on the left.</p>
    <p>{props.siteDataModel.status}</p>
  </>
);

export default Home;

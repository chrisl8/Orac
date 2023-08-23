import React from 'react';
import perSiteSettings from '../utils/perSiteSettings';

const Home = (props) => (
  <>
    <p>Welcome to {perSiteSettings.applicationName}.</p>
    <p>Orac Status: {props.siteDataModel.status}</p>
    {props.siteDataModel.userLocation &&
      props.siteDataModel.userLocation.isHome && (
        <p>
          Christen <strong> is</strong> home.
        </p>
      )}
    {(!props.siteDataModel.userLocation ||
      !props.siteDataModel.userLocation.isHome) && (
      <p>
        Christen is <strong> not</strong> home.
      </p>
    )}
    {/*<p>Christen is home: {props.siteDataModel.userLocation.isHome}</p>*/}
    <pre>{JSON.stringify(props.siteDataModel, null, 2)}</pre>
  </>
);

export default Home;

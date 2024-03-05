import React from 'react';
import perSiteSettings from '../utils/perSiteSettings';
import HomeAssistantIcon from '../images/home_assistant_icon_138491.svg';
import Todo from '../components/todo';

const Home = (props) => (
  <>
    <p>
      Welcome to {perSiteSettings.applicationName}.<br />
      <img className="white-icon" src={HomeAssistantIcon} alt="HA" />
      <span style={{ verticalAlign: 'super' }}>
        {Boolean(props.siteDataModel.homeAssistantConnected) && 'Connected'}
      </span>
      <br />
      Orac Status: {props.siteDataModel.status}
      <br />
      {props.siteDataModel.userLocation &&
        props.siteDataModel.userLocation.isHome && (
          <>
            Christen <strong> is</strong> home.
          </>
        )}
      {(!props.siteDataModel.userLocation ||
        !props.siteDataModel.userLocation.isHome) && (
        <>
          Christen is <strong> not</strong> home.
        </>
      )}
    </p>
    <Todo {...props} />
    <h1>Blue Dwarf</h1>
    VIN: {props.siteDataModel?.blueDwarf?.vin}
    <br />
    Mileage: {props.siteDataModel?.blueDwarf?.mileage}
    <h2>Oil</h2>
    <ul>
      <li>Oil</li>
    </ul>
    <hr />
    {/*<p>Christen is home: {props.siteDataModel.userLocation.isHome}</p>*/}
    <pre>{JSON.stringify(props.siteDataModel, null, 2)}</pre>
  </>
);

export default Home;

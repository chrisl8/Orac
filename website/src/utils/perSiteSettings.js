const applicationName = 'Orac';
let apiURL = `http://192.168.1.123:8080/`;
if (window.location.hostname === 'localhost') {
  apiURL = `http://localhost/`;
}

const perSiteSettings = {
  applicationName,
  apiURL,
};

export default perSiteSettings;

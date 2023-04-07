require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_URL = process.env.API_URL;

async function getToken() {
  try {
    const response = await axios.post(`${API_URL}/api/Token`, {
      username: API_USERNAME,
      password: API_PASSWORD,
      grant_type: 'password',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: [(data) => {
        return Object.keys(data).map(key => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }).join('&');
      }]
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw new Error('Failed to get token');
  }
}

async function getComponents(req) {
  try {
    const token = await getToken();

    // Construct the OData filter based on the "eeid" query parameter
    let filter = "ComponentType/Name eq 'Application'";
    if (req.query.eeid) {
      filter += ` and EEID eq ${req.query.eeid}`;
    }
    

    const response = await axios.get(`${API_URL}/api/Components?$filter=${filter}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting components:', error.message);
    throw new Error('Failed to get components');
  }
}

app.get('/components', async (req, res) => {
  try {
    const components = await getComponents(req);
    res.json(components);
  } catch (error) {
    console.error('Error handling request:', error.message);
    res.status(500).send('Failed to get components');
  }
});

app.post('/components', async (req, res) => {
  try {
    const { architectureName, applicationName } = req.body;
    const token = await getToken();

    const componentData = {
      ArchitectureName: architectureName,
      ComponentTypeName: 'Application Survey',
      Name: `Application Survey for ${applicationName}`
    };

    // Create the component
    const createComponent = axios.post(`${API_URL}/api/Components`, componentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Wait for the component to be created before creating the connection
    const componentResponse = await createComponent;
    console.log('Component Response Body:', componentResponse.data);

    const connectionData = {
      Name: 'Application Survey Connection',
      ArchitectureName: architectureName,
      ConnectionTypeName: 'Surveyed',
      SourceComponentName: `Application Survey for ${applicationName}`,
      SinkComponentName: applicationName
    };

    // Wait 5 seconds before creating the connection
    setTimeout(async () => {
      const createConnection = axios.post(`${API_URL}/api/Connections`, connectionData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const connectionResponse = await createConnection;
      console.log('Connection Response Body:', connectionResponse.data);
    }, 5000);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error creating component:', error.message);
    res.status(500).json({ error: 'Failed to create component' });
  }
});




app.listen(3001, '0.0.0.0', () => {
  console.log('Server listening on port 3001');
});

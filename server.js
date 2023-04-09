require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { auth } = require('express-openid-connect');

const app = express();
const cors = require("cors");

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/vps.mattdav.is/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/vps.mattdav.is/fullchain.pem')
};

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(bodyParser.json());

const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_URL = process.env.API_URL;
const AUTH0_SECRET = process.env.AUTH0_SECRET;

async function getToken() {
  try {
    const response = await axios.post(
      `${API_URL}/api/Token`,
      {
        username: API_USERNAME,
        password: API_PASSWORD,
        grant_type: "password",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        transformRequest: [
          (data) => {
            return Object.keys(data)
              .map((key) => {
                return (
                  encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
                );
              })
              .join("&");
          },
        ],
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting token:", error.message);
    throw new Error("Failed to get token");
  }
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://vps.mattdav.is',
  clientID: 'OQVv18aSMi4UuD41iXWvEvdgv8TwfAq5',
  issuerBaseURL: 'https://dev-8odjbliwttyqwb1h.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

async function getComponents(req) {
  try {
    const token = await getToken();

    // Construct the OData filter based on the "eeid" query parameter
    let filter = "ComponentType/Name eq 'Application'";
    if (req.query.eeid) {
      filter += ` and EEID eq ${req.query.eeid}`;
    }

    const response = await axios.get(
      `${API_URL}/api/Components?$filter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting components:", error.message);
    throw new Error("Failed to get components");
  }
}

app.get("/components", async (req, res) => {
  try {
    const components = await getComponents(req);
    res.json(components);
  } catch (error) {
    console.error("Error handling request:", error.message);
    res.status(500).send("Failed to get components");
  }
});

app.get("/questions", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/ComponentTypes?$filter=Name eq 'Application Survey'&$expand=Properties($filter=Type eq 'Q')`,
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from API");
  }
});

app.post("/components", async (req, res) => {
  try {
    const { architectureName, applicationName, answers, userName } = req.body;
    const token = await getToken();

    const componentData = {
      ArchitectureName: architectureName,
      ComponentTypeName: "Application Survey",
      Name: `Application Survey for ${applicationName}`,
    };

    // Create the component
    const createComponent = axios.post(
      `${API_URL}/api/Components`,
      componentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Wait for the component to be created before creating the connection
    const componentResponse = await createComponent;
    console.log("Component Response Body:", componentResponse.data);

    const sourceComponentEEID = componentResponse.data.EEID;

    console.log("Application Name:", applicationName);

    const connectionData = {
      Name: "Application Survey Connection",
      ArchitectureName: architectureName,
      ConnectionTypeName: "Surveyed",
      SourceComponentEEID: sourceComponentEEID,
      SinkComponentName: applicationName,
    };

    // Wait for 5 seconds before creating the connection
    setTimeout(async () => {
      try {
        const createConnection = await axios.post(
          `${API_URL}/api/Connections`,
          connectionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Connection Response Body:", createConnection.data);
      } catch (error) {
        console.error("Error creating connection:", error.message);
        throw new Error("Failed to create connection");
      }
    }, 5000);

    const propertiesPatchRequests = Object.entries(answers).map(
      ([question, answer]) => {
        const property = {
          Type: "Q",
          Name: question,
          Value: answer,
        };
        console.log("Property to be sent:", property);
        return axios.patch(
          `${API_URL}/api/Components(${sourceComponentEEID})/Properties('${property.Type}|${property.Name}')`,
          { Value: property.Value },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    );

    // Wait for all the properties to be updated
    await Promise.all(propertiesPatchRequests);

    console.log(`Survey data saved for user ${userName}`); // Log the user's name


    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error creating component:", error.message);
    res.status(500).json({ error: "Failed to create component" });
  }
});

https.createServer(options, app).listen(443, () => {
  console.log("Server listening on port 443");
});

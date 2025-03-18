# Application Surveys for Avolution ABACUS

This project extends the functionality of Avolution ABACUS by providing a robust solution for handling application surveys outside of the Enterprise dashboards. It serves as a proof of concept for a working Application Surveys module, handling forms, and interacting with the ABACUS REST API. 

This project leverages Express to avoid CORS issues on the Enterprise server.

https://github.com/dattmavis/app-survey/assets/84292097/3c7d3bf0-8a6c-4a79-9de5-0286a5590d95

## Benefits

- **Enhanced Collaboration**: Users can fill out surveys to assist EA work.
- **Responsive web interface**: Offers a cleaner and more responsive interface for filling out surveys.
- **Dynamic survey generation**: Express routing implements automatic link generation, enabling new surveys to be dynamically created and workflows to be automated.
- **Seamless embedding**: Enhances embedding in existing platforms and enables better task assignment.

## Features

- **User Authentication**: Utilizes Auth0 for secure user authentication.
- **API Integration**: Interacts with the ABACUS REST API to fetch and submit survey data.
- **State Management**: Manages state using React hooks for a smooth user experience.
- **Secure Communication**: Ensures secure communication using HTTPS with Let's Encrypt certificates.

## System Requirements

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Avolution ABACUS account w/ REST API License
- Auth0 account for authentication

## Installation Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/app-surveys-abacus.git
   cd app-surveys-abacus` 

2.  **Install Dependencies**
    
    bash
    
    Copy code
    
    `npm install` 
    
3.  **Set Up Environment Variables** Create a `.env` file in the root directory and add the following variables:
    
		 
		API_USERNAME=username
		API_PASSWORD=password
		API_URL= https://yourabacusinstance.com
		AUTH0_SECRET=your-auth0-secret
		AUTH0_CLIENT_ID=your-auth0-client-id
		AUTH0_ISSUER_BASE_URL=https://your-auth0-domain

    
4.  **Set Up HTTPS** Ensure you have the SSL/TLS certificates from Let's Encrypt or another certificate authority. Place the certificates in the appropriate directory (e.g., `/etc/letsencrypt/live/vps.mattdav.is/`).
    
5.  **Run the Application**
    
    bash
    
    Copy code
    
    `npm start` 
    
6.  **Access the Application** Open your browser and navigate to `https://vps.mattdav.is` to access the survey application.
    

## Usage

### User Authentication

-   **Login**: Users can log in using Auth0 to access and fill out surveys.
-   **Logout**: Users can log out to end their session.

### Filling Out Surveys

-   Upon logging in, users will see a list of available surveys.
-   Users can fill out the surveys and submit their responses.
-   The application will save the responses and provide a confirmation message.

## Contributing

1.  Fork the repository
2.  Create a new branch (`git checkout -b feature-branch`)
3.  Make your changes and commit (`git commit -am 'Add new feature'`)
4.  Push to the branch (`git push origin feature-branch`)
5.  Create a new Pull Request

## License & Disclaimer

This project is unlicensed, and being provided to the public for demonstration purposes. The ABACUS REST API and all associated ABACUS Code belongs to Avolution Software.
This App Survey code is personally developed by me, and I am not publishing it to be representative of any type of official extension to ABACUS or any other products offered by Avolution Software. 

I highly suggest viewing this entirely as a proof of concept. I am not offering this in any official capacity to be supported by Avolution, making no promises or guarantees, no assurances of maintenace or security, and you should use any code or examples at your own risk.

## Contact

For any inquiries or feedback, please reach out to Matt Davis via GitHub or Email.


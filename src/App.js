import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [components, setComponents] = useState([]);
  const [eeid, setEeid] = useState('');

  useEffect(() => {
    async function fetchComponents() {
      try {
        const params = new URLSearchParams(window.location.search);
        const eeid = params.get('eeid');
        if (eeid) {
          setEeid(eeid);
          const response = await axios.get(`http://localhost:3001/components?eeid=${eeid}`);
          setComponents(response.data.value);
        } else {
          console.warn('No valid Application EEID specified');
        }
      } catch (error) {
        console.error('Error fetching components:', error.message);
      }
    }

    fetchComponents();
  }, []);

  const [businessFit, setBusinessFit] = useState('');
  const [technicalFit, setTechnicalFit] = useState('');
  const [cost, setCost] = useState('');
  const [security, setSecurity] = useState('');
  const [support, setSupport] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const answersJson = JSON.stringify({
      businessFit,
      technicalFit,
      cost,
      security,
      support
    });

    console.log(answersJson);

    try {
      const architectureName = components[0].ArchitectureName;
      const applicationName = components[0].Name;
      await axios.post('https://localhost:3001/components', {
        architectureName,
        applicationName
      });
      console.log('Components created successfully');
    } catch (error) {
      console.error('Error creating components:', error.message);
    }
  };

  if (!eeid) {
    return (
      <div className="survey-container">
        <div className="alert">No Valid Application EEID Specified</div>
      </div>
    );
  }



  return (
    <div className="survey-container">
      <h1>Application Survey</h1>

      {components.map((component) => (
        <div key={component.EEID}>
          <p><b>Application Name:</b> {component.Name}</p>
          <p><b>Description: </b>{component.Description}</p>
          <p><b>Architecture: </b>{component.ArchitectureName}</p>
        </div>
      ))}

      {components.length > 0 &&
        <form onSubmit={handleSubmit}>
          <hr></hr><br></br>

          <div className="question-container">
            <label className="question">Mission Fit</label>
            <p>How well does the application provide the required mission or business capabilities or processes from a user perspective?</p>
            <select className="answer" name="businessFit" value={businessFit} onChange={(e) => setBusinessFit(e.target.value)}>
              <option value="">Select An Answer</option>
              <option value="5">5 - Perfect fit</option>
              <option value="4">4 - Good fit</option>
              <option value="3">3 - Average fit</option>
              <option value="2">2 - Poor fit</option>
              <option value="1">1 - No fit</option>
            </select>
          </div>

          <div className="question-container">
            <label className="question">Technical Fit </label>
            <p>How well does this application fit with your technical infrastructure?</p>
            <select className="answer" name="technicalFit" value={technicalFit} onChange={(e) => setTechnicalFit(e.target.value)}>
              <option value="">Select An Answer</option>
              <option value="5">5 - Perfect fit</option>
              <option value="4">4 - Good fit</option>
              <option value="3">3 - Average fit</option>
              <option value="2">2 - Poor fit</option>
              <option value="1">1 - No fit</option>
            </select>
          </div>

          <div className="question-container">
            <label className="question">Cost</label>
            <p>How does the cost of this application compare to alternatives?</p>
            <select className="answer" name="cost" value={cost} onChange={(e) => setCost(e.target.value)}>
              <option value="">Select An Answer</option>
              <option value="5">5 - Much cheaper</option>
              <option value="4">4 - Slightly cheaper</option>
              <option value="3">3 - Same cost</option>
              <option value="2">2 - Slightly more expensive</option>
              <option value="1">1 - Much more expensive</option>
            </select>
          </div>

          <div className="question-container">
            <label className="question">Security</label>
            <p>How secure is this application?</p>
            <select className="answer" name="security" value={security} onChange={(e) => setSecurity(e.target.value)}>
              <option value="">Select An Answer</option>
              <option value="5">5 - Highly secure</option>
              <option value="4">4 - Secure</option>
              <option value="3">3 - Somewhat secure</option>
              <option value="2">2 - Not very secure</option>
              <option value="1">1 - Not at all secure</option>
            </select>
          </div>


          <div className="question-container">
            <label className="question">Support </label>
            <p> How good is the vendor's support for this application?</p>
            <select className="answer" name="support" value={support} onChange={(e) => setSupport(e.target.value)}>
              <option value="">Select An Answer</option>
              <option value="5">5 - Excellent support</option>
              <option value="4">4 - Good support</option>
              <option value="3">3 - Average support</option>
              <option value="2">2 - Poor support</option>
              <option value="1">1 - No support</option>
            </select>
          </div>

          <button type="submit">Submit</button>
        </form>
      }

      {components.length === 0 &&
        <div className="alert">No valid application found for that EEID</div>
      }
    </div>
  );
}

export default App;
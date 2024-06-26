import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import SubmissionList from "./SubmissionList";

import "./style.css";

function App() {

  const [components, setComponents] = useState([]);
  const [eeid, setEeid] = useState("");
  const [questions, setQuestions] = useState([]);


  const [answers, setAnswers] = useState({});
  const [showDescriptions, setShowDescriptions] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  

  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const handleAnswerChange = (questionName, answer) => {
    setAnswers({
      ...answers,
      [questionName]: answer,
    });
  };


  const handleLogin = () => {
    localStorage.setItem("eeid", window.location.search.split("=")[1]);
     const redirectUri = window.location.origin;
    loginWithRedirect({
      redirectUri: `${redirectUri}?eeid=${localStorage.getItem("eeid")}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("eeid"); // remove eeid from localStorage on logout
    const redirectUri = window.location.origin;
    logout({ returnTo: redirectUri });

  };




  useEffect(() => {
    async function fetchComponents() {
      try {
        const params = new URLSearchParams(window.location.search);
        const eeid = params.get("eeid");
        if (eeid) {
          setEeid(eeid);
          const [componentsResponse, questionsResponse] = await Promise.all([
            axios.get(`https://vps.mattdav.is/components?eeid=${eeid}`),
            axios.get(`https://vps.mattdav.is/questions`),
          ]);
          setComponents(componentsResponse.data.value);
          setQuestions(
            questionsResponse.data.value[0].Properties.map((question) => ({
              name: question.Name,
              description: question.Description,
            }))
          );
        } else {
          console.warn("No valid Application EEID specified");
        }
      } catch (error) {
        console.error("Error fetching components:", error.message);
      }
    }

    fetchComponents();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const eeid = localStorage.getItem("eeid");
  
    const surveyData = {
      applicationName: components[0].Name,
      architectureName: components[0].ArchitectureName,
      eeid,
      userName: user?.name, // add the userName property here
      answers: Object.entries(answers).map(([question, answer]) => ({
        name: question,
        value: answer,
      })),
    };
  
    console.log("Survey data to be sent:", surveyData);

    try {
      await axios.post("https://vps.mattdav.is/components", surveyData);
      console.log("Survey data saved");
      localStorage.setItem('surveyData', JSON.stringify(surveyData));
      setIsSubmitted(true); // set isSubmitted to true after the form has been submitted
    } catch (error) {
      console.error("Error saving survey data:", error.message);
    }
  };

  useEffect(() => {
    const initialShowDescriptions = questions.reduce(
      (acc, question) => ({
        ...acc,
        [question.name]: false,
      }),
      {}
    );
    setShowDescriptions(initialShowDescriptions);
  }, [questions]);

  const toggleDescription = (questionName) => {
    setShowDescriptions({
      ...showDescriptions,
      [questionName]: !showDescriptions[questionName],
    });
  };

  if (!eeid) {
    return (
      <div className="alert">
        No Valid Application EEID Specified. <br /><br /> Please follow it again from ABACUS or contact your system administrator if the link is invalid.
      </div>
    );
  }

  return (

  
<div className={isAuthenticated ? "survey-container" : ""}>
  {isAuthenticated ? (
    <div>
      <div className="login-container">
        <p>User: {user.name}</p>
        <button className="login-button" onClick={handleLogout}>Log Out</button>
      </div>
      <div className="header-container">
        <div className="title-container">
          <h1 className="title">Application Survey</h1>
          {components.map((component) => (
            <div key={component.EEID}>
              <p>
                <b>Application Name:</b> {component.Name}
              </p>
              <p>
                <b>Description: </b>
                {component.Description}
              </p>
              <p>
                <b>Architecture: </b>
                {component.ArchitectureName}
              </p>
            </div>
          ))}
        </div>
        <div className="logo-container">
          <img src="logo.png" alt="Logo" className="logo" />
        </div>
        <div className="question-container">
          {isSubmitted ? (
            <SubmissionList />
          ) : (
            <div>
              {components.length > 0 && (
                <form onSubmit={handleSubmit}>
                  {questions.map((question) => (
                    <div
                      key={question.name}
                      className={
                        showDescriptions[question.name]
                          ? "question-card active"
                          : "question-card"
                      }
                    >
                      <div
                        className="question-title"
                        onClick={() => toggleDescription(question.name)}
                      >
                        <h2 className="question">{question.name}</h2>
                        <span className="question-icon">
                          {showDescriptions[question.name] ? "▲" : "ⓘ"}
                        </span>
                      </div>
                      {showDescriptions[question.name] && (
                        <div className="question-description">
                          <p>{question.description}</p>
                        </div>
                      )}
                      <div className="question-answer">
                        <select
                          className="answer"
                          name={question.name}
                          value={answers[question.name]}
                          onChange={(e) =>
                            handleAnswerChange(question.name, e.target.value)
                          }
                        >
                          <option value="">Select An Answer</option>
                          <option value="5">5 - Perfect fit</option>
                          <option value="4">4 - Good fit</option>
                          <option value="3">3 - Average fit</option>
                          <option value="2">2 - Poor fit</option>
                          <option value="1">1 - No fit</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
          )}
        </div>
        <hr />
      </div>
    </div>
  ) : (
    <div className="alert">
      <p>Please log in to view the survey.</p>
      <button className="login-button" onClick={handleLogin}>Log In</button>
    </div>
  )}
</div>
  );
}

export default App;

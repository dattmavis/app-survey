import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";



function App() {
  const [components, setComponents] = useState([]);
  const [eeid, setEeid] = useState("");
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [showDescriptions, setShowDescriptions] = useState({});

  const handleAnswerChange = (questionName, answer) => {
    setAnswers({
      ...answers,
      [questionName]: answer,
    });
  };

  useEffect(() => {
    async function fetchComponents() {
      try {
        const params = new URLSearchParams(window.location.search);
        const eeid = params.get("eeid");
        if (eeid) {
          setEeid(eeid);
          const [componentsResponse, questionsResponse] = await Promise.all([
            axios.get(`http://localhost:3001/components?eeid=${eeid}`),
            axios.get(`http://localhost:3001/questions`),
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

    const surveyData = {
      applicationName: components[0].Name,
      architectureName: components[0].ArchitectureName,
      answers,
    };

    console.log("Survey data to be sent:", surveyData);

    try {
      await axios.post("http://localhost:3001/components", surveyData);
      console.log("Survey data saved");
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
      <div className="survey-container">
        <div className="alert">No Valid Application EEID Specified</div>
      </div>
    );
  }

  return (

    <div className="survey-container">
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
      </div>

      <hr />

      {components.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="question-container">
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
          </div>

          <button type="submit">Submit</button>
        </form>
      )}

      {components.length === 0 && (
        <div className="alert">No valid application found for that EEID</div>
      )}
    </div>

  );
}

export default App;

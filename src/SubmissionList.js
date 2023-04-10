import React, { useEffect, useState } from 'react';

const SubmissionList = () => {
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('surveyData');
    if (data) {
      setSurveyData(JSON.parse(data));
    }
  }, []);

  if (!surveyData) {
    return <div>No submissions yet</div>;
  }

  return (
    <div>
      <h2>Thank you for completing the survey!</h2>
      <h3>Here are your submissions:</h3>
      <ul>
        {surveyData.answers.map((answer, index) => (
          <li key={index}>
            {answer.name}: {answer.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubmissionList;

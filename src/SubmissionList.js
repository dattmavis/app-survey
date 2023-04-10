import React from 'react';

const SubmissionList = ({ answers }) => (
  <div>
    <h2>Thank you for completing the survey!</h2>
    <h3>Here are your submissions:</h3>
    <ul>
      {answers.map((answer, index) => (
        <li key={index}>{answer.name}: {answer.value}</li>
      ))}
    </ul>
  </div>
);

export default SubmissionList;

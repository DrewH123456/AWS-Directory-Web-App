import React, { useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [result, setResult] = useState('');

  const loadData = async () => {
    // Fetch data from S3
    fetch('https://s3-us-west-2.amazonaws.com/css490/input.txt')
      .then(response => response.text())
      .then(items => {
        // Send data to Lambda function
        fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
          method: 'POST',
          body: JSON.stringify({ button: 'loadData', fileName: 'input.txt', fileData: items }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(data => setData(data))
          .catch(error => console.error('Error loading data:', error));
      })
      .catch(error => console.error('Error fetching file:', error));
  };

  const clearData = async () => {
    // Clear data using Lambda function
    fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
      method: 'POST',
      body: JSON.stringify({ button: 'clearData', fileName: 'input.txt' }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error clearing data:', error));
  };

  const queryDataData = async () => {
    // queryData data using Lambda function
    fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
      method: 'POST',
      body: JSON.stringify({ button: 'queryData', firstName, lastName }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error queryDataing data:', error));
  };

  return (
    <div>
      <h1>Higginbotham Program 4</h1>
      <div>
        <button onClick={loadData}>Load Data</button>
        <button onClick={clearData}>Clear Data</button>
        <br />
        <label>First Name:</label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <br />
        <label>Last Name:</label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <br />
        <button onClick={queryDataData}>queryData</button>
        {/* <button onClick={handleClick}>Update State</button> */}
      </div>
      {data && (
        <div>
          <h2>Results:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
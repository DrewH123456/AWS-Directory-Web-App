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
      // .then(text => {
      //   const lines = text.split('\n');
      //   const items = lines.map(line => {
      //     const [lastName, firstName, ...attributes] = line.split(' ');
      //     const item = { lastName, firstName };
      //     attributes.forEach(attribute => {
      //       const [key, value] = attribute.split('=');
      //       item[key] = value;
      //     });
      //     return item;
      //   });
      //   return items;
      // })
      .then(items => {
        // Send data to Lambda function
        fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
          method: 'POST',
          body: JSON.stringify({ button: 'loadData', key: 'input.txt', object: items }),
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
      body: JSON.stringify({ button: 'clearData', key: 'input.txt' }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error clearing data:', error));
  };

  const queryData = async () => {
    // Query data using Lambda function
    fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
      method: 'POST',
      body: JSON.stringify({ button: 'query', firstName, lastName }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error querying data:', error));
  };

  // const handleClick = async () => {
  //   try {
  //     const response = await fetch('https://pm3cd73culmxojlhxrttdmkag40loirs.lambda-url.us-east-2.on.aws/', {
  //       method: 'POST',
  //       body: JSON.stringify({ button: 'updateState', /* any other data you want to send */ }),
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch data');
  //     }

  //     const responseData = await response.json();
  //     setResult(responseData);
  //   } catch (error) {
  //     console.error('Error updating state:', error);
  //   }
  // };

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
        <button onClick={queryData}>Query</button>
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
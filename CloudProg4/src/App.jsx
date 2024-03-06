import React, { useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const loadData = () => {
    fetch('https://your-lambda-endpoint', {
      method: 'POST',
      body: JSON.stringify({ button: 'loadData' }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error loading data:', error))
  }

  const clearData = () => {
    fetch('https://your-lambda-endpoint', {
      method: 'POST',
      body: JSON.stringify({ button: 'clearData' }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(() => setData(null))
      .catch(error => console.error('Error clearing data:', error))
  }

  const queryData = () => {
    fetch('https://your-lambda-endpoint', {
      method: 'POST',
      body: JSON.stringify({ button: 'query', firstName, lastName }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => console.log('Query result:', data))
      .catch(error => console.error('Error querying data:', error))
  }

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
      </div>
    </div>
  )
}

export default App
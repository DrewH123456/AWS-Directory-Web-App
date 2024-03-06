import React, { useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const loadData = () => {
    // Fetch data from object storage and update state
    // Example: fetch('https://s3-us-west-2.amazonaws.com/css490/input.txt')
    //           .then(response => response.text())
    //           .then(data => setData(data))
    //           .catch(error => console.error('Error loading data:', error))
  }

  const clearData = () => {
    // Clear data from object storage and update state
    // Example: setData(null)
  }

  const queryData = () => {
    // Query data based on first name and last name
    // Example: const result = data.filter(item => item.firstName === firstName && item.lastName === lastName)
    //           console.log('Query result:', result)
  }

  return (
    <div>
      <h1>Website + Storage</h1>
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
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
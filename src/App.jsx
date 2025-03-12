import { useState } from 'react'
import JsonGenerator from './components/JsonGenerator'
import { Route, Router, Routes } from 'react-router-dom';


function App() {
  const [count, setCount] = useState(0)

  return (
      <Routes>
        <Route path="/" element={<JsonGenerator />} />
      </Routes>
  );
}

export default App

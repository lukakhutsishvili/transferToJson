import { useState } from 'react'
import JsonGenerator from './components/JsonGenerator'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='min-h-screen'>
    <JsonGenerator/>
    </div>
    </>
  )
}

export default App

import { Route, Routes } from "react-router-dom";

import JsonGenerator from "./components/JsonGenerator";


function App() {
  return (
      <Routes>
        <Route path="/" element={<JsonGenerator />} />
      </Routes>
  );
}

export default App;

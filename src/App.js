import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" exact={true} element={<Home />} />
      </Routes>
    </>
  );
}

export default App;

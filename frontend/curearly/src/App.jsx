import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { AuthProvider } from "./context/AuthContext";
import Header from './components/Header.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from './pages/HomePage/HomePage.jsx';
import Login from "./pages/Login/Login";
import Register from './pages/Register/Register';
import PatientProfile from "./pages/PatientProfile/PatientProfile";
import Analysis from "./pages/Analysis/Analysis";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/patient-profile"
            element={
              <ProtectedRoute>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

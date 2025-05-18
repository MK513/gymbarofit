import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';

function App() {

  // let loadingPage = <h1> Loading ... </h1>;
  // let content = loadingPage;

  // if (!loading) {
  //   content = todoPage;
  // }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
    // <div className="App">
    //   <{content}>
    // </div>
  );
}

export default App;
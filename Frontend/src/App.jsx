import "./App.css";
import logo from "./assets/logo.avif";
function App() {
  return (
    <>
      <div className="container">
        <div className="logo">
          <img src={logo} className="logo react" alt="React logo" />
        </div>
        <h1>Generate Your Certificate </h1>
        <div className="main_card">
          <label htmlFor="name">Type Your Name Here</label>
          <input type="text" placeholder="Enter Your Name" id="name" />{" "}
          <label htmlFor="email">Type Your Email Here</label>
          <input type="email" placeholder="Enter Your Email" id="email" />{" "}
          <div className="generate_btn">
            <button>Generate</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

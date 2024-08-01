import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.avif";
import axios from "axios";
function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // const [data, setData] = useState(null); // For storing the response

  const handleGenerate = () => {
    // Make sure to validate input before sending the request
    if (!name || !email) {
      alert("Please enter both name and email");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);

    axios
      .post("http://localhost:6257/create-document", formData, {
        responseType: "blob", // Set responseType to blob if you expect binary data (PDF)
      })
      .then((response) => {
        // Assuming the API returns a PDF file, handle it here
        // For instance, you might want to download the file
        console.log(response);
        const fileURL = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", `${name}.pdf`); // File name for download
        document.body.appendChild(link);
        link.click();
        setEmail("");
        setName("");
      })
      .catch((error) => {
        console.log("Error generating certificate:", error);
        setName("");
        setEmail("");
      });
  };
  return (
    <>
      <div className="container">
        <div className="logo">
          <img src={logo} className="logo react" alt="React logo" />
        </div>
        <h1>Generate Your Certificate </h1>
        <div className="main_card">
          <label htmlFor="name">Type Your Name Here</label>
          <input
            type="text"
            placeholder="Enter Your Name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />{" "}
          <label htmlFor="email">Type Your Email Here</label>
          <input
            type="email"
            placeholder="Enter Your Email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />{" "}
          <div className="generate_btn">
            <button onClick={handleGenerate}>Generate</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

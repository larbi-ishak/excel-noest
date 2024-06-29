"use client";

import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [start, setStart] = useState(2); // Default value set to 0
  const [end, setEnd] = useState(0); // Default value set to 0

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleStartChange = (event) => {
    setStart(event.target.value);
  };

  const handleEndChange = (event) => {
    setEnd(event.target.value);
  };

  const handleButtonClick = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("start", start);
    formData.set("end", end);

    setProcessing(true);
    try {
      const response = await fetch("/api/excel", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Response from server:", data);
      setProcessing(false);
      data.success ? setSuccess(true) : setFail(true);
    } catch (error) {
      setProcessing(false);
      console.error("Error:", error);
      setFail(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input type="file" onChange={handleFileChange} />
      Start:
      <input
        type="number"
        placeholder="Start"
        value={start}
        onChange={handleStartChange}
        style={{ color: "red" }}
      />
      End:
      <input
        type="number"
        placeholder="End"
        value={end}
        onChange={handleEndChange}
        style={{ color: "red" }}
      />
      <div>
        <button onClick={handleButtonClick}>Upload and Send</button>
      </div>
      <p>{processing ? "En cours de traitement" : null}</p>
      Operation Status: {success ? "Succeeded" : null} {fail ? "Failed" : null}
    </main>
  );
}

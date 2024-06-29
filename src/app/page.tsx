"use client";

import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleButtonClick = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    
    try {
      const response = await fetch("/api/excel", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input type="file" onChange={handleFileChange} />

      <div>
        <button onClick={handleButtonClick}>Upload and Send</button>
      </div>
    </main>
  );
}

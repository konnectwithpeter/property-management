/* eslint-disable react/prop-types */
import React, { createContext } from "react";

let APIContext = createContext();
export default APIContext;
export const APIProvider = (props) => {
  //global start section for urls in the entire project
  const backendUrl = "http://127.0.0.1:8000/";
  const frontendUrl = "http://localhost:5173/";

  let contextData = {
    API_URL: backendUrl,
    BASE_URL: frontendUrl,
  };
  return (
    <APIContext.Provider value={contextData}>
      {props.children}
    </APIContext.Provider>
  );
};
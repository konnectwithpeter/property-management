/* eslint-disable react/prop-types */
import React, { createContext } from "react";

let APIContext = createContext();
export default APIContext;
export const APIProvider = (props) => {
  //global start section for urls in the entire project
  const backendUrl = "http://147.79.102.115:8000/";
  const frontendUrl = "http://147.79.102.115:8000/";

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
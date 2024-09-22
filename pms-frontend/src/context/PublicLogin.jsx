/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./AuthContext";
import React from 'react'


// eslint-disable-next-line no-unused-vars
const PublicLogin = ({ children, ...rest }) => {
	let { user } = useContext(AuthContext);

	//restrict all logged in user from accessing auth pages
	return user.username !== "guest" ? (
		<Navigate to="/" />
	) : (
		<Outlet {...rest} />
	);
};

export default PublicLogin;
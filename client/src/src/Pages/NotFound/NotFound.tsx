import axios from "axios";
import { useEffect, useState } from "react";
import SignIn from "../../Components/Auth/Signin";
import { redirect, useNavigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';
import React from "react";
import KillSocket from "../../Components/KillSocket/KillSocket";
import image404 from './404.png';
import './NotFound.scss'

function NotFound() {
  let navigate = useNavigate();
  KillSocket("all");
  let booleffect = false;

  // const IsLoggedIn = useSelector(getLogged);
  // const IsTwoAuthConnected = useSelector(getConnected);
  // const IsTwoAuthActivated = useSelector(getActivated);
  // const User = useSelector(getUser);
  // const dispatch = useDispatch();

  const [User, setUser] = useState<any>();
  const [IsLoggedIn, setLogged] = useState<boolean>();
  const [IsTwoAuthActivated, setActivated] = useState<boolean>();
  const [IsTwoAuthConnected, setConnected] = useState<boolean>();

  async function GetLoggedInfoAndUser() {
    if (localStorage.getItem("token")) {
      await axios
        .get(`http://90.66.199.176:7000/user/getLoggedInfo`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setLogged(res.data.IsLoggedIn);
          setActivated(res.data.isTwoFactorAuthenticationEnabled);
          setConnected(res.data.isSecondFactorAuthenticated);
        })
        .catch((err) => {
          console.log(err.message);
          setUser("{}");
        });
      await axios
        .get(`http://90.66.199.176:7000/user`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setUser(JSON.stringify(res.data.User));
          console.log(User);
        })
        .catch((err) => {
          console.log(err.message);
          setUser("{}");
        });
    }
  }

  useEffect(() => {
    if (!booleffect) {
      GetLoggedInfoAndUser();
      booleffect = true;
    }
  }, []);

  return (
    <div className="NotFoundPage">
      <img src={image404} alt="404"></img>
      <button onClick={() => navigate("/")}> Home </button>
    </div>
  );
}

export default NotFound;
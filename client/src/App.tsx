import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./Pages/Home/HomePage";
import NotFound from "./Pages/NotFound";
import Logout from "./Components/Auth/Logout";
import Settings from "./Pages/Settings/Settings";
import TwoAuth from "./Pages/TwoAuth";
import axios from "axios";
import GameSpectatePage from "./Pages/GameSpectatePage/GameSpectatePage";
import React from "react";
import { getConnectedList, getRequestedList, getSocketSocial, getUser, setConnectedList, setFriendList, setRequestedList, setRequestList, setSocketSocial, setUser } from "./Redux/authSlice";
import { getSocket, setSocket } from "./Redux/chatSlice";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import DMPage from "./Pages/DMPage/DMPage";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Protected from "./Protected";
import TestPage from "./Pages/test";
import { createNotification } from "./Components/notif/Notif";
//import TestPage from "./Pages/test";
//import './Pages/PhaserGame'

function App() {
  const [APIStatus, setAPIStatus] = useState<boolean>(true);
	const dispatch = useDispatch();
	const user = useSelector(getUser);
	const socketSocial = useSelector(getSocketSocial);
	const socketChat = useSelector(getSocket);
	const ConnectedList = useSelector(getConnectedList);
	const requestedList = useSelector(getRequestedList);
	const [booleffect, setBooleffect] = useState<boolean>(false);
	
	useEffect(() => { // Connect to the socket
		if (!socketChat)
		{
			const newSocket = io('http://90.66.192.148:4001');
			dispatch(setSocket(newSocket));
		}
		// socketSocial?.removeAllListeners();
		
		//eslint-disable-next-line
	}, []);
	useEffect(() => {
		const socketSet = async () => {
			await axios.get(`http://90.66.192.148:7000/user`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
			.then((res) => {
				if (res.data.User)
				{
					socketSocial?.close();
					console.log("get user and emit socket");
					const newSocketSocial = io('http://90.66.192.148:7003');
					dispatch(setSocketSocial(newSocketSocial));
					dispatch(setUser(res.data.User));
				}
			})
				
		}
		socketSet();
	}, [localStorage.length]);
	useEffect(() => {
		if (user && !booleffect && socketSocial)
		{
			setBooleffect(true);
			console.log('"oleffect"');
			socketSocial.emit("connected", {uuid: user.uuid});
		}
	}, [socketSocial, user]);

	useEffect(() => {
		if (user && socketSocial)
		{
			socketSocial.removeListener("mewFriend");
			socketSocial.on("newFriend", (data: any) => {
				if (data.uuid === user.uuid && data?.username) {
					createNotification("info", "New friend request from: " + data.username);
					axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
					}).then((res) => {
						let requestTab = res.data.usernameList;
						if (requestTab.length)
							dispatch(setRequestList(requestTab));
						else
							dispatch(setRequestList([]));
					}).catch((err) => {
						console.log(err.message);
						// SetRequestList([]);
					});
				}
			});
			socketSocial.removeListener("friendAccepted");
			socketSocial.on("friendAccepted", (data: any) => {
				if (data.uuid === user.uuid && data?.username && data?.friendUuid) {
					createNotification("info", data.username + " accepted your friend request");
					axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
					}).then((res) => {
						const requested = requestedList.filter((e : any) => e.uuid !== data.friendUuid);
						dispatch(setRequestedList(requested));
						let friendList = res.data.friendList;
						if (friendList.length)
							dispatch(setFriendList(friendList));
					}).catch((err) => {
						console.log(err.message);
					});
				}
			});
			socketSocial.removeListener("removedOrBlocked");
			socketSocial.on("removedOrBlocked", (data: any) => {
				if (data.uuid === user.uuid && data?.username) {
					//createNotification("info", data.username + " accepted your friend request");
					axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
					}).then((res) => {
						let friendList = res.data.friendList;
						if (friendList.length)
							dispatch(setFriendList(res.data.friendList));
					}).catch((err) => {
						console.log(err.message);
					});
				}
			});
			socketSocial.removeListener("CancelFriend");
			socketSocial.on("CancelFriend", (data: any) => {
				if (data.uuid === user.uuid) {
					axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
					}).then((res) => {
						let requestTab = res.data.usernameList;
						if (requestTab.length)
							dispatch(setRequestList(requestTab));
						else
							dispatch(setRequestList([]));
					}).catch((err) => {
						console.log(err.message);
						//SetRequestList([]);
					});
				}
			});
			socketSocial.removeListener("DeclineFriend");
			socketSocial.on("DeclineFriend", (data: any) => {
				if (data.uuid === user.uuid) {
					axios.get(`http://90.66.192.148:7000/user/ListFriendRequested`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
					}).then((res) => {
						let requestedTab = res.data.ListFriendsRequested;
						if (requestedTab.length)
							dispatch(setRequestedList(requestedTab));
						else
							dispatch(setRequestedList([]));
					}).catch((err) => {
						console.log(err.message);
						//SetRequestList([]);
					});
				}
			});
		}
	}, [socketSocial]);

	useEffect(() => {
		console.log("update socket on")
		console.log(`socketSocial ${socketSocial}`);
		if (socketSocial)
		{
			console.log('la')
			socketSocial?.removeListener("listUsersConnected");
			socketSocial.on('listUsersConnected', (data : any) => {
				dispatch(setConnectedList(data.users));
				console.log("erererererer" , ConnectedList)
			})
			
			socketSocial?.removeListener("connectedToServer");
			socketSocial.on('connectedToServer', (data : any) => {
				console.log("test")
				dispatch(setConnectedList([...ConnectedList, data]));
			})
			
			socketSocial?.removeListener("disconnectFromServer");
			socketSocial.on('disconnectFromServer', (data : any) => {
				console.log("Oui salade: ", ConnectedList.filter((user: any) => user.uuid !== data.uuid))
				dispatch(setConnectedList(ConnectedList.filter((user: any) => user.uuid !== data.uuid)));
			})
		}
	}, [socketSocial, ConnectedList]);
  return (
    <Router>
      {APIStatus ? (
        <Routes>
			
			<Route path="/" element={<HomePage />}></Route>
			<Route path="/login" element={<SignIn />}></Route>
			<Route path="/login/return/" element={<GetToken />}></Route>
			<Route path="/settings" element={<Settings />}></Route>
			{/* <Route path="/profile" element={<Protected><Profile /></Protected>}></Route> */}
			<Route path="/logout" element={<Protected><Logout /></Protected>}></Route>
			<Route path="/twoAuth" element={<Protected><TwoAuth /></Protected>}></Route>
			{/* <Route path="/social" element={<Protected><Social /></Protected>}></Route> */}
			{/* <Route path=":UserId" element={<Protected><Social /></Protected>}></Route> */}
			{/*</Routes>Route path="/game/" element={<Protected><GamePlayingPage /></Protected>}></Route>*/}
			{/*</Routes>Route path="/game/:roomId" element={<Protected><GamePlayingPage /></Protected>}></Route>*/}
			<Route path="/game/spectate" element={<Protected><GameSpectatePage /></Protected>}></Route>
			<Route path="/game/spectate/:roomId" element={<Protected><GameSpectatePage /></Protected>}></Route>
			<Route path="/chat/" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/channel" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/channel/:id" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/dm" element={<Protected><DMPage /></Protected>}></Route>
			<Route path="/chat/dm/:id" element={<Protected><DMPage /></Protected>}></Route>
			<Route path="/test" element={<Protected><TestPage /></Protected>}></Route>
			<Route path="*" element={<NotFound />}></Route>
    </Routes>
      ) : (
        <Routes>
          <Route
            path="*"
            element={<div>{APIStatus ? "API is up" : "API is down"}</div>}
          ></Route>
        </Routes>
      )}
    </Router>
  );
}

export default App;

/* <Route path="/chat" element={<ChatPage />}></Route> */


import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import SignIn from '../Components/Auth/Signin';
import { redirect, useNavigate, useLocation } from "react-router-dom";
import './Profile.scss';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function Profile() {
	let navigate = useNavigate();
	let booleffect = false;
	const token = localStorage.getItem('token');

	const booleffect2 = useRef<boolean>(true);
	const firstrender = useRef<boolean>(true);

	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const IsLoggedIn = useSelector(getLogged);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();

	const [User, setUser] = useState<any>();
	const [IsLoggedIn, setLogged] = useState<boolean>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>();
	const [IsTwoAuthConnected, setConnected] = useState<boolean>();

	async function GetLoggedInfoAndUser()
	{
		if (localStorage.getItem('token'))
		{
			await axios.get(`http://localhost:5000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setLogged(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
				}).catch((err) => {
					console.log(err.message);	
				});
				
				await axios.get(`http://localhost:5000/user`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setUser(JSON.stringify(res.data.User));	
					console.log(res.data.User)
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
		}
		booleffect2.current = false;
	}
	useEffect(() : any => {
		if (!booleffect)
		{
			GetLoggedInfoAndUser()
			booleffect = true;
		}
	},[]);
	return (
		<div className='profilePage'>
			<div className='container'>
			{
				!(booleffect2.current) ?
				(	
					<div className='container'>
					{
						(User) ?
						(
							<div className='userProfile'>
							{
								User === "{}" ?
								(
									<div className='userNotFound'>
										<p> User not found </p>
										<button onClick={() => navigate("/")}> Home </button>
									</div>
								)

								:

								<div className='userInfo'>
									<p> Hello {JSON.parse(User)?.username} </p>
									<img src={JSON.parse(User)?.image} alt="user_img" width="384" height="256"/><br></br>
									<button onClick={() => navigate("/")}> Home </button>
									<button onClick={() => navigate("/logout")}> Logout </button>
								</div>
							}
							</div>
						)

						:

						<div className='userNotFound'>
							<p> User not found </p>
							<button onClick={() => navigate("/")}> Home </button>
						</div>
					}
					</div>
				)
				:
					<p> Loading .... </p>
			}
			</div>
		</div>
	)
}

export default Profile;
import axios from 'axios';import { useState } from 'react';
import { getUser } from '../../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import React from 'react';
import { createNotification } from '../../notif/Notif';
import './Join.scss';

interface props {
    channelId: string;
    channelVisibility: string;
    setSearchChannel: any;
}

function Join(props: props) {
    const [password, setPassword] = useState<string>("");

    const dispatch = useDispatch();
    
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);

    const handleJoin = async (id: string) => {

        if (props.channelVisibility === "protected")
            if (password === "")
                return;

        if (props.channelVisibility === "private")
        {
            createNotification("error", "You can't join this channel, please use the private code.");
            return;
        }
                
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://90.66.199.176:7000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }
    
        await axios.post("http://90.66.199.176:7000/api/chat/channel/join", {"channelId": id, "userId": user.uuid, "password": password})
        .then(() => {
            getUsersChannel(user.uuid);
            socket?.emit('joinPermanent', { channelId: id });
            createNotification("success", "You have successfully join the channel.");
            props.setSearchChannel("");
        }).catch((err) => {
            createNotification("error", err.response.data.message);
        })}
    
  return (
    <>
        {
            props.channelVisibility === "protected" ?
            <>
                <input placeholder="password" value={password} onChange={e => setPassword(e.target.value)}></input>
                <button className='joinChannelButton' onClick={e => handleJoin(props.channelId)}>Join</button>
            </>
            :
            <>
                <button className='joinChannelButton' onClick={e => handleJoin(props.channelId)}>Join</button>
            </>
        }
    </>
  );
}

export default Join;

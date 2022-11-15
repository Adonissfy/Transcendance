import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";

interface props {
    user: IuserDb;
}

function Kick(props : props) {
  const socket = useSelector(getSocket);
  const me = useSelector(getUser);
  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  const handleKick = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    await axios.post(`http://90.66.192.148:7000/api/chat/channel/kick/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.uuid
    }).then(() => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "kick"});
      createNotification('success', 'You have successfully kicked the player.');
    });
  }

  return (
    <button className="actionButton" onClick={e => handleKick(props.user.uuid)}>Kick</button>
  );
}

export default Kick;
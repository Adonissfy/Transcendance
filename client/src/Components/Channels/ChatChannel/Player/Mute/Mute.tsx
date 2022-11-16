import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './Mute.scss'
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";

interface props {
    user: IuserDb;
    mutedUsers: [];
}

function Mute(props : props) {
  const [value, onChange] = useState<Date>(new Date());
  const me = useSelector(getUser);
  const socket = useSelector(getSocket);

  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  const [time, setTime] = useState<string>("permanent");
  const [muteMenu, setMuteMenu] = useState(false);

  const handleMute = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    if (isMuted()){ //unmute
      await axios.post(`http://90.66.192.148:7000/api/chat/channel/unmute/`, {
        channelId: selectedChannel,
        target: targetId,
        admin: me.uuid,
      }).then(() => {
        socket.emit("mute", {channelId: selectedChannel, target: targetId});
        setMuteMenu(false);
        createNotification('success', 'You have successfully umuted the player.');
      });

      return ;
    }
    
    if (!value)
      onChange(new Date());
    
    let permanent = time === "permanent" ? true : false;
    let duration = value?.toISOString();

    await axios.post(`http://90.66.192.148:7000/api/chat/channel/mute/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.uuid,
      time: duration,
      isPermanent: permanent
    }).then(() => {
      socket.emit("mute", {channelId: selectedChannel, target: targetId});
      setMuteMenu(false);
      if (permanent)
        createNotification('success', 'You have permanently muted the player.');
      else
        createNotification('success', 'You have successfully muted the player until ' + value.toLocaleDateString() + " at " + value.getHours() + ":" + value.getMinutes() + '.');
    });
  }

  const handleClose = () => {
    setMuteMenu(false);
    // props.setManageMode(false);
  }

  const isMuted = () => {
    if (props.mutedUsers.filter((user: any) => user.id === props.user.uuid).length > 0)
      return true;
    return false;
  }

  return (
    <>
      { muteMenu ?
          <div className="muteMenu">
            <div className="muteContainer">
              <div className="muteInfos">
                <h3>Mute {props.user.username}</h3>
                <span onClick={handleClose}>X</span>
              </div>
              <div className="muteDuration">
                <h4>Duration</h4>
                <form>
                  <input type="radio" name="permanent" value="permanent" onChange={e => setTime("permanent")} checked={time === "permanent"}/>
                  <label htmlFor="permanent">Permanent</label>
                  <input type="radio" name="temporary" value="temporary" onChange={e => setTime("temporary")} checked={time === "temporary"}/>
                  <label htmlFor="temporary">Temporary</label>
                </form>
              </div>
              {
                time === "temporary" ?
                <DateTimePicker 
                  disableClock={true} 
                  clearIcon={null} 
                  format="dd/MM/y - h:mm a" 
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="Y"
                  minutePlaceholder="Minute" 
                  hourPlaceholder="Hour"
                  closeWidgets={false}
                  locale="fr"
                  minDate={new Date()} 
                  onChange={onChange}
                  value={value}
                  

                  className="datePicker" 
                  required />
                  : null
              }
              <button onClick={() => handleMute(props.user.uuid)}>Mute</button>
            </div>
          </div>
      : null
    }
      {
        isMuted() ?
          <button className="actionButton" onClick={() => handleMute(props.user.uuid)}>Unmute</button>
        :
          <button className="actionButton" onClick={() => setMuteMenu(!muteMenu)}>Mute</button>
      }
    </>
  );
}

export default Mute;
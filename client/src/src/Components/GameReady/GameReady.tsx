import axios from "axios";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { createNotification } from "../notif/Notif";
import React from "react";
import "./GameReady.scss";
import { PacmanLoader, ScaleLoader } from "react-spinners";
import NavBar from "../Nav/NavBar";
import { useSelector } from "react-redux";
import { getSockeGame } from "../../Redux/gameSlice";
/*
  Check if player search on another tab
*/
interface props {
  socket: Socket | undefined;
  setReady: (ready: boolean) => void;
  setPlayerId: (playerId: string) => void;
  setPlayerName: (playerName: string) => void;
  setDisplay: (display: boolean) => void;
}

interface IPlayer {
  id: string;
  name: string;
  status: string;
  x: number;
  y: number;
}

interface IRoom {
  id: string;
  name: string;
  nbPlayers: number;
  owner: string;
  status: string;
  createdAt: string;
  playerA: IPlayer;
  playerB: IPlayer;
  scoreA: number;
  scoreB: number;
  ball: IBall;
  settings: ISettings;
  configurationA: IConfiguration;
  configurationB: IConfiguration;
}

interface ISettings {
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
  background: string;
}
interface IConfiguration {
  difficulty: string;
  background: string;
  confirmed: boolean;
}
interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

function GameReady(props: props) {
  const [searching, setSearching] = useState<boolean>(false);
  const [searchingDisplay, setSearchingDisplay] = useState<boolean>(false);
  const [room, setRoom] = useState<IRoom>();
  const [tmpUser, setTmpUser] = useState<any>(null);
  const [tmpUserBoolean, setTmpUserBoolean] = useState<boolean>(false);
  const [configuringDisplay, setConfiguringDisplay] = useState<boolean>(false);
  const [settings, setSettings] = useState<IConfiguration>({difficulty: "easy", background: "background1", confirmed: false});
  const [settingsBis, setSettingsBis] = useState<IConfiguration>({difficulty: "easy", background: "background1", confirmed: false});
  //const [notification, setNotificaton] = useState<Boolean>(false);
  const socket = useSelector(getSockeGame);


  // const [propsOn, setPropsOn] = useState<boolean>(false);
  useEffect(() => {
    if (searching && !tmpUserBoolean) {
      setTmpUserBoolean(true);
      socket?.on("searching-" + tmpUser.id, (data: IRoom) => {
        setSearchingDisplay(true);
        //setNotificaton(false);
        setRoom(data);
      });
      socket?.emit("searching", tmpUser);
      console.log("emit searching", socket);
    }
  }, [searching, tmpUser, tmpUserBoolean, socket]);
    const [timeouts, setTimeouts] = useState<number>(20);
    socket?.removeListener("configuring");
    socket?.removeListener("configurationUpdated");
    socket?.removeListener("playerLeave");
    socket?.removeListener("roomDestroyed");
    socket?.removeListener("roomTimeout");

    socket?.on("configuring", (data: IRoom) => {
      console.log("receive configuring", data);
      setSearchingDisplay(false);
      setConfiguringDisplay(true);
    });
    socket?.on("roomDestroyed", (data: any) => {
      console.log("Room destroyed");
      createNotification("info", "Un des deux jouers n'a pas confirmé la configuration");
      socket?.emit("cancelSearching", { tmpUser, room });
      setSearchingDisplay(false);
      setSearching(false);
      setTmpUserBoolean(false);
      setConfiguringDisplay(false);
      setSettings({difficulty: "easy", background: "background1", confirmed: false});
      props.setDisplay(true);
    });
    socket?.on("roomTimeout", (data: any) => {
      console.log("Timeout", data.time);
      setTimeouts(data.time);
    });
    socket?.on("configurationUpdated", (data: IRoom) => {
      console.log(
        "receive configurationUpdated",
        data.configurationB,
        data.configurationA,
        data.playerA,
        data.playerB,
        tmpUser,
        data
      );
      if (data.playerA?.id === tmpUser?.id) setSettingsBis(data.configurationB);
      else setSettingsBis(data.configurationA);
    });
    socket?.on("playerLeave", () => {
      console.log("receive cancelSearching");
      createNotification("info", "L'autre connard a leave 1");
      //setNotificaton(true);
      setSearchingDisplay(true);
      setSearching(true);
      setTmpUserBoolean(true);
      setConfiguringDisplay(false);
      setSettings({difficulty: "easy", background: "background1", confirmed: false});
    });
  // }
  //}, [propsOn, socket, User, searchingDisplay, configuringDisplay, searching, tmpUserBoolean, settingsBis, settings, room, tmpUser, error, success]);

  const getUser = async () => {
    const messages = await axios
      .get(`http://90.66.199.176:7000/user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .catch((err) => {
        console.log(err);
      });
    if (messages?.data && messages.data?.User) {
      console.log(messages.data.User, {
        id: messages.data.User.uuid,
        name: messages.data.User.username,
      });
      setTmpUser({
        id: messages.data.User.uuid,
        name: messages.data.User.username,
      });
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  async function handleReady() {
    console.log("hey", socket);
    props.setPlayerId(tmpUser.id);
    props.setPlayerName(tmpUser.name);
    //setNotificaton(false);
    setSearching(true);
    props.setDisplay(false);
  }
  return (
    <div className="PlayInterface">
      {!searchingDisplay && !configuringDisplay ? (
        <>
          <button onClick={handleReady} className="play-button">
            Search for a game
          </button>
        </>
      ) : null}
      {searchingDisplay ? (
        <div>
          <ScaleLoader
            className="loading-spinner"
            color={"#FFFFFF"}
            loading={true}
            height={65}
            speedMultiplier={0.75}
            width={10}
          />
          {
            //<p className="waiting-text">Searching for a game...</p>
          }
          <button
            onClick={
              () => {
                socket?.emit("cancelSearching", { tmpUser, room });
                setSearchingDisplay(false);
                setConfiguringDisplay(false);
                setSearching(false);
                setTmpUserBoolean(false);
                props.setDisplay(true);
              } /*Cancel search*/
            }
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      ) : null}
      {configuringDisplay ? (
        <div>
        
          <div className="game-config">
            <p>Configuring the game...</p>
            <p>{timeouts}</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              <select
                disabled={settings?.confirmed}
                className="game-config-select"
                defaultValue="easy"
                id="Difficulty"
                onChange={(e) => {
                  if (e.target.value === "undefined") return;
                  if (settings)
                    setSettings({ ...settings, difficulty: e.target.value });
                  else
                    setSettings({
                      difficulty: e.target.value,
                      background: "",
                      confirmed: false,
                    });
                  socket?.emit("updateConfirugation", {
                    difficulty: e.target.value,
                    background: settings?.background,
                    confirmed: false,
                  });
                }}
              >
                <option key="easy" value="easy">
                  Easy
                </option>
                <option key="medium" value="medium">
                  Medium
                </option>
                <option key="hard" value="hard">
                  Hard
                </option>
              </select>
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Background">Background </label>
              <select
                disabled={settings?.confirmed}
                className="game-config-select"
                defaultValue="background1"
                id="Background"
                onChange={(e) => {
                  if (e.target.value === "undefined") return;
                  if (settings)
                    setSettings({ ...settings, background: e.target.value });
                  else
                    setSettings({
                      difficulty: "",
                      background: e.target.value,
                      confirmed: false,
                    });
                  socket?.emit("updateConfirugation", {
                    difficulty: settings?.difficulty,
                    background: e.target.value,
                    confirmed: false,
                  });
                }}
              >
                <option key="background1" value="background1">
                  Background 1
                </option>
                <option key="background2" value="background2">
                  Background 2
                </option>
              </select>
            </div>

            <button
              className="game-config-button"
              onClick={
                () => {
                  console.log("cancel searching", tmpUser);
                  socket?.emit("cancelSearching", { tmpUser, room });
                  setSearchingDisplay(false);
                  setSearching(false);
                  setTmpUserBoolean(false);
                  setConfiguringDisplay(false);
                  setSettings({difficulty: "easy", background: "background1", confirmed: false});
                  props.setDisplay(true);
                } /*Cancel search*/
              }
            >
              Cancel
            </button>
            {!settings?.confirmed ? (
            <button
              className="game-config-button"
              onClick={
                () => {
                  if (
                    settings?.difficulty &&
                    settings?.background &&
                    settings?.confirmed === false
                  ) {
                    setSettings({ ...settings, confirmed: true });
                    socket?.emit("confirmConfiguration", settings);
                  }
                  else {
                    console.log ("settings", settings);
                  }
                } /*Cancel search*/
              }
            >
              Ready
            </button>
            ) : null}
          </div>
          <div className="game-config-secondary">
            <p>Configuration of the other player</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              {settingsBis?.difficulty ? (
                <p>{settingsBis.difficulty}</p>
              ) : (
                <p>Easy1</p>
              )}
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Difficulty">Background </label>
              {settingsBis?.background ? (
                <p>{settingsBis.background}</p>
              ) : (
                <p>Background1</p>
              )}
            </div>
            Ready : {settingsBis?.confirmed ? <p>Yes</p> : <p>No</p>}
          </div>
        </div>
      ) : null}
      <div></div>
    </div>
  );
}

export default GameReady;

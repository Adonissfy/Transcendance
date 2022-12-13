import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import "./GamePlay.scss";
import { Stage, Layer, Rect, Circle, Text, Image } from "react-konva";
import useImage from 'use-image';
import Konva from "konva";
import useEventListener from "@use-it/event-listener";

interface props {
  socket: Socket | undefined;
  room: IRoom | undefined;
  playerId: string;
  playerName: string;
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

interface IConfiguration {
  difficulty: string;
  background: string;
}

interface ISettings {
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
  background: string;
}

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
  percentY: number;
  ref: React.RefObject<Konva.Rect>;
}

interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface ICanvasBall {
  x: number;
  y: number;
  id: string;
  radius: number;
  percentX: number;
  percentY: number;
  ref: React.RefObject<Konva.Circle>;
}

/*
g
*/

function GamePlay(props: props) {
  let maxWidth = 1000;
  let maxHeight = 500;
  const [image] = (props?.room?.settings?.background == "background1" ? useImage("") : useImage(''));
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth > maxWidth ?  maxWidth : window.innerWidth);
  const [windowsHeight, setWindowsHeight] = useState(window.innerHeight > maxHeight - 200 ? maxHeight : window.innerHeight - 200); // game board
  const [boardWidth, setBoardWidth] = useState<number>(
    props.room?.settings.boardWidth
      ? (props.room?.settings.boardWidth / 100) * windowsWidth
      : 100
  );
  const [boardHeight, setBoardHeight] = useState<number>(
    props.room?.settings.boardHeight
      ? (props.room?.settings.boardHeight / 100) * windowsHeight
      : 100
  );
  const [ball, setBall] = useState<ICanvasBall>({
    id: "ball",
    x: props.room?.ball.x
      ? (props.room?.ball.x / 100) * windowsWidth
      : windowsWidth / 2,
    y: props.room?.ball.y
      ? (props.room?.ball.y / 100) * windowsHeight
      : windowsHeight / 2,
    radius: props.room?.settings.ballRadius
      ? (props.room?.settings.ballRadius / 100) * windowsHeight
      : 100,
    percentX: 50,
    percentY: 50,
    ref: React.createRef<Konva.Circle>(),
  });
  const [playerA, setPlayerA] = useState<ICanvasBoard>({
    id: "playerA",
    x: 0.01 * windowsWidth,
    y: props.room?.playerA.y
      ? (props.room?.playerA.y / 100) * windowsHeight
      : windowsHeight / 2 - boardHeight / 2,
    percentY: 50,
    ref: React.createRef<Konva.Rect>(),
  });
  const [playerB, setPlayerB] = useState<ICanvasBoard>({
    id: "playerB",
    x: (windowsWidth - 0.0175 * windowsWidth),
    y: props.room?.playerB.y
      ? (props.room?.playerB.y / 100) * windowsHeight
      : windowsHeight / 2 - boardHeight / 2,
    percentY: 50,
    ref: React.createRef<Konva.Rect>(),
  });
  let uwu = false;
  useEffect (() => {
    if (!uwu)
    {
      playerA.ref.current?.position({ x: playerA.x, y: playerA.y });
      playerB.ref.current?.position({ x: playerB.x, y: playerB.y });
      uwu = true;
    }
  }, [])

  let mouseMoveBool = true;
  const mousemove = 
    (e: any) => {
      if (mouseMoveBool) {
        console.log("Emit");
        const _player = { id: "", x: 0, y: 0 };
        if (props.room?.playerA.name === props.playerName) {
          _player.id = playerA.id;
          _player.x = playerA.x;
          _player.y = playerA.y;
        } else {
          _player.id = playerB.id;
          _player.x = playerB.x;
          _player.y = playerB.y;
        }
        if (!e?.clientY) return;
        const _height = e?.clientY;
        _player.y =
          (((_height - boardHeight / 2) * 100) / window.innerHeight) *
          (windowsHeight / 100);
        if (_player.y < 0) _player.y = 0;
        if (_player.y + boardHeight > windowsHeight)
          _player.y = windowsHeight - boardHeight;

        props.socket?.emit("playerMove", {
          id: _player.id,
          x: (100 * _player.x) / windowsWidth,
          y: (100 * _player.y) / windowsHeight,
          timestamp: Date.now(),
        });
        if (props.room?.playerA.name === props.playerName) {
          playerA.ref.current?.position({ y: _player.y, x: playerA.x });
          setPlayerA({ ...playerA, y: _player.y, percentY: ((100 * _player.y) / windowsHeight) });
        }
        else {
          playerB.ref.current?.position({ y: _player.y, x: playerB.x });
          setPlayerB({ ...playerB, y: _player.y, percentY: ((100 * _player.y) / windowsHeight) });
        }
      }
      mouseMoveBool = !mouseMoveBool;
    }

  useEventListener("mousemove", mousemove);
  function handleResize() {
    setWindowsWidth(window.innerWidth > maxWidth ?  maxWidth : window.innerWidth);
    setWindowsHeight(window.innerHeight > maxHeight + 200 ? maxHeight : window.innerHeight - 200);
    setBoardWidth(
      props.room?.settings.boardWidth
        ? (props.room?.settings.boardWidth / 100) * windowsWidth
        : 100
    );
    setBoardHeight(
      props.room?.settings.boardHeight
        ? (props.room?.settings.boardHeight / 100) * windowsHeight
        : 100
    );
    setBall({
      ...ball,
      id: "ball",
      radius: props.room?.settings.ballRadius
        ? (props.room?.settings.ballRadius / 100) * windowsHeight
        : 100,
      x: (ball.percentX / 100) * windowsWidth,
      y: (ball.percentY / 100) * windowsHeight,
      percentX: ball.percentX,
      percentY: ball.percentY,
    });
    console.log(
      "width:",
      windowsWidth,
      "height:",
      windowsHeight,
      "ballRadius:",
      ball?.radius
    );
    setPlayerA({
      ...playerA,
      id: "playerA",
      x: (0.01 * windowsWidth),
      y: (playerA.percentY / 100) * windowsHeight,
      percentY: playerA.percentY,
    });
    setPlayerB({
      ...playerB,
      id: "playerB",
      x: (windowsWidth - 0.0175 * windowsWidth),
      y: (playerB.percentY / 100) * windowsHeight,
      percentY: playerB.percentY,
    });
    ball.ref.current?.position({ x: ball.x, y: ball.y });
    playerA.ref.current?.position({ x: playerA.x, y: playerA.y });
    playerB.ref.current?.position({ x: playerB.x, y: playerB.y });
  }
  useEventListener("resize", handleResize);
  // Check car le resize ne met pas a jour les var du useEffect
  props.socket?.removeListener("playerMovement");
  props.socket?.on("playerMovement", (data: any) => {
    //console.log("playerMovement", props.playerId);
    if (data.player && data.x != undefined && data.y != undefined) {
      if (data.player === "playerA") {
        setPlayerA({
          ...playerA,
          id: "playerA",
          x: 0.01 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
          percentY: data.y,
        });
        playerA.ref.current?.position({
          x: 0.01 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
        });
      } else if ((data.player === "playerB")) {
        setPlayerB({
          ...playerB,
          id: "playerB",
          x: windowsWidth - 0.0175 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
          percentY: data.y,
        });
        playerB.ref.current?.position({
          x: windowsWidth - 0.0175 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
        });
      }
    }
  });
  props.socket?.removeListener("ballMovement");
  props.socket?.on("ballMovement", (room: IRoom) => {
    ball.ref.current?.to({
      // Duration 1000 / 60 = 16.666666666666668
      duration: 1 / 240,
      x: (room.ball.x / 100) * windowsWidth,
      y: (room.ball.y / 100) * windowsHeight,
    });
  });
  return (
    <div id="gameMainCanvas">
      <GameBoard socket={props.socket} room={props.room} />
      <div>
        <Stage
          width={windowsWidth}
          height={windowsHeight}
          className="gameMainCanvas"
          pixelRatio={1}
        >
          <Layer listening={false}>
            <Image width={windowsWidth} height={windowsHeight} image={image} x={0} y={0} fill="gray" />

            {
              <Rect
                ref={playerA.ref}
                //x={windowsWidthDefault * 0.15 - boardWidth}
                //y={windowsHeightDefault * 0.5 - boardHeight / 2}
                width={boardWidth}
                height={boardHeight}
                fill="blue"
              />
            }
            {
              <Rect
                //x={windowsWidthDefault * 0.85}
                //y={windowsHeightDefault * 0.5 - boardHeight / 2}
                ref={playerB.ref}
                width={boardWidth}
                height={boardHeight}
                fill="green"
              />
            }
            {
              <Circle
                ref={ball.ref}
                draggable
                radius={ball.radius}
                fill="red"
              />
            }
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default GamePlay;
/**/
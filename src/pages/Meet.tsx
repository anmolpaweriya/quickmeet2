import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

// components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { InfinitySpin } from "react-loader-spinner";

//icons
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { FaCopy } from "react-icons/fa6";
import {
  MdDraw,
  MdMessage,
  MdClose,
  MdSend,
  MdScreenShare,
} from "react-icons/md";
import {
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";
import { Fullscreen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

//types
type userType = {
  [key: string]: {
    id: string;
    name: string;
    stream?: MediaStream;
  };
};
type peerConnectionsType = {
  [key: string]: RTCPeerConnection;
};
type trackSendersType = {
  [key: string]: RTCRtpSender[];
};

type messageType = {
  name: string;
  message: string;
  time: string;
};

type connectionType = "camera" | "screen";

export default function Meet({
  socket,
  room,
}: {
  socket: Socket;
  room: string;
}) {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const peerConnections = useRef<peerConnectionsType>({});
  const trackSenders = useRef<trackSendersType>({});
  const localStream = useRef<MediaStream>();
  const localScreenStream = useRef<MediaStream>();
  const peerScreenShareConnections = useRef<peerConnectionsType>({});
  const isScreenSharing = useRef<boolean>(false);

  const [users, setUsers] = useState<userType>({});
  const [username, setUsername] = useState("");
  const [constraints, setConstraints] = useState({ video: true, audio: false });
  const [screenShare, setScreenShare] = useState(false);
  const [messagesSectionOpen, setMessagesSectionOpen] = useState(false);
  const [messagesList, setMessagesList] = useState<messageType[]>([]);

  const iceServers = [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "2ad699eea1f2f61b1f11958b",
      credential: "5tcqmBTXblTRGu/p",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "2ad699eea1f2f61b1f11958b",
      credential: "5tcqmBTXblTRGu/p",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "2ad699eea1f2f61b1f11958b",
      credential: "5tcqmBTXblTRGu/p",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "2ad699eea1f2f61b1f11958b",
      credential: "5tcqmBTXblTRGu/p",
    },
  ];

  const videoQualities = {
    default: true,

    high: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 15, max: 20 },
    },
    normal: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 25, max: 30 },
    },
    low: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      frameRate: { ideal: 25, max: 30 },
    },
    // lowest: {
    //   width: { ideal: 16 },
    //   height: { ideal: 9 },
    //   frameRate: { ideal: 1, max: 1 },
    // },
  };

  const [selectedQuality, setSelectedQuality] = useState("default");
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenShareDialogOpen, setIsScreenShareDialogOpen] = useState(false);

  // functions
  function joinRoom() {
    if (!usernameInputRef.current) return;
    setUsername(usernameInputRef.current.value);
  }

  function addUser(id: string, name: string) {
    setUsers((pre) => {
      if (pre["main"]?.id == id) return pre;
      return { ...pre, [id]: { id, name } };
    });
  }

  function addStreamToUser(id: string, stream: MediaStream | undefined) {
    setUsers((pre) => {
      if (pre["main"].id == id) {
        pre["main"].stream = stream;
      } else {
        if (pre[id]) pre[id].stream = stream;
      }

      return { ...pre };
    });
  }

  function removeUser(id: string) {
    setUsers((pre) => {
      if (!pre["main"] || pre["main"].id !== id) {
        delete pre[id];
      } else {
        delete pre["main"];
        if (socket.id) {
          const user = pre[socket.id];
          pre["main"] = { ...user };
          delete pre[socket.id];
        }
      }

      return { ...pre };
    });
  }

  function handleNewUser(id: string, name: string) {
    addUser(id, name);
    socket.emit("user-connection-reply", id, username);
    toast(name + " Joined");
  }

  async function handleUserConnectionReply(id: string, name: string) {
    addUser(id, name);
    await createConnection(id);
    await createOffer(id);
  }

  function handleUserDisconnected(id: string) {
    removeUser(id);
    removeUser(`${id}-screen`);
  }

  function getPeerById(id: string, type: connectionType) {
    let peer;
    if (type == "camera") peer = peerConnections.current[id];
    else peer = peerScreenShareConnections.current[id];
    return peer;
  }

  async function createConnection(id: string, type: connectionType = "camera") {
    const peer = new RTCPeerConnection({ iceServers });
    if (type == "camera") {
      peerConnections.current[id]?.close();
      peerConnections.current[id] = peer;
    } else {
      peerScreenShareConnections.current[id]?.close();
      peerScreenShareConnections.current[id] = peer;
    }

    peer.ontrack = (event) => {
      let userId = id;
      if (type == "screen") userId = `${id}-screen`;
      renderStream(userId, event.streams[0]);
      addStreamToUser(userId, event.streams[0]);
    };
    peer.onicecandidate = (event) => {
      if (event.candidate)
        socket.emit("ice-candidate", JSON.stringify(event.candidate), id, type);
    };

    if (type == "camera") addTrackToSinglePeer(id, "camera");

    return peer;
  }

  async function createOffer(id: string, type: connectionType = "camera") {
    const peer = getPeerById(id, type);
    if (!peer) return;
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", JSON.stringify(offer), id, type);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleOffer(offer: string, id: string, type: connectionType) {
    let peer = getPeerById(id, type);
    if (!peer) peer = await createConnection(id, type);

    if (type == "camera" && isScreenSharing.current) startScreenShare();

    await peer.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(offer)),
    );
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("answer", JSON.stringify(answer), id, type);
  }

  function handleAnswer(answer: string, id: string, type: connectionType) {
    const peer = getPeerById(id, type);
    if (!peer) return;
    peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
    console.log("connected");
  }

  async function handleIceCandidate(
    candidate: string,
    id: string,
    type: connectionType,
  ) {
    const peer = getPeerById(id, type);
    if (!peer) return;
    await peer.addIceCandidate(JSON.parse(candidate));
  }

  function renderStream(id: string, stream: MediaStream | undefined) {
    document.querySelector(`#id-${id} video`)?.remove();
    if (!stream) return;
    const video = document.createElement("video");
    if (socket.id == id) video.muted = true;
    // video.controls = false
    video.onloadedmetadata = () => video.play();
    video.srcObject = stream;

    document.getElementById(`id-${id}`)?.appendChild(video);
  }

  function setMainStream(id: string) {
    setUsers((pre) => {
      if (pre["main"].id == id) return pre;
      const user = pre["main"];
      pre[user.id] = { ...user };
      pre["main"] = { ...pre[id] };
      delete pre[id];
      return { ...pre };
    });
  }

  async function startVideo() {
    localStream.current?.getTracks().forEach(function (track) {
      track.stop();
    });

    if (!constraints.video && !constraints.audio) {
      localStream.current = undefined;
      socket.emit("stream-stopped", room);
    } else
      localStream.current =
        await navigator.mediaDevices.getUserMedia(constraints);

    if (socket.id) addStreamToUser(socket.id, localStream.current);

    addTrackToAllPeers();
  }

  function addTrackToAllPeers() {
    Object.keys(peerConnections.current)?.forEach(async (id: string) => {
      await addTrackToSinglePeer(id, "camera");
    });
  }
  async function addTrackToSinglePeer(
    id: string,
    type: connectionType = "camera",
  ) {
    const peer = getPeerById(id, type);

    let userId = id;
    if (type == "screen") userId = `${id}-screen`;

    trackSenders.current[userId]?.forEach((sender) => {
      peer.removeTrack(sender);
    });
    trackSenders.current[userId] = [];

    let stream = localStream.current;
    if (type == "screen") stream = localScreenStream.current;
    stream?.getTracks().forEach((track) => {
      try {
        const sender = peer.addTrack(track, stream);
        trackSenders.current[userId].push(sender);
      } catch (err) {
        console.log(err);
      }
    });
  }
  function toggleVideo() {
    setConstraints((pre) => ({ ...pre, video: !pre.video }));
  }

  function toggleAudio() {
    setConstraints((pre) => ({ ...pre, audio: !pre.audio }));
  }

  function copyMeetLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Meeting Link Copied");
  }

  async function resendOffer() {
    await startVideo();
    Object.keys(peerConnections.current).forEach(async (id: string) => {
      await createOffer(id);
    });
  }

  function sendMessage() {
    if (!messageInputRef.current) return;
    if (socket.id)
      handleReceivedMessage(messageInputRef.current.value, username + " (You)");
    socket.emit("send-message", messageInputRef.current.value, room, username);
    messageInputRef.current.value = "";
  }

  function handleReceivedMessage(message: string, name: string) {
    const time = new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setMessagesList((pre) => [
      ...pre,
      {
        message,
        name,
        time,
      },
    ]);
  }

  // screen share functions
  async function toggleScreenShare() {
    isScreenSharing.current = !isScreenSharing.current;

    startScreenShare();

    setScreenShare(isScreenSharing.current);
  }

  async function startScreenShare() {
    if (!socket.id) return;
    const id = `${socket.id}-screen`;

    if (!isScreenSharing.current) {
      localScreenStream.current?.getTracks().forEach(function (track) {
        track.stop();
      });
      localScreenStream.current = undefined;
      socket.emit("screen-share-stopped", room);
      removeUser(id);
    } else {
      try {
        if (!localScreenStream.current) {
          localScreenStream.current =
            await navigator.mediaDevices.getDisplayMedia({
              video:
                videoQualities[selectedQuality as keyof typeof videoQualities],
              audio: isVideoMuted,
            });
          localScreenStream.current
            .getVideoTracks()[0]
            .addEventListener("ended", () => {
              toggleScreenShare();
            });
        }
        addUser(id, `${username}(Screen)`);
        socket.emit("screen-share-started", room, username);
      } catch (err: any) {
        console.error("anisole", err);
        isScreenSharing.current = false;
        setScreenShare(isScreenSharing.current);
      }
    }

    addStreamToUser(id, localScreenStream.current);
    addScreenTrackToPeers();
    setIsScreenShareDialogOpen(false);
  }

  async function addScreenTrackToPeers() {
    Object.keys(peerConnections.current).forEach(async (id: string) => {
      if (!peerScreenShareConnections.current[id])
        await createConnection(id, "screen");
    });

    Object.keys(peerScreenShareConnections.current).forEach(
      async (id: string) => {
        await addTrackToSinglePeer(id, "screen");
        await createOffer(id, "screen");
      },
    );
  }
  async function handleScreenShareStart(id: string, name: string) {
    addUser(`${id}-screen`, `${name}(Screen)`);
  }
  async function handleScreenShareStopped(id: string) {
    removeUser(`${id}-screen`);
  }

  /* View in fullscreen */
  function openFullscreen(elem: Element) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function toggleFullscreen() {
    const elem = document.getElementById(`id-${users["main"]?.id}`);
    if (!elem) return;
    elem.classList.toggle("fullScreenVideo");
    if (elem.classList.contains("fullScreenVideo")) {
      openFullscreen(elem);
    } else closeFullscreen();
  }

  // use effects
  useEffect(() => {
    if (username.length == 0) {
      usernameInputRef.current?.focus();
      return;
    }
    if (socket.connected) return;

    socket.on("connect", () => {
      socket.emit("join-room", room, username);
      setUsers({ main: { id: socket.id!, name: username } });
      if (socket.id) addStreamToUser(socket.id, localStream.current);

      // listeners
      socket.on("new-user", handleNewUser);
      socket.on("user-connection-reply", handleUserConnectionReply);
      socket.on("user-disconnected", handleUserDisconnected);
      socket.on("offer", handleOffer);
      socket.on("answer", handleAnswer);
      socket.on("ice-candidate", handleIceCandidate);
      socket.on("stream-stopped", (id) => addStreamToUser(id, undefined));
      socket.on("screen-share-started", handleScreenShareStart);
      socket.on("screen-share-stopped", handleScreenShareStopped);
      socket.on("receive-message", (message: string, name: string) => {
        setMessagesSectionOpen((pre) => {
          if (!pre) toast("Received message from " + name);
          return pre;
        });
        handleReceivedMessage(message, name);
      });
    });

    socket.connect();
  }, [username]);

  useEffect(() => {
    Object.values(users).forEach((user) => {
      renderStream(user.id, user.stream);
    });
  }, [users]);

  useEffect(() => {
    resendOffer();
  }, [constraints]);

  // jsx return
  if (username.length === 0)
    return (
      <div className="h-svh flex justify-center items-center">
        <Card className="min-w-[350px]">
          <CardHeader>
            <CardTitle className="text-3xl">Join Room</CardTitle>
            <CardDescription>
              Enter your name before joining the room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                joinRoom();
              }}
              className="grid gap-3"
            >
              <Input placeholder="Enter Name" ref={usernameInputRef} />
              <Button onClick={joinRoom}>Join</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <>
      {!socket.connected && (
        <div className="w-full h-full absolute top-0 left-0 z-20 bg-[#181818] flex justify-center items-center  ">
          <InfinitySpin color="#fff" />
        </div>
      )}
      <Dialog
        open={isScreenShareDialogOpen}
        onOpenChange={setIsScreenShareDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">
              Start Sharing Screen
            </DialogTitle>
            <DialogDescription>
              Select video quality for your screen share and also other
              additional setting
            </DialogDescription>
          </DialogHeader>
          <div className=" grid gap-4">
            <div className="w-full flex justify-between items-center">
              <p className="text-black font-semibold">Video</p>
              <Select
                value={selectedQuality}
                onValueChange={(val) => setSelectedQuality(val)}
              >
                <SelectTrigger className="w-[180px] text-black">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(videoQualities).map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full flex justify-between items-center">
              <p className="text-black font-semibold">Audio</p>
              <Switch
                checked={isVideoMuted}
                onCheckedChange={(val) => setIsVideoMuted(val)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsScreenShareDialogOpen(false)}
              variant={"destructive"}
            >
              Close
            </Button>
            <Button onClick={toggleScreenShare}>Start Sharing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="w-full h-dvh box-border flex transition-all max-sm:flex-col">
        <section className="h-full w-full box-border p-4">
          <div className="w-full h-full grid grid-rows-[auto_75px]">
            <div
              className="bg-[#333] rounded-lg overflow-hidden w-full h-full relative"
              id={`id-${users["main"]?.id}`}
            >
              <p className="absolute bottom-2 left-2 text-3xl">
                {users["main"]?.name}
                {users["main"]?.id == socket.id ? " (You)" : ""}
              </p>
              <button
                className=" absolute top-4 right-4 z-10 scale-125"
                onClick={toggleFullscreen}
              >
                <Fullscreen />
              </button>
            </div>
            <div className="w-full h-full flex justify-center items-center gap-5 max-sm:gap-3">
              <button
                className={
                  "rounded-full w-[50px] h-[50px] flex justify-center items-center text-xl active:scale-95 transition-all max-sm:hidden " +
                  (screenShare ? "bg-blue-400 text-black" : "bg-[#444]")
                }
                onClick={() => {
                  if (screenShare) toggleScreenShare();
                  else setIsScreenShareDialogOpen(true);
                }}
              >
                <MdScreenShare />
              </button>

              <button
                className={
                  "rounded-full w-[50px] h-[50px] flex justify-center items-center text-xl active:scale-95 transition-all " +
                  (constraints.video ? "bg-blue-400 text-black" : "bg-[#444]")
                }
                onClick={toggleVideo}
              >
                {constraints.video ? (
                  <BsFillCameraVideoFill />
                ) : (
                  <BsFillCameraVideoOffFill />
                )}
              </button>
              <button
                className={
                  "rounded-full w-[50px] h-[50px] flex justify-center items-center text-xl  active:scale-95 transition-all " +
                  (constraints.audio ? "bg-blue-400 text-black" : "bg-[#444]")
                }
                onClick={toggleAudio}
              >
                {constraints.audio ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              <a
                href="/draw/index.html"
                target="_blank"
                className="rounded-full w-[50px] h-[50px] bg-[#444] flex justify-center items-center text-xl  active:scale-95 transition-all"
              >
                <MdDraw />
              </a>
              <button
                onClick={() => setMessagesSectionOpen((pre) => !pre)}
                className={
                  "rounded-full w-[50px] h-[50px] flex justify-center items-center text-xl active:scale-95 transition-all " +
                  (messagesSectionOpen ? "bg-blue-400 text-black" : "bg-[#444]")
                }
              >
                <MdMessage />
              </button>
              <button
                onClick={copyMeetLink}
                className="rounded-full w-[50px] h-[50px] bg-[#444] flex justify-center items-center text-xl active:scale-95 transition-all"
              >
                <FaCopy />
              </button>
              <a
                href="/"
                className="rounded-full w-[50px] h-[50px] bg-red-500 flex justify-center items-center text-xl  active:scale-95 transition-all"
              >
                <IoCall />
              </a>
            </div>
          </div>
        </section>
        <section
          className={
            " h-full transition-all overflow-x-hidden overflow-y-scroll box-border  flex flex-col gap-3  max-sm:flex-row max-sm:overflow-x-scroll py-5  max-sm:py-0" +
            (Object.keys(users).length > 1
              ? " w-[300px] max-sm:w-full max-sm:h-[150px] px-2 "
              : " w-0 max-sm:h-0 ")
          }
          id="usersParentSection"
        >
          {Object.keys(users).map((key) => {
            const user = users[key];
            if (key == "main") return;

            return (
              <div
                className="flex-none sm:w-full box-border rounded-md bg-[#333] h-[100px] relative hover:scale-95 transition-all max-sm:h-full max-sm:w-[200px]"
                key={user.id}
                id={`id-${user.id}`}
                onClick={() => setMainStream(user.id)}
              >
                <p className="absolute bottom-2 left-2 text-lg">
                  {user.name}
                  {user.id == socket.id ? " (You)" : ""}
                </p>
              </div>
            );
          })}
        </section>

        <section
          className={
            "absolute right-0 h-full top-0 bg-[#fff] backdrop-blur-xl sm:rounded-l-xl  grid grid-rows-[50px_auto_75px] transition-all overflow-hidden z-20 " +
            (messagesSectionOpen ? "w-[400px] max-sm:w-full " : "w-0")
          }
        >
          <div className="h-full w-full flex justify-end ">
            <button
              onClick={() => setMessagesSectionOpen(false)}
              className="mr-5 text-2xl active:scale-90 text-black"
            >
              <MdClose />
            </button>
          </div>
          <ul className="w-full h-full flex flex-col gap-2">
            {messagesList.map((message, index) => {
              return (
                <li
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      {message.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {message.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {message.message}
                  </p>
                </li>
              );
            })}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="w-full h-full flex justify-center items-center box-border px-3 "
          >
            <Input
              placeholder="type message ..."
              ref={messageInputRef}
              className="bg-white text-black"
            />
            <Button type="submit">
              <MdSend />
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}

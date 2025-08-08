// components
import Room from "./pages/Room";
import Meet from "./pages/Meet";
import { io } from "socket.io-client";
import { ToastContainer } from "react-toastify";

function App() {
  // const api = "http://localhost:8000";
  // const api = "https://quickmeet.ddns.net";
  const api = "https://quickmeet2-backend.onrender.com";
  // const api = "https://quickmeet.publicvm.com"
  const socket = io(api, {
    autoConnect: false,
    transports: ["websocket", "polling"],
  });
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get("room")?.toString();

  return (
    <>
      <ToastContainer
        pauseOnFocusLoss={false}
        position="bottom-right"
        theme="dark"
      />

      {room?.length ? <Meet socket={socket} room={room} /> : <Room />}
    </>
  );
}

export default App;

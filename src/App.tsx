
// components
import Room from './pages/Room'
import Meet from './pages/Meet'
import { io } from "socket.io-client"
import { ToastContainer } from "react-toastify"



function App() {
  // const api = "http://localhost:8000"
  // const api = "https://webrtc-conference.glitch.me"
  const api = "https://quickmeet.work.gd"
  const socket = io(api, { autoConnect: false })
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get('room')?.toString();



  return (
    <>
      <ToastContainer
        pauseOnFocusLoss={false}
        position="bottom-right"
        theme="dark"
      />

      {room?.length ?
        <Meet
          socket={socket}
          room={room}
        />
        :
        <Room />
      }
      {/* <BrowserRouter>
        <Routes>
          <Route index element={<Room />} />
          <Route path='/:room' element={<Meet socket={socket} />} />
        </Routes>
      </BrowserRouter> */}

    </>
  )
}

export default App

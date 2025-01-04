import { useState } from "react";
import { v4 } from "uuid";

// components
import { toast } from 'react-toastify';


export default function Room() {

    const [roomId, setRoomId] = useState("")



    async function joinRoom(e: any) {
        e.preventDefault();
        if (roomId.length == 0) {
            toast.error("Must provide room id")
            return
        }
        window.location.href = window.location.origin + `?room=${roomId}`
    }
    async function createRoom(e: any) {
        e.preventDefault();
        const uid = v4()
        toast.success("Room Created Successfully")

        setTimeout(() => {
            window.location.href = window.location.origin + `?room=${uid}`
        }, 500);
    }




    return (
        <>

            <div
                className='w-full h-full flex items-center flex-col'
            >

                <h1
                    className='my-10 text-white font-cinzel text-7xl max-sm:text-5xl'
                ><span className='text-blue-300'>
                        Q
                    </span>
                    uick
                    <span className='ml-6 text-blue-300'>M</span>
                    eets</h1>
                <form className='relative z-10 glassy p-5 bg-blue-300 mt-10 flex flex-col gap-5 font-bold text-white'>

                    <input
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        placeholder='Room Id'
                        className='outline-none bg-transparent border-b-2 p-2  font-medium text-black placeholder:text-white mb-5'
                        spellCheck={false}
                    />

                    <button
                        onClick={joinRoom}
                        className='text-black bg-white rounded-lg p-2 flex justify-center items-center'
                    >
                        Join
                    </button>


                    <h1
                        className='grid items-center grid-cols-[auto_3em_auto]'
                    >
                        <span className='w-full bg-white h-1 rounded-lg'></span>
                        <span className='text-center  '>OR</span>
                        <span className='w-full bg-white h-1 rounded-lg'></span>
                    </h1>
                    <button
                        onClick={createRoom}
                        className='text-black bg-white rounded-lg p-2 flex justify-center gap-2 items-center'
                    >
                        Create
                    </button>




                </form>






            </div >


            < div className="fixed bottom-0 w-full flex items-center justify-center" >

                <svg id="visual" viewBox="0 0 960 540" >
                    <path fill="#5bb6ff">
                        <animate
                            attributeName="d"
                            values="M0 442L17.8 447.5C35.7 453 71.3 464 106.8 464.5C142.3 465 177.7 455 213.2 457.8C248.7 460.7 284.3 476.3 320 473.8C355.7 471.3 391.3 450.7 426.8 450C462.3 449.3 497.7 468.7 533.2 471C568.7 473.3 604.3 458.7 640 459.3C675.7 460 711.3 476 746.8 475.7C782.3 475.3 817.7 458.7 853.2 447.7C888.7 436.7 924.3 431.3 942.2 428.7L960 426L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;


M0 420L17.8 423.3C35.7 426.7 71.3 433.3 106.8 435.7C142.3 438 177.7 436 213.2 438.5C248.7 441 284.3 448 320 456.7C355.7 465.3 391.3 475.7 426.8 481.8C462.3 488 497.7 490 533.2 490.5C568.7 491 604.3 490 640 479.7C675.7 469.3 711.3 449.7 746.8 443.3C782.3 437 817.7 444 853.2 443C888.7 442 924.3 433 942.2 428.5L960 424L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;



M0 442L17.8 447.5C35.7 453 71.3 464 106.8 464.5C142.3 465 177.7 455 213.2 457.8C248.7 460.7 284.3 476.3 320 473.8C355.7 471.3 391.3 450.7 426.8 450C462.3 449.3 497.7 468.7 533.2 471C568.7 473.3 604.3 458.7 640 459.3C675.7 460 711.3 476 746.8 475.7C782.3 475.3 817.7 458.7 853.2 447.7C888.7 436.7 924.3 431.3 942.2 428.7L960 426L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;

"

                            dur="3s" repeatCount="indefinite"

                        />

                    </path>
                </svg>

                {/* backgroud glow */}

                <svg
                    className='absolute top-0 blur-2xl'
                    viewBox="0 0 960 540" >
                    <path fill="#5bb6ff">
                        <animate
                            attributeName="d"
                            values="M0 442L17.8 447.5C35.7 453 71.3 464 106.8 464.5C142.3 465 177.7 455 213.2 457.8C248.7 460.7 284.3 476.3 320 473.8C355.7 471.3 391.3 450.7 426.8 450C462.3 449.3 497.7 468.7 533.2 471C568.7 473.3 604.3 458.7 640 459.3C675.7 460 711.3 476 746.8 475.7C782.3 475.3 817.7 458.7 853.2 447.7C888.7 436.7 924.3 431.3 942.2 428.7L960 426L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;


M0 420L17.8 423.3C35.7 426.7 71.3 433.3 106.8 435.7C142.3 438 177.7 436 213.2 438.5C248.7 441 284.3 448 320 456.7C355.7 465.3 391.3 475.7 426.8 481.8C462.3 488 497.7 490 533.2 490.5C568.7 491 604.3 490 640 479.7C675.7 469.3 711.3 449.7 746.8 443.3C782.3 437 817.7 444 853.2 443C888.7 442 924.3 433 942.2 428.5L960 424L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;



M0 442L17.8 447.5C35.7 453 71.3 464 106.8 464.5C142.3 465 177.7 455 213.2 457.8C248.7 460.7 284.3 476.3 320 473.8C355.7 471.3 391.3 450.7 426.8 450C462.3 449.3 497.7 468.7 533.2 471C568.7 473.3 604.3 458.7 640 459.3C675.7 460 711.3 476 746.8 475.7C782.3 475.3 817.7 458.7 853.2 447.7C888.7 436.7 924.3 431.3 942.2 428.7L960 426L960 541L942.2 541C924.3 541 888.7 541 853.2 541C817.7 541 782.3 541 746.8 541C711.3 541 675.7 541 640 541C604.3 541 568.7 541 533.2 541C497.7 541 462.3 541 426.8 541C391.3 541 355.7 541 320 541C284.3 541 248.7 541 213.2 541C177.7 541 142.3 541 106.8 541C71.3 541 35.7 541 17.8 541L0 541Z;

"

                            dur="3s" repeatCount="indefinite"

                        />

                    </path>
                </svg>
            </ div >
        </>
    )
}

import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance()
{
  const { chainId:chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const [entranceFee, setEntranceFee] = useState("0")
  const [numPlayers, setNumPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")


  const dispatch = useNotification()

  const { runContractFunction: enterRaffle, isFetching, isLoading } = useWeb3Contract(
    {
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "enterRaffle",
      params: {},
      msgValue: entranceFee
    }
  )
  
  const { runContractFunction: getEntranceFee } = useWeb3Contract(
    {
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "getEntranceFee",
      params: {},
    }
  )

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract(
    {
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "getNumberOfPlayers",
      params: {},
    }
  )

  const { runContractFunction: getRecentWinner } = useWeb3Contract(
    {
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "getRecentWinner",
      params: {},
    }
  )

  async function updateUI()
  {
    const raffleEntranceFee = (await getEntranceFee()).toString()
    const raffleNumPlayers = (await getNumberOfPlayers()).toString()
    const raffleRecentWinner = (await getRecentWinner())

    setEntranceFee(raffleEntranceFee)
    setNumPlayers(raffleNumPlayers)
    setRecentWinner(raffleRecentWinner)
  }

  useEffect(()=>
  {
    if(isWeb3Enabled)
    {
      updateUI()
    }
  }, [isWeb3Enabled])

  async function handleSuccess(tx)
  {
    const txReceipt = await tx.wait(1)
    handleNewNotification(tx)
    updateUI()
    // await new Promise(async (resolve, reject) =>
    // {
    //   txReceipt.once("Winner Picked")
    //   {
    //     updateUI()
    //     resolve()
    //   }
    // })
  }

  const handleNewNotification = function (tx) 
  {
    dispatch(
      {
        type: "info",
        message: "Transaction Complete",
        title: "Tx Notification",
        position: "topR",
        icon: "bell"
      }
    )
  }

  return(
    <div className="p-5">
      <h1>Hi! from Lottery Entrance</h1>
      {raffleAddress ? (
        <div> 
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto" 
            onClick={async function()
            {
              await enterRaffle(
                {
                  onSuccess: handleSuccess,
                  onError: (error) => {console.log(error)}
                })
            }} disabled={isLoading || isFetching}>Enter Raffle
          </button>
          <p>Entrance Fee is: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
          <p>Number Of Players: {numPlayers} </p>
          <h4>Recent Winner: {recentWinner} </h4>
        </div>) : 
        (
          <div>
            <p>No Raffle Contract detected</p>
            <p>Whats Up!!</p>
          </div>
        )
      }
    </div>
  )
}
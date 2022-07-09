import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader()
{
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis()
  // enableWeb3 connects us to mmw, 'account' is the address of the connected EOA
  useEffect(()=>
  {
    if(isWeb3Enabled){return}
    if(typeof window !== "undefined")
    {
      if(window.localStorage.getItem("connected")) // so it connects by itself on page load
      {
        enableWeb3() 
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled])

  useEffect(()=>
  {
    Moralis.onAccountChanged((account)=>
    {
      console.log(`Account changed to ${account}`)
      if (account == null)
      {
        window.localStorage.removeItem("connected")
        deactivateWeb3()
        console.log("null account found")
      }
    })
  }, [])

  return (
    <div>
      {account ? (<div>Connected to {account.slice(0,6)+"..."+account.slice(account.length-4, account.length)} </div>) : 
        (<button onClick={async ()=>
        {
          await enableWeb3()
          if(typeof window !== "undefined") // do this because nextjs may not recognize window
          {
            window.localStorage.setItem("connected", "injected") // cookie storage to save login to memory
            // ends up being stored as 'connected: injected'
          }
        }} disabled={isWeb3EnableLoading}>Connect</button>)}
    </div>
  )
}
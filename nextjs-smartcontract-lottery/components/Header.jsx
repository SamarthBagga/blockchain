import { useEffect } from "react"
import { useMoralis } from "react-moralis"

export default function Header() {
    const { enableWeb3, account, isWeb3Enabled, Moralis } = useMoralis()

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changes to ${account}`)
            if (account == null) {
                window.localStorage.getItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])
    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

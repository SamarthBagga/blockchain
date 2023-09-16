import { ConnectButton } from "web3uikit"

export default function NewHeader() {
    return (
        <div className="border-b-2 p-5 flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl">Dececntralized Lottery</h1>
            <div className="ml-auto py-2 px-2">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}

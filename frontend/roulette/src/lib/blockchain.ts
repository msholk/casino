import { ethers } from "ethers"
import { diamondAddress } from "../contracts/address"
import playerFacet from "../contracts/PlayersFacet.json"
import rouletteFacet from "../contracts/RouletteFacet.json"
import chalk from "chalk"

// deposit funds to cashier
export async function playerDeposit(quantity: number) {
    if (quantity < 0) {
        console.log('playerDeposit: quantity input is less than 0')
        return
    }
    try {
        if (window.ethereum) {

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const playerContract = new ethers.Contract(
                diamondAddress,
                playerFacet.abi,
                signer
            )

            const txn = await playerContract.depositToCashier({
                value: ethers.utils.parseEther(String(quantity)),
                gasLimit: 5000000,
            })

            console.log("Depositing money...")
            await txn.wait()
            console.log("Deposited money...done", txn.hash)

        } else {
            console.log("Ethereum object not found, install Metamask.")
        }
    } catch (error) {
        console.error("playerDeposit: " || error)
    }
}


// withdraw funds from cashier
export async function playerWithdraw(quantity: number) {
    if (quantity < 0) {
        console.log('playerDeposit: quantity input is less than 0')
        return
    }
    try {
        if (window.ethereum) {

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const playerContract = new ethers.Contract(
                diamondAddress,
                playerFacet.abi,
                signer
            )

            const txn = await playerContract.withdrawPlayerBalanceAmount(
                ethers.utils.parseEther(String(quantity)),
                { gasLimit: 5000000, })

            console.log("Withdrawing money...")
            await txn.wait()
            console.log("Withdrawing money...done", txn.hash)

        } else {
            console.log("Ethereum object not found, install Metamask.")
        }
    } catch (error) {
        console.error(error)
    }
}


export async function getPlayerBalance(): Promise<number> {
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const playerContract = new ethers.Contract(
                diamondAddress,
                playerFacet.abi,
                signer)

            let balance = await playerContract.checkPlayerBalance()
            console.log("Retrieved player balance...", balance)

            return balance

        } else {
            console.log("Ethereum object not found, install Metamask.")
        }
    } catch (error) {
        console.log(error)
    }

    return -1
}

const isUniqueEvents = (ev: ethers.Event) => {
    if(!window.uniqueEvents) window.uniqueEvents = {}

    const key = `${ev.transactionHash}-${ev.logIndex}`;
    if (window.uniqueEvents?.[key]) {
        return false;
    }

    window.uniqueEvents[key] = true
    return true;
};

const listenToRouletteLaunched = async (customerAddress: string) => {
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const rouletteContract = new ethers.Contract(
                diamondAddress,
                rouletteFacet.abi,
                signer
            );
            rouletteContract.removeAllListeners();

            let filterTo = rouletteContract.filters.RouletteLaunched(customerAddress);
            rouletteContract.once(filterTo, (sender: ethers.BigNumber, requestId: ethers.BigNumber, ev: ethers.Event) => {
                if (!isUniqueEvents(ev)) return
                const red = (m: string) => {
                    console.log(chalk.red(m));
                };

                red(
                    `event RouletteLaunched(
               sender :${sender.toString()},
            requestId :${requestId.toString()}
            )`
                );

                listenToRouletteStopped(customerAddress, requestId);
            });

        } else {
            console.log("Ethereum object not found, install Metamask.");
        }
    } catch (error: any) {
        let message = error.message.data || error.reason
        if (message) {
            console.error(message);
        }
        console.log(error);
    }
};

/*
listenToRouletteStopped(customerAddress,requestId,state)
*/
const listenToRouletteStopped = async (customerAddress: string, requestId: ethers.BigNumber) => {
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const rouletteContract = new ethers.Contract(
                diamondAddress,
                rouletteFacet.abi,
                signer
            );
            rouletteContract.removeAllListeners();

            let filterTo = rouletteContract.filters.RouletteStopped(
                customerAddress,
                requestId
            );

            //  event RouletteStopped(address indexed sender,uint256 indexed requestId,uint256 randomWord,uint256 resultNum);
            rouletteContract.once(
                filterTo,
                (sender, requestId, randomWord, resultNum, ev) => {
                    if (!isUniqueEvents(ev)) return;

                    const red = (m: string) => {
                        console.log(chalk.red(m));
                    };

                    red(
                        `event RouletteStopped(
                 sender :${sender.toString()},
              requestId :${requestId.toString()},
              randomWord:${randomWord.toString()},
              resultNum :${resultNum.toString()},
              )`
                    );
                    console.log(ev);
                }
            );
        } else {
            console.log("Ethereum object not found, install Metamask.");
        }
    } catch (error: any) {
        let message = error.data.message || error.reason
        if (message) {
            console.error(message);
        }
        console.log(error);
    }
};


export const placeBet = async (bets: Array<any>) => {
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let customerAddress = await signer.getAddress()
            const rouletteContract = new ethers.Contract(
                diamondAddress,
                rouletteFacet.abi,
                signer
            );
            await rouletteContract.placeBet(
                bets,
                0
            );
            listenToRouletteLaunched(customerAddress);
            console.log("Bet is placed");
        } else {
            console.log("Ethereum object not found, install Metamask.");
        }
    } catch (error: any) {
        let message = error.data.message || error.reason;
        if (message) {
            console.error(message);
        }
        console.log(error);
    }
};

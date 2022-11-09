import Image from "next/image"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "@rainbow-me/rainbowkit"
//https://cdn.discordapp.com/attachments/960590776570626098/1039674954213490828/martix.gif
export default function Welcome() {
    return (
        <div>
            <div className="grid items-center justify-items-center bg-no-repeat bg-cover bg-black bg-[url('https://cdn.discordapp.com/attachments/960590776570626098/1039674954213490828/martix.gif')] relative">
                <div className="mt-8 grid items-center justify-items-center text-center opacity-100 ">
                    <div className="flex items-center">
                        <img src="/logo.png" width="100px" height="100px" />
                        <h1 className="font-ams  lg:text-6xl md:text-3xl sm:text-2xl font-bold text-pintk">
                            House
                            <br />
                        </h1>
                        <h1 className="font-ams lg:text-4xl md:text-3xl sm:text-2xl font-bold text-white"></h1>
                        <h1 className="font-ams  lg:text-6xl md:text-3xl sm:text-2xl font-bold text-houseblue">
                            Matrix
                            <br />
                        </h1>
                    </div>

                    <h1 className="font-ams lg:text-4xl md:text-3xl sm:text-2xl font-bold text-slate-300">
                        The Decentralized Casino
                    </h1>
                    <h1 className="font-ams lg:text-4xl  font-bold text-slate-300">
                        Bet with BTC, ETH, and ,Stablecoins directly from your wallet
                    </h1>
                    <p className="my-5 text-slate-200 text-sm sm:text-xs w-[50vw] lg:w-11/12"></p>

                    <button className={styles.button55}>
                        <div className="text-4xl font-ams font-normal hover:font-bold">
                            Play Roulette
                        </div>
                    </button>

                    <p className="my-5 text-slate-200 text-sm sm:text-xs w-[50vw] lg:w-11/12"></p>
                </div>
            </div>
            <div className="bg-black grid items-center justify-items-center bg-no-repeat bg-cover relative">
                <div className=" mt-8 mb-8 flex items-center justify-center">
                    <div className="text-center lg:grid lg:grid-cols-3 lg:gap-40 ">
                        <div className="">
                            <div>
                                <svg
                                    width="128px"
                                    height="128px"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 32 32"
                                    strokeWidth="1.5"
                                    stroke="rgb(255,255,255)"
                                    className="w-6 h-6"
                                >
                                    <path d="M26 29.36H6v-.72h6.659a3.365 3.365 0 0 1 2.981-2.98V11.333c-1.131-.174-2-1.154-2-2.333s.869-2.159 2-2.333V3.36H6.136l4.173 6.955c.034.056.051.12.051.185 0 2.68-2.18 4.86-4.86 4.86S.64 13.18.64 10.5c0-.065.018-.129.051-.185l4.5-7.5A.362.362 0 0 1 5.5 2.64h21c.126 0 .243.066.309.175l4.5 7.5c.033.056.052.12.052.185 0 2.68-2.181 4.86-4.86 4.86s-4.86-2.18-4.86-4.86c0-.065.019-.129.052-.185l4.173-6.955H16.36v3.308c1.131.174 2 1.154 2 2.333s-.869 2.159-2 2.333v14.327a3.365 3.365 0 0 1 2.981 2.98H26v.719zm-12.616-.72h5.231A2.643 2.643 0 0 0 16 26.36a2.646 2.646 0 0 0-2.616 2.28zm8.992-17.78c.183 2.115 1.963 3.78 4.124 3.78s3.941-1.665 4.124-3.78h-8.248zm-21.001 0c.183 2.115 1.963 3.78 4.125 3.78s3.941-1.665 4.125-3.78h-8.25zM16 7.36c-.904 0-1.64.736-1.64 1.64s.736 1.64 1.64 1.64c.904 0 1.64-.736 1.64-1.64S16.904 7.36 16 7.36zm6.636 2.78h7.729L26.5 3.7l-3.864 6.44zm-21 0h7.729L5.5 3.7l-3.864 6.44z" />
                                </svg>

                                <div className="text-pintk font-Prompt font-bold text-xl">
                                    Provably Fair
                                </div>
                            </div>
                            <div className="text-white mt-4 font-bold font-Prompt">
                                Chainlink Verifiable Randomness
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                Function (VRF) assures users that all
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                casino game-play is provably fair
                            </div>
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                            <svg
                                width="128px"
                                height="128px"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="rgb(255,255,255)"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                />
                            </svg>
                            <div className="text-pintk font-Prompt font-bold text-xl">On-Chain</div>
                            <div className="text-white mt-4 font-Prompt font-bold">
                                Hybrid Smart-Contracts allow for a
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                trust minimized, hyper-automated
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                gaming experience
                            </div>
                        </div>
                        <div className="">
                            <svg
                                width="128px"
                                height="128px"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="rgb(255,255,255)"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-pintk font-Prompt font-bold text-xl">Rewards</div>
                            <div className="text-white mt-4 font-Prompt font-bold">
                                Provably Fair
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                Earn boosted winnings when locking
                            </div>
                            <div className="text-white font-Prompt font-bold">veHMX</div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="grid items-center justify-items-center bg-no-repeat bg-cover bg-black bg-[url('https://cdn.discordapp.com/attachments/960590776570626098/1039674954213490828/martix.gif')] relative">
                    <div className="mt-8 flex items-center">
                        <h1 className=" font-ams lg:text-4xl md:text-3xl sm:text-lg font-bold text-pintk">
                            Decentralized
                        </h1>

                        <h1 className="font-ams  lg:text-4xl md:text-3xl sm:text-lg font-bold text-houseblue">
                            Casino
                        </h1>
                        <h1 className="font-ams  lg:text-4xl md:text-3xl sm:text-lg font-bold text-white">
                            and
                        </h1>
                        <h1 className="font-ams  lg:text-4xl md:text-3xl sm:text-lg font-bold text-houseblue">
                            Sportsbook
                        </h1>
                    </div>

                    <h1 className="mb-8 font-ams text-center lg:text-4xl md:text-3xl sm:text-lg font-bold text-slate-300">
                        Enter the Matrix and enjoy a seamless On-Chain gaming experience
                    </h1>
                </div>
            </div>
            <div className="bg-black">
                <div className=" flex items-center justify-center">
                    <div className="mt-8 mb-8 lg:grid lg:grid-cols-4 lg:gap-40 items-center justify-center">
                        <div className="text-center">
                            <div>
                                <svg
                                    width="32px"
                                    height="32px"
                                    fill="rgb(255,255,255)"
                                    viewBox="-8 0 512 512"
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="rgb(255,255,255)"
                                >
                                    <path d="M481.5 60.3c-4.8-18.2-19.1-32.5-37.3-37.4C420.3 16.5 383 8.9 339.4 8L496 164.8c-.8-43.5-8.2-80.6-14.5-104.5zm-467 391.4c4.8 18.2 19.1 32.5 37.3 37.4 23.9 6.4 61.2 14 104.8 14.9L0 347.2c.8 43.5 8.2 80.6 14.5 104.5zM4.2 283.4L220.4 500c132.5-19.4 248.8-118.7 271.5-271.4L275.6 12C143.1 31.4 26.8 130.7 4.2 283.4zm317.3-123.6c3.1-3.1 8.2-3.1 11.3 0l11.3 11.3c3.1 3.1 3.1 8.2 0 11.3l-28.3 28.3 28.3 28.3c3.1 3.1 3.1 8.2 0 11.3l-11.3 11.3c-3.1 3.1-8.2 3.1-11.3 0l-28.3-28.3-22.6 22.7 28.3 28.3c3.1 3.1 3.1 8.2 0 11.3l-11.3 11.3c-3.1 3.1-8.2 3.1-11.3 0L248 278.6l-22.6 22.6 28.3 28.3c3.1 3.1 3.1 8.2 0 11.3l-11.3 11.3c-3.1 3.1-8.2 3.1-11.3 0l-28.3-28.3-28.3 28.3c-3.1 3.1-8.2 3.1-11.3 0l-11.3-11.3c-3.1-3.1-3.1-8.2 0-11.3l28.3-28.3-28.3-28.2c-3.1-3.1-3.1-8.2 0-11.3l11.3-11.3c3.1-3.1 8.2-3.1 11.3 0l28.3 28.3 22.6-22.6-28.3-28.3c-3.1-3.1-3.1-8.2 0-11.3l11.3-11.3c3.1-3.1 8.2-3.1 11.3 0l28.3 28.3 22.6-22.6-28.3-28.3c-3.1-3.1-3.1-8.2 0-11.3l11.3-11.3c3.1-3.1 8.2-3.1 11.3 0l28.3 28.3 28.3-28.5z" />
                                </svg>
                                <div className="text-pintk font-Prompt font-bold">Sportsbook</div>
                            </div>
                            <div className="text-white mt-4 font-bold font-Prompt">
                                Wager on-chain bets on your
                            </div>
                            <div className="text-white font-Prompt font-bold">
                                favorite sporting events
                            </div>
                        </div>
                        <div className="text-center">
                            <svg
                                width="64px"
                                height="64px"
                                fill="rgb(255,255,255)"
                                viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgb(255,255,255)"
                            >
                                <path
                                    fill="rgb(255,255,255)"
                                    d="M150.156 82.406c-1.843.092-3.663.446-5.344 1.063L41.094 121.53c-4.483 1.645-8.493 5.357-10.5 9.69-2.007 4.33-2.238 9.798-.594 14.28l66.72 181.875c1.643 4.482 5.354 8.524 9.686 10.53 4.332 2.008 9.8 2.24 14.28.595l103.72-38.063c4.483-1.644 8.493-5.355 10.5-9.687l.03-.063c1.982-4.322 2.2-9.757.564-14.218L168.78 94.593c-1.635-4.46-5.318-8.484-9.624-10.5l-.062-.03c-2.166-1.005-4.623-1.556-7.094-1.658-.618-.025-1.23-.03-1.844 0zM189.22 96.03l63.843 174c3.41 9.3 2.975 19.61-1.188 28.595-4.163 8.986-11.734 15.965-21.03 19.375l-27.44 10.063 60 2.78c4.77.223 9.91-1.66 13.44-4.874 3.528-3.217 5.87-8.17 6.092-12.94l9-193.5c.222-4.768-1.628-9.938-4.843-13.468-3.216-3.53-8.168-5.87-12.938-6.093l-84.937-3.94zm121 33.25l-8.626 184.626c-.46 9.893-4.836 19.237-12.156 25.906-7.32 6.67-17.014 10.148-26.907 9.688l-26.06-1.22 69.374 23.095c4.53 1.507 10.012 1.107 14.28-1.03 4.27-2.14 7.838-6.283 9.345-10.814l61.155-183.81c1.507-4.532 1.107-10.013-1.03-14.282-2.14-4.27-6.283-7.87-10.814-9.375l-68.56-22.782zm-205.064 18.345c24.458 24.936 68.02 17.74 80.75 45.53 11.875 25.927-14.51 46.006-37.97 38.407l17 30.782-18.78 6.906-10.937-31.688c-10.39 22.624-43.053 23.746-54.157-.53-13.53-29.577 24.02-54.2 24.093-89.407zm301.438 39.22L347.22 365.437c-3.127 9.397-9.865 17.19-18.72 21.625l-.094.03c-8.834 4.396-19.07 5.116-28.437 2l-20.376-6.78 43.312 37.03c3.63 3.102 8.865 4.78 13.625 4.407 4.76-.374 9.618-2.84 12.72-6.47l125.875-147.31c3.102-3.63 4.78-8.835 4.406-13.595-.372-4.76-2.87-9.648-6.5-12.75l-66.436-56.78z"
                                />
                            </svg>
                            <div className="text-pintk font-Prompt font-bold">Poker and 21</div>
                            <div className="text-white mt-4 font-Prompt font-bold">
                                Play provably fair Poker and 21
                            </div>
                        </div>
                        <div className="text-center">
                            <svg
                                width="64px"
                                height="64px"
                                fill="rgb(255,255,255)"
                                viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgb(255,255,255)"
                            >
                                <path d="M19.58 364.314h132.077a4 4 0 0 0 4-4V105.336a4 4 0 0 0-4-4H19.58a4 4 0 0 0-4 4v254.978a4 4 0 0 0 4 4zm26.972-8v-19.107h81.712v19.107H46.552zm89.713 0v-23.107a4 4 0 0 0-4-4H42.552a4 4 0 0 0-4 4v23.107H23.58V236.825h38.693c-6.017 11.944-10.263 28.374-7.796 50.05a4 4 0 0 0 3.933 3.548c2.573.026 9.272.039 19.912.039 18.304 0 41.902-.039 41.902-.039a3.998 3.998 0 0 0 3.806-5.212c-.117-.367-7.206-23.298-4.352-48.386h27.979v119.489h-11.392zM86.67 214.35l-.422-.784c-.807-1.5-2.412-2.417-4.111-2.297-.512.036-1.106.059-1.791.059-3.943 0-9-.872-14.625-2.522-2.687-.789-5.134-1.188-7.273-1.188-4.916 0-7.659 2.089-9.095 3.841-1.526 1.863-2.179 4.035-2.421 5.94l-6.899-.01-1.428-31.08 8.68-1.113v.957c0 1.002.311 2.003.974 2.754a4.003 4.003 0 0 0 4.991.862c7.737-4.366 15.902-6.579 24.267-6.579 17.376 0 30.12 9.603 30.239 9.694a4.006 4.006 0 0 0 4.242.409l15.416-7.745c1.15 1.449 2.605 3.26 3.913 4.821-9.426 10.13-15.684 23.163-18.558 38.456H76.878c3.336-4.135 6.539-7.034 8.78-8.826a4.349 4.349 0 0 0 1.012-5.649zm24.938 22.475a117.334 117.334 0 0 0-.631 14.68c.248 13.344 2.488 24.668 4.014 30.926-7.981.012-23.662.031-36.668.031-7.295 0-12.728-.006-16.239-.019-1.629-20.364 3.269-35.272 9.295-45.618h40.229zM51.242 112.556c3.847-2.046 9.264-3.22 14.862-3.22s11.015 1.174 14.862 3.22c3.013 1.604 4.813 3.612 4.813 5.374s-1.799 3.77-4.813 5.373c-3.847 2.046-9.264 3.22-14.862 3.22s-11.015-1.174-14.862-3.22c-3.013-1.604-4.813-3.611-4.813-5.373s1.8-3.77 4.813-5.374zm39.57 14.121c3.847-2.046 9.264-3.22 14.861-3.22 5.598 0 11.015 1.174 14.862 3.22 3.014 1.603 4.813 3.611 4.813 5.373s-1.799 3.771-4.813 5.373c-3.847 2.046-9.264 3.22-14.862 3.22-5.598 0-11.015-1.174-14.861-3.22-3.014-1.603-4.813-3.611-4.813-5.373s1.799-3.77 4.813-5.373zm1.093-17.341h37.51c-2.896 3.799-12.079 6.117-18.755 6.117s-15.86-2.318-18.755-6.117zm-49.716 0c-2.4 2.477-3.759 5.402-3.759 8.594 0 9.459 11.897 16.593 27.674 16.593 4.328 0 8.361-.54 11.939-1.514.775 8.978 12.391 15.634 27.63 15.634 15.777 0 27.674-7.134 27.674-16.593 0-4.457-2.643-8.397-7.087-11.318 6.337-2.501 10.683-6.549 11.791-11.396h9.606v119.488h-26.722c2.573-12.656 8.076-25.312 18.628-35.419a3.998 3.998 0 0 0 .028-5.75c-1.261-1.231-5.514-6.546-7.898-9.606a3.998 3.998 0 0 0-4.951-1.116l-16.214 8.146c-4.756-3.086-17.055-9.89-33.01-9.89-7.646 0-15.125 1.571-22.31 4.682a4 4 0 0 0-4.432-3.189l-16.845 2.16a4 4 0 0 0-3.487 4.151l1.772 38.574a3.999 3.999 0 0 0 3.99 3.816l14.769.021h.005a4.012 4.012 0 0 0 3.068-1.454 4.04 4.04 0 0 0 .86-3.302c-.165-.898-.224-3.091.644-4.133.978-1.171 3.939-1.201 7.917-.034 4.154 1.22 7.993 2.051 11.473 2.487a71.072 71.072 0 0 0-7.993 9.855H23.58V109.336h18.609zm124.598 254.978h132.077a4 4 0 0 0 4-4V105.336a4 4 0 0 0-4-4H166.787a4 4 0 0 0-4 4v254.978a4 4 0 0 0 4 4zm26.972-8v-19.107h81.712v19.107h-81.712zm89.713 0v-23.107a4 4 0 0 0-4-4H189.76a4 4 0 0 0-4 4v23.107h-14.973V236.825h38.693c-6.017 11.944-10.263 28.374-7.795 50.05a4 4 0 0 0 3.933 3.548c2.573.026 9.272.039 19.911.039 18.304 0 41.902-.039 41.902-.039a4 4 0 0 0 3.806-5.21c-.116-.367-7.177-23.306-4.327-48.388h27.954v119.489h-11.392zM233.877 214.35l-.422-.784c-.807-1.5-2.412-2.417-4.111-2.297-.512.036-1.106.059-1.791.059-3.943 0-9-.872-14.625-2.522-2.687-.789-5.134-1.188-7.273-1.188-4.916 0-7.659 2.089-9.094 3.841-1.526 1.863-2.179 4.035-2.421 5.94l-6.9-.01-1.428-31.08 8.68-1.113v.971c0 .998.312 1.994.973 2.741a4.01 4.01 0 0 0 4.993.86c7.737-4.366 15.902-6.579 24.267-6.579 17.377 0 30.12 9.603 30.239 9.694a4.003 4.003 0 0 0 4.242.409l15.416-7.745c1.15 1.449 2.605 3.26 3.913 4.821-9.427 10.13-15.685 23.163-18.559 38.456h-35.891c3.336-4.135 6.539-7.034 8.78-8.826a4.347 4.347 0 0 0 1.012-5.648zm24.937 22.475a117.334 117.334 0 0 0-.631 14.68c.248 13.344 2.488 24.668 4.014 30.926-7.981.012-23.661.031-36.667.031-7.294 0-12.728-.006-16.238-.019-1.63-20.364 3.268-35.272 9.295-45.618h40.227zM198.45 112.556c3.847-2.046 9.264-3.22 14.861-3.22 5.598 0 11.015 1.174 14.862 3.22 3.013 1.604 4.813 3.612 4.813 5.374s-1.799 3.77-4.813 5.373c-3.847 2.046-9.264 3.22-14.862 3.22s-11.015-1.174-14.861-3.22c-3.014-1.604-4.813-3.611-4.813-5.373s1.799-3.77 4.813-5.374zm39.569 14.121c3.847-2.046 9.264-3.22 14.861-3.22 5.599 0 11.016 1.174 14.862 3.22 3.014 1.603 4.813 3.611 4.813 5.373s-1.799 3.771-4.813 5.373c-3.847 2.046-9.264 3.22-14.862 3.22-5.598 0-11.015-1.174-14.861-3.22-3.014-1.603-4.813-3.611-4.813-5.373s1.799-3.77 4.813-5.373zm1.093-17.341h37.51c-2.896 3.799-12.079 6.117-18.755 6.117s-15.859-2.318-18.755-6.117zm-49.716 0c-2.4 2.477-3.759 5.402-3.759 8.594 0 9.459 11.897 16.593 27.674 16.593 4.328 0 8.361-.54 11.939-1.514.775 8.978 12.391 15.634 27.63 15.634 15.777 0 27.675-7.134 27.675-16.593 0-4.457-2.643-8.397-7.087-11.318 6.338-2.501 10.683-6.549 11.79-11.396h9.605v119.488h-26.699c2.569-12.664 8.066-25.323 18.606-35.419.783-.75 1.229-1.785 1.233-2.869s-.43-2.124-1.205-2.881c-1.261-1.231-5.513-6.546-7.897-9.606a3.999 3.999 0 0 0-4.951-1.116l-16.214 8.146c-4.757-3.086-17.055-9.89-33.011-9.89-7.646 0-15.124 1.571-22.31 4.682a4 4 0 0 0-4.432-3.189l-16.845 2.16a4 4 0 0 0-3.487 4.151l1.772 38.574a3.999 3.999 0 0 0 3.99 3.816l14.769.021h.005a4.012 4.012 0 0 0 3.068-1.454 4.04 4.04 0 0 0 .86-3.302c-.165-.899-.225-3.092.643-4.133.978-1.171 3.938-1.201 7.917-.034 4.154 1.22 7.993 2.051 11.473 2.487a71.072 71.072 0 0 0-7.993 9.855h-43.37V109.336h18.611zm124.598 254.978H446.07a4 4 0 0 0 4-4V105.336a4 4 0 0 0-4-4H313.994a4 4 0 0 0-4 4v254.978a4 4 0 0 0 4 4zm26.973-8v-19.107h81.712v19.107h-81.712zm89.712 0v-23.107a4 4 0 0 0-4-4h-89.712a4 4 0 0 0-4 4v23.107h-14.973V236.825h38.693c-6.017 11.944-10.264 28.374-7.797 50.05a4.001 4.001 0 0 0 3.934 3.548c2.573.026 9.272.039 19.911.039 18.305 0 41.902-.039 41.902-.039a3.998 3.998 0 0 0 3.805-5.212c-.117-.367-7.206-23.298-4.351-48.386h27.979v119.489h-11.391zM381.084 214.35l-.422-.784c-.807-1.5-2.412-2.417-4.112-2.297-.512.036-1.106.059-1.791.059-3.942 0-9-.872-14.624-2.522-2.687-.789-5.134-1.188-7.273-1.188-4.916 0-7.659 2.089-9.095 3.841-1.525 1.863-2.179 4.035-2.421 5.94l-6.899-.01-1.428-31.08 8.68-1.113v.94c0 1.003.308 2.007.969 2.762a4 4 0 0 0 4.997.87c7.737-4.366 15.902-6.579 24.267-6.579 17.377 0 30.12 9.603 30.239 9.694a4.003 4.003 0 0 0 4.242.409l15.416-7.745c1.15 1.449 2.605 3.26 3.913 4.821-9.426 10.13-15.684 23.163-18.558 38.456h-35.891c3.336-4.135 6.539-7.034 8.78-8.826a4.348 4.348 0 0 0 1.011-5.648zm24.938 22.475a117.334 117.334 0 0 0-.631 14.68c.248 13.344 2.487 24.668 4.013 30.926-7.981.012-23.661.031-36.668.031-7.294 0-12.728-.006-16.238-.019-1.629-20.364 3.269-35.272 9.296-45.618h40.228zm-60.365-124.269c3.847-2.046 9.264-3.22 14.861-3.22s11.015 1.174 14.861 3.22c3.014 1.604 4.813 3.612 4.813 5.374s-1.799 3.77-4.813 5.373c-3.847 2.046-9.264 3.22-14.861 3.22s-11.015-1.174-14.861-3.22c-3.014-1.604-4.813-3.611-4.813-5.373s1.8-3.77 4.813-5.374zm39.569 14.121c3.847-2.046 9.264-3.22 14.861-3.22 5.599 0 11.016 1.174 14.862 3.22 3.014 1.603 4.813 3.611 4.813 5.373s-1.799 3.771-4.813 5.373c-3.847 2.046-9.264 3.22-14.862 3.22-5.598 0-11.015-1.174-14.861-3.22-3.014-1.603-4.813-3.611-4.813-5.373s1.799-3.77 4.813-5.373zm1.093-17.341h37.51c-2.896 3.799-12.079 6.117-18.755 6.117s-15.859-2.318-18.755-6.117zm-49.715 0c-2.4 2.477-3.759 5.402-3.759 8.594 0 9.459 11.897 16.593 27.674 16.593 4.328 0 8.36-.54 11.938-1.514.775 8.978 12.391 15.634 27.63 15.634 15.777 0 27.675-7.134 27.675-16.593 0-4.457-2.643-8.397-7.087-11.318 6.338-2.501 10.683-6.549 11.791-11.396h9.605v119.488h-26.722c2.573-12.656 8.076-25.312 18.628-35.419.783-.75 1.229-1.785 1.233-2.869s-.43-2.124-1.205-2.881c-1.261-1.231-5.513-6.546-7.897-9.606a3.999 3.999 0 0 0-4.951-1.116l-16.214 8.146c-4.757-3.086-17.055-9.89-33.011-9.89-7.646 0-15.124 1.571-22.31 4.682a3.993 3.993 0 0 0-1.28-2.224 4.011 4.011 0 0 0-3.151-.965l-16.845 2.16a4.001 4.001 0 0 0-3.487 4.151l1.772 38.574a4 4 0 0 0 3.99 3.816l14.769.021h.006a4.012 4.012 0 0 0 3.068-1.454 4.036 4.036 0 0 0 .859-3.302c-.165-.899-.225-3.091.644-4.133.978-1.172 3.938-1.201 7.917-.034 4.154 1.22 7.992 2.051 11.473 2.487a71.072 71.072 0 0 0-7.993 9.855h-43.37V109.336h18.61z" />
                                <path d="M461.65 86.085H4a4 4 0 0 0-4 4v285.479a4 4 0 0 0 4 4h457.65a4 4 0 0 0 4-4V90.085a4 4 0 0 0-4-4zm-4 285.48H8V94.085h449.65v277.48z" />
                            </svg>
                            <div className="text-pintk font-Prompt font-bold">Slots</div>
                            <div className="text-white mt-4 font-Prompt font-bold">
                                Enjoy provably fair slot
                            </div>
                            <div className="text-white font-Prompt font-bold">machines</div>
                        </div>
                        <div className="text-center">
                            <svg
                                width="64px"
                                height="64px"
                                fill="rgb(255,255,255)"
                                viewBox="0 -64 640 640"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgb(255,255,255)"
                            >
                                <path d="M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z" />
                            </svg>
                            <div className="text-pintk font-Prompt font-bold">Roulette</div>
                            <div className="text-white mt-4 font-Prompt font-bold">
                                Test your luck and spin the wheel
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="grid items-center justify-items-center bg-no-repeat bg-cover bg-black  relative">
                    <div className="mt-8 flex items-center">
                        <h1 className=" lg:text-4xl sm:text-xl font-bold text-white text-center">
                            House Matrix Dual Token Model
                        </h1>
                    </div>
                    <div className="mt-8 mb-8 lg:grid lg:grid-cols-2 lg:gap-40 items-center justify-center">
                        <div className="">
                            <div className="border-4 border-pintk p-8">
                                <h2 className="mb-4 text-white">
                                    <div className="flex items-center ">
                                        <img src="/logo.png" width="100px" height="100px" />
                                        <h1 className="text-5xl lg:text-4xl md:text-3xl sm:text-2xl font-bold text-pintk">
                                            HMX
                                            <br />
                                        </h1>
                                    </div>
                                    <br /> HMX is the utility and governance token.
                                    <br /> Accrues 30% of the platform's generated fees.
                                    <br />
                                    <br /> Arbitrum APR: 23.65%
                                </h2>
                                <div className="flex items-center justify-center space-x-4">
                                    <button className={styles.button26}>
                                        <div className="">Buy</div>
                                    </button>
                                    <button className={styles.button26}>
                                        <div className="">Read more</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="border-4 border-pintk p-8">
                                <h2 className="mb-4 text-white">
                                    <div className="flex items-center ">
                                        <img src="/logo.png" width="100px" height="100px" />
                                        <h1 className="text-5xl lg:text-4xl md:text-3xl sm:text-2xl font-bold text-pintk">
                                            HLP
                                            <br />
                                        </h1>
                                    </div>
                                    <br /> HLP is the liquidity provider token.
                                    <br /> Accrues 70% of the platform's generated fees. <br />
                                    <br /> Arbitrum APR: 31.08%
                                </h2>
                                <div className="flex items-center justify-center space-x-4">
                                    <button className={styles.button26}>
                                        <div className="">Buy</div>
                                    </button>
                                    <button className={styles.button26}>
                                        <div className="">Read more</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h1 className="mb-8 font-ams text-4xl  font-bold text-slate-300"></h1>
                </div>
            </div>
        </div>
    )
}

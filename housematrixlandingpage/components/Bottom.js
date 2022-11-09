import Link from "next/link"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "@rainbow-me/rainbowkit"
//https://cdn.discordapp.com/attachments/960590776570626098/1039674954213490828/martix.gif
export default function Bottom() {
    return (
        <>
            <div className="h-[100vh] grid items-center justify-items-center bg-no-repeat bg-cover bg-black bg-[url('https://cdn.discordapp.com/attachments/960590776570626098/1039674954213490828/martix.gif')] border-black relative">
                <div className="text-white text-xs">
                    <div>copy right reserved by @HouseMatrx</div>
                    <div className="mt-3"></div>
                    <div className="text-center lg:grid lg:grid-cols-2 gap-10  ">
                        <div>
                            <Link href="https://github.com/">
                                <button>
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="#ffffff"
                                            
                                            d="M11.999 1C5.926 1 1 5.925 1 12c0 4.86 3.152 8.983 7.523 10.437.55.102.75-.238.75-.53 0-.26-.009-.952-.014-1.87-3.06.664-3.706-1.475-3.706-1.475-.5-1.27-1.221-1.61-1.221-1.61-.999-.681.075-.668.075-.668 1.105.078 1.685 1.134 1.685 1.134.981 1.68 2.575 1.195 3.202.914.1-.71.384-1.195.698-1.47-2.442-.278-5.01-1.222-5.01-5.437 0-1.2.428-2.183 1.132-2.952-.114-.278-.491-1.397.108-2.91 0 0 .923-.297 3.025 1.127A10.536 10.536 0 0 1 12 6.32a10.49 10.49 0 0 1 2.754.37c2.1-1.424 3.022-1.128 3.022-1.128.6 1.514.223 2.633.11 2.911.705.769 1.13 1.751 1.13 2.952 0 4.226-2.572 5.156-5.022 5.428.395.34.747 1.01.747 2.037 0 1.47-.014 2.657-.014 3.017 0 .295.199.637.756.53C19.851 20.979 23 16.859 23 12c0-6.075-4.926-11-11.001-11"
                                        />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                        <div>
                            <Link href="https://twitter.com/">
                                <button>
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 -23.5 256 256"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="xMidYMid"
                                    >
                                        <path
                                            d="M256 25.45a105.04 105.04 0 0 1-30.166 8.27c10.845-6.5 19.172-16.793 23.093-29.057a105.183 105.183 0 0 1-33.351 12.745C205.995 7.201 192.346.822 177.239.822c-29.006 0-52.523 23.516-52.523 52.52 0 4.117.465 8.125 1.36 11.97-43.65-2.191-82.35-23.1-108.255-54.876-4.52 7.757-7.11 16.78-7.11 26.404 0 18.222 9.273 34.297 23.365 43.716a52.312 52.312 0 0 1-23.79-6.57c-.003.22-.003.44-.003.661 0 25.447 18.104 46.675 42.13 51.5a52.592 52.592 0 0 1-23.718.9c6.683 20.866 26.08 36.05 49.062 36.475-17.975 14.086-40.622 22.483-65.228 22.483-4.24 0-8.42-.249-12.529-.734 23.243 14.902 50.85 23.597 80.51 23.597 96.607 0 149.434-80.031 149.434-149.435 0-2.278-.05-4.543-.152-6.795A106.748 106.748 0 0 0 256 25.45"
                                            fill="#55acee"
                                        />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="mb-3"></div>
                    <div className="h-[54vh] absolute top-1 right-0 rounded-md overflow-hidden opacity-100 z-[1500]"></div>
                </div>
            </div>
        </>
    )
}

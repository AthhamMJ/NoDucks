import styles from "./Welcome.module.css";

function Welcome() {
    return (
        <div className={styles.welcomeContent}>

            <p>6 October 2026</p>

            <h1>Welcome Back Athham</h1>

            <div className={styles.focusSection}>

                <div className={styles.focusContent}>

                    <div>
                        <svg
                            width="35px"
                            height="35px"
                            viewBox="0 0 24.00 24.00"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#ffffff"
                            stroke="#ffffff"
                            strokeWidth="0.00024000000000000003"
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0">
                                <rect
                                    x="0"
                                    y="0"
                                    width="24.00"
                                    height="24.00"
                                    rx="12"
                                    fill="#7438ff"
                                    strokeWidth="0"
                                ></rect>
                            </g>

                            <g
                                id="SVGRepo_tracerCarrier"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                stroke="#CCCCCC"
                                strokeWidth="0.4800000000000001"
                            ></g>

                            <g id="SVGRepo_iconCarrier">
                                <g>
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path>
                                </g>
                            </g>
                        </svg>
                    </div>

                    <div>
                        <p>Today's Focus</p>
                        <h3>Newton's Second Law</h3>
                        <p>
                            Understand the concept<br />
                            Doing some practices are enough today
                        </p>
                    </div>

                </div>

                <div className={styles.startButtonContainer}>
                    <button className={styles.startButton}>
                        Start
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Welcome;
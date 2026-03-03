'use client'
import { useEffect, useState } from "react"
import { UAParser } from 'ua-parser-js'

const useDeviceTracking = () => {
    const [deviceInfo, setDeviceInfo] = useState("");

    useEffect(() => {
        const parser = new UAParser();
        const result = parser.getResult();

        const deviceType = result.device.type ?? "Desktop";
        const osName = result.os.name ?? "";
        const osVersion = result.os.version ?? "";
        const browserName = result.browser.name ?? "";
        const browserVersion = result.browser.version ?? "";

        setDeviceInfo(
            `${deviceType} - ${osName} ${osVersion} - ${browserName} ${browserVersion}`
        );

    }, [])

    return deviceInfo
}

export default useDeviceTracking
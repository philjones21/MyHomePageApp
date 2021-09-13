import {Constants} from "./Constants";
const fs = require("fs");

export interface IConfigInfo {
    config: {
        secret: string,
        timeout: number,
        allowNewUsers: boolean,
        environment: string
    }
}

export let configInfo: IConfigInfo;

const rawInfo: string = fs.readFileSync(Constants.CONFIG_PATH);
configInfo = JSON.parse(rawInfo);
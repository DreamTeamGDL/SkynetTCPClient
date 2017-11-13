
import {Socket} from "net"
import * as OS from "os"

import ActionMessage from "./Action"
import {Action} from "./Action"
import ConfigurationMessage from "./Configuration";

export default class TCPClient {
    private port: number;
    private address: string;
    private tcpClient: Socket;

    public constructor(port: number, address: string) {
        this.port = port;
        this.address = address;
        this.tcpClient = new Socket();
    }

    public async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.tcpClient.connect(this.port, this.address, () => {
                console.log("Shit ready");
                resolve();
            });
        });
    }

    public async send(message: ActionMessage): Promise<ActionMessage | ConfigurationMessage> {
        return new Promise<ActionMessage | ConfigurationMessage>((resolve, reject) => {
            this.onConnect(message, resolve, reject)
        });
    }

    public listen(handler: (message: ActionMessage) => void): void {
	console.log("Listening..");
        this.tcpClient.addListener("data", (data: Buffer) => {
            let response: ActionMessage = JSON.parse(data.toString("utf8"));
            handler(response);
        });
    }

    public stopListening(): void {
        this.tcpClient.removeAllListeners();
    }

    public async configure(): Promise<ConfigurationMessage> {
        let configure: ActionMessage = {
            Action: Action.CONFIGURE,
            Name: this.getMacAddress(),
            Do: ""
        };
        return await this.send(configure) as ConfigurationMessage;
    }

    private getMacAddress(): string {
        let netInfo = OS.networkInterfaces();
        for (let key of Object.keys(netInfo)) {
            for (let data of netInfo[key]) {
                if (data.mac != "00:00:00:00:00:00") {
                    return data.mac.replace(/:/g, "").toUpperCase();
                }
            }
        }
        return "";
    }

    private async onConnect(
        message: ActionMessage, 
        resolve: (value: any) => void, 
        reject: (reason?: any) => void
    ): Promise<void> {
	    console.log(JSON.stringify(message));
        let bytes = Buffer.from(JSON.stringify(message), "utf8");
        this.tcpClient.write(bytes);
        let listener: (data: Buffer) => void = (data: Buffer) => {
            let response = JSON.parse(data.toString("utf8"));
            console.log(response);
            resolve(response);   
            this.tcpClient.removeListener("data", listener);
        };
        let createdSocket = this.tcpClient.addListener("data", listener);
        setInterval(() => reject(new Error("TCP response not found")), 5000);
    }
}

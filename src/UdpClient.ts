
import {Action} from "./Action"
import ActionMessage from "./Action"
import * as Datagram from "dgram"
import {Socket} from "dgram"

export default class UDPClient {

    private static  port: number = 25500;
    private static address: string = "192.168.137.255";

    private static hello: ActionMessage = {
        Action: Action.HELLO,
        Do: "",
        Name: ""
    };

    private udpClient: Socket;
    private trialCount: number;

    public constructor() {
        this.udpClient = Datagram.createSocket("udp4");
        this.trialCount = 0;
    }

    public async announce(): Promise<ActionMessage> {
        const bytes = Buffer.from(JSON.stringify(UDPClient.hello), "utf8");
        return new Promise<ActionMessage>((resolve, reject) => {
            this.udpClient.bind(() => {
                this.udpClient.setBroadcast(true); 
                let interval = setInterval(() => {
                    this.udpClient.send(bytes, 0, bytes.length, UDPClient.port, UDPClient.address);
                    if (this.trialCount++ > 5) {
                        reject(new Error("Unable to reach server UDP"));
                    }
                }, 500);
            
                this.udpClient.addListener("message", (buf, rinfo) => {
                    const message: ActionMessage = JSON.parse(buf.toString("utf8"));
                    this.udpClient.close();
                    clearInterval(interval);
                    resolve(message);
                });
            });
        });
    }
    

}
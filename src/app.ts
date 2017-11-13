
import UDPClient from "./UdpClient"
import * as Net from "net"
import {Socket} from "net"

import ActionMessage from "./Action"
import {Action} from "./Action"
import * as OS from "os"
import ConfigurationMessage, { Configuration } from "./Configuration";
import TCPClient from "./TcpClient";
import { Pin } from "./Pin";

class Application {

    private tcpClient: TCPClient;

    private configuration: Configuration;

    public constructor() {
        this.configuration = {
            PinMap: {},
            ClientName: ""
        };
    }
    
    public static main(): void {
        let app = new Application();
        app.connect();
    }

    private connect(): void {
        this.handleExceptions(this.handledConnect);
    }

    private handledConnect: () => Promise<void> = async () => {
        this.tcpClient = await this.find();
        await this.tcpClient.connect();
        await this.configure(this.tcpClient);
        await this.tcpClient.send({
            Action: Action.CONNECT,
            Name: this.configuration.ClientName,
            Do: ""
        });
        this.tcpClient.listen(this.messageHandler);
    }

    private messageHandler: (message: ActionMessage) => void = (message) => {
        let action: string[] = message.Do.split(";");
        let pinName = action[0];
        this.configuration.PinMap[pinName].write(action[1] == "TRUE");
        this.tcpClient.send({
            Action: Action.ACKNOWLEDGE,
            Name: "",
            Do: ""
        });
        console.log("Acknowledge");
    }

    private find: () => Promise<TCPClient> = async () => {
        let udpClient = new UDPClient();
        let message: ActionMessage = await udpClient.announce();
        console.log(message);
        return new TCPClient(parseInt(message.Do), message.Name);
    }

    private configure: (tcpClient: TCPClient) => Promise<void> = async (tcpClient) => {
        let configMessage = await tcpClient.configure();
        for (let key in configMessage.PinMap) {
            this.configuration.PinMap[key] = new Pin(configMessage.PinMap[key]);
        }
        this.configuration.ClientName = configMessage.ClientName;
        console.log(this.configuration);
    }

    private handleExceptions(stuff: () => void): void {
        try {
            stuff();
        } catch (e) {
            const err: Error = e as Error;
            console.error(err.message);
        }
    }
}

Application.main();

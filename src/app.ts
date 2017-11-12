
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
        let tcpClient = await this.find();
        await tcpClient.connect();
        await this.configure(tcpClient);
        await tcpClient.send({
            Action: Action.CONNECT,
            Name: this.configuration.ClientName,
            Do: ""
        });
        tcpClient.listen(this.messageHandler);
    }

    private messageHandler: (message: ActionMessage) => void = (message) => {
        console.log(message);
        console.log("Is this the place?");
        let action: string[] = message.Do.split(";");
        let pinName = action[0];
	    console.log(action[1] == "TRUE");
        this.configuration.PinMap[pinName].write(action[1] == "TRUE");
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

import { Pin } from "./Pin";

export default interface ConfigurationMessage {
    PinMap: {[key: string]: number}, 
    ClientName: string
}

export interface Configuration {
    PinMap: {[key: string]: Pin},
    ClientName: string
}
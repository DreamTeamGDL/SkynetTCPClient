 export enum Action {
    CONNECT, 
    TELL,
    HELLO,
    CONFIGURE
 }

 export default interface ActionMessage {
    Action: number,
    Do: string,
    Name: string
}
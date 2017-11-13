 export enum Action {
    CONNECT, 
    TELL,
    HELLO,
    CONFIGURE,
    ACKNOWLEDGE
 }

 export default interface ActionMessage {
    Action: number,
    Do: string,
    Name: string
}
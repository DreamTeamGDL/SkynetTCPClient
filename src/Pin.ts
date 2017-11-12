import Gpio = require("rpi-gpio")

export class Pin {

    private pin: number;

    public constructor(pin: number) {
        this.pin = pin;
        Gpio.setup(pin);
    }

    public async read(): Promise<boolean> {
        return new Promise((resolve: (value?: boolean) => void, reject: (reason?: any) => void) => {
            Gpio.read(this.pin, (err: Error, data: boolean) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async write(value: boolean): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            Gpio.write(this.pin, value, (err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /** @param {ms} The number of milliseconds between on and off */
    public async pulse(ms: number): Promise<void> {
        await this.write(true);
        setTimeout(async () => await this.write(false), ms);
    }
}
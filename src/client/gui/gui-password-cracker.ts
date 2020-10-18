import { gameState } from "../client.js";
import { SoftwareGuiElement } from "./gui-software.js";
import { loginWindow } from "./gui.js";
import 'https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js'
import { Desktop } from "./desktop.js";

declare const faker: Faker.FakerStatic;

export class PasswordCrackerGuiElement extends SoftwareGuiElement {

    softwareActions(): void {
        loginWindow.restore()
        Desktop.bringToFront(loginWindow)
    }

    getExecutionArgs() { return {} }

    static effect() {
        return setInterval(() => {
            const currentIp = gameState.remoteGateway?.ip;
            const currentValue = gameState.hackedDB.entries.find(e => e.ip === currentIp)?.user.password;
            loginWindow.passInput.value(currentValue + faker.random.alphaNumeric());
        }, 50);
    }
}
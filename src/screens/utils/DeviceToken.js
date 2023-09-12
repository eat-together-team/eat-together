// Class to hold the current device push token
export default class DeviceToken {

    // Static holder for the token
    static #token = null;

    // Get the value of the token
    static getToken() {
        return this.#token;
    }

    // Set the value of the token
    static setToken(token) {
        this.#token = token;
    }
}
import { Client } from "./Client.js";

export class Admin extends Client {
  kickClient(_targetClientId: string): boolean {
    return true;
  }

  closeRemoteProducer(_producerId: string): boolean {
    return true;
  }
}

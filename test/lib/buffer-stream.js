import {Writable} from "stream";

export default class BufferStream extends Writable {
  constructor() {
    super();
    this.value = "";
  }

  _write(chunk, encoding, callback) {
    this.value += chunk.toString();
    callback();
  }
}

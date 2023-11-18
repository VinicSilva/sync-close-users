import { Transform } from 'node:stream'
const ONE_HALF_SECOND = 1500

export default class ThrottleRequest extends Transform {
  #requestsPerSecond = 0
  #internalCounter = 0

  constructor({
    objectMode,
    requestsPerSecond
  }) {
    super({
      objectMode
    })
    
    this.#requestsPerSecond = requestsPerSecond
  }
  _transform(chunk, enc, callback) {
    this.#internalCounter++
    if (! (this.#internalCounter >= this.#requestsPerSecond)) {
      return callback(null, chunk)
    }
    
    setTimeout(() => {
      this.#internalCounter = 0
      return callback(null, chunk)
    }, ONE_HALF_SECOND);
  }
}
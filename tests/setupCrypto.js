const globalObject = globalThis;

Object.defineProperty(globalObject, "isSecureContext", {
  value: true,
  writable: true,
});

const deterministicValues = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
let callIndex = 0;

const cryptoStub = {
  getRandomValues(array) {
    if (!(array instanceof Uint8Array) && !(array instanceof Uint16Array) && !(array instanceof Uint32Array)) {
      throw new TypeError("Expected Uint8Array, Uint16Array, or Uint32Array");
    }

    if (array instanceof Uint8Array) {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = (callIndex + i) % 256;
      }
    } else {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = deterministicValues[(callIndex + i) % deterministicValues.length];
      }
    }

    callIndex = (callIndex + array.length) % deterministicValues.length;
    return array;
  },
};

Object.defineProperty(globalObject, "crypto", {
  value: cryptoStub,
  configurable: true,
});

if (globalObject.window) {
  Object.defineProperty(globalObject.window, "isSecureContext", {
    value: true,
    configurable: true,
  });
  Object.defineProperty(globalObject.window, "crypto", {
    value: cryptoStub,
    configurable: true,
  });
}

(function (factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory;
  } else {
    const generator = factory(window);
    const { document } = window;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", generator.init, { once: true });
    } else {
      generator.init();
    }
  }
})(function createPasswordGenerator(global) {
  const document = global.document;
  const navigator = global.navigator;

  const elements = {
    lengthInput: document.getElementById("length"),
    lowercaseToggle: document.getElementById("lowercase"),
    uppercaseToggle: document.getElementById("uppercase"),
    numbersToggle: document.getElementById("numbers"),
    symbolsToggle: document.getElementById("symbols"),
    generateButton: document.getElementById("generate"),
    copyButton: document.getElementById("copy"),
    passwordOutput: document.getElementById("password"),
    status: document.getElementById("status"),
    form: document.getElementById("generator-form")
  };

  const CHARSETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
  };

  function supportsWebCrypto() {
    return Boolean(global.isSecureContext && global.crypto?.getRandomValues);
  }

  function ensureWebCrypto() {
    if (!supportsWebCrypto()) {
      throw new Error("Web Crypto API unavailable");
    }
  }

  function getActiveSets() {
    const active = [];
    if (elements.lowercaseToggle.checked) active.push("lowercase");
    if (elements.uppercaseToggle.checked) active.push("uppercase");
    if (elements.numbersToggle.checked) active.push("numbers");
    if (elements.symbolsToggle.checked) active.push("symbols");
    return active;
  }

  function buildCharacterPool(activeSets) {
    return activeSets.map((key) => CHARSETS[key]).join("");
  }

  function getRandomIndex(maxExclusive) {
    if (maxExclusive <= 0) return 0;
    ensureWebCrypto();
    const MAX_UINT32 = 4294967296;
    const limit = Math.floor(MAX_UINT32 / maxExclusive) * maxExclusive;
    const random = new Uint32Array(1);
    while (true) {
      global.crypto.getRandomValues(random);
      const value = random[0];
      if (value < limit) {
        return value % maxExclusive;
      }
    }
  }

  function getRandomCharacter(pool) {
    const poolLength = pool.length;
    if (poolLength === 0) return "";
    ensureWebCrypto();
    const maxValid = Math.floor(256 / poolLength) * poolLength;
    const randomValues = new Uint8Array(1);
    while (true) {
      global.crypto.getRandomValues(randomValues);
      const value = randomValues[0];
      if (value < maxValid) {
        return pool[value % poolLength];
      }
    }
  }

  function setStatus(message) {
    elements.status.textContent = message;
  }

  function clearPassword() {
    elements.passwordOutput.textContent = "";
    if (typeof elements.passwordOutput.removeAttribute === "function") {
      elements.passwordOutput.removeAttribute("data-value");
    } else {
      delete elements.passwordOutput.dataset?.value;
    }
    elements.copyButton.disabled = true;
  }

  function generatePassword() {
    const length = Number(elements.lengthInput.value);
    if (
      !Number.isInteger(length) ||
      length < Number(elements.lengthInput.min) ||
      length > Number(elements.lengthInput.max)
    ) {
      setStatus(`Password length must be between ${elements.lengthInput.min} and ${elements.lengthInput.max}.`);
      clearPassword();
      return;
    }

    const activeSets = getActiveSets();
    if (activeSets.length === 0) {
      setStatus("Select at least one character type.");
      clearPassword();
      return;
    }

    const pool = buildCharacterPool(activeSets);
    const requiredChars = activeSets.map((setKey) => getRandomCharacter(CHARSETS[setKey]));
    const remainingLength = Math.max(length - requiredChars.length, 0);
    const characters = [];

    for (let i = 0; i < remainingLength; i += 1) {
      characters.push(getRandomCharacter(pool));
    }

    characters.push(...requiredChars);

    for (let i = characters.length - 1; i > 0; i -= 1) {
      const randomIndex = getRandomIndex(i + 1);
      const temp = characters[i];
      characters[i] = characters[randomIndex];
      characters[randomIndex] = temp;
    }

    const password = characters.join("");
    elements.passwordOutput.textContent = password;
    elements.passwordOutput.dataset.value = password;
    elements.copyButton.disabled = false;
    setStatus("Password generated. Use Copy to store it securely.");
  }

  async function copyPassword() {
    const value = elements.passwordOutput.dataset.value;
    if (!value) {
      setStatus("Generate a password before copying.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus("Password copied to clipboard.");
    } catch (error) {
      setStatus("Clipboard unavailable. Copy manually.");
    }
  }

  function disableControls() {
    elements.lengthInput.disabled = true;
    elements.lowercaseToggle.disabled = true;
    elements.uppercaseToggle.disabled = true;
    elements.numbersToggle.disabled = true;
    elements.symbolsToggle.disabled = true;
    elements.generateButton.disabled = true;
    elements.copyButton.disabled = true;
  }

  function init() {
    if (!supportsWebCrypto()) {
      disableControls();
      setStatus(
        "Secure password generation requires HTTPS and a modern browser with Web Crypto support. Try loading this page over HTTPS or updating your browser."
      );
      return;
    }

    elements.generateButton.addEventListener("click", generatePassword);
    elements.copyButton.addEventListener("click", copyPassword);
    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      generatePassword();
    });
  }

  return {
    init,
    generatePassword,
    copyPassword,
    getActiveSets,
    buildCharacterPool,
    supportsWebCrypto,
    elements
  };
});

(function () {
  const lengthInput = document.getElementById("length");
  const lengthSlider = document.getElementById("length-slider");
  const lowercaseToggle = document.getElementById("lowercase");
  const uppercaseToggle = document.getElementById("uppercase");
  const numbersToggle = document.getElementById("numbers");
  const symbolsToggle = document.getElementById("symbols");
  const generateButton = document.getElementById("generate");
  const copyButton = document.getElementById("copy");
  const passwordOutput = document.getElementById("password");
  const status = document.getElementById("status");

  // Analytics tracking function
  function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }

  function hasSecureRandomSupport() {
    if (!window.crypto?.getRandomValues) {
      return false;
    }

    try {
      const probe = new Uint8Array(1);
      window.crypto.getRandomValues(probe);
      return true;
    } catch (error) {
      return false;
    }
  }

  const supportsWebCrypto = hasSecureRandomSupport();

  const CHARSETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
  };

  function getActiveSets() {
    const sets = [];
    if (lowercaseToggle.checked) sets.push("lowercase");
    if (uppercaseToggle.checked) sets.push("uppercase");
    if (numbersToggle.checked) sets.push("numbers");
    if (symbolsToggle.checked) sets.push("symbols");
    return sets;
  }

  function buildCharacterPool(activeSets) {
    return activeSets.map((key) => CHARSETS[key]).join("");
  }

  function getRandomIndex(maxExclusive) {
    const MAX_UINT32 = 4294967296; // 2^32
    if (maxExclusive <= 0) return 0;
    const limit = Math.floor(MAX_UINT32 / maxExclusive) * maxExclusive;
    if (!supportsWebCrypto) {
      throw new Error("Web Crypto API unavailable");
    }

    const random = new Uint32Array(1);
    while (true) {
      window.crypto.getRandomValues(random);
      const value = random[0];
      if (value < limit) {
        return value % maxExclusive;
      }
    }
  }

  function getRandomCharacter(pool) {
    const poolLength = pool.length;
    if (poolLength === 0) return "";
    const maxValid = Math.floor(256 / poolLength) * poolLength;
    if (!supportsWebCrypto) {
      throw new Error("Web Crypto API unavailable");
    }

    const randomValues = new Uint8Array(1);
    while (true) {
      window.crypto.getRandomValues(randomValues);
      const value = randomValues[0];
      if (value < maxValid) {
        return pool[value % poolLength];
      }
    }
  }

  function generatePassword() {
    const length = Number(lengthInput.value);
    if (!Number.isInteger(length) || length < Number(lengthInput.min) || length > Number(lengthInput.max)) {
      status.textContent = `Password length must be between ${lengthInput.min} and ${lengthInput.max}.`;
      passwordOutput.textContent = "";
      passwordOutput.removeAttribute("data-value");
      copyButton.disabled = true;
      return;
    }

    const activeSets = getActiveSets();
    if (activeSets.length === 0) {
      status.textContent = "Select at least one character type.";
      passwordOutput.textContent = "";
      passwordOutput.removeAttribute("data-value");
      copyButton.disabled = true;
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
    passwordOutput.textContent = password;
    passwordOutput.dataset.value = password;
    copyButton.disabled = false;
    status.textContent = "Password generated. Use Copy to store it securely.";

    // Track password generation event
    trackEvent('generate_password', {
      'password_length': length,
      'has_uppercase': uppercaseToggle.checked,
      'has_lowercase': lowercaseToggle.checked,
      'has_numbers': numbersToggle.checked,
      'has_symbols': symbolsToggle.checked
    });
  }

  async function copyPassword() {
    const value = passwordOutput.dataset.value;
    if (!value) {
      status.textContent = "Generate a password before copying.";
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      status.textContent = "Password copied to clipboard.";
      
      // Track copy event
      trackEvent('copy_password');
    } catch (error) {
      status.textContent = "Clipboard unavailable. Copy manually.";
    }
  }

  function init() {
    if (!supportsWebCrypto) {
      lengthInput.disabled = true;
      if (lengthSlider) lengthSlider.disabled = true;
      lowercaseToggle.disabled = true;
      uppercaseToggle.disabled = true;
      numbersToggle.disabled = true;
      symbolsToggle.disabled = true;
      generateButton.disabled = true;
      copyButton.disabled = true;
      status.textContent =
        "Secure password generation requires HTTPS (or localhost) and a modern browser with Web Crypto support. On mobile, open the HTTPS version of this page or update your browser.";
      return;
    }

    generateButton.addEventListener("click", generatePassword);
    copyButton.addEventListener("click", copyPassword);

    if (lengthSlider) {
      lengthSlider.value = lengthInput.value;

      lengthSlider.addEventListener("input", () => {
        lengthInput.value = lengthSlider.value;
      });

      lengthInput.addEventListener("input", () => {
        const value = Number(lengthInput.value);
        const min = Number(lengthInput.min);
        const max = Number(lengthInput.max);
        if (!Number.isNaN(value)) {
          const clamped = Math.min(Math.max(value, min), max);
          lengthSlider.value = String(clamped);
        }
      });
    }

    document.getElementById("generator-form").addEventListener("submit", (event) => {
      event.preventDefault();
      generatePassword();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
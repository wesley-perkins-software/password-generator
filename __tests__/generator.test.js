const generatorMarkup = `
  <main class="container" id="main-content">
    <section class="generator" aria-labelledby="generator-title">
      <h2 id="generator-title">Generate a password</h2>
      <form id="generator-form" novalidate>
        <div class="field">
          <label for="length">Password length</label>
          <input type="number" id="length" name="length" min="8" max="128" value="20" inputmode="numeric" />
        </div>
        <fieldset class="field options">
          <legend>Include characters</legend>
          <label class="option">
            <input type="checkbox" id="lowercase" name="lowercase" checked />
            <span>Lowercase (a-z)</span>
          </label>
          <label class="option">
            <input type="checkbox" id="uppercase" name="uppercase" checked />
            <span>Uppercase (A-Z)</span>
          </label>
          <label class="option">
            <input type="checkbox" id="numbers" name="numbers" checked />
            <span>Numbers (0-9)</span>
          </label>
          <label class="option">
            <input type="checkbox" id="symbols" name="symbols" checked />
            <span>Symbols (!@#…)</span>
          </label>
        </fieldset>
        <div class="actions">
          <button type="button" id="generate">Generate</button>
          <button type="button" id="copy" disabled>Copy</button>
        </div>
      </form>
      <div class="output" aria-live="polite" aria-atomic="true">
        <output id="password" for="generator-form" tabindex="0" aria-label="Generated password"></output>
      </div>
      <p class="status" aria-live="assertive" aria-atomic="true" id="status" role="status"></p>
    </section>
  </main>
`;

function loadGenerator() {
  document.body.innerHTML = generatorMarkup;
  Object.defineProperty(document, "readyState", {
    value: "complete",
    configurable: true,
  });

  jest.isolateModules(() => {
    require("../script.js");
  });
}

describe("password generator UI", () => {
  beforeEach(() => {
    jest.resetModules();
    loadGenerator();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("clears output and disables copy button when length is out of range", () => {
    const lengthInput = document.getElementById("length");
    const generateButton = document.getElementById("generate");
    const passwordOutput = document.getElementById("password");
    const copyButton = document.getElementById("copy");
    const status = document.getElementById("status");

    lengthInput.value = "200";
    generateButton.click();

    expect(status.textContent).toBe("Password length must be between 8 and 128.");
    expect(passwordOutput.textContent).toBe("");
    expect(passwordOutput.dataset.value).toBeUndefined();
    expect(copyButton.disabled).toBe(true);
  });

  test("shows guidance when no character types are selected", () => {
    const lengthInput = document.getElementById("length");
    lengthInput.value = "12";

    ["lowercase", "uppercase", "numbers", "symbols"].forEach((id) => {
      const checkbox = document.getElementById(id);
      checkbox.checked = false;
    });

    const generateButton = document.getElementById("generate");
    const passwordOutput = document.getElementById("password");
    const copyButton = document.getElementById("copy");
    const status = document.getElementById("status");

    generateButton.click();

    expect(status.textContent).toBe("Select at least one character type.");
    expect(passwordOutput.textContent).toBe("");
    expect(passwordOutput.dataset.value).toBeUndefined();
    expect(copyButton.disabled).toBe(true);
  });

  test("generates password with characters from each enabled set", () => {
    const lengthInput = document.getElementById("length");
    lengthInput.value = "16";

    const generateButton = document.getElementById("generate");
    const passwordOutput = document.getElementById("password");
    const copyButton = document.getElementById("copy");
    const status = document.getElementById("status");

    generateButton.click();

    const password = passwordOutput.textContent;
    expect(password).toHaveLength(16);
    expect(passwordOutput.dataset.value).toBe(password);
    expect(copyButton.disabled).toBe(false);
    expect(status.textContent).toBe("Password generated. Use Copy to store it securely.");

    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)).toBe(true);
  });
});

const test = require('node:test');
const assert = require('node:assert/strict');
const createPasswordGenerator = require('../script');

function createEvent(type) {
  return {
    type,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    }
  };
}

function createElement(initial = {}) {
  const listeners = new Map();
  const element = {
    id: initial.id ?? null,
    type: initial.type ?? 'div',
    value: initial.value ?? '',
    min: initial.min ?? '0',
    max: initial.max ?? '0',
    checked: initial.checked ?? false,
    disabled: initial.disabled ?? false,
    dataset: { ...(initial.dataset ?? Object.create(null)) }
  };

  let textContent = initial.textContent ?? '';

  Object.defineProperty(element, 'textContent', {
    get() {
      return textContent;
    },
    set(value) {
      textContent = value;
    }
  });

  element.addEventListener = function addEventListener(type, handler) {
    if (!listeners.has(type)) {
      listeners.set(type, []);
    }
    listeners.get(type).push(handler);
  };

  element.removeEventListener = function removeEventListener(type, handler) {
    if (!listeners.has(type)) return;
    const handlers = listeners.get(type).filter((fn) => fn !== handler);
    listeners.set(type, handlers);
  };

  element.dispatchEvent = async function dispatchEvent(event) {
    const handlers = listeners.get(event.type) ?? [];
    for (const handler of handlers) {
      await handler.call(element, event);
    }
    return !event.defaultPrevented;
  };

  element.click = function click() {
    return element.dispatchEvent(createEvent('click'));
  };

  element.removeAttribute = function removeAttribute(name) {
    if (name === 'data-value') {
      delete element.dataset.value;
    }
  };

  return element;
}

function createTestEnvironment() {
  const elementsById = {
    length: createElement({ id: 'length', type: 'number', value: '20', min: '8', max: '128' }),
    lowercase: createElement({ id: 'lowercase', type: 'checkbox', checked: true }),
    uppercase: createElement({ id: 'uppercase', type: 'checkbox', checked: true }),
    numbers: createElement({ id: 'numbers', type: 'checkbox', checked: true }),
    symbols: createElement({ id: 'symbols', type: 'checkbox', checked: true }),
    generate: createElement({ id: 'generate' }),
    copy: createElement({ id: 'copy', disabled: true }),
    password: createElement({ id: 'password', dataset: { value: '' } }),
    status: createElement({ id: 'status' }),
    'generator-form': createElement({ id: 'generator-form' })
  };

  const document = {
    readyState: 'complete',
    getElementById(id) {
      return elementsById[id];
    },
    addEventListener() {},
    removeEventListener() {}
  };

  const navigator = {
    clipboard: {
      async writeText() {
        throw new Error('Clipboard not implemented');
      }
    }
  };

  const global = {
    document,
    navigator,
    isSecureContext: true,
    crypto: {
      getRandomValues(typedArray) {
        if (typedArray.length === 0) {
          return typedArray;
        }
        typedArray.fill(0);
        return typedArray;
      }
    }
  };

  const generator = createPasswordGenerator(global);
  generator.init();

  return {
    global,
    generator,
    elements: elementsById,
    navigator
  };
}

test('copies the generated password and reports success', async (t) => {
  const env = createTestEnvironment();
  const { elements, navigator } = env;

  const clipboardCalls = [];
  navigator.clipboard.writeText = async (value) => {
    clipboardCalls.push(value);
  };

  await elements.generate.click();

  assert.equal(elements.copy.disabled, false, 'copy button should be enabled after generating');
  assert.notEqual(elements.password.textContent, '', 'password text should be populated');

  await elements.copy.click();

  assert.equal(elements.status.textContent, 'Password copied to clipboard.');
  assert.equal(clipboardCalls.length, 1);
  assert.equal(clipboardCalls[0], elements.password.dataset.value);
});

test('shows the fallback message when clipboard access is rejected', async () => {
  const env = createTestEnvironment();
  const { elements, navigator } = env;

  navigator.clipboard.writeText = async () => {
    throw new Error('clipboard rejected');
  };

  await elements.generate.click();
  await elements.copy.click();

  assert.equal(elements.status.textContent, 'Clipboard unavailable. Copy manually.');
});

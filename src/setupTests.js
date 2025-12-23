// Tentative d'activer jest-dom si présent, sinon fournir un fallback minimal pour les matchers utilisés.
try {
  // eslint-disable-next-line global-require
  require('@testing-library/jest-dom/extend-expect');
} catch (e) {
  // Provide minimal fallback matcher to avoid crashes when jest-dom is not installed
  // We provide toBeInTheDocument which is commonly used by RTL tests in this project.
  // This is intentionally minimal (truthy check).
  // eslint-disable-next-line no-undef
  if (typeof expect !== 'undefined' && typeof expect.extend === 'function') {
    expect.extend({
      toBeInTheDocument(received) {
        const pass = received !== null && received !== undefined;
        return {
          pass,
          message: () =>
            pass
              ? 'Expected element not to be present in the document'
              : 'Expected element to be present in the document',
        };
      },
    });
  }
}

/* Polyfill TextEncoder/TextDecoder required by some node libs (supertest / formidable deps) */
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// Default fetch mock that returns an empty successful JSON result.
// Individual tests may override this with jest.spyOn or by reassigning global.fetch.
const defaultFetchMock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
    text: async () => JSON.stringify({}),
  })
);

// Ensure global.fetch exists (use existing if present, otherwise provide default mock)
if (!global.fetch) {
  global.fetch = defaultFetchMock;
} else if (typeof global.fetch === 'function' && !global.fetch.mock) {
  // wrap existing fetch into a jest mock if needed
  global.fetch = jest.fn(global.fetch);
}

// Reset/clear mocks before each test to avoid cross-test leakage
beforeEach(() => {
  if (global.fetch && typeof global.fetch.mockClear === 'function') {
    global.fetch.mockClear();
  } else {
    global.fetch = defaultFetchMock;
  }
});

// Ensure all mocks are cleared after each test
afterEach(() => {
  jest.clearAllMocks();
});

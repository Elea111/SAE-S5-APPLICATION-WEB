// Setup Jest global mocks/utilities for tests

// Default fetch mock that returns an empty successful JSON result.
// Individual tests may override this with jest.spyOn or by reassigning global.fetch.
const defaultFetchMock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
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

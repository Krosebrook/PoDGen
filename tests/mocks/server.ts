import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server Setup
 * 
 * This sets up a request interception server that runs during tests.
 * It intercepts all network requests and returns mocked responses based on the handlers.
 * 
 * Usage:
 * - Server is automatically started in tests/setup.ts
 * - Individual tests can add custom handlers using server.use()
 * - Handlers are reset after each test
 */
export const server = setupServer(...handlers);

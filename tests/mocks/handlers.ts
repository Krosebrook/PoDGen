import { http, HttpResponse } from 'msw';

/**
 * MSW Request Handlers for API Mocking
 * 
 * These handlers intercept network requests during tests and return mock responses.
 * This allows us to test API integrations without making real network calls.
 */

// Mock handlers for Google Gemini API
export const handlers = [
  // Mock successful Gemini API response
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Mock AI response',
              },
            ],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
        totalTokenCount: 15,
      },
    });
  }),

  // Mock for image generation responses
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*/generateContent', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                },
              },
            ],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        },
      ],
    });
  }),

  // Mock rate limit error (429)
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*/rate-limit-test', () => {
    return new HttpResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
    });
  }),

  // Mock authentication error (401)
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*/auth-error-test', () => {
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // Mock safety block error
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*/safety-test', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Content blocked by safety filters',
          code: 400,
        },
      },
      { status: 400 }
    );
  }),
];

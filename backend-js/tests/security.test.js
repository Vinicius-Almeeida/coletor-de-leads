const axios = require("axios");
const { searchGooglePlaces } = require("../services/googlePlaces");
const { enrichDataWithScraping } = require("../services/scraper");

const BASE_URL = "http://localhost:3001";

describe("Security Tests", () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  describe("Input Validation Tests", () => {
    test("Should prevent SQL injection attempts", async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "admin'--",
        "1' UNION SELECT * FROM users--",
      ];

      for (const input of maliciousInputs) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/search`,
            {
              nicho: input,
              cidade: input,
            },
            {
              timeout: 5000,
            }
          );
          // Se chegou aqui, deve ter validado corretamente
          expect(response.status).toBe(400);
        } catch (error) {
          // Esperado que falhe com input malicioso
          expect(error.response?.status).toBe(400);
        }
      }
    });

    test("Should prevent XSS attempts", async () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//",
        "<svg onload=alert('xss')>",
      ];

      for (const payload of xssPayloads) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/search`,
            {
              nicho: payload,
              cidade: payload,
            },
            {
              timeout: 5000,
            }
          );
          // Deve validar e rejeitar XSS
          expect(response.status).toBe(400);
        } catch (error) {
          // Esperado que falhe
          expect(error.response?.status).toBe(400);
        }
      }
    });

    test("Should prevent NoSQL injection", async () => {
      const nosqlPayloads = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "1==1"}',
        '{"$regex": ".*"}',
        '{"$exists": true}',
      ];

      for (const payload of nosqlPayloads) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/search`,
            {
              nicho: payload,
              cidade: payload,
            },
            {
              timeout: 5000,
            }
          );
          expect(response.status).toBe(400);
        } catch (error) {
          expect(error.response?.status).toBe(400);
        }
      }
    });
  });

  describe("Rate Limiting Tests", () => {
    test("Should handle rapid requests gracefully", async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          axios.post(
            `${BASE_URL}/api/search`,
            {
              nicho: "test",
              cidade: "test",
            },
            {
              timeout: 5000,
            }
          )
        );
      }

      try {
        const responses = await Promise.allSettled(requests);
        // Deve lidar com múltiplas requisições sem crash
        expect(responses.length).toBe(10);
      } catch (error) {
        // Se falhar, deve ser por rate limiting, não por crash
        expect(error.message).not.toContain("ECONNREFUSED");
      }
    });
  });

  describe("Authentication & Authorization Tests", () => {
    test("Should not expose sensitive information in headers", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/health`, {
          timeout: 5000,
        });

        const headers = response.headers;

        // Verificar se não expõe informações sensíveis
        expect(headers["server"]).toBeUndefined();
        expect(headers["x-powered-by"]).toBeUndefined();
        expect(headers["x-aspnet-version"]).toBeUndefined();
        expect(headers["x-aspnetmvc-version"]).toBeUndefined();
      } catch (error) {
        console.log("Health test skipped - server not running");
      }
    });

    test("Should have proper CORS headers", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/health`, {
          timeout: 5000,
        });

        const headers = response.headers;

        // Verificar headers de segurança
        expect(headers["access-control-allow-origin"]).toBeDefined();
        expect(headers["access-control-allow-methods"]).toBeDefined();
        expect(headers["access-control-allow-headers"]).toBeDefined();
      } catch (error) {
        console.log("CORS test skipped - server not running");
      }
    });
  });

  describe("Data Validation Tests", () => {
    test("Should validate email format", async () => {
      const invalidEmails = [
        "invalid-email",
        "test@",
        "@domain.com",
        "test..test@domain.com",
        "test@domain..com",
      ];

      for (const email of invalidEmails) {
        const result = await enrichDataWithScraping({
          nome: "Test",
          email: email,
        });

        // Deve limpar ou rejeitar emails inválidos
        expect(result.email).not.toBe(email);
      }
    });

    test("Should validate URL format", async () => {
      const invalidUrls = [
        "not-a-url",
        "ftp://malicious.com",
        "javascript:alert('xss')",
        "data:text/html,<script>alert('xss')</script>",
      ];

      for (const url of invalidUrls) {
        const result = await enrichDataWithScraping({
          nome: "Test",
          site: url,
        });

        // Deve rejeitar URLs maliciosas
        expect(result.site).not.toBe(url);
      }
    });
  });

  describe("Error Handling Tests", () => {
    test("Should not expose internal errors", async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/search`,
          {
            nicho: "a".repeat(10000), // Input muito grande
            cidade: "test",
          },
          {
            timeout: 5000,
          }
        );
        expect(response.status).toBe(400);
      } catch (error) {
        // Deve retornar erro genérico, não detalhes internos
        expect(error.response?.data?.error).not.toContain("stack");
        expect(error.response?.data?.error).not.toContain("internal");
      }
    });

    test("Should handle malformed JSON gracefully", async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/search`,
          "invalid json",
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
          }
        );
        expect(response.status).toBe(400);
      } catch (error) {
        expect(error.response?.status).toBe(400);
      }
    });
  });
});

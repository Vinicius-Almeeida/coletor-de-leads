const {
  validateInput,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
} = require("../middleware/security");
const { enrichDataWithScraping } = require("../services/scraper");

describe("Security Tests", () => {
  describe("Input Validation Tests", () => {
    test("Should sanitize SQL injection attempts", () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "admin'--",
        "1' UNION SELECT * FROM users--",
      ];

      for (const input of maliciousInputs) {
        const sanitized = sanitizeInput(input);

        // Deve ter sanitizado o input
        expect(sanitized).not.toBe(input);
        expect(sanitized).not.toContain("DROP");
        expect(sanitized).not.toContain("INSERT");
        expect(sanitized).not.toContain("UNION");
      }
    });

    test("Should sanitize XSS attempts", () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//",
        "<svg onload=alert('xss')>",
      ];

      for (const payload of xssPayloads) {
        const sanitized = sanitizeInput(payload);

        // Deve ter removido tags HTML e scripts
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("javascript:");
        expect(sanitized).not.toContain("<img");
        expect(sanitized).not.toContain("<svg");
      }
    });

    test("Should sanitize NoSQL injection", () => {
      const nosqlPayloads = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "1==1"}',
        '{"$regex": ".*"}',
        '{"$exists": true}',
      ];

      for (const payload of nosqlPayloads) {
        const sanitized = sanitizeInput(payload);

        // Deve ter sanitizado o input
        expect(sanitized).not.toContain("$gt");
        expect(sanitized).not.toContain("$where");
        expect(sanitized).not.toContain("$regex");
      }
    });

    test("Should validate input size limits", () => {
      const req = {
        body: {
          nicho: "a".repeat(101), // Muito longo
          cidade: "test",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      validateInput(req, res, next);

      // Deve rejeitar input muito longo
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Nicho muito longo" });
    });
  });

  describe("Data Validation Tests", () => {
    test("Should validate email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      const invalidEmails = [
        "invalid-email",
        "test@",
        "@domain.com",
        "test..test@domain.com",
        "test@domain..com",
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    test("Should validate URL format", () => {
      const validUrls = [
        "https://example.com",
        "http://www.example.org",
        "https://subdomain.example.co.uk",
      ];

      const invalidUrls = [
        "not-a-url",
        "ftp://malicious.com",
        "javascript:alert('xss')",
        "data:text/html,<script>alert('xss')</script>",
      ];

      validUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(true);
      });

      invalidUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe("Middleware Integration Tests", () => {
    test("Should process valid input correctly", () => {
      const req = {
        body: {
          nicho: "restaurante",
          cidade: "São Paulo",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      validateInput(req, res, next);

      // Deve processar input válido
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("Should reject empty input", () => {
      const req = {
        body: {
          nicho: "",
          cidade: "",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      validateInput(req, res, next);

      // Deve rejeitar input vazio
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Scraper Security Tests", () => {
    test("Should handle malicious URLs safely", async () => {
      const maliciousUrls = [
        "javascript:alert('xss')",
        "data:text/html,<script>alert('xss')</script>",
        "ftp://malicious.com",
      ];

      for (const url of maliciousUrls) {
        const result = await enrichDataWithScraping({
          nome: "Test",
          site: url,
        });

        // Deve rejeitar URLs maliciosas
        expect(result.site).not.toBe(url);
      }
    });

    test("Should handle invalid emails safely", async () => {
      const invalidEmails = ["invalid-email", "test@", "@domain.com"];

      for (const email of invalidEmails) {
        const result = await enrichDataWithScraping({
          nome: "Test",
          email: email,
        });

        // Deve limpar emails inválidos
        expect(result.email).not.toBe(email);
      }
    });
  });
});

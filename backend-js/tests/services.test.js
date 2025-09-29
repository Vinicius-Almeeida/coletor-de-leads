/**
 * @jest-environment node
 */

// Mock do Puppeteer para testes
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(),
      goto: jest.fn(),
      waitForTimeout: jest.fn(),
      content: jest.fn().mockResolvedValue(`
        <html>
          <head><title>Example Domain</title></head>
          <body><h1>Example Domain</h1></body>
        </html>
      `),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}));

const { searchGooglePlaces } = require("../services/googlePlaces");
const { enrichDataWithScraping, scraper } = require("../services/scraper");
const { generateExcelFile } = require("../services/excelGenerator");

describe("Services Tests", () => {
  // Aumentar o timeout do Jest para este teste, pois Puppeteer pode ser lento
  jest.setTimeout(30000);

  test("Google Places service should handle errors gracefully", async () => {
    const result = await searchGooglePlaces("", "");
    expect(Array.isArray(result)).toBe(true);
  });

  test("Scraper service with Puppeteer should scrape a valid URL", async () => {
    // Usar um site simples e confiável para o teste
    const result = await scraper("https://example.com/");

    expect(result.success).toBe(true);
    expect(result.title).toBe("Example Domain");
    expect(result.html).toContain("<h1>Example Domain</h1>");
  });

  test("Scraper service should handle invalid URLs gracefully", async () => {
    // Mock para URL inválida
    const puppeteer = require('puppeteer');
    puppeteer.launch.mockRejectedValueOnce(new Error('Connection failed'));

    const result = await scraper("https://invalid-url-that-does-not-exist.com");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("Excel Generator should create buffer", async () => {
    const testData = [
      {
        nome: "Empresa Teste",
        telefone: "(11) 99999-9999",
        email: "teste@empresa.com",
        site: "https://empresa.com",
        endereco: "Rua Teste, 123",
        whatsapp: "11999999999",
      },
    ];

    const buffer = await generateExcelFile(testData, "test");
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  test("Scraper should handle invalid URLs", async () => {
    const testBusiness = {
      nome: "Empresa Teste",
      site: "invalid-url",
    };

    const result = await enrichDataWithScraping(testBusiness);
    expect(result.nome).toBe("Empresa Teste");
  });
});

const { searchGooglePlaces } = require("../services/googlePlaces");
const { enrichDataWithScraping } = require("../services/scraper");
const { generateExcelFile } = require("../services/excelGenerator");

describe("Services Tests", () => {
  test("Google Places service should handle errors gracefully", async () => {
    const result = await searchGooglePlaces("", "");
    expect(Array.isArray(result)).toBe(true);
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

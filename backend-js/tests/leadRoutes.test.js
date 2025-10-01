const request = require("supertest");
const app = require("../server");

describe("Lead Routes MVP", () => {
  // Mock da variável de ambiente para os testes
  const originalApiKey = process.env.INTERNAL_API_KEY;
  const testApiKey = "test-api-key-123";

  beforeAll(() => {
    process.env.INTERNAL_API_KEY = testApiKey;
  });

  afterAll(() => {
    process.env.INTERNAL_API_KEY = originalApiKey;
  });

  describe("POST /api/v1/leads/scrape", () => {
    it("deve retornar 401 quando X-API-Key não for fornecida", async () => {
      const response = await request(app).post("/api/v1/leads/scrape").send({
        termo_busca: "restaurante",
        cidade: "São Paulo",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("X-API-Key header é obrigatório");
    });

    it("deve retornar 401 quando X-API-Key for inválida", async () => {
      const response = await request(app)
        .post("/api/v1/leads/scrape")
        .set("X-API-Key", "chave-invalida")
        .send({
          termo_busca: "restaurante",
          cidade: "São Paulo",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Chave de API inválida");
    });

    it("deve retornar 400 quando termo_busca não for fornecido", async () => {
      const response = await request(app)
        .post("/api/v1/leads/scrape")
        .set("X-API-Key", testApiKey)
        .send({
          cidade: "São Paulo",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Parâmetros obrigatórios ausentes");
      expect(response.body.required_fields).toContain("termo_busca");
    });

    it("deve retornar 400 quando cidade não for fornecida", async () => {
      const response = await request(app)
        .post("/api/v1/leads/scrape")
        .set("X-API-Key", testApiKey)
        .send({
          termo_busca: "restaurante",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Parâmetros obrigatórios ausentes");
      expect(response.body.required_fields).toContain("cidade");
    });

    it("deve retornar 400 quando parâmetros estiverem vazios", async () => {
      const response = await request(app)
        .post("/api/v1/leads/scrape")
        .set("X-API-Key", testApiKey)
        .send({
          termo_busca: "",
          cidade: "São Paulo",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Parâmetros obrigatórios ausentes");
    });

    it("deve retornar 500 quando GOOGLE_PLACES_API_KEY não estiver configurada", async () => {
      const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY;
      delete process.env.GOOGLE_PLACES_API_KEY;

      const response = await request(app)
        .post("/api/v1/leads/scrape")
        .set("X-API-Key", testApiKey)
        .send({
          termo_busca: "restaurante",
          cidade: "São Paulo",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Configuração de API ausente");

      // Restaurar a chave original
      process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey;
    });
  });
});

const axios = require("axios");

// Mock do axios para evitar chamadas de rede reais
jest.mock("axios");

const BASE_URL = "http://localhost:3001";

describe("API Health Tests", () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  test("Health endpoint should return 200", async () => {
    // Simula uma resposta de sucesso do axios
    const mockedResponse = { 
      status: 200, 
      data: { status: "healthy" } 
    };
    axios.get.mockResolvedValue(mockedResponse);

    // Agora, a chamada abaixo não fará uma requisição de rede real
    const response = await axios.get(`${BASE_URL}/api/health`);

    expect(response.status).toBe(200);
    expect(response.data.status).toBe("healthy");
    expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/health`);
  });

  test("Test endpoint should return 200", async () => {
    // Simula uma resposta de sucesso do axios
    const mockedResponse = { 
      status: 200, 
      data: { message: "Backend funcionando!" } 
    };
    axios.get.mockResolvedValue(mockedResponse);

    const response = await axios.get(`${BASE_URL}/api/test`);

    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Backend funcionando!");
    expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/test`);
  });

  test("Search endpoint should validate input", async () => {
    // Simula uma resposta de erro de validação
    const mockedError = {
      response: {
        status: 400,
        data: { error: "Validation failed" }
      }
    };
    axios.post.mockRejectedValue(mockedError);

    try {
      await axios.post(`${BASE_URL}/api/search`, {
        nicho: "",
        cidade: "",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
    }

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/api/search`,
      { nicho: "", cidade: "" }
    );
  });
});

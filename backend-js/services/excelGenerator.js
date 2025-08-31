const ExcelJS = require("exceljs");

/**
 * Gera arquivo Excel com os dados dos leads
 * @param {Array} data - Array de leads
 * @param {string} type - Tipo do arquivo ('leads' ou 'whatsapp_leads')
 * @returns {Buffer} Buffer do arquivo Excel
 */
async function generateExcelFile(data, type = "leads") {
  try {
    console.log(
      `📊 Gerando arquivo Excel: ${type} com ${data.length} registros`
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    // Definir cabeçalhos
    const headers = [
      "Empresa",
      "Telefone",
      "Email",
      "Website",
      "Endereço",
      "WhatsApp",
      "LinkedIn",
      "Facebook",
    ];

    // Adicionar cabeçalhos
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Adicionar dados
    data.forEach((lead) => {
      worksheet.addRow([
        lead.nome || "",
        lead.telefone || "",
        lead.email || "",
        lead.site || "",
        lead.endereco || "",
        lead.whatsapp || "",
        lead.linkedin || "",
        lead.facebook || "",
      ]);
    });

    // Ajustar largura das colunas
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Adicionar bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    console.log(`✅ Arquivo Excel gerado com sucesso: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error("❌ Erro ao gerar arquivo Excel:", error);
    throw error;
  }
}

/**
 * Gera arquivo Excel específico para leads com WhatsApp
 * @param {Array} data - Array de leads com WhatsApp
 * @returns {Buffer} Buffer do arquivo Excel
 */
async function generateWhatsAppExcelFile(data) {
  try {
    console.log(`📊 Gerando arquivo Excel WhatsApp: ${data.length} registros`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("WhatsApp Leads");

    // Definir cabeçalhos específicos para WhatsApp
    const headers = [
      "Empresa",
      "Telefone",
      "WhatsApp",
      "Email",
      "Website",
      "Endereço",
      "Segmento",
    ];

    // Adicionar cabeçalhos
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF25D366" }, // Cor verde do WhatsApp
    };

    // Adicionar dados
    data.forEach((lead) => {
      worksheet.addRow([
        lead.nome || lead.empresa || "",
        lead.telefone || "",
        lead.whatsapp || "",
        lead.email || "",
        lead.site || "",
        lead.endereco || "",
        lead.segmento || "Geral",
      ]);
    });

    // Ajustar largura das colunas
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Adicionar bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    console.log(
      `✅ Arquivo Excel WhatsApp gerado com sucesso: ${buffer.length} bytes`
    );
    return buffer;
  } catch (error) {
    console.error("❌ Erro ao gerar arquivo Excel WhatsApp:", error);
    throw error;
  }
}

module.exports = {
  generateExcelFile,
  generateWhatsAppExcelFile,
};

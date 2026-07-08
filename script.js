let planilha = [];
let inventario = [];
let colunaID = null;

const tabela = document.querySelector("#tabela tbody");
const contador = document.querySelector("#contador");
const statusUpload = document.querySelector("#statusUpload");

document.querySelector("#upload").addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    statusUpload.textContent = "Nenhum arquivo selecionado.";
    return;
  }

  const reader = new FileReader();

  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      planilha = XLSX.utils.sheet_to_json(sheet);

      if (planilha.length === 0) {
        statusUpload.textContent = "⚠️ Planilha vazia ou formato inválido.";
        return;
      }

      planilha = planilha.map(row => {
        const novo = {};
        for (let chave in row) {
          novo[chave.trim().toLowerCase()] = row[chave];
        }
        return novo;
      });

      const colunas = Object.keys(planilha[0]);
      colunaID = colunas.find(c =>
        c.includes("id") || c.includes("codigo") || c.includes("código") || c.includes("item") || c.includes("sap")
      );

      if (!colunaID) {
        statusUpload.textContent = "⚠️ Nenhuma coluna de ID encontrada.";
        return;
      }

      statusUpload.textContent = `✅ Planilha carregada: ${file.name} (${planilha.length} linhas) | Coluna de ID detectada: ${colunaID}`;
      console.log("Colunas detectadas:", colunas);
    } catch (error) {
      statusUpload.textContent = "❌ Erro ao ler a planilha. Verifique o formato do arquivo.";
      console.error(error);
    }
  };

  reader.onerror = () => {
    statusUpload.textContent = "❌ Erro ao carregar o arquivo.";
  };

  reader.readAsArrayBuffer(file);
}

document.querySelector("#adicionar").addEventListener("click", () => {
  if (planilha.length === 0) {
    alert("⚠️ Carregue uma planilha antes de pesquisar.");
    return;
  }

  const idsInput = document.querySelector("#ids").value;
  const categoria = document.querySelector("input[name='categoria']:checked").value;

  // ✅ aceita vírgula, espaço e quebra de linha
  const ids = idsInput
    .split(/[\s,]+/)
    .map(i => i.trim())
    .filter(i => i);

  let encontrados = [];

  planilha.forEach(row => {
    const valor = row[colunaID];
    if (valor === undefined || valor === null) return;

    const valorStr = String(valor).trim();
    const valorNum = Number(valor);

    if (ids.includes(valorStr) || ids.includes(String(valorNum))) {
      row.categoria = categoria;
      if (!inventario.some(item => String(item[colunaID]).trim() === valorStr)) {
        inventario.push(row);
        encontrados.push(row);
      }
    }
  });

  if (encontrados.length > 0) {
    atualizarTabela();
    document.querySelector("#ids").value = "";
    alert(`✅ ${encontrados.length} IDs adicionados ao inventário.`);
  } else {
    alert("❌ Nenhum dos IDs informados foi encontrado na planilha.");
  }
});

document.querySelector("#limpar").addEventListener("click", () => {
  inventario = [];
  atualizarTabela();
});

document.querySelector("#baixar").addEventListener("click", () => {
  const ws = XLSX.utils.json_to_sheet(inventario);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventário");
  XLSX.writeFile(wb, "inventario.xlsx");
});

function atualizarTabela() {
  tabela.innerHTML = "";
  inventario.forEach((item, index) => {
    const row = `<tr>
      <td>${item[colunaID] || ""}</td>
      <td>${item["código"] || item["codigo"] || ""}</td>
      <td>${item["descrição"] || ""}</td>
      <td>${item["referência uso"] || ""}</td>
      <td>${item["os fabricante"] || ""}</td>
      <td>${item["status garantia"] || ""}</td>
      <td>${item["status peça garantia"] || ""}</td>
      <td>${item["recebimento upc"] || ""}</td>
      <td>${item["modelo principal"] || ""}</td>
      <td>${item.categoria}</td>
      <td><button onclick="remover(${index})">Remover</button></td>
    </tr>`;
    tabela.insertAdjacentHTML("beforeend", row);
  });
  contador.textContent = `Total de itens: ${inventario.length} | IN HOME: ${invent

let planilha = [];
let inventario = [];
let colunaID = null;

const tabela = document.querySelector("#tabela tbody");
const contador = document.querySelector("#contador");
const statusUpload = document.querySelector("#statusUpload");

document.querySelector("#upload").addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    planilha = XLSX.utils.sheet_to_json(sheet);

    // Normaliza nomes das colunas
    planilha = planilha.map(row => {
      const novo = {};
      for (let chave in row) {
        novo[chave.trim().toLowerCase()] = row[chave];
      }
      return novo;
    });

    // Detecta automaticamente a coluna de ID
    const colunas = Object.keys(planilha[0]);
    colunaID = colunas.find(c =>
      c.includes("id") ||
      c.includes("código") ||
      c.includes("codigo") ||
      c.includes("item") ||
      c.includes("sap")
    );

    if (!colunaID) {
      alert("⚠️ Nenhuma coluna de ID encontrada na planilha. Verifique os nomes das colunas.");
      return;
    }

    statusUpload.textContent = `✅ Planilha carregada: ${file.name} (${planilha.length} linhas) | Coluna de ID detectada: ${colunaID}`;
    console.log("Colunas detectadas:", colunas);
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
  const ids = idsInput.replace(/,/g, " ").split(" ").map(i => i.trim()).filter(i => i);

  let encontrados = [];

  ids.forEach(id => {
    const idNum = Number(id); // converte para número
    const resultado = planilha.find(row => {
      const valor = Number(row[colunaID]);
      return valor === idNum;
    });

    if (resultado) {
      resultado.categoria = categoria;
      if (!inventario.some(item => Number(item[colunaID]) === idNum)) {
        inventario.push(resultado);
        encontrados.push(resultado);
      }
    } else {
      alert(`❌ ID ${id} não encontrado na planilha.`);
    }
  });

  if (encontrados.length > 0) {
    atualizarTabela();
    document.querySelector("#ids").value = "";
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
  contador.textContent = `Total de itens: ${inventario.length} | IN HOME: ${inventario.filter(i => i.categoria === "IN HOME").length} | LABORATÓRIO: ${inventario.filter(i => i.categoria === "LABORATÓRIO").length}`;
}

function remover(index) {
  inventario.splice(index, 1);
  atualizarTabela();
}

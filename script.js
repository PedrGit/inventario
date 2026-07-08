let planilha = [];
let inventario = [];

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
    statusUpload.textContent = `✅ Planilha carregada: ${file.name} (${planilha.length} linhas)`;
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
    const resultado = planilha.find(row => String(row.ID) === id);
    if (resultado) {
      resultado.Categoria = categoria;
      if (!inventario.some(item => item.ID === resultado.ID)) {
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
      <td>${item.ID}</td>
      <td>${item.Código || ""}</td>
      <td>${item.Descrição || ""}</td>
      <td>${item["Referência Uso"] || ""}</td>
      <td>${item["OS Fabricante"] || ""}</td>
      <td>${item["Status garantia"] || ""}</td>
      <td>${item["Status peça garantia"] || ""}</td>
      <td>${item["Recebimento UPC"] || ""}</td>
      <td>${item["Modelo Principal"] || ""}</td>
      <td>${item.Categoria}</td>
      <td><button onclick="remover(${index})">Remover</button></td>
    </tr>`;
    tabela.insertAdjacentHTML("beforeend", row);
  });
  contador.textContent = `Total de itens: ${inventario.length} | IN HOME: ${inventario.filter(i => i.Categoria === "IN HOME").length} | LABORATÓRIO: ${inventario.filter(i => i.Categoria === "LABORATÓRIO").length}`;
}

function remover(index) {
  inventario.splice(index, 1);
  atualizarTabela();
}

const tabela = document.querySelector("#tabela tbody");
const contador = document.querySelector("#contador");
let inventario = [];

document.querySelector("#adicionar").addEventListener("click", () => {
  const idsInput = document.querySelector("#ids").value;
  const categoria = document.querySelector("input[name='categoria']:checked").value;
  const ids = idsInput.replace(/,/g, " ").split(" ").map(i => i.trim()).filter(i => i);

  ids.forEach(id => {
    if (!inventario.some(item => item.id === id)) {
      inventario.push({ id, categoria, descricao: "Item genérico" });
    }
  });

  atualizarTabela();
  document.querySelector("#ids").value = "";
});

document.querySelector("#limpar").addEventListener("click", () => {
  inventario = [];
  atualizarTabela();
});

document.querySelector("#baixar").addEventListener("click", () => {
  const csv = inventario.map(i => `${i.id},${i.categoria},${i.descricao}`).join("\n");
  const blob = new Blob(["ID,Categoria,Descrição\n" + csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.csv";
  a.click();
});

function atualizarTabela() {
  tabela.innerHTML = "";
  inventario.forEach(item => {
    const row = `<tr><td>${item.id}</td><td>${item.categoria}</td><td>${item.descricao}</td></tr>`;
    tabela.insertAdjacentHTML("beforeend", row);
  });
  contador.textContent = `Total de itens: ${inventario.length}`;
}

document.querySelector("#adicionar").addEventListener("click", () => {
  if (planilha.length === 0) {
    alert("⚠️ Carregue uma planilha antes de pesquisar.");
    return;
  }

  const idsInput = document.querySelector("#ids").value;
  const categoria = document.querySelector("input[name='categoria']:checked").value;

  // Agora divide por vírgula, espaço OU quebra de linha
  const ids = idsInput
    .split(/[\s,]+/)   // separa por espaço, vírgula ou \n
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

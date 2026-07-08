document.querySelector("#adicionar").addEventListener("click", () => {
  if (planilha.length === 0) {
    alert("⚠️ Carregue uma planilha antes de pesquisar.");
    return;
  }

  const idsInput = document.querySelector("#ids").value;
  const categoria = document.querySelector("input[name='categoria']:checked").value;
  const ids = idsInput.replace(/,/g, " ").split(" ").map(i => i.trim()).filter(i => i);

  let encontrados = [];

  // Busca todos os IDs de uma vez
  const resultados = planilha.filter(row => {
    const valor = row[colunaID];
    if (valor === undefined || valor === null) return false;

    const valorStr = String(valor).trim();
    const valorNum = Number(valor);

    // Retorna verdadeiro se o valor estiver na lista de IDs (como texto ou número)
    return ids.includes(valorStr) || ids.includes(String(valorNum));
  });

  if (resultados.length > 0) {
    resultados.forEach(r => {
      r.categoria = categoria;
      if (!inventario.some(item => String(item[colunaID]).trim() === String(r[colunaID]).trim())) {
        inventario.push(r);
        encontrados.push(r);
      }
    });

    atualizarTabela();
    document.querySelector("#ids").value = "";
    alert(`✅ ${encontrados.length} IDs adicionados ao inventário.`);
  } else {
    alert("❌ Nenhum dos IDs informados foi encontrado na planilha.");
  }
});

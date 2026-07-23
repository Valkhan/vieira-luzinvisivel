(() => {
  const grid = document.getElementById('destaques-grid');
  if (!grid) return;

  const itens = PORTFOLIO_DATA.galeria
    .filter((item) => item.destaque)
    .sort((a, b) => a.ordem - b.ordem)
    .slice(0, 6);

  /* Padrão de layout: 2 cards grandes na primeira linha, 3 na segunda */
  const tamanhos = ['lg', 'lg', 'sm', 'sm', 'sm', 'sm'];

  itens.forEach((item, i) => {
    const isSm = tamanhos[i] === 'sm';

    const card = document.createElement('div');
    card.className = 'destaque-card' + (isSm ? ' destaque-card--sm' : '');
    card.innerHTML = `
      <div class="destaque-card-media">
        <img src="${item.imagem}" alt="${item.titulo}">
        <span class="destaque-card-label">Destaque${i + 1}</span>
      </div>
      <div class="destaque-card-caption">
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
      </div>
    `;

    grid.appendChild(card);
  });
})();

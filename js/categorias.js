(() => {
  const list = document.getElementById('categorias-list');
  if (!list) return;

  function galeriaPorCategoria(categoriaId) {
    return PORTFOLIO_DATA.galeria
      .filter((item) => item.categoria_id === categoriaId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  PORTFOLIO_DATA.categorias.forEach((categoria) => {
    const itens = galeriaPorCategoria(categoria.id);

    const wrapper = document.createElement('div');
    wrapper.className = 'categoria-item';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'categoria-item-header';
    header.innerHTML = `<span>${categoria.nome}</span><span class="close-icon">&times;</span>`;

    const panel = document.createElement('div');
    panel.className = 'categoria-item-panel';

    const gallery = document.createElement('div');
    gallery.className = 'categoria-item-gallery';

    if (itens.length) {
      itens.forEach((item) => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
          <img src="${item.imagem}" alt="${item.titulo}">
          <figcaption>${item.descricao}</figcaption>
        `;
        gallery.appendChild(figure);
      });
    } else {
      const em = document.createElement('p');
      em.style.color = '#888';
      em.style.padding = '1rem 0 2rem';
      em.textContent = 'Em breve.';
      gallery.appendChild(em);
    }

    panel.appendChild(gallery);

    header.addEventListener('click', () => {
      const jaAtivo = wrapper.classList.contains('active');

      list.querySelectorAll('.categoria-item.active').forEach((el) => {
        el.classList.remove('active');
      });

      if (!jaAtivo) {
        wrapper.classList.add('active');
      }
    });

    wrapper.appendChild(header);
    wrapper.appendChild(panel);
    list.appendChild(wrapper);
  });
})();

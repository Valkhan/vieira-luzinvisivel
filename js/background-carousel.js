/* Carrossel de fundo genérico: fila embaralhada (Fisher-Yates) + crossfade + object-position aleatório */
function criarCarrosselDeFundo({ container, imagens, intervalo = 3000 }) {
  function embaralhar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let fila = embaralhar(imagens);
  let cursor = 0;

  function proximaImagem() {
    if (cursor >= fila.length) {
      fila = embaralhar(imagens);
      cursor = 0;
    }
    return fila[cursor++];
  }

  const posicoes = [
    '15% 15%', '50% 15%', '85% 15%',
    '15% 50%', '50% 50%', '85% 50%',
    '15% 85%', '50% 85%', '85% 85%',
  ];

  function posAleatoria() {
    return posicoes[Math.floor(Math.random() * posicoes.length)];
  }

  const slides = container.querySelectorAll('.slide');

  slides.forEach(slide => {
    const img = slide.querySelector('img');
    img.src = proximaImagem();
    img.style.objectPosition = posAleatoria();
  });

  let atual = 0;

  setTimeout(() => {
    slides[atual].classList.add('active');

    setInterval(() => {
      const anterior = atual;
      slides[anterior].classList.remove('active');
      atual = (atual + 1) % slides.length;
      slides[atual].querySelector('img').style.objectPosition = posAleatoria();
      slides[atual].classList.add('active');

      setTimeout(() => {
        const img = slides[anterior].querySelector('img');
        img.src = proximaImagem();
        img.style.objectPosition = posAleatoria();
      }, 1500);
    }, intervalo);
  }, 300);
}

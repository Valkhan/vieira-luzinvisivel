(() => {
  const hero = document.getElementById('hero');
  const video = document.getElementById('hero-video');
  const playButton = document.getElementById('play-button');
  const logoWrapper = document.getElementById('logo-wrapper');
  const heroLogo = document.getElementById('hero-logo');

  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  let logoRevelada = false;

  function iniciarReproducao() {
    video.play();
    hero.classList.add('is-playing');
  }

  /*
   * Alguns navegadores mobile não repintam o <video> ao buscar (seek) um
   * novo tempo enquanto ele está pausado — o quadro antigo (já preto,
   * perto do fim do arquivo) fica "congelado" na tela. Dar um play/pause
   * rápido força a decodificação e o repaint do quadro correto.
   */
  function voltarAoFrameInicial() {
    video.pause();
    video.currentTime = 0;
    video.play()
      .then(() => video.pause())
      .catch(() => {});
  }

  video.play()
    .then(() => hero.classList.add('is-playing'))
    .catch(() => {
      playButton.classList.add('visible');
    });

  playButton.addEventListener('click', () => {
    iniciarReproducao();
    playButton.classList.remove('visible');
  });

  video.addEventListener('timeupdate', () => {
    if (logoRevelada) return;

    if (isTouchDevice) {
      // Mobile: ao chegar em 00:50, volta ao primeiro frame (esmaecido) com a logo sobreposta.
      if (video.currentTime >= 50) {
        logoRevelada = true;
        voltarAoFrameInicial();
        video.classList.add('video-dimmed');
        hero.classList.remove('is-playing');
        logoWrapper.classList.add('visible');
      }
      return;
    }

    // Desktop: aos 47s a logo aparece sobreposta e o vídeo segue tocando até o fim.
    if (video.currentTime >= 47) {
      logoRevelada = true;
      logoWrapper.classList.add('visible');
    }
  });

  heroLogo.addEventListener('click', () => {
    logoWrapper.classList.remove('visible');
    video.classList.remove('video-dimmed');
    logoRevelada = false;

    video.currentTime = 0;
    iniciarReproducao();
  });
})();

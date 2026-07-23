(() => {
  const hero = document.getElementById('hero');
  const video = document.getElementById('hero-video');
  const playButton = document.getElementById('play-button');
  const logoWrapper = document.getElementById('logo-wrapper');
  const heroLogo = document.getElementById('hero-logo');

  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const FRAME_INICIAL = 1; // 00:01 — frame em que a vaca aparece (00:00 não serve)

  let logoFadeIniciada = false;
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
    video.currentTime = FRAME_INICIAL;
    video.play()
      .then(() => video.pause())
      .catch(() => {});
  }

  function definirFrameInicialEstatico() {
    if (video.readyState >= 1) {
      video.currentTime = FRAME_INICIAL;
    } else {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = FRAME_INICIAL;
      }, { once: true });
    }
  }

  definirFrameInicialEstatico();

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
    if (isTouchDevice) {
      // Mobile: o fade-in da logo começa aos 00:48, ainda com o vídeo tocando...
      if (!logoFadeIniciada && video.currentTime >= 48) {
        logoFadeIniciada = true;
        logoWrapper.classList.add('visible');
      }

      // ...e aos 00:50 o vídeo pausa e volta ao primeiro frame (esmaecido).
      if (!logoRevelada && video.currentTime >= 50) {
        logoRevelada = true;
        voltarAoFrameInicial();
        video.classList.add('video-dimmed');
        hero.classList.remove('is-playing');
      }
      return;
    }

    // Desktop: aos 47s a logo aparece sobreposta e o vídeo segue tocando até o fim.
    if (!logoRevelada && video.currentTime >= 47) {
      logoRevelada = true;
      logoWrapper.classList.add('visible');
    }
  });

  heroLogo.addEventListener('click', () => {
    logoWrapper.classList.remove('visible');
    video.classList.remove('video-dimmed');
    logoFadeIniciada = false;
    logoRevelada = false;

    video.currentTime = FRAME_INICIAL;
    iniciarReproducao();
  });
})();

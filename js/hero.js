(() => {
  const video = document.getElementById('hero-video');
  const playButton = document.getElementById('play-button');
  const logoWrapper = document.getElementById('logo-wrapper');
  const heroLogo = document.getElementById('hero-logo');

  let logoRevelada = false;

  video.play().catch(() => {
    playButton.classList.add('visible');
  });

  playButton.addEventListener('click', () => {
    video.play();
    playButton.classList.remove('visible');
  });

  video.addEventListener('timeupdate', () => {
    if (!logoRevelada && video.currentTime >= 47) {
      logoRevelada = true;
      logoWrapper.classList.add('visible');
    }
  });

  heroLogo.addEventListener('click', () => {
    video.currentTime = 0;
    video.play();
  });
})();

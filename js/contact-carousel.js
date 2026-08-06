(() => {
  const imagens = [
    'img/fundos/a_luz_invisivel_etereo_01.jpg',
    'img/fundos/a_luz_invisivel_etereo_02.jpg',
    'img/fundos/a_luz_invisivel_etereo_03.jpg',
    'img/fundos/a_luz_invisivel_mineral_01.jpg',
    'img/fundos/a_luz_invisivel_mineral_02.jpg',
    'img/fundos/a_luz_invisivel_mineral_03.jpg',
    'img/fundos/a_luz_invisivel_pele_01.jpg',
    'img/fundos/a_luz_invisivel_pele_02.jpg',
    'img/fundos/a_luz_invisivel_pele_03.jpg',
  ];

  criarCarrosselDeFundo({
    container: document.getElementById('contato-carousel'),
    imagens,
    intervalo: 3000,
  });
})();

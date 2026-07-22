(() => {
  const imagens = [
    'img/fundos/ali_tapume_etereo_01.jpg',
    'img/fundos/ali_tapume_etereo_02.jpg',
    'img/fundos/ali_tapume_etereo_03.jpg',
    'img/fundos/ali_tapume_mineral_01.jpg',
    'img/fundos/ali_tapume_mineral_02.jpg',
    'img/fundos/ali_tapume_mineral_03.jpg',
    'img/fundos/ali_tapume_pele_01.jpg',
    'img/fundos/ali_tapume_pele_02.jpg',
    'img/fundos/ali_tapume_pele_03.jpg',
  ];

  criarCarrosselDeFundo({
    container: document.getElementById('contato-carousel'),
    imagens,
    intervalo: 3000,
  });
})();

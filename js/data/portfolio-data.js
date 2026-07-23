/*
 * Dados de exemplo (mock) do portfólio.
 * Espelham os campos das tabelas `categorias` e `galeria` em /dev/banco/.
 * Quando a API PHP existir, este arquivo é substituído por um fetch real.
 */
const PORTFOLIO_DATA = {
  categorias: [
    { id: 1, nome: 'Scenes', slug: 'scenes' },
    { id: 2, nome: 'Films', slug: 'films' },
    { id: 3, nome: 'Set Design', slug: 'set-design' },
    { id: 4, nome: 'Photography', slug: 'photography' },
    { id: 5, nome: 'Avatars', slug: 'avatars' },
    { id: 6, nome: 'Music Videos', slug: 'music-videos' },
    { id: 7, nome: 'Fashion', slug: 'fashion' },
    { id: 8, nome: 'Architecture', slug: 'architecture' },
    { id: 9, nome: 'Games', slug: 'games' },
    { id: 10, nome: 'Virtual Worlds', slug: 'virtual-worlds' },
  ],

  galeria: [
    {
      id: 1,
      categoria_id: 5,
      titulo: 'Aliquam Nec Mauris',
      descricao: 'Pellentesque nunc tellus, euismod a accumsan nec, iaculis non ligula. Praesent dictum, ante in pulvinar molestie, mi orci posuere tellus.',
      imagem: 'img/fundos/ali_tapume_pele_01.jpg',
      destaque: true,
      ordem: 1,
    },
    {
      id: 2,
      categoria_id: 5,
      titulo: 'Ultrices Commodo Et',
      descricao: 'Nulla facilisi. Aliquam eget posuere leo. Etiam enim urna, egestas vitae quam rutrum, lacinia lacinia diam. Aliquam eu tristique sem.',
      imagem: 'img/fundos/ali_tapume_pele_02.jpg',
      destaque: true,
      ordem: 2,
    },
    {
      id: 3,
      categoria_id: 5,
      titulo: 'Donec Id Tortor',
      descricao: 'Donec id tortor et lectus venenatis egestas. Vivamus feugiat, mi eu aliquet congue, lectus massa interdum nisi, a suscipit leo tortor sed sapiente.',
      imagem: 'img/fundos/ali_tapume_pele_03.jpg',
      destaque: true,
      ordem: 3,
    },
    {
      id: 4,
      categoria_id: 1,
      titulo: 'Aliquam Nec Mauris',
      descricao: 'Ectus eleifend tempor vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.',
      imagem: 'img/fundos/ali_tapume_etereo_01.jpg',
      destaque: true,
      ordem: 1,
    },
    {
      id: 5,
      categoria_id: 2,
      titulo: 'Ultrices Commodo Et',
      descricao: 'Curae integer leo eros comm condimentum suscipit varius tincidunt et elit sed quis elit.',
      imagem: 'img/fundos/ali_tapume_etereo_02.jpg',
      destaque: true,
      ordem: 1,
    },
    {
      id: 6,
      categoria_id: 3,
      titulo: 'Aliquam Nec Mauris',
      descricao: 'Ectus eleifend tempor vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.',
      imagem: 'img/fundos/ali_tapume_mineral_01.jpg',
      destaque: true,
      ordem: 1,
    },
    {
      id: 7,
      categoria_id: 4,
      titulo: 'Ultrices Commodo Et',
      descricao: 'Curae integer leo eros comm condimentum suscipit varius tincidunt et elit sed quis elit.',
      imagem: 'img/fundos/ali_tapume_mineral_02.jpg',
      destaque: true,
      ordem: 1,
    },
    {
      id: 8,
      categoria_id: 4,
      titulo: 'Aliquam Nec Mauris',
      descricao: 'Ectus eleifend tempor vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.',
      imagem: 'img/fundos/ali_tapume_mineral_03.jpg',
      destaque: true,
      ordem: 2,
    },
  ],
};

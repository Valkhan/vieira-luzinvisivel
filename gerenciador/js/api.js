/*
 * Camada de API do /gerenciador/.
 * Hoje persiste em localStorage com a MESMA forma de dados das tabelas
 * em /dev/banco/ (id, sys_cri, sys_alt, sys_del). Quando as rotas PHP
 * existirem (auth por sessão), basta trocar os métodos abaixo por
 * fetch('/gerenciador/api/...', { credentials: 'include' }).
 */
const Api = (() => {
  const STORAGE_KEY = 'gerenciador_db_v1';

  function nowIso() {
    return new Date().toISOString();
  }

  /*
   * Mesma regra do backend (php/inc/slugify.php): minúsculo, sem acentos,
   * espaços/símbolos viram "-". Mantido em espelho aqui porque a criação
   * de categorias ainda é mockada em localStorage.
   */
  function slugify(texto) {
    const semAcentos = (texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    const slug = semAcentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'item';
  }

  function seed() {
    return {
      usuarios: [
        {
          id: 1,
          nome: 'Administrador',
          email: 'admin@luzinvisivel.com',
          senha: 'mudar123', // demo apenas — produção usa senha_hash + PHP
          ativo: 1,
          sys_cri: nowIso(),
          sys_alt: nowIso(),
          sys_del: null,
        },
      ],
      categorias: (window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA.categorias : []).map((c) => ({
        ...c,
        ordem: c.id,
        sys_cri: nowIso(),
        sys_alt: nowIso(),
        sys_del: null,
      })),
      galeria: (window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA.galeria : []).map((g) => ({
        ...g,
        sys_cri: nowIso(),
        sys_alt: nowIso(),
        sys_del: null,
      })),
    };
  }

  function readDb() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  }

  function writeDb(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function nextId(rows) {
    return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }

  function list(table) {
    const db = readDb();
    return db[table].filter((r) => !r.sys_del);
  }

  function create(table, data) {
    const db = readDb();
    if (table === 'categorias') {
      data = { ...data, slug: slugify(data.nome) };
    }
    const row = {
      ...data,
      id: nextId(db[table]),
      sys_cri: nowIso(),
      sys_alt: nowIso(),
      sys_del: null,
    };
    db[table].push(row);
    writeDb(db);
    return row;
  }

  function update(table, id, data) {
    const db = readDb();
    const row = db[table].find((r) => r.id === id);
    if (!row) throw new Error('Registro não encontrado.');
    if (table === 'categorias' && data.nome) {
      data = { ...data, slug: slugify(data.nome) };
    }
    Object.assign(row, data, { sys_alt: nowIso() });
    writeDb(db);
    return row;
  }

  function uploadImagemGaleria(galeriaId, file, { categoriaSlug, titulo }) {
    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('galeria_id', galeriaId);
    formData.append('categoria_slug', categoriaSlug);
    formData.append('titulo', titulo);

    return fetch('../php/gerenciador/upload-imagem.php', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message || 'Falha no upload.');
        return json.path;
      });
  }

  function remove(table, id) {
    const db = readDb();
    const row = db[table].find((r) => r.id === id);
    if (!row) throw new Error('Registro não encontrado.');
    row.sys_del = nowIso();
    writeDb(db);
  }

  function login(email, senha) {
    const db = readDb();
    const usuario = db.usuarios.find((u) => u.email === email && !u.sys_del);
    if (!usuario || usuario.senha !== senha || !usuario.ativo) {
      throw new Error('E-mail ou senha inválidos.');
    }
    sessionStorage.setItem('gerenciador_auth', JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email }));
    return usuario;
  }

  function logout() {
    sessionStorage.removeItem('gerenciador_auth');
  }

  function currentUser() {
    const raw = sessionStorage.getItem('gerenciador_auth');
    return raw ? JSON.parse(raw) : null;
  }

  /*
   * Recuperação de senha — hoje mockada em localStorage.
   * Quando existir php/gerenciador/esqueci-senha.php + Resend, troque por
   * fetch() real: o token deixa de ser exposto no retorno e passa a ir
   * apenas no corpo do e-mail.
   */
  function gerarToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function requestPasswordReset(email) {
    const db = readDb();
    const usuario = db.usuarios.find((u) => u.email === email && !u.sys_del && u.ativo);

    // Não revela se o e-mail existe ou não (mesmo comportamento da futura API).
    if (!usuario) return { enviado: true };

    const token = gerarToken();
    const expiraEm = Date.now() + 60 * 60 * 1000; // 1h
    const resets = JSON.parse(localStorage.getItem('gerenciador_resets') || '{}');
    resets[token] = { usuarioId: usuario.id, expiraEm };
    localStorage.setItem('gerenciador_resets', JSON.stringify(resets));

    // Placeholder do envio de e-mail (futuro: php/gerenciador/esqueci-senha.php via Resend).
    return { enviado: true, token };
  }

  function resetPassword(token, novaSenha) {
    const resets = JSON.parse(localStorage.getItem('gerenciador_resets') || '{}');
    const entry = resets[token];
    if (!entry || entry.expiraEm < Date.now()) {
      throw new Error('Link inválido ou expirado.');
    }

    update('usuarios', entry.usuarioId, { senha: novaSenha });

    delete resets[token];
    localStorage.setItem('gerenciador_resets', JSON.stringify(resets));
  }

  return {
    list, create, update, remove,
    login, logout, currentUser,
    requestPasswordReset, resetPassword,
    slugify, uploadImagemGaleria,
  };
})();

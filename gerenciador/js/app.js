const { useState, useEffect } = React;
const h = React.createElement;

function useAuthGuard() {
  useEffect(() => {
    if (!Api.currentUser()) {
      window.location.href = 'index.html';
    }
  }, []);
}

function Modal({ title, onClose, wide, children }) {
  return h(
    'div',
    { className: 'modal-backdrop', onClick: (e) => e.target === e.currentTarget && onClose() },
    h('div', { className: 'modal-box' + (wide ? ' modal-box--wide' : '') }, h('h3', null, title), children)
  );
}

/* ─── CATEGORIAS ─── */
function CategoriasPanel() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // null = fechado, {} = novo, {...} = edição
  const [slugPreview, setSlugPreview] = useState('');

  function reload() {
    setRows(Api.list('categorias').sort((a, b) => a.ordem - b.ordem));
  }

  useEffect(reload, []);

  useEffect(() => {
    if (editing) {
      setSlugPreview(Api.slugify(editing.nome || ''));
    }
  }, [editing]);

  function handleSave(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      nome: form.nome.value.trim(),
      ordem: Number(form.ordem.value) || 0,
    };
    if (editing.id) {
      Api.update('categorias', editing.id, data);
    } else {
      Api.create('categorias', data);
    }
    setEditing(null);
    reload();
  }

  function handleDelete(id) {
    if (!confirm('Remover esta categoria?')) return;
    Api.remove('categorias', id);
    reload();
  }

  return h('div', null,
    h('div', { className: 'panel-header' },
      h('h2', null, 'Categorias'),
      h('button', { className: 'btn', onClick: () => setEditing({}) }, 'Nova categoria')
    ),

    h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Ordem'), h('th', null, 'Nome'), h('th', null, 'Slug'), h('th', null))),
      h('tbody', null, rows.map((r) => h('tr', { key: r.id },
        h('td', null, r.ordem),
        h('td', null, r.nome),
        h('td', null, r.slug),
        h('td', null, h('div', { className: 'row-actions' },
          h('button', { onClick: () => setEditing(r) }, 'Editar'),
          h('button', { onClick: () => handleDelete(r.id) }, 'Excluir')
        ))
      )))
    ),

    editing && h(Modal, {
      title: editing.id ? 'Editar categoria' : 'Nova categoria',
      onClose: () => setEditing(null),
    },
      h('form', { onSubmit: handleSave },
        h('label', { className: 'field-label' }, 'Nome'),
        h('input', {
          name: 'nome',
          defaultValue: editing.nome,
          required: true,
          onChange: (e) => setSlugPreview(Api.slugify(e.target.value)),
        }),

        h('label', { className: 'field-label' }, 'Slug (gerado automaticamente)'),
        h('input', { value: slugPreview, disabled: true }),

        h('label', { className: 'field-label' }, 'Ordem'),
        h('input', { name: 'ordem', type: 'number', defaultValue: editing.ordem || 0 }),

        h('div', { className: 'modal-actions' },
          h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setEditing(null) }, 'Cancelar'),
          h('button', { type: 'submit', className: 'btn' }, 'Salvar')
        )
      )
    )
  );
}

/* ─── GALERIA ─── */
function GaleriaPanel() {
  const [rows, setRows] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [saveError, setSaveError] = useState('');

  function reload() {
    setRows(Api.list('galeria').sort((a, b) => a.ordem - b.ordem));
    setCategorias(Api.list('categorias'));
  }

  useEffect(reload, []);

  useEffect(() => {
    if (editing) {
      setFile(null);
      setSaveError('');
      setOptimizing(false);
      setPreviewUrl(editing.imagem ? '../' + editing.imagem : null);
    }
  }, [editing]);

  function nomeCategoria(id) {
    const c = categorias.find((cat) => cat.id === Number(id));
    return c ? c.nome : '—';
  }

  async function handleFileChange(e) {
    const selecionado = e.target.files[0];
    if (!selecionado) return;

    setSaveError('');
    setOptimizing(true);
    try {
      const otimizado = await otimizarImagem(selecionado, 1080);
      setFile(otimizado);
      setPreviewUrl(URL.createObjectURL(otimizado));
    } catch (err) {
      setSaveError(err.message || 'Falha ao processar a imagem.');
    } finally {
      setOptimizing(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const form = e.target;
    setSaveError('');

    const categoriaId = Number(form.categoria_id.value);
    const categoria = categorias.find((c) => c.id === categoriaId);
    const titulo = form.titulo.value.trim();

    const data = {
      categoria_id: categoriaId,
      titulo,
      descricao: form.descricao.value.trim(),
      destaque: form.destaque.checked ? 1 : 0,
      ordem: Number(form.ordem.value) || 0,
    };

    setSaving(true);
    try {
      let row;
      if (editing.id) {
        row = Api.update('galeria', editing.id, data);
      } else {
        row = Api.create('galeria', { ...data, imagem: '' });
      }

      if (file) {
        const path = await Api.uploadImagemGaleria(row.id, file, {
          categoriaSlug: categoria ? categoria.slug : 'geral',
          titulo,
        });
        Api.update('galeria', row.id, { imagem: path });
      }

      setEditing(null);
      reload();
    } catch (err) {
      setSaveError(err.message || 'Falha ao salvar o item.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id) {
    if (!confirm('Remover este item da galeria?')) return;
    Api.remove('galeria', id);
    reload();
  }

  return h('div', null,
    h('div', { className: 'panel-header' },
      h('h2', null, 'Galeria'),
      h('button', { className: 'btn', onClick: () => setEditing({}) }, 'Novo item')
    ),

    h('table', null,
      h('thead', null, h('tr', null, h('th', null), h('th', null, 'Título'), h('th', null, 'Categoria'), h('th', null, 'Destaque'), h('th', null))),
      h('tbody', null, rows.map((r) => h('tr', { key: r.id },
        h('td', null, h('img', { className: 'thumb', src: r.imagem ? '../' + r.imagem : '../img/logo-branco.svg', alt: '' })),
        h('td', null, r.titulo),
        h('td', null, nomeCategoria(r.categoria_id)),
        h('td', null, h('span', { className: 'badge' + (r.destaque ? ' on' : '') }, r.destaque ? 'Sim' : 'Não')),
        h('td', null, h('div', { className: 'row-actions' },
          h('button', { onClick: () => setEditing(r) }, 'Editar'),
          h('button', { onClick: () => handleDelete(r.id) }, 'Excluir')
        ))
      )))
    ),

    editing && h(Modal, { title: editing.id ? 'Editar item' : 'Novo item', onClose: () => setEditing(null), wide: true },
      h('div', { className: 'modal-split' },
        h('form', { onSubmit: handleSave, id: 'galeria-form' },
          h('label', { className: 'field-label' }, 'Categoria'),
          h('select', { name: 'categoria_id', defaultValue: editing.categoria_id || '', required: true },
            h('option', { value: '', disabled: true }, 'Selecione'),
            categorias.map((c) => h('option', { key: c.id, value: c.id }, c.nome))
          ),

          h('label', { className: 'field-label' }, 'Título'),
          h('input', { name: 'titulo', defaultValue: editing.titulo, required: true }),

          h('label', { className: 'field-label' }, 'Descrição'),
          h('textarea', { name: 'descricao', defaultValue: editing.descricao }),

          h('label', { className: 'field-label' }, 'Imagem (upload)'),
          h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', onChange: handleFileChange, disabled: optimizing }),
          h('p', { className: 'field-hint' }, optimizing
            ? 'Otimizando imagem no navegador…'
            : 'Imagens com largura acima de 1080px são redimensionadas automaticamente no navegador antes do envio.'),

          h('label', { className: 'field-label' }, 'Ordem'),
          h('input', { name: 'ordem', type: 'number', defaultValue: editing.ordem || 0 }),

          h('label', { className: 'checkbox' },
            h('input', { type: 'checkbox', name: 'destaque', defaultChecked: !!editing.destaque }),
            'Exibir em Destaques'
          ),

          saveError && h('p', { className: 'field-error' }, saveError),

          h('div', { className: 'modal-actions' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setEditing(null) }, 'Cancelar'),
            h('button', { type: 'submit', className: 'btn', disabled: saving || optimizing }, saving ? 'Salvando…' : 'Salvar')
          )
        ),

        h('div', { className: 'modal-preview' },
          previewUrl
            ? h('img', { src: previewUrl, alt: '' })
            : h('div', { className: 'modal-preview-placeholder' }, h('img', { src: '../img/logo-branco.svg', alt: '' }))
        )
      )
    )
  );
}

/* ─── USUÁRIOS ─── */
function UsuariosPanel() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  function reload() {
    setRows(Api.list('usuarios'));
  }

  useEffect(reload, []);

  function handleSave(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      ativo: form.ativo.checked ? 1 : 0,
    };
    if (form.senha.value.trim()) {
      data.senha = form.senha.value.trim();
    }
    if (editing.id) {
      Api.update('usuarios', editing.id, data);
    } else {
      if (!form.senha.value.trim()) {
        alert('Informe uma senha para o novo usuário.');
        return;
      }
      Api.create('usuarios', data);
    }
    setEditing(null);
    reload();
  }

  function handleDelete(id) {
    if (!confirm('Remover este usuário?')) return;
    Api.remove('usuarios', id);
    reload();
  }

  return h('div', null,
    h('div', { className: 'panel-header' },
      h('h2', null, 'Usuários'),
      h('button', { className: 'btn', onClick: () => setEditing({}) }, 'Novo usuário')
    ),

    h('table', null,
      h('thead', null, h('tr', null, h('th', null, 'Nome'), h('th', null, 'E-mail'), h('th', null, 'Ativo'), h('th', null))),
      h('tbody', null, rows.map((r) => h('tr', { key: r.id },
        h('td', null, r.nome),
        h('td', null, r.email),
        h('td', null, h('span', { className: 'badge' + (r.ativo ? ' on' : '') }, r.ativo ? 'Sim' : 'Não')),
        h('td', null, h('div', { className: 'row-actions' },
          h('button', { onClick: () => setEditing(r) }, 'Editar'),
          h('button', { onClick: () => handleDelete(r.id) }, 'Excluir')
        ))
      )))
    ),

    editing && h(Modal, { title: editing.id ? 'Editar usuário' : 'Novo usuário', onClose: () => setEditing(null) },
      h('form', { onSubmit: handleSave },
        h('label', { className: 'field-label' }, 'Nome'),
        h('input', { name: 'nome', defaultValue: editing.nome, required: true }),

        h('label', { className: 'field-label' }, 'E-mail'),
        h('input', { name: 'email', type: 'email', defaultValue: editing.email, required: true }),

        h('label', { className: 'field-label' }, `Senha ${editing.id ? '(deixe em branco para manter)' : ''}`),
        h('input', { name: 'senha', type: 'password' }),

        h('label', { className: 'checkbox' },
          h('input', { type: 'checkbox', name: 'ativo', defaultChecked: editing.ativo === undefined ? true : !!editing.ativo }),
          'Usuário ativo'
        ),

        h('div', { className: 'modal-actions' },
          h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setEditing(null) }, 'Cancelar'),
          h('button', { type: 'submit', className: 'btn' }, 'Salvar')
        )
      )
    )
  );
}

function App() {
  useAuthGuard();
  const user = Api.currentUser();
  const [tab, setTab] = useState('categorias');

  function handleLogout() {
    Api.logout();
    window.location.href = 'index.html';
  }

  if (!user) return null;

  return h('div', { className: 'app-shell' },
    h('aside', { className: 'app-sidebar' },
      h('img', { className: 'brand-logo', src: '../img/logo-branco.svg', alt: 'a luz invisível' }),
      h('nav', { className: 'app-nav' },
        h('button', { className: tab === 'categorias' ? 'active' : '', onClick: () => setTab('categorias') }, 'Categorias'),
        h('button', { className: tab === 'galeria' ? 'active' : '', onClick: () => setTab('galeria') }, 'Galeria'),
        h('button', { className: tab === 'usuarios' ? 'active' : '', onClick: () => setTab('usuarios') }, 'Usuários')
      ),
      h('button', { className: 'logout-btn', onClick: handleLogout }, `Sair (${user.nome})`)
    ),

    h('main', { className: 'app-main' },
      tab === 'categorias' && h(CategoriasPanel),
      tab === 'galeria' && h(GaleriaPanel),
      tab === 'usuarios' && h(UsuariosPanel)
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));

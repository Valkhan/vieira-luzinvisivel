(() => {
  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('submit-button');
  const statusEl = document.getElementById('form-status');
  const iconDefault = submitButton.querySelector('.icon-check');
  const spinner = submitButton.querySelector('.spinner');

  function setStatus(mensagem) {
    statusEl.textContent = mensagem || '';
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    iconDefault.style.display = loading ? 'none' : 'block';
    spinner.style.display = loading ? 'block' : 'none';
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();
    const honeypot = form.website.value.trim();

    if (honeypot) {
      return;
    }

    if (!nome) {
      setStatus('Preencha seu nome.');
      return;
    }
    if (!validarEmail(email)) {
      setStatus('Informe um e-mail válido.');
      return;
    }
    if (!mensagem) {
      setStatus('Escreva sua mensagem.');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch('php/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, mensagem }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.message || 'Falha ao enviar.');
      }

      setStatus('Mensagem enviada com sucesso.');
      form.reset();
    } catch (err) {
      setStatus(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  });
})();

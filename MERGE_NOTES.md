# Notas de merge — branch `site` → `site-completo`

Este arquivo documenta o que foi implementado na branch `site` desde o commit
`ad666dc`, para orientar o merge (ou reaplicação manual) na branch
`site-completo`, que já tem seções e funcionalidades adicionais.

## Escopo real das mudanças

Apenas dois arquivos foram alterados nesta branch:

- `css/style.css`
- `js/hero.js`

Nenhum arquivo novo foi criado. Nenhuma seção nova (Destaques, Categorias,
painel `/gerenciador/`, banco de dados etc.) faz parte deste diff — se esse
trabalho existir, ele está em `site-completo` ou precisa ser refeito à parte
(ver seção "Fora do escopo" no final).

Commits relevantes:

```
ad666dc  (base — antes desta branch)
56f31ff  Ajustes de formulário de contato + comportamento touch do hero
6c68717  Cronologia (ajustes finos de timing do vídeo)
```

## O que foi implementado

### 1. `js/hero.js` — comportamento do vídeo do hero

**Frame estático inicial corrigido**
Antes o vídeo pausado mostrava o frame `00:00`. Agora usa uma constante
`FRAME_INICIAL = 1` (00:01), aplicada:
- ao carregar a página (frame estático antes do play);
- ao voltar do loop no mobile;
- ao reiniciar o vídeo via clique na logo.

**Bug corrigido — clique vazando pela logo invisível**
A logo tinha `pointer-events: auto` fixo no CSS, então cliques na área dela
funcionavam mesmo com opacidade 0 (antes de aparecer), reiniciando o vídeo
prematuramente. Corrigido: só fica clicável quando `#logo-wrapper` tem a
classe `.visible`.

**Bug corrigido — logo não escondia ao reiniciar**
Clicar na logo para reiniciar o vídeo não a escondia de volta. Agora o
clique remove a classe `.visible`, tira o dimming (`.video-dimmed`) e
reseta as flags de controle (`logoFadeIniciada`, `logoRevelada`).

**Comportamento mobile novo**
Detecção via `matchMedia('(hover: none) and (pointer: coarse)')` — escolhida
por ser estável em rotação de tela (ao contrário de um breakpoint de
largura, que mudaria em paisagem).

- **00:48** — a logo começa o fade-in (`transition: opacity`), ainda com o
  vídeo tocando.
- **00:50** — o vídeo pausa, volta para o frame estático (00:01) e aplica
  opacidade 50% (classe `.video-dimmed`).
- **Fix de frame preto "congelado"**: em alguns navegadores mobile, pausar
  + setar `currentTime` não repinta o `<video>` — a tela ficava presa no
  último frame decodificado (preto, perto do fim do arquivo). Corrigido
  forçando um `play()` seguido de `pause()` imediato após o seek, o que
  força o decode/repaint do frame correto.
- **Durante a reprodução em mobile**: `object-fit: contain` + `width: 100%`
  (vídeo inteiro visível, sem corte) — diferente do `cover` usado no
  estado estático. Mantido mesmo após rotacionar o aparelho, por depender
  de `hover`/`pointer` e não de largura de viewport.

**Comportamento desktop preservado**
Logo aparece aos 47s, vídeo continua tocando normalmente até o fim (sem
pausa, sem reset, sem dimming). Isso não mudou.

### 2. `css/style.css`

- `#hero-video` ganhou `transition: opacity 0.8s ease` (suaviza o dimming
  no mobile).
- Regra de clique da logo migrada de `#hero-logo { pointer-events: auto; }`
  (sempre ativa) para `#logo-wrapper.visible #hero-logo { pointer-events:
  auto; }` (só ativa quando visível).
- Novo bloco `@media (hover: none) and (pointer: coarse)` com as regras do
  modo mobile: `.is-playing` (flex centralizado), `.is-playing #hero-video`
  (contain + width 100%), `.video-dimmed` (opacity 0.5).
- Margem superior do formulário de contato (`.contato-content`) alterada de
  `35.46296vh` (383px/1080) para `24.53704vh` (**265px/1080**).

## Como fazer o merge com `site-completo`

O diff é pequeno e localizado (dois arquivos, ~100 linhas), então o caminho
mais seguro é:

1. **Não faça um merge automático "às cegas"** se `site-completo` também
   alterou `js/hero.js` ou as regras de `#hero`/`#contato` em
   `css/style.css` — como esses dois arquivos provavelmente cresceram
   bastante lá (novas seções), um merge de texto puro tem alto risco de
   conflito ou de sobrescrever lógica nova.
2. **Recomendado: cherry-pick + reaplicação manual**, em vez de merge de
   branch inteira:
   ```bash
   git checkout site-completo
   git cherry-pick 56f31ff
   git cherry-pick 6c68717
   ```
   Resolva conflitos comparando bloco a bloco com as seções acima — a
   lógica de `hero.js` é isolada (função autoexecutável, não depende de
   nada das outras seções), então normalmente basta garantir que o
   `#hero`/`#hero-video`/`#logo-wrapper`/`#hero-logo`/`#play-button`
   continuam com os mesmos `id`s em `index.html` na branch de destino.
3. **Se preferir merge de branch normal**, depois de resolver conflitos,
   confira manualmente:
   - Se `site-completo` tem uma versão diferente do reset de frame do
     vídeo, decida qual `FRAME_INICIAL` prevalece.
   - Se `site-completo` já implementou algo para mobile no hero, compare
     os thresholds de tempo (47s desktop / 48s+50s mobile) e o gatilho de
     detecção mobile (`matchMedia` vs. breakpoint de largura) — prefira a
     versão por `matchMedia`, é mais robusta a rotação.
   - Confirme que a margem `.contato-content` (265px/1080) não foi
     sobrescrita por um valor antigo (383px/1080) vindo do merge.

## Checklist de correção pós-merge

- [ ] `#hero-video`, `#logo-wrapper`, `#hero-logo`, `#play-button` existem
      com os mesmos `id`s em `index.html` na branch final.
- [ ] Testar no desktop: logo aparece aos 47s, vídeo não pausa, não há
      dimming.
- [ ] Testar em device/emulador touch: fade da logo aos 48s, pausa +
      dimming aos 50s, sem frame preto congelado.
- [ ] Rotacionar o device durante a reprodução: vídeo deve continuar
      `object-fit: contain` + `width: 100%` (não deve reverter para
      `cover`).
- [ ] Clicar na logo (mobile e desktop): vídeo reinicia do frame 00:01,
      logo some, dimming some.
- [ ] Clicar rapidamente na área da logo *antes* dela aparecer: vídeo não
      deve reiniciar (valida o fix de `pointer-events`).
- [ ] Conferir visualmente a margem superior do formulário de contato.

## Fora do escopo desta branch

Estes itens foram discutidos/prototipados em conversas anteriores mas
**não estão presentes no working tree atual de `site`** (foram descartados
antes deste merge) — se `site-completo` não os tiver, precisam ser refeitos
do zero:

- Seções **Destaques** e **Categorias** (grid de destaques, accordion de
  categorias com galeria).
- Painel administrativo **`/gerenciador/`** (login, dashboard React via
  CDN, CRUDs de categorias/galeria/usuários, recuperação de senha).
- Banco de dados em **`/dev/banco/`** (schema SQL + seeders separados por
  tabela).
- Backend PHP de upload/otimização de imagem
  (`php/gerenciador/upload-imagem.php`) e helper de slug
  (`php/inc/slugify.php`).
- `js/scroll-snap.js` continua no repositório e ainda é referenciado em
  `index.html` — o scroll-snap por proximidade (`scroll-snap-type: y
  proximity`) nunca foi de fato removido, ao contrário do que foi relatado
  em um resumo anterior desta mesma sessão. Vale decidir explicitamente se
  ele deve ser mantido, ajustado ou removido antes do merge final.

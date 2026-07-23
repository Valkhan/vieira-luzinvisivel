/*
 * Otimiza a imagem no navegador antes do upload: se a largura ultrapassar
 * `larguraMaxima`, redimensiona via <canvas> mantendo a proporção original
 * e devolve um novo File já reduzido (o backend só reprocessa como
 * salvaguarda, caso o cliente não suporte canvas/toBlob).
 */
function otimizarImagem(file, larguraMaxima = 1080) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width <= larguraMaxima) {
        resolve(file);
        return;
      }

      const escala = larguraMaxima / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = larguraMaxima;
      canvas.height = Math.round(img.height * escala);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao otimizar a imagem no navegador.'));
            return;
          }
          resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
        },
        file.type,
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem selecionada.'));
    };

    img.src = url;
  });
}

<?php
/**
 * Upload de imagens da galeria.
 * Recebe multipart/form-data: imagem (file), galeria_id, categoria_slug, titulo.
 *
 * A otimização (redimensionar para largura máxima de 1080px) acontece no
 * navegador antes do envio (gerenciador/js/image-optimizer.js) — única
 * fonte de entrada de imagem, então o backend apenas valida e armazena.
 *
 * Salva em /uploads/galeria/{galeria_id}/a-luz-invisivel-{slug-categoria}-{titulo}.{ext}
 *
 * TODO: quando a autenticação por sessão do /gerenciador/ existir, exigir
 * sessão válida aqui antes de aceitar o upload.
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

require __DIR__ . '/../inc/slugify.php';

$galeriaId = filter_input(INPUT_POST, 'galeria_id', FILTER_VALIDATE_INT);
$categoriaSlug = trim((string) ($_POST['categoria_slug'] ?? ''));
$titulo = trim((string) ($_POST['titulo'] ?? ''));

if (!$galeriaId || $categoriaSlug === '' || $titulo === '' || empty($_FILES['imagem'])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos para o upload.']);
    exit;
}

$arquivo = $_FILES['imagem'];

if ($arquivo['error'] !== UPLOAD_ERR_OK) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Falha no envio do arquivo.']);
    exit;
}

const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8MB
if ($arquivo['size'] > TAMANHO_MAXIMO) {
    http_response_code(413);
    echo json_encode(['success' => false, 'message' => 'Imagem maior que 8MB.']);
    exit;
}

$mime = mime_content_type($arquivo['tmp_name']);
$extensoesPermitidas = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

if (!isset($extensoesPermitidas[$mime])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Formato de imagem não suportado. Use JPG, PNG ou WebP.']);
    exit;
}

$extensao = $extensoesPermitidas[$mime];

// Monta o nome do arquivo respeitando o limite de 255 bytes de caminho por sistema de arquivos.
$categoriaSlugNormalizado = slugify($categoriaSlug);
$tituloNormalizado = slugify($titulo);

$prefixo = 'a-luz-invisivel-';
$sufixo = '.' . $extensao;
$espacoDisponivel = 255 - strlen($prefixo) - strlen($sufixo) - 1; // "-" entre categoria e título

$partesDisponiveis = max(4, $espacoDisponivel - strlen($categoriaSlugNormalizado));
$tituloNormalizado = substr($tituloNormalizado, 0, $partesDisponiveis);

$nomeArquivo = $prefixo . $categoriaSlugNormalizado . '-' . $tituloNormalizado . $sufixo;

$diretorio = __DIR__ . '/../../uploads/galeria/' . $galeriaId;
if (!is_dir($diretorio)) {
    mkdir($diretorio, 0755, true);
}

$caminhoCompleto = $diretorio . '/' . $nomeArquivo;

if (!move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Falha ao salvar a imagem.']);
    exit;
}

echo json_encode([
    'success' => true,
    'path' => 'uploads/galeria/' . $galeriaId . '/' . $nomeArquivo,
]);

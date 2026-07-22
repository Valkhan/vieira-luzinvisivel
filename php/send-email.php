<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuração ausente.']);
    exit;
}
require $configPath;

session_start();

$agora = time();
$ultimoEnvio = $_SESSION['ultimo_envio'] ?? 0;
if ($agora - $ultimoEnvio < 30) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Aguarde antes de enviar novamente.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Requisição inválida.']);
    exit;
}

$nome = trim(strip_tags($input['nome'] ?? ''));
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$mensagem = trim(strip_tags($input['mensagem'] ?? ''));

if ($nome === '' || $mensagem === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

$payload = json_encode([
    'from' => 'a luz invisível <onboarding@resend.dev>',
    'to' => [RESEND_TO_EMAIL],
    'reply_to' => $email,
    'subject' => 'Novo contato — a luz invisível',
    'text' => "Nome: {$nome}\nE-mail: {$email}\n\nMensagem:\n{$mensagem}",
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . RESEND_API_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 15,
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$erro = curl_error($ch);
curl_close($ch);

if ($erro || $statusCode >= 400) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Falha ao enviar e-mail.']);
    exit;
}

$_SESSION['ultimo_envio'] = $agora;

echo json_encode(['success' => true]);

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

$nomeHtml = htmlspecialchars($nome, ENT_QUOTES, 'UTF-8');
$emailHtml = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$mensagemHtml = nl2br(htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8'));

$html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family:'Inter', Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color:#ffffff; padding:20px 32px;">
              <span style="display:block; font-weight:900; font-size:16px; letter-spacing:0; text-transform:uppercase; color:#000000;">A Luz Invisível</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              <span style="display:block; font-weight:900; font-size:22px; text-transform:uppercase; color:#ffffff; letter-spacing:0;">Novo contato</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:block; font-weight:700; font-size:11px; text-transform:uppercase; color:#999999; letter-spacing:1px;">Nome</span>
              <span style="display:block; font-size:15px; color:#ffffff; margin-top:4px;">{$nomeHtml}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0;">
              <span style="display:block; font-weight:700; font-size:11px; text-transform:uppercase; color:#999999; letter-spacing:1px;">E-mail</span>
              <span style="display:block; font-size:15px; color:#ffffff; margin-top:4px;">{$emailHtml}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 36px;">
              <span style="display:block; font-weight:700; font-size:11px; text-transform:uppercase; color:#999999; letter-spacing:1px;">Mensagem</span>
              <span style="display:block; font-size:15px; color:#ffffff; margin-top:4px; line-height:1.6;">{$mensagemHtml}</span>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #333333; padding:16px 32px;">
              <span style="display:block; font-size:11px; color:#666666; text-transform:uppercase; letter-spacing:1px;">Enviado pelo formulário de contato do site</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$payload = json_encode([
    'from' => 'A Luz Invisível <site@luzinvisivel.com>',
    'to' => [RESEND_TO_EMAIL],
    'reply_to' => $email,
    'subject' => 'Novo contato — a luz invisível',
    'text' => "Nome: {$nome}\nE-mail: {$email}\n\nMensagem:\n{$mensagem}",
    'html' => $html,
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

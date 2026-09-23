<?php

/**
 * Contact form email handler
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$name = isset($input['name']) ? trim(strip_tags($input['name'])) : '';
$email = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';
$message = isset($input['message']) ? trim(strip_tags($input['message'])) : '';

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor complete todos los campos.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor ingrese un correo válido.']);
    exit;
}

$to = 'contacto@isabellamoretti.com'; // CHANGE: Client's email
$subject = 'Nuevo mensaje desde el sitio web | Isabella Moretti';

$body = "Nuevo mensaje desde el formulario de contacto:\n\n";
$body .= "Nombre: $name\n";
$body .= "Email: $email\n";
$body .= "Mensaje:\n$message\n\n";
$body .= "---\n";
$body .= "Enviado desde el sitio web de Isabella Moretti";

$headers = "From: sitio@isabellamoretti.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$mailSent = mail($to, $subject, $body, $headers);

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => '✓ Gracias, su mensaje ha sido enviado.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al enviar. Intente más tarde.']);
}

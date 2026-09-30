<?php

/**
 * Image upload handler
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit;
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Upload error']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Use JPG, PNG, GIF or WEBP.']);
    exit;
}

$maxSize = 10 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File too large (max 10MB)']);
    exit;
}

$uploadDir = __DIR__ . '/../images/gallery/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'gallery_' . date('Ymd_His') . '_' . uniqid() . '.' . $extension;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    exit;
}

$url = '/images/gallery/' . $filename;
echo json_encode(['success' => true, 'url' => $url]);

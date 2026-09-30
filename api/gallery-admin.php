<?php

/**
 * Gallery CRUD API - With file deletion
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/../data/gallery.json';
$password = 'karla2026';

$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
}

function deleteFile($filepath)
{
    if (empty($filepath)) return false;
    $fullPath = __DIR__ . '/..' . $filepath;
    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo file_get_contents($dataFile);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    if (!isset($input['password']) || $input['password'] !== $password) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if (!isset($input['items']) || !is_array($input['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data format']);
        exit;
    }

    // Delete removed images
    $oldData = json_decode(file_get_contents($dataFile), true) ?: [];
    $deletedItems = array_diff($oldData, $input['items']);
    foreach ($deletedItems as $item) {
        if (!empty($item) && is_string($item)) {
            deleteFile($item);
        }
    }

    $result = file_put_contents($dataFile, json_encode($input['items'], JSON_PRETTY_PRINT));
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

<?php

/**
 * Press CRUD API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/../data/press.json';
$password = 'karla2026';

$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

if (!file_exists($dataFile)) {
    $default = [
        [
            'id' => 'demo1',
            'outlet' => 'Diario de Centro América',
            'date' => '10 de septiembre de 2025',
            'title' => 'Voz que se eleva y cruza océanos',
            'excerpt' => 'Karla Argueta, soprano que se fusiona con la música en Rusia para conquistar escenarios internacionales...',
            'author' => 'Narcy Vásquez · Sección Artes',
            'link' => 'https://dca.gob.gt',
            'linkText' => 'Leer en Diario de Centro América'
        ]
    ];
    file_put_contents($dataFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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

    $result = file_put_contents($dataFile, json_encode($input['items'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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

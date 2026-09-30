<?php

/**
 * Concerts CRUD API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/../data/concerts.json';
$password = 'karla2026';

$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

if (!file_exists($dataFile)) {
    $default = [
        [
            'id' => 'demo1',
            'day' => '15',
            'month' => 'Mar',
            'title' => 'Recital de Lieder — Schubert y Brahms',
            'venue' => 'Conservatorio Rimsky-Korsakov',
            'city' => 'San Petersburgo, Rusia',
            'link' => '#'
        ],
        [
            'id' => 'demo2',
            'day' => '02',
            'month' => 'Abr',
            'title' => 'Concierto de Arias y Dúos — COVERJAZZ',
            'venue' => 'Redstone Jazz Club',
            'city' => 'Kursk, Rusia',
            'link' => '#'
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

<?php
require_once __DIR__ . '/env.php';

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: audio/mpeg');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check for API key
$apiKey = getEnvVar('OPENAI_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'OpenAI API key not configured']);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

// Check for required fields
if (!isset($input['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required field: text']);
    exit();
}

try {
    // Prepare the request to OpenAI TTS API
    $ch = curl_init('https://api.openai.com/v1/audio/speech');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'tts-1',
        'input' => $input['text'],
        'voice' => 'alloy'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    // Execute the request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception("cURL Error: " . $error);
    }

    if ($httpCode !== 200) {
        throw new Exception("OpenAI TTS API Error: " . $response);
    }

    // Return the audio data
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error processing request',
        'details' => $e->getMessage()
    ]);
} 
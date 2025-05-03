<?php
require_once __DIR__ . '/env.php';

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

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

try {
    // Check if audio file was uploaded
    if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No audio file uploaded or upload error');
    }

    $audioFile = $_FILES['audio']['tmp_name'];
    $audioType = $_FILES['audio']['type'];

    // Validate audio file type
    $allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'];
    if (!in_array($audioType, $allowedTypes)) {
        throw new Exception('Invalid audio file type');
    }

    // Prepare the request to OpenAI Whisper API
    $ch = curl_init('https://api.openai.com/v1/audio/transcriptions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);

    // Create multipart form data
    $postData = [
        'file' => new CURLFile($audioFile, $audioType, 'audio'),
        'model' => 'whisper-1',
        'response_format' => 'json'
    ];

    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
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
        throw new Exception("OpenAI Whisper API Error: " . $response);
    }

    // Return the transcription
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error processing request',
        'details' => $e->getMessage()
    ]);
} 
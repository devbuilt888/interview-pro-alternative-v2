<?php
function loadEnv() {
    $envFile = __DIR__ . '/../.env.local';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

loadEnv();

function getEnvVar($key, $default = null) {
    $value = getenv($key);
    return $value !== false ? $value : $default;
} 
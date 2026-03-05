<?php

use App\Http\Controllers\Api\AiAssistController;
use App\Http\Controllers\Api\EducationalResourceController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Auth endpoints (public)
Route::post('users/register', [UserController::class, 'register']);
Route::post('users/login', [UserController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    Route::get('users', [UserController::class, 'index']);

    Route::apiResource('resources', EducationalResourceController::class)
        ->parameters(['resources' => 'educationalResource']);

    Route::post('ai/generate-description', [AiAssistController::class, 'generateDescription']);
});

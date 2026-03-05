<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAssistController extends Controller
{
    public function generateDescription(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:Video,PDF,Link',
        ]);

        $title = $request->input('title');
        $type = $request->input('type');

        $startTime = microtime(true);

        if (config('app.ai_mock_mode') || empty(config('app.gemini_api_key')) || config('app.gemini_api_key') === 'your_gemini_api_key_here') {
            usleep(700 * 1000);
            $result = $this->getMockResponse($title, $type);
            $latency = round(microtime(true) - $startTime, 2);

            Log::info(sprintf(
                '[INFO] AI Request: Title="%s", TokenUsage=150, Latency=%ss (mock)',
                $title,
                $latency
            ));

            return response()->json($result);
        }

        try {
            $prompt = "Generate a concise educational description (2-3 sentences) and 3 relevant tags for a {$type} resource titled: \"{$title}\". Respond in JSON format: {\"description\": \"...\", \"tags\": [\"tag1\", \"tag2\", \"tag3\"]}";

            $response = Http::timeout(30)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='.config('app.gemini_api_key'),
                [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ]
            );

            $latency = round(microtime(true) - $startTime, 2);

            if ($response->failed()) {
                Log::error('[ERROR] AI Request failed: '.$response->status());

                return response()->json(['error' => 'AI service unavailable'], 503);
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $tokenUsage = $data['usageMetadata']['totalTokenCount'] ?? 150;

            // Extract JSON from response
            preg_match('/\{.*\}/s', $text, $matches);
            $parsed = json_decode($matches[0] ?? '{}', true);

            $description = $parsed['description'] ?? $this->getMockResponse($title, $type)['description'];
            $tags = $parsed['tags'] ?? $this->getMockResponse($title, $type)['tags'];

            Log::info(sprintf(
                '[INFO] AI Request: Title="%s", TokenUsage=%d, Latency=%ss',
                $title,
                $tokenUsage,
                $latency
            ));

            return response()->json(['description' => $description, 'tags' => $tags]);
        } catch (\Exception $e) {
            Log::error('[ERROR] AI Request exception: '.$e->getMessage());

            return response()->json(['error' => 'AI service error'], 503);
        }
    }

    private function getMockResponse(string $title, string $type): array
    {
        $typeDescriptions = [
            'Video' => 'video educacional',
            'PDF' => 'documento PDF',
            'Link' => 'recurso online',
        ];

        $typeDesc = $typeDescriptions[$type] ?? 'recurso';

        return [
            'description' => "Este {$typeDesc} aborda o tema \"{$title}\" de forma clara e objetiva. É um material recomendado para estudantes que desejam aprofundar seus conhecimentos. O conteúdo foi desenvolvido para facilitar o aprendizado e a compreensão do assunto.",
            'tags' => [
                strtolower(str_replace(' ', '-', $title)),
                strtolower($type),
                'educação',
            ],
        ];
    }
}

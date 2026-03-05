<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:Video,PDF,Link',
            'url' => 'required|string|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Models\EducationalResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationalResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $q = trim((string) $request->query('q', ''));
        $field = (string) $request->query('field', 'all'); // title | tag | type | all
        $field = in_array($field, ['title', 'tag', 'type', 'all'], true) ? $field : 'all';

        $query = EducationalResource::query();

        if ($q !== '') {
            if ($field === 'title') {
                $query->where('title', 'like', "%{$q}%");
            } elseif ($field === 'type') {
                $query->where('type', 'like', "%{$q}%");
            } elseif ($field === 'tag') {
                $query->where('tags', 'like', "%{$q}%");
            } else {
                $query->where(function ($sub) use ($q) {
                    $sub->where('title', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%")
                        ->orWhere('type', 'like', "%{$q}%")
                        ->orWhere('tags', 'like', "%{$q}%");
                });
            }
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreResourceRequest $request): JsonResponse
    {
        $resource = EducationalResource::create($request->validated());

        return response()->json($resource, 201);
    }

    public function show(EducationalResource $educationalResource): JsonResponse
    {
        return response()->json($educationalResource);
    }

    public function update(StoreResourceRequest $request, EducationalResource $educationalResource): JsonResponse
    {
        $educationalResource->update($request->validated());

        return response()->json($educationalResource);
    }

    public function destroy(EducationalResource $educationalResource): JsonResponse
    {
        $educationalResource->delete();

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\V1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));

        $categories = Category::query()
            ->withCount('documents')
            ->search($request->string('search')->toString())
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $category->loadCount('documents');

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => CategoryResource::make($category)->resolve(),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->fill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', $category->is_active),
        ])->save();

        $category->loadCount('documents');

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => CategoryResource::make($category)->resolve(),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Barangay\StoreBarangayRequest;
use App\Http\Requests\Barangay\UpdateBarangayRequest;
use App\Http\Resources\V1\BarangayResource;
use App\Models\Barangay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarangayController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));

        $barangays = Barangay::query()
            ->withCount(['documents', 'users'])
            ->search($request->string('search')->toString())
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return BarangayResource::collection($barangays);
    }

    public function store(StoreBarangayRequest $request): JsonResponse
    {
        $barangay = Barangay::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $barangay->loadCount(['documents', 'users']);

        return response()->json([
            'message' => 'Barangay created successfully.',
            'barangay' => BarangayResource::make($barangay)->resolve(),
        ], 201);
    }

    public function update(UpdateBarangayRequest $request, Barangay $barangay): JsonResponse
    {
        $barangay->fill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', $barangay->is_active),
        ])->save();

        $barangay->loadCount(['documents', 'users']);

        return response()->json([
            'message' => 'Barangay updated successfully.',
            'barangay' => BarangayResource::make($barangay)->resolve(),
        ]);
    }

    public function destroy(Barangay $barangay): JsonResponse
    {
        $barangay->delete();

        return response()->json([
            'message' => 'Barangay deleted successfully.',
        ]);
    }
}

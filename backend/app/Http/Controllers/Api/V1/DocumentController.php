<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Requests\Document\UpdateDocumentRequest;
use App\Http\Resources\V1\DocumentResource;
use App\Models\Document;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\DocumentFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentFileService $documentFileService,
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));

        $documents = Document::query()
            ->with(['category', 'barangay', 'uploader'])
            ->visibleTo($user)
            ->filter($request->only([
                'search',
                'category_id',
                'barangay_id',
                'uploaded_by',
                'status',
                'file_type',
                'date_from',
                'date_to',
                'sort',
            ]))
            ->paginate($perPage)
            ->withQueryString();

        return DocumentResource::collection($documents);
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $this->authorize('create', Document::class);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $request->file('file');
        $fileData = $this->documentFileService->store($file);

        $document = Document::create([
            ...$request->validated(),
            ...$fileData,
            'uploaded_by' => $request->user()?->id,
        ]);

        $document->load(['category', 'barangay', 'uploader']);

        return response()->json([
            'message' => 'Document created successfully.',
            'document' => DocumentResource::make($document)->resolve(),
        ], 201);
    }

    public function show(Document $document): JsonResponse
    {
        $this->authorize('view', $document);

        $document->load(['category', 'barangay', 'uploader']);

        return response()->json([
            'document' => DocumentResource::make($document)->resolve(),
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        $data = $request->validated();
        $oldPath = null;
        $oldDisk = null;

        if ($request->hasFile('file')) {
            $oldPath = $document->file_path;
            $oldDisk = $document->resolvedStorageDisk();
            /** @var \Illuminate\Http\UploadedFile $uploadedFile */
            $uploadedFile = $request->file('file');
            $data = [
                ...$data,
                ...$this->documentFileService->store($uploadedFile),
            ];
        }

        $document->fill($data)->save();

        if ($oldPath) {
            $this->documentFileService->delete($oldPath, $oldDisk);
        }

        $document->load(['category', 'barangay', 'uploader']);

        return response()->json([
            'message' => 'Document updated successfully.',
            'document' => DocumentResource::make($document)->resolve(),
        ]);
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        $path = $document->file_path;
        $disk = $document->resolvedStorageDisk();
        $document->delete();
        $this->documentFileService->delete($path, $disk);

        return response()->json([
            'message' => 'Document deleted successfully.',
        ]);
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->authorize('download', $document);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($document->resolvedStorageDisk());

        abort_unless($disk->exists($document->file_path), 404, 'Stored file not found.');

        $this->activityLogService->log(
            action: 'document.downloaded',
            module: 'documents',
            description: "Downloaded document {$document->title}.",
            user: $request->user(),
            document: $document,
            details: [
                'document_id' => $document->id,
                'file_name' => $document->original_file_name,
            ],
            request: $request,
        );

        return $disk->download($document->file_path, $document->original_file_name);
    }

    public function patchStatus(Request $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(Document::allowedStatuses())],
        ]);

        $document->update(['status' => $validated['status']]);
        $document->load(['category', 'barangay', 'uploader']);

        return response()->json([
            'message' => 'Document status updated.',
            'document' => DocumentResource::make($document)->resolve(),
        ]);
    }

    public function preview(Request $request, Document $document): StreamedResponse
    {
        $this->authorize('view', $document);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($document->resolvedStorageDisk());

        abort_unless($disk->exists($document->file_path), 404, 'Stored file not found.');

        $this->activityLogService->log(
            action: 'document.previewed',
            module: 'documents',
            description: "Previewed document {$document->title}.",
            user: $request->user(),
            document: $document,
            details: [
                'document_id' => $document->id,
                'file_name' => $document->original_file_name,
            ],
            request: $request,
        );

        return $disk->response($document->file_path, $document->original_file_name, disposition: 'inline');
    }
}

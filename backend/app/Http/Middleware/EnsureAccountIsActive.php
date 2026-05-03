<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user?->isSuspended()) {
            $request->user()?->currentAccessToken()?->delete();

            return new JsonResponse([
                'message' => 'Your account has been suspended. Please contact the administrator.',
                'code' => 'account_suspended',
            ], 403);
        }

        return $next($request);
    }
}

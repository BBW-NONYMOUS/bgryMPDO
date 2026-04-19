<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isStaff()) {
            return in_array($document->access_level, [
                Document::ACCESS_STAFF,
                Document::ACCESS_BARANGAY,
            ], true);
        }

        return $document->access_level === Document::ACCESS_BARANGAY
            && ($document->barangay_id === null || $document->barangay_id === $user->barangay_id);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    public function update(User $user, Document $document): bool
    {
        return $this->view($user, $document) && ($user->isAdmin() || $user->isStaff());
    }

    public function delete(User $user, Document $document): bool
    {
        return $this->update($user, $document);
    }

    public function download(User $user, Document $document): bool
    {
        return $this->view($user, $document);
    }
}

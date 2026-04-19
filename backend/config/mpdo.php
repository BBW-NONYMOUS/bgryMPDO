<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MPDO Storage Disks
    |--------------------------------------------------------------------------
    |
    | `documents_disk` should point to a private/local disk to prevent direct
    | public access to archived files. The default `local` disk in this app is
    | configured to use `storage/app/private`.
    |
    */

    'documents_disk' => env('MPDO_DOCUMENTS_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Public Avatars Disk
    |--------------------------------------------------------------------------
    |
    | Profile photos are stored separately from document archives. Keeping these
    | on the public disk makes it easy to render in the UI.
    |
    */

    'avatars_disk' => env('MPDO_AVATARS_DISK', 'public'),
];


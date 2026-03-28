# MPDO Document Archiving System

This workspace contains a document archiving system for MPDO with:

- a React + Vite frontend in `frontend/`
- a Laravel 13 API backend in `mpdo-backend-skeleton-temp/`

The system supports authentication, dashboard reporting, document uploads, downloads, category management, barangay management, user management, and activity logging.

## System Structure

```text
MPDO/
|-- frontend/                      # React client application
|   |-- src/
|   |   |-- api/                  # Axios API wrappers
|   |   |-- components/           # Reusable UI parts
|   |   |-- context/              # Auth state provider
|   |   |-- hooks/                # Custom hooks
|   |   |-- layouts/              # Dashboard shell
|   |   |-- pages/                # Route pages
|   |   |-- routes/               # App route definitions
|   |   `-- utils/                # Helpers for storage/data formatting
|   `-- package.json
|
|-- mpdo-backend-skeleton-temp/    # Laravel API
|   |-- app/
|   |   |-- Http/
|   |   |   |-- Controllers/Api/V1/   # API controllers
|   |   |   |-- Requests/             # Request validation
|   |   |   `-- Resources/V1/         # API response transformers
|   |   |-- Models/                   # Eloquent models
|   |   |-- Policies/                 # Role/access policies
|   |   `-- Services/                 # File storage and activity logging
|   |-- database/
|   |   |-- migrations/               # Tables and schema
|   |   `-- seeders/                  # Starter accounts/data
|   |-- routes/
|   |   `-- api.php                   # API routes
|   `-- .env.example
|
`-- README.md
```

## Main Features

- Login with Laravel Sanctum token authentication
- Role-based access for `admin`, `staff`, and `barangay` users
- Upload, list, filter, update, delete, and download documents
- Manage categories and barangays
- Manage user accounts
- View dashboard counts and recent activity
- Audit trail for important actions such as login, logout, and downloads

## User Roles

- `admin`
  Full access to the system, including users, categories, barangays, activity logs, and documents.
- `staff`
  Can manage documents and view dashboard data.
- `barangay`
  Can access documents visible to their barangay scope.

Note: the backend stores the barangay role internally as `barangay_official`, while the frontend/API display it as `barangay`.

## Backend Overview

The Laravel API is versioned under `/api/v1`.

Main endpoints:

- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/logout`
- `GET /dashboard`
- `GET/POST/PUT/DELETE /categories`
- `GET/POST/PUT/DELETE /barangays`
- `GET/POST/PUT/DELETE /documents`
- `GET /documents/{id}/download`
- `GET/POST/PUT/DELETE /users`
- `GET /activity-logs`

Document uploads are stored on the `public` disk in:

```text
storage/app/public/documents
```

The current application-level upload limit is 5 MB.

## Frontend Overview

The React app uses:

- `react-router-dom` for routing
- `axios` for API requests
- local storage for auth token and user session
- `VITE_API_URL` for backend base URL configuration

Main frontend routes:

- `/login`
- `/dashboard`
- `/documents`
- `/documents/upload`
- `/categories`
- `/barangays`
- `/users`
- `/activity-logs`

## How To Run The System

### 1. Backend setup

Open a terminal in `mpdo-backend-skeleton-temp/`.

1. Install PHP dependencies:

```bash
composer install
```

2. Create the environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your MySQL database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mpdo_archiving
DB_USERNAME=root
DB_PASSWORD=
```

4. Generate the app key:

```bash
php artisan key:generate
```

5. Run migrations and seed starter data:

```bash
php artisan migrate --seed
```

6. Create the storage symlink for public files:

```bash
php artisan storage:link
```

7. Start the API server:

```bash
php artisan serve
```

Default backend URL:

```text
http://localhost:8000
```

### 2. Frontend setup

Open another terminal in `frontend/`.

1. Install Node dependencies:

```bash
npm install
```

2. Create a frontend `.env` file if needed:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

3. Start the frontend:

```bash
npm run dev
```

Default frontend URL is usually:

```text
http://localhost:5173
```

## Starter Accounts

The database seeder creates these accounts:

- `admin@mpdo.local` / `password123`
- `staff@mpdo.local` / `password123`
- `barangay@mpdo.local` / `password123`

Use the admin account first if you want full access to test the system.

## Typical Workflow

1. Log in from the frontend.
2. Review dashboard counts and recent activity.
3. Create or update categories and barangays if needed.
4. Upload a document from the Documents module.
5. Assign category, barangay, access level, and status.
6. Search, filter, download, or update documents later.
7. Use the Activity Logs page to review system actions.

## Important Implementation Notes

- The frontend sends a Bearer token on every authenticated request.
- Document updates with a new file use multipart form data and Laravel method spoofing.
- Document visibility is filtered by role in the backend model scope.
- Download actions are logged in the activity log service.
- If uploads fail, check PHP `upload_max_filesize` and `post_max_size`.

## Recommended Development Entry Points

If you are new to this codebase, start here:

- Frontend routing: `frontend/src/routes/AppRoutes.jsx`
- Frontend auth state: `frontend/src/context/AuthContext.jsx`
- Frontend document upload page: `frontend/src/pages/UploadDocument.jsx`
- Backend API routes: `mpdo-backend-skeleton-temp/routes/api.php`
- Backend document controller: `mpdo-backend-skeleton-temp/app/Http/Controllers/Api/V1/DocumentController.php`
- Backend request validation: `mpdo-backend-skeleton-temp/app/Http/Requests/`
- Backend seed data: `mpdo-backend-skeleton-temp/database/seeders/StarterDataSeeder.php`

## Requirements

- PHP 8.3+
- Composer
- MySQL
- Node.js LTS
- npm

## Troubleshooting

- `401 Unauthorized`
  Usually means the token is missing, expired, or the backend is not running.
- `CORS or network error`
  Confirm the frontend points to the correct `VITE_API_URL`.
- `SQLSTATE` errors
  Check database credentials and ensure migrations have been run.
- File upload errors
  Confirm `php artisan storage:link` was executed and PHP upload limits are high enough.


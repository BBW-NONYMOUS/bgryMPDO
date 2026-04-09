# MPDO System Plan Audit

Audit date: 2026-04-08

Reference plan: `docs/Archiving_print_system_plan.docx`

Scope reviewed:
- `frontend/src`
- `mpdo-backend-skeleton-temp/app`
- `mpdo-backend-skeleton-temp/routes`
- `mpdo-backend-skeleton-temp/database`
- existing backend tests

## Overall Assessment

The current system follows the main MPDO archiving plan well at the core workflow level.

Implemented well:
- login and authentication
- role-based access control
- document upload and archiving
- document metadata and categorization
- document search, preview, and download
- category, barangay, and user management
- dashboard reporting
- activity logs and CSV exports

Main gaps:
- no self-service profile update module for users
- no profile picture upload
- no system settings module for archive status, classification, or document-type setup
- no separate account approval workflow beyond active/inactive status
- secure storage is only partially satisfied because uploaded files are stored on the `public` disk

## Priority Findings

### 1. Secure storage is only partially implemented

The plan requires secure storage. The current backend stores files on Laravel's `public` disk through `DocumentFileService`, and the filesystem config exposes that disk through `public/storage`.

Evidence:
- `mpdo-backend-skeleton-temp/app/Services/DocumentFileService.php`
- `mpdo-backend-skeleton-temp/config/filesystems.php`
- `README.md`

Impact:
- app-level access control exists through policies and protected download routes
- but files are still physically placed in a web-accessible public storage area
- random UUID filenames reduce guessing, but that is not the same as real access protection

Recommendation:
- move document storage to the private `local` disk
- stream files only through authorized controller routes
- keep direct public URLs disabled for archived records

### 2. User self-profile management from the plan is missing

The plan says users should be able to update their own profile details such as name, address, contact information, email, and password.

Current state:
- there is a profile read endpoint only
- there is no frontend page for profile editing
- there are no user fields for address or contact information in the schema

Evidence:
- `mpdo-backend-skeleton-temp/app/Http/Controllers/Api/V1/AuthController.php`
- `mpdo-backend-skeleton-temp/database/migrations/0001_01_01_000000_create_users_table.php`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/layout/Sidebar.jsx`

### 3. Admin settings from the plan are missing

The plan expects system settings for:
- user roles and access permissions
- archive status options and classification settings
- document type and category setup

Current state:
- categories and barangays are manageable
- roles, statuses, and access levels are hard-coded in the application
- there is no dedicated settings module or dynamic configuration screen

Evidence:
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/forms/DocumentForm.jsx`
- `mpdo-backend-skeleton-temp/app/Models/Document.php`
- `mpdo-backend-skeleton-temp/app/Models/User.php`

### 4. Account approval workflow is only partial

The plan says administrators should be able to approve or deactivate user accounts.

Current state:
- deactivate/activate is implemented through `is_active`
- create, update, delete, and role assignment are implemented
- a separate approval state or approval action is not implemented

Evidence:
- `frontend/src/pages/Users.jsx`
- `frontend/src/components/forms/UserForm.jsx`
- `mpdo-backend-skeleton-temp/app/Http/Controllers/Api/V1/UserController.php`

## Compliance Matrix

| Plan item | Status | Notes |
| --- | --- | --- |
| Web-based archive for MPDO documents | Implemented | React frontend plus Laravel API support centralized storage and retrieval. |
| Login and authentication | Implemented | Login, token auth, protected routes, and logout are present. |
| Role-based access control | Implemented | `admin`, `staff`, and `barangay` access is enforced in frontend routes and backend middleware/policies. |
| Document upload and archiving | Implemented | Upload, file validation, storage, edit, delete, preview, and download are present. |
| Document categorization and metadata | Implemented | Title, category, barangay, description, keywords, remarks, status, access level, and document date are supported. |
| Search and retrieval | Implemented | Search plus category, barangay, status, and date filters are available. |
| View and download documents | Implemented | Preview and download endpoints plus frontend actions are present. |
| Report generation | Implemented | CSV exports exist for dashboard summary, documents, and activity logs. |
| Audit trail and monitoring | Implemented | Login, logout, document, category, barangay, and user actions are logged. |
| Dashboard reports and summaries | Implemented | Dashboard counts, recent documents, recent activity, and summary export are implemented. |
| Category management | Implemented | Admin can add, edit, delete, activate, and deactivate categories. |
| Barangay reference management | Implemented | Admin can add, edit, delete, activate, and deactivate barangays. |
| User account management | Partial | Admin CRUD and role assignment are implemented, but no explicit approval workflow exists. |
| Admin manage system settings | Missing | No settings page for configurable roles, statuses, access rules, or document-type setup. |
| Admin monitor activities and logs | Implemented | Activity log page and export are present. |
| MPDO staff dashboard access | Implemented | Staff can access dashboard and document workflows. |
| Barangay official scoped access | Implemented | Barangay users only see documents within allowed scope via `visibleTo()` and route protection. |
| User self-profile update | Missing | No edit profile page or update endpoint for own account details. |
| Address/contact info in profile | Missing | Not in current `users` table or resource payload. |
| Profile picture upload | Missing | No schema, storage, API, or UI support. |
| Secure storage | Partial | Authorization exists, but physical file storage uses the public disk. |
| File support: PDF, DOCX, XLSX, PPT, JPG, PNG | Implemented | Supported, and the app also accepts `PPTX`. |
| Evaluation criteria: acceptability, efficiency, accuracy, security | Not represented in app | These are listed in the plan, but there is no in-app evaluation module or repo artifact measuring them. |

## Evidence Summary

Main implementation files reviewed:
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Documents.jsx`
- `frontend/src/pages/UploadDocument.jsx`
- `frontend/src/pages/Categories.jsx`
- `frontend/src/pages/Barangays.jsx`
- `frontend/src/pages/Users.jsx`
- `frontend/src/pages/ActivityLogs.jsx`
- `frontend/src/components/forms/DocumentForm.jsx`
- `frontend/src/components/forms/UserForm.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `mpdo-backend-skeleton-temp/routes/api.php`
- `mpdo-backend-skeleton-temp/app/Http/Controllers/Api/V1/*.php`
- `mpdo-backend-skeleton-temp/app/Models/*.php`
- `mpdo-backend-skeleton-temp/app/Policies/DocumentPolicy.php`
- `mpdo-backend-skeleton-temp/app/Observers/*.php`
- `mpdo-backend-skeleton-temp/app/Services/*.php`
- `mpdo-backend-skeleton-temp/database/migrations/*.php`

## Verification Performed

Completed:
- extracted and reviewed the plan text from `docs/Archiving_print_system_plan.docx`
- compared plan requirements against frontend routes, pages, forms, and backend controllers/models
- ran backend test suite successfully with `php artisan test`

Backend test result:
- `6` tests passed

Not completed:
- frontend production build could not be fully verified in this session

Reason:
- sandboxed build hit `spawn EPERM`
- unrestricted `npm run build` approval was requested but not granted

## Recommended Next Additions Based on MPDO Operations

These features would fit the MPDO context better than generic document-system features.

### 1. Document versioning and superseded records

Useful for:
- updated development plans
- revised project proposals
- corrected maps or blueprints

Suggested behavior:
- mark one document as the current version
- preserve older versions as history
- show who revised it and when

### 2. Project-based archive folders

Useful for:
- infrastructure projects
- farm-to-market roads
- drainage, water, and public works coordination

Suggested behavior:
- create a project record
- attach related permits, plans, photos, accomplishment reports, and funding papers
- filter by project, barangay, funding source, and status

### 3. Retention schedule and disposal review

Useful for:
- separating active, semi-active, and archival records
- preparing records for long-term retention or disposal approval

Suggested behavior:
- assign retention period per category
- alert admins when records are due for review
- keep a disposal/transfer approval trail

### 4. Incoming and outgoing transmittal tracking

Useful for:
- letters, endorsements, requests, and routed planning documents

Suggested behavior:
- record sender, recipient, date received, date released, and routing status
- print transmittal slips or receiving logs
- link the transmittal to archived files

### 5. OCR for scanned PDFs and image files

Useful for:
- older printed reports
- scanned permits
- image-based plans and signed documents

Suggested behavior:
- extract text from scans
- include OCR text in search results
- reduce missed results when users search by document content

### 6. Map and location tagging

Useful for:
- zoning files
- land-use references
- project site records

Suggested behavior:
- tag documents by sitio, purok, barangay, or coordinates
- filter records by area
- attach map preview images for quick review

### 7. Request and release log for physical copies

Useful for:
- printed plans
- blueprint copies
- certified document requests

Suggested behavior:
- log who requested a printed copy
- track release date, quantity, and purpose
- keep a printable release form history

### 8. Deadline and compliance reminders

Useful for:
- report submissions
- permit expirations
- periodic planning requirements

Suggested behavior:
- reminders on dashboard
- category-based due dates
- overdue views by barangay or project

## Suggested Implementation Order

1. Fix secure storage by moving files to private storage.
2. Add self-profile management with password change.
3. Add explicit account approval workflow if it is required by your adviser or plan panel.
4. Add system settings for configurable statuses, access levels, and document types.
5. Add MPDO-specific features starting with document versioning and project-based archives.

## Final Conclusion

The system already follows the most important functional parts of the plan.

If judged on the core archive workflow alone, it is close to compliant.

If judged strictly against the full written plan, it is not yet fully complete because profile management, settings management, approval workflow, and stronger secure file storage are still missing or partial.

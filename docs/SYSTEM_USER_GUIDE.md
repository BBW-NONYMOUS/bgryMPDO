# MPDO Archiving System User Guide

This guide explains how to use the MPDO Archiving System, including how to log in, upload documents, manage records, and use the other main modules.

## 1. What This System Does

The MPDO Archiving System is used to:

- store digital documents in one place
- organize files by category and barangay
- control who can view documents
- search, preview, download, and update records
- monitor activity inside the system

## 2. User Roles

What you can do depends on your account role.

### Admin

Admin users can:

- view the dashboard
- upload, edit, delete, preview, and download documents
- create and manage categories
- create and manage barangays
- create and manage users
- view activity logs
- export reports

### Staff

Staff users can:

- view the dashboard
- upload, edit, delete, preview, and download documents
- export dashboard and document reports

Staff users cannot manage categories, barangays, users, or activity logs.

### Barangay Official

Barangay users can:

- view the dashboard
- open the Documents page
- preview and download documents they are allowed to access

Barangay users cannot upload, edit, or delete documents.

## 3. Logging In

1. Open the system login page.
2. Enter your email address.
3. Enter your password.
4. Click `Login`.

If the login is correct, the system will open the dashboard.

## 4. Main Menu

The left sidebar contains the main navigation.

- `Dashboard`: Summary of document counts and recent activity
- `Documents`: List of all accessible documents
- `Upload Document`: Page for adding a new document
- `Categories`: Admin page for document groups
- `Barangays`: Admin page for barangay records
- `Users`: Admin page for account management
- `Activity Logs`: Admin page for audit trail
- `Logout`: Sign out of the system

## 5. How To Upload or Send a Document

If you mean "send a document into the system," the correct action is to upload it.

Only `admin` and `staff` users can upload documents.

### Steps to upload

1. Open `Upload Document` from the sidebar.
2. Fill in the document information.
3. Select the file from your computer.
4. Click `Save Document`.
5. After saving, you will be redirected to the `Documents` page.

### Fields you need to fill in

- `Document Title`: Name of the file or record
- `Document Number`: Optional reference number
- `Status`: `Draft`, `Active`, or `Archived`
- `Document Date`: Date written on the document
- `Category`: Required classification of the document
- `Barangay`: Optional barangay assignment
- `Access Level`: Who can see the document
- `Keywords`: Search terms separated by commas
- `Description`: Summary of the document
- `Remarks`: Internal notes
- `Upload File`: The actual file attachment

### Supported file types

The system accepts:

- PDF
- DOCX
- XLSX
- PPT or PPTX
- JPG or JPEG
- PNG

### File size limit

The current maximum upload size is `5 MB`.

If the file is too large, the system will reject it.

### Access Level meaning

- `Admin only`: Only admins can view it
- `Admin and staff`: Admins and staff can view it
- `Visible to barangay officials`: Barangay officials can view it

### Barangay meaning

- If you choose a barangay, the document is connected to that barangay
- If you leave it as `General / All barangays`, the document is not limited to one barangay

## 6. How To View, Search, and Download Documents

Open the `Documents` page to work with saved files.

### Available actions

- `View`: Preview the document
- `Download`: Save a copy to your device
- `Edit`: Update document details or replace the file
- `Delete`: Remove the record from the system

`Edit` and `Delete` are available only for `admin` and `staff`.

### Search and filter options

You can filter documents by:

- search keyword
- category
- barangay
- status
- date from
- date to

Click the filter action to refresh the list. Use reset to clear filters.

### Exporting a document report

From the `Documents` page, click `Export Report` to download a report based on the current filters.

## 7. How To Update an Existing Document

1. Open the `Documents` page.
2. Find the document you want to update.
3. Click `Edit`.
4. Change the needed fields.
5. Upload a new file only if you want to replace the current attachment.
6. Click `Save Changes`.

If you leave the file empty during editing, the current file stays unchanged.

## 8. Dashboard Guide

The `Dashboard` gives a quick overview of the system.

It shows:

- latest uploaded document
- latest activity
- weekly uploads and activity
- recent records and summaries

You can also click `Export Summary Report` to download a dashboard summary.

## 9. Category Management

This module is for `admin` users only.

Use `Categories` to organize documents into groups such as:

- Development Plans
- Permits and Clearances
- Infrastructure Reports
- Maps and Blueprints

### How to add a category

1. Open `Categories`.
2. Click `Add Category`.
3. Enter the category name.
4. Add a short description.
5. Set the status to `Active` or `Inactive`.
6. Click `Save Category`.

### How to edit or delete a category

- Click `Edit` to update the category
- Click `Delete` to remove it

It is better to create categories first before uploading documents.

## 10. Barangay Management

This module is for `admin` users only.

Use `Barangays` to maintain the official barangay list used in documents and user accounts.

### How to add a barangay

1. Open `Barangays`.
2. Click `Add Barangay`.
3. Enter the barangay name.
4. Add a description if needed.
5. Set the status.
6. Click `Save Barangay`.

### Why this is important

Barangays are used for:

- tagging documents
- filtering records
- assigning barangay officials to the correct area

## 11. User Management

This module is for `admin` users only.

Use `Users` to create and maintain system accounts.

### How to add a user

1. Open `Users`.
2. Click `Add User`.
3. Enter the user's name.
4. Enter the email address.
5. Set a password.
6. Choose the role:
   - `Admin`
   - `Staff`
   - `Barangay Official`
7. Assign a barangay if the user is a barangay official.
8. Set the account status.
9. Save the user.

### Notes

- `Admin` has full access
- `Staff` works mainly with documents
- `Barangay Official` should normally be linked to a barangay

## 12. Activity Logs

This module is for `admin` users only.

The `Activity Logs` page is used to review important actions inside the system.

Examples:

- user login
- logout
- document creation
- document update
- document download
- other tracked system events

You can also:

- filter by action
- filter by date range
- export the activity log report

## 13. Recommended Daily Workflow

For admins:

1. Log in
2. Check the dashboard
3. Confirm categories and barangays are correct
4. Create users if needed
5. Upload or review documents
6. Check activity logs when needed

For staff:

1. Log in
2. Upload new documents
3. Review, edit, or download existing records
4. Export document reports if needed

For barangay officials:

1. Log in
2. Open the Documents page
3. Search for accessible files
4. Preview or download needed records

## 14. Tips for Better Document Encoding

To keep the archive clean and searchable:

- use clear document titles
- fill in the correct category
- assign the correct barangay when needed
- add keywords separated by commas
- use `Draft` for unfinished records
- use `Active` for current files
- use `Archived` for old or inactive files

## 15. Common Problems and Fixes

### I cannot log in

- check your email and password
- make sure your account is active
- make sure the system server is running

### I cannot upload a file

- make sure the file is `5 MB` or smaller
- make sure the format is supported
- make sure required fields are filled in
- make sure you are logged in as `admin` or `staff`

### I cannot see a document

- the access level may not allow your role
- a barangay-restricted document may not match your barangay

### My filters show no results

- clear the search filters
- check the category, barangay, and date values

## 16. Quick Start for First-Time Setup

If this is a fresh system, use this order:

1. Log in as `admin`
2. Create or review categories
3. Create or review barangays
4. Create user accounts
5. Start uploading documents
6. Test searching, previewing, and downloading

## 17. Summary

The main working flow of the system is simple:

1. log in
2. upload documents
3. classify them correctly
4. search and retrieve them later
5. monitor activity and users when needed

If you want, this guide can also be converted into:

- a shorter `README` version
- a step-by-step staff manual
- a barangay user manual
- an admin manual with screenshots section placeholders

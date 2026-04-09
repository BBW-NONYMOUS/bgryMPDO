# Needed Features for MPDO (Office + Systems)

Prepared date: 2026-04-09

## Purpose

This document lists the features still needed for MPDO in two layers:

1. Features needed for the current MPDO Document Archiving System (based on `docs/Archiving_print_system_plan.docx` and `docs/SYSTEM_PLAN_AUDIT.md`).
2. Features commonly needed for broader MPDO office operations (not limited to the archiving plan).

If your scope is only the document archiving system, focus on Layer 1. If your scope is a full MPDO office information system, include Layer 2.

## Layer 2: MPDO Office Operational Features (Beyond the Archiving Plan)

These are common MPDO office workflows that are usually needed in real operations, but are not necessarily part of the archiving-system plan document.

### 1. Plans, Programs, and Reports Registry

Needed functions:

- maintain a library of official plans and reports (drafts and final)
- track versions, approvals, and effectivity dates
- link plans to barangays, sectors, and projects
- publish read-only views for authorized users

Examples of items (adjust to your LGU):

- CDP, CLUP, LDIP, AIP, sectoral plans
- annual/quarterly accomplishment reports
- local development council minutes and resolutions

### 2. Project and PPA Management (Planning to Implementation)

Needed functions:

- register PPAs/projects with locations and beneficiaries
- define milestones and target dates
- record physical and financial progress
- attach photos, inspection notes, and supporting documents
- generate progress summaries per barangay, funding source, and status

### 3. Zoning and Locational Clearance Workflow (If Applicable)

Needed functions:

- application intake and tracking number
- checklist of required documents
- site inspection scheduling and findings
- recommendation, approval, and issuance records
- printable certificate templates and release logs

Note: only include this module if zoning/locational clearance is part of your MPDO's responsibilities in your LGU.

### 4. GIS and Map-Based Records (If You Have Mapping Data)

Needed functions:

- manage map layers by barangay, zoning, hazards, and projects
- tag documents to coordinates or map polygons
- map-based search and filtering
- export map snapshots for reports

### 5. Barangay Profiles and Statistics

Needed functions:

- maintain barangay profiles (population, facilities, issues, priorities)
- store time-series indicators and sources
- generate tables/charts for reports
- attach supporting evidence and datasets

### 6. Incoming Requests and Technical Assistance Tracking

Needed functions:

- record requests from barangays and stakeholders
- assign to staff, track status, and due dates
- log actions taken and outputs produced
- export service and response reports

### 7. Meetings, Minutes, and Resolutions Management

Needed functions:

- schedule meetings (LDC, sectoral bodies)
- record attendance and agenda
- attach minutes and resolutions
- track action items and deadlines

### 8. Templates, Printing, and Release Controls

Needed functions:

- standardized templates for recurring documents
- controlled printing (who printed what, when)
- release tracking for signed/issued documents
- optional e-signature support if policy allows

## Layer 1: MPDO Document Archiving System (Based on the Plan)

## Current System Coverage

The current system already supports:

- login and authentication
- role-based access control
- document upload and archiving
- document metadata and categorization
- document search, preview, and download
- dashboard summaries and reports
- category, barangay, and user management
- activity logs

Because of that, the focus should now be on the remaining missing features and the next MPDO-specific improvements.

## Required Missing Features

These are the features that should be added first for the current MPDO Document Archiving System because they are either missing from the written archiving plan or only partially implemented.

### 1. User Profile Management

Users should be able to manage their own profile without depending on an administrator.

Needed functions:

- update full name
- update email
- update password
- add and edit address
- add and edit contact number
- view personal account details

Why this matters:

- matches the original system plan
- reduces admin dependency for simple profile changes
- improves account maintenance and data accuracy

### 2. Profile Picture Upload

The system should support profile photo upload for users.

Needed functions:

- upload profile picture
- replace existing picture
- validate file type and size
- store image securely
- display picture in profile and navigation areas

Why this matters:

- improves account identity and usability
- helps admins recognize users faster

### 3. Account Approval Workflow

The system currently supports active and inactive accounts, but it still needs a clear approval process for newly created users.

Needed functions:

- pending account status
- approve account action
- reject account action
- optional remarks for approval or rejection
- approval history in activity logs

Why this matters:

- adds stronger control over who can access the system
- aligns better with formal government account issuance

### 4. System Settings Module

Administrators need a settings area for configuration instead of relying on hard-coded values.

Needed functions:

- manage archive status options
- manage classification options
- manage document types
- manage access-level options
- manage role-related settings if allowed by policy

Why this matters:

- makes the system easier to maintain
- allows policy changes without code edits
- improves long-term flexibility

### 5. Secure Private File Storage

File access is controlled in the app, but physical storage still needs stronger protection.

Needed functions:

- store archived files in private storage
- disable direct public access to document files
- download files only through authorized backend routes
- log access to protected files

Why this matters:

- strengthens confidentiality
- supports safer records handling
- better fits the security expectation of an archive system

## MPDO-Specific Operational Features

These features are not just generic archive features. They support real MPDO workflows and would make the system more useful in daily operations.

### 1. Document Versioning

Useful for revised plans, corrected reports, and updated proposals.

Needed functions:

- keep version history
- mark the latest approved version
- track who updated the file
- show revision date and notes

### 2. Project-Based Archive Records

Useful for infrastructure, land-use, development, and barangay project files.

Needed functions:

- create project records
- group documents under one project
- track project status
- filter by barangay, funding source, and project type

### 3. Retention Schedule and Disposal Review

Useful for records management and archive compliance.

Needed functions:

- assign retention period by category
- alert users when files are due for review
- mark files for transfer, retention, or disposal
- keep a disposal approval trail

### 4. Incoming and Outgoing Transmittal Tracking

Useful for official letters, endorsements, requests, and routed planning documents.

Needed functions:

- log sender and recipient
- record received and released dates
- track routing status
- print receiving or transmittal logs
- link transmittal entries to archived files

### 5. OCR for Scanned Documents

Useful for scanned PDFs, image-based documents, and older paper records.

Needed functions:

- extract text from scanned files
- include OCR text in search indexing
- improve search results for image-based archives

### 6. Map and Location Tagging

Useful for zoning, land-use planning, and project-site documentation.

Needed functions:

- tag documents by barangay, sitio, purok, or coordinates
- search by location
- attach map preview or site reference

### 7. Physical Copy Request and Release Log

Useful for blueprint copies, printed plans, and certified document requests.

Needed functions:

- record requester details
- track release date and quantity
- log purpose of request
- print release history if needed

### 8. Deadline and Compliance Reminders

Useful for recurring submissions, reporting schedules, and expiration-based records.

Needed functions:

- dashboard reminders
- due date tracking
- overdue status views
- notifications by category or project

## Suggested Priority Order

Recommended implementation order:

1. secure private file storage
2. user profile management
3. profile picture upload
4. account approval workflow
5. system settings module
6. document versioning
7. project-based archive records
8. transmittal tracking
9. retention schedule and disposal review
10. OCR, map tagging, and compliance reminders

If you will expand beyond archiving into MPDO office operations, implement Layer 2 modules after the archiving system is secure and stable.

## Summary

The MPDO system already covers the main archive workflow, but it still needs several important features to become more complete and more aligned with actual MPDO operations.

The highest-priority additions are:

- secure storage
- self-service profile management
- account approval workflow
- admin settings management

After these are complete, the best next step is to add MPDO-specific tools such as versioning, project-based records, transmittal tracking, retention handling, and map-based document tagging.

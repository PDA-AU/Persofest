# PERSOFEST'26 - Event Registration Portal PRD

## Project Overview
A comprehensive web application for PERSOFEST'26 event onboarding and registration portal with Neobrutalism design aesthetic.

## Tech Stack
- **Backend:** FastAPI (Python) + SQLAlchemy ORM
- **Database:** PostgreSQL (local instance)
- **Frontend:** React.js + Tailwind CSS
- **Design:** Neobrutalism (bold borders, vibrant colors, sharp animations)

## User Personas
1. **Students** - College students registering for PERSOFEST'26 event
2. **Event Organizers** - Managing participant registrations (future)

## Core Requirements
- User registration with multi-step form
- JWT-based authentication
- Profile dashboard with edit mode
- Profile picture upload (server-side storage)
- Responsive sidebar navigation
- Mobile-first responsive design

## Database Schema
### Participants Table
- id (Primary Key)
- name (String)
- register_number (Unique String)
- email (Unique String)
- phone_number (String)
- department (Enum - 10 departments)
- year_of_study (Enum - First/Second/Third)
- profile_picture (String - URL path)
- password_hash (String)
- created_at, updated_at (DateTime)

## What's Been Implemented ✅
**Date: Jan 27, 2026**

### Backend (FastAPI)
- [x] Health check endpoint
- [x] Departments & Years list endpoints
- [x] User registration (POST /api/auth/register)
- [x] JWT Login (POST /api/auth/login)
- [x] Profile retrieval (GET /api/profile/me)
- [x] Profile update (PATCH /api/profile/me)
- [x] Profile picture upload (POST /api/upload/profile-picture)
- [x] CORS middleware enabled
- [x] SQLAlchemy models with Enums

### Frontend (React + Tailwind)
- [x] Landing page with animated feature cards
- [x] Multi-step registration form (3 steps)
- [x] Login page
- [x] Profile dashboard (Bento grid layout)
- [x] Edit mode toggle
- [x] Profile picture upload UI
- [x] Responsive sidebar navigation
- [x] Mobile header bar with hamburger menu
- [x] Neobrutalism design system
  - Bold 2-4px black borders
  - Hard shadows with translate effects
  - Vibrant colors (Primary Red, Secondary Blue, Accent Lime)
  - Lexend Mega + Space Mono fonts
  - Float animations for decorative elements

### Responsiveness Improvements
- [x] Mobile-optimized card spacing
- [x] Mobile header bar that doesn't overlap content
- [x] Smooth block entry animations
- [x] Floating decorative elements (desktop only)

## Prioritized Backlog

### P0 - Critical (None remaining)
All critical features implemented

### P1 - High Priority
- [ ] Event schedule/details page
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Admin dashboard for viewing registrations

### P2 - Medium Priority
- [ ] QR code generation for registered participants
- [ ] Event notifications/announcements
- [ ] Participant list/directory
- [ ] Export registrations to CSV

### P3 - Nice to Have
- [ ] Dark mode toggle
- [ ] Social sharing for event
- [ ] Real-time registration counter
- [ ] Multi-language support

## Next Tasks
1. Add event schedule/details page
2. Implement email verification
3. Create admin panel for organizers
4. Add QR code generation for check-in

## Test Status
- Backend: 100% (8/8 tests passed)
- Frontend: 95% (14/15 tests - minor console warnings)

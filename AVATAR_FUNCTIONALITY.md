# Avatar/Profile Photo Functionality

## Overview
The avatar/profile photo functionality has been implemented for all user types (students, teachers, staff, managers, and admins) across the InvAI application.

## Features
- **Default Avatar**: All users start with a default avatar image when they first log in
- **Change Photo**: Users can upload their own profile photo (JPG/PNG, up to 2MB)
- **Universal Access**: All user roles can change their profile photo through the `/profile` page
- **Real-time Updates**: Avatar changes are immediately reflected in the sidebar and other components

## Implementation Details

### Frontend Components
1. **Main Profile Page** (`/src/pages/profile/Profile.jsx`)
   - Used by all user types (students, teachers, staff, managers, admins)
   - Contains photo upload functionality with preview
   - Integrates with backend API for avatar upload

2. **Manager Profile Page** (`/src/pages/manager/Profile.jsx`)
   - Legacy manager-specific profile page (if still in use)
   - Also includes the same avatar functionality

3. **Sidebar Component** (`/src/components/Dashboard/Sidebar.jsx`)
   - Displays user avatar in the sidebar
   - Automatically updates when avatar is changed

### Backend Implementation
1. **Avatar Upload Endpoint** (`POST /api/users/:id/avatar`)
   - Handles file upload with multer
   - Stores files in `/backend/uploads/avatars/` directory
   - Saves avatar URL in database `users.avatar_url` column

2. **File Serving** (`/uploads` static route)
   - Serves uploaded avatars at `http://localhost:5000/uploads/avatars/filename`

### Database Schema
- `users.avatar_url` column stores the relative path to the avatar file
- Example: `/uploads/avatars/u123.jpg`

### Utility Functions
- `getAvatarUrl(user)` - Returns full avatar URL or default avatar
- `hasCustomAvatar(user)` - Checks if user has uploaded a custom avatar

## Usage Instructions

### For Users (All Roles)
1. Navigate to Profile page (`/profile`)
2. In the "Profile Photo" section, click "Change Photo"
3. Select an image file (JPG/PNG, max 2MB)
4. Click "Save Photo" to upload
5. Avatar will be updated immediately across the application

### For Developers
```javascript
import { getAvatarUrl } from '@/utils/avatarUtils';

// Get user's avatar URL (with fallback to default)
const avatarUrl = getAvatarUrl(user);

// Use in img tag
<img src={getAvatarUrl(user)} alt="User avatar" />
```

## File Structure
```
frontend/src/
├── assets/avatar.png                    # Default avatar image
├── components/Dashboard/Sidebar.jsx     # Displays user avatar
├── pages/profile/Profile.jsx            # Main profile page with avatar upload
├── pages/manager/Profile.jsx            # Manager profile page (legacy)
├── utils/avatarUtils.js                 # Avatar utility functions
└── ...

backend/
├── src/routes/userRoutes.js             # Avatar upload endpoint
├── uploads/avatars/                     # Uploaded avatar files
└── ...
```

## Technical Notes
- Avatar files are named as `u{userId}.{extension}` (e.g., `u7.jpg`)
- The backend automatically creates the uploads directory if it doesn't exist
- File size limit is enforced at 2MB
- Only image files (MIME type starting with 'image/') are accepted
- CORS is properly configured to allow avatar access from frontend

## Security Considerations
- File type validation prevents non-image uploads
- File size limits prevent abuse
- Users can only upload avatars for their own account (authorization check)
- Uploaded files are stored with safe, predictable naming convention
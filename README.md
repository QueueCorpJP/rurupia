# Rurupia - Therapist Connectivity Platform

A web application that connects clients with therapists, manages therapy-related services, and provides a platform for therapist-client interaction.

## Features

- Multiple user roles: Client, Therapist, Store Admin, System Admin
- Therapist browsing and filtering
- Appointment booking and management
- Messaging system between clients and therapists
- Authentication with email/password, LINE, and Google
- Blog system with Rich Text Editor
- Analytics for store and system admins
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Backend:** Supabase (Auth, Database, Storage)
- **Infrastructure:** AWS (S3, CloudFront)

## Deployment

This project is automatically deployed to AWS using GitHub Actions:

1. The React application is built using Vite
2. Built assets are uploaded to AWS S3
3. CloudFront distribution is invalidated to serve the latest content

### AWS Resources

- **S3 Bucket:** `therapist-connectivity-frontend-93b9faa0` (Tokyo region)
- **CloudFront Distribution:** `dqv3ckdbgwb1i.cloudfront.net`
- **Custom Domain:** `rupipia.jp` (pending DNS configuration)

### CI/CD Setup

The repository includes GitHub Actions workflows that automatically:
- Build the application
- Deploy to AWS S3
- Invalidate the CloudFront cache

To use this CI/CD pipeline, you must set up the following GitHub repository secrets:
- `AWS_ACCESS_KEY_ID`: AWS access key with permissions for S3 and CloudFront
- `AWS_SECRET_ACCESS_KEY`: Corresponding AWS secret key
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_TINYMCE_API_KEY`: Your TinyMCE API key

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## DNS Configuration

To set up the custom domain (rupipia.jp), you need to:

1. Add the following DNS validation record for the SSL certificate:
   - CNAME: `_9a689ffbd47df0f833e3dcb0d742c029.rupipia.jp`
   - Value: `_ca8dbb7f5b87f13819f0f5bcd230052e.xlfgrmvvlj.acm-validations.aws`

2. After the certificate is validated, add a CNAME record:
   - CNAME: `rupipia.jp`
   - Value: `dqv3ckdbgwb1i.cloudfront.net`

## Live Demo
The application is deployed and accessible at: [https://therapist-connectivity.vercel.app/](https://therapist-connectivity.vercel.app/)

## Available Routes

### Main Pages
- `/` - Home/Landing page
- `/therapists` - Browse all therapists
- `/therapists/:id` - View specific therapist details
- `/book/:id` - Book an appointment with a specific therapist
- `/contact` - Contact page
- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog post

### User Routes
- `/user-profile` - User profile management
- `/user-bookings` - View and manage user bookings
- `/messages` - Messages overview
- `/messages/:id` - Individual message thread

### Therapist Routes
- `/therapist-dashboard` - Therapist's dashboard
- `/therapist-login` - Therapist login
- `/therapist-signup` - Therapist registration

### Authentication Routes
- `/login` - User login
- `/signup` - User registration
- `/store-login` - Store admin login
- `/store-signup` - Store registration

### Admin Panel Routes
All admin routes are prefixed with `/admin`
- `/admin` - Admin dashboard
- `/admin/accounts` - Manage user accounts
- `/admin/requests` - Handle requests
- `/admin/inquiries` - Manage inquiries
- `/admin/blog` - Blog management
- `/admin/settings` - Admin settings

### Store Management Routes
All store routes are prefixed with `/store-admin`
- `/store-admin` - Store dashboard
- `/store-admin/therapists` - Manage therapists
- `/store-admin/bookings` - Manage bookings
- `/store-admin/courses` - Manage courses
- `/store-admin/inquiries` - Handle store inquiries
- `/store-admin/analytics` - View analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/therapists` - List therapists
- `GET /api/users/therapists/:id` - Get therapist details

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/:id` - Get appointment details

### Messaging
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation

### Store Management
- `GET /api/store/analytics` - Get store analytics
- `GET /api/store/bookings` - Get store bookings
- `GET /api/store/courses` - Get courses
- `POST /api/store/courses` - Create course
- `PUT /api/store/courses/:id` - Update course

# Memory and Lesson Management System

This system maintains user interactions, memories, and learned lessons through two primary JSON files:

## memory.json
Stores user-related information including:
- Basic identity
- Behaviors
- Preferences
- Goals
- Relationships (up to 3 degrees of separation)
- Entities and their relationships

## lessons.json
Tracks error-related information including:
- Error patterns
- Solutions
- Success metrics
- Verification steps

## File Management
- Files automatically split at 1000 lines
- Atomic and factual observations
- Clear naming conventions
- Regular updates and maintenance

## Quality Guidelines
### Lessons
- Descriptive names (e.g., "NEXTJS_BUILD_ERROR_001")
- Detailed error patterns
- Testable verification steps
- Environmental requirements
- Solution effectiveness tracking

### Memory
- Atomic observations
- Active voice relations
- Consistent entity naming
- Meaningful connections
- Regular cleanup

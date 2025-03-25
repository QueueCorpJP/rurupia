# Therapist Connectivity Project

A web application for connecting therapists and managing therapy-related services.

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

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- React Router DOM
- Vercel (Deployment)

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_URL` - API base URL
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Authentication URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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

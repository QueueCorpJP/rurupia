# Therapist Connectivity Project

A web application for connecting therapists and managing therapy-related services.

## Live Demo
The application is deployed and accessible at: [https://therapist-connectivity.vercel.app/](https://therapist-connectivity.vercel.app/)

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login endpoint
- `POST /api/auth/register` - New user registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session information

### User Management
- `GET /api/users/profile` - Get user profile information
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/therapists` - List all therapists
- `GET /api/users/therapists/:id` - Get specific therapist details

### Appointment Management
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update existing appointment
- `DELETE /api/appointments/:id` - Cancel/delete appointment
- `GET /api/appointments/:id` - Get specific appointment details

### Availability Management
- `GET /api/availability` - Get availability slots
- `POST /api/availability` - Set availability
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Remove availability slot

### Communication
- `GET /api/messages` - Get message history
- `POST /api/messages` - Send new message
- `GET /api/messages/:conversationId` - Get conversation messages

## Pages/Routes

- `/` - Home/Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/appointments` - Appointments management
- `/therapists` - Therapist listing
- `/messages` - Messaging interface
- `/availability` - Availability management

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
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

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

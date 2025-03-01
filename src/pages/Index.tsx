
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, Check, Star } from 'lucide-react';
import TherapistCard from '../components/TherapistCard';
import { therapists } from '../utils/data';

const Index = () => {
  // Show only 3 featured therapists on the landing page
  const featuredTherapists = therapists
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <Layout>
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Find Your Perfect Male Massage Therapist
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Book therapeutic massage sessions with professional male therapists specialized in your specific needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  to="/therapists"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Browse Therapists
                </Link>
                <Link
                  to="/about"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Verified professionals
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Secure bookings
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Personalized care
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  alt="Professional Massage"
                  className="object-cover w-full h-full"
                  height="600"
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
                  width="600"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                The Right Care for Your Wellness Journey
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                We connect you with qualified male massage therapists who specialize in various techniques.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Personalized Care</h3>
              <p className="text-muted-foreground">
                Our platform helps you find therapists that match your specific preferences and needs.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Verified Professionals</h3>
              <p className="text-muted-foreground">
                All therapists are certified, background-checked, and have verified credentials.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Direct Communication</h3>
              <p className="text-muted-foreground">
                Message therapists to discuss your needs before booking your appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Featured Therapists
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Meet Our Top-Rated Professionals
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Browse through our selection of highly-rated massage therapists.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {featuredTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link
              to="/therapists"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              View All Therapists
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                What Our Clients Say
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Read about the positive experiences from our satisfied clients.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            {[
              {
                name: "Emily Johnson",
                review: "Found the perfect therapist for my chronic back pain. The booking process was smooth and the massage helped tremendously.",
                rating: 5
              },
              {
                name: "Sarah Williams",
                review: "I was looking for a therapist who specializes in sports massage and found exactly what I needed. Great experience overall!",
                rating: 5
              },
              {
                name: "Michelle Davis",
                review: "The ability to message the therapist before booking was incredibly helpful. I felt comfortable knowing what to expect.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.review}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

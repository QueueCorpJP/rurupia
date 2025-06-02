import { describe, it, expect } from 'vitest';
import type { UserProfile, BlogPost, TherapistProfile } from '../types';

describe('Type Utilities', () => {
  it('should validate UserProfile interface', () => {
    const mockUser: UserProfile = {
      id: '123',
      email: 'test@example.com',
      nickname: 'TestUser',
      age: '25',
      avatar_url: 'https://example.com/avatar.jpg',
      mbti: 'INTJ',
      hobbies: ['reading', 'coding'],
      is_verified: true
    };

    expect(mockUser.id).toBe('123');
    expect(mockUser.email).toBe('test@example.com');
    expect(mockUser.nickname).toBe('TestUser');
  });

  it('should validate BlogPost interface', () => {
    const mockPost: BlogPost = {
      id: 'post-123',
      title: 'Test Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      slug: 'test-post',
      coverImage: 'https://example.com/image.jpg',
      category: 'wellness',
      tags: ['health', 'wellness'],
      publishedAt: '2023-01-01T00:00:00Z',
      readTime: 5,
      views: 100,
      author_name: 'Test Author',
      author_avatar: 'https://example.com/author.jpg'
    };

    expect(mockPost.id).toBe('post-123');
    expect(mockPost.title).toBe('Test Post');
    expect(mockPost.views).toBe(100);
  });

  it('should validate TherapistProfile interface', () => {
    const mockTherapist: TherapistProfile = {
      id: 'therapist-123',
      name: 'Dr. Test',
      description: 'Test description',
      qualifications: ['License A', 'Certification B'],
      specialties: ['anxiety', 'depression'],
      location: 'Tokyo',
      price: 5000,
      rating: 4.5,
      reviews: 100,
      experience: 5,
      availability: ['Monday', 'Tuesday'],
      workingDays: ['Monday', 'Tuesday'],
      workingHours: { start: '09:00', end: '17:00' },
      pricePerHour: 5000,
      bio: 'Experienced therapist'
    };

    expect(mockTherapist.id).toBe('therapist-123');
    expect(mockTherapist.name).toBe('Dr. Test');
    expect(mockTherapist.rating).toBe(4.5);
  });

  it('should handle optional fields in UserProfile', () => {
    const minimalUser: UserProfile = {
      id: '456'
    };

    expect(minimalUser.id).toBe('456');
    expect(minimalUser.nickname).toBeUndefined();
    expect(minimalUser.email).toBeUndefined();
  });
}); 
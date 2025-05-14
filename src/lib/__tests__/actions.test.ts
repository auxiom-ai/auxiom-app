import {
    getNewsletterStatus,
    getOnboardingStatus,
    getUserAccountStatus,
    getUserDeliveryDay,
    getUserDeliveryStatus,
    getUserKeywords,
    getUserPlan,
    getUserPodcasts,
    getUserProfile,
    getVerificationStatus,
    subscribeToNewsletter,
    updatePodcastListenedStatus
} from '../actions';
import { supabase } from '../db/drizzle';

// Mock Supabase client
jest.mock('../db/drizzle', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis()
    }))
  }
}));

describe('User Actions', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    occupation: 'Developer',
    industry: 'Tech',
    role: 'Developer',
    keywords: ['javascript', 'react', 'typescript', 'node', 'supabase'],
    delivery_day: 1,
    plan: 'free',
    active: true,
    verified: true,
    delivered: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock auth.getUser
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 1 } }
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: mockUser
      });

      const result = await getUserProfile();
      expect(result).toEqual(mockUser);
    });

    it('should redirect if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      await expect(getUserProfile()).rejects.toThrow();
    });
  });

  describe('getUserKeywords', () => {
    it('should return user keywords', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { keywords: mockUser.keywords }
      });

      const result = await getUserKeywords();
      expect(result).toEqual(mockUser.keywords);
    });
  });

  describe('getUserDeliveryDay', () => {
    it('should return user delivery day', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { delivery_day: mockUser.delivery_day }
      });

      const result = await getUserDeliveryDay();
      expect(result).toBe(mockUser.delivery_day);
    });
  });

  describe('getUserDeliveryStatus', () => {
    it('should return true if user has recent delivery', async () => {
      const recentDate = new Date().toISOString();
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { delivered: recentDate }
      });

      const result = await getUserDeliveryStatus();
      expect(result).toBe(true);
    });

    it('should return false if user has no recent delivery', async () => {
      const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { delivered: oldDate }
      });

      const result = await getUserDeliveryStatus();
      expect(result).toBe(false);
    });
  });

  describe('getUserAccountStatus', () => {
    it('should return user account status', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { active: mockUser.active }
      });

      const result = await getUserAccountStatus();
      expect(result).toBe(mockUser.active);
    });
  });

  describe('getUserPlan', () => {
    it('should return user plan', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { plan: mockUser.plan }
      });

      const result = await getUserPlan();
      expect(result).toBe(mockUser.plan);
    });
  });

  describe('getUserPodcasts', () => {
    it('should return user podcasts', async () => {
      const mockPodcasts = [
        { id: 1, title: 'Podcast 1', user_id: 1 },
        { id: 2, title: 'Podcast 2', user_id: 1 }
      ];

      (supabase.from('podcasts').select().eq as jest.Mock).mockResolvedValue({
        data: mockPodcasts
      });

      const result = await getUserPodcasts();
      expect(result).toEqual(mockPodcasts);
    });
  });

  describe('updatePodcastListenedStatus', () => {
    it('should update podcast listened status', async () => {
      (supabase.from('podcasts').update().eq().select().single as jest.Mock).mockResolvedValue({
        data: { id: 1, listened: true }
      });

      const result = await updatePodcastListenedStatus(1);
      expect(result).toEqual({ success: 'Podcast marked as listened.' });
    });

    it('should return error if podcast not found', async () => {
      (supabase.from('podcasts').update().eq().select().single as jest.Mock).mockResolvedValue({
        error: new Error('Not found')
      });

      const result = await updatePodcastListenedStatus(999);
      expect(result).toEqual({ error: 'Podcast not found.' });
    });
  });

  describe('getNewsletterStatus', () => {
    it('should return true if user is subscribed', async () => {
      (supabase.from('emails').select().eq().single as jest.Mock).mockResolvedValue({
        data: { email: mockUser.email }
      });

      const result = await getNewsletterStatus();
      expect(result).toBe(true);
    });

    it('should return false if user is not subscribed', async () => {
      (supabase.from('emails').select().eq().single as jest.Mock).mockResolvedValue({
        data: null
      });

      const result = await getNewsletterStatus();
      expect(result).toBe(false);
    });
  });

  describe('subscribeToNewsletter', () => {
    it('should successfully subscribe user', async () => {
      (supabase.from('emails').insert as jest.Mock).mockResolvedValue({
        error: null
      });

      const result = await subscribeToNewsletter();
      expect(result).toEqual({ success: 'Successfully subscribed to newsletter.' });
    });

    it('should handle subscription error', async () => {
      (supabase.from('emails').insert as jest.Mock).mockResolvedValue({
        error: new Error('Subscription failed')
      });

      const result = await subscribeToNewsletter();
      expect(result).toEqual({ error: 'Failed to subscribe to newsletter.' });
    });
  });

  describe('getVerificationStatus', () => {
    it('should return user verification status', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: { verified: mockUser.verified }
      });

      const result = await getVerificationStatus();
      expect(result).toBe(mockUser.verified);
    });
  });

  describe('getOnboardingStatus', () => {
    it('should return true if onboarding is complete', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: {
          name: mockUser.name,
          occupation: mockUser.occupation,
          keywords: mockUser.keywords
        }
      });

      const result = await getOnboardingStatus();
      expect(result).toBe(true);
    });

    it('should return false if onboarding is incomplete', async () => {
      (supabase.from('users').select().eq().single as jest.Mock).mockResolvedValue({
        data: {
          name: '',
          occupation: '',
          keywords: []
        }
      });

      const result = await getOnboardingStatus();
      expect(result).toBe(false);
    });
  });
}); 
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
    from: jest.fn()
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
    jest.clearAllMocks();
    
    // Mock auth.getUser with email
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 1, email: mockUser.email } }
    });

    // Setup default mock responses
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUser }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis()
    };

    (supabase.from as jest.Mock).mockReturnValue(mockChain);
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const result = await getUserProfile();
      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from('users').select).toHaveBeenCalled();
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
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
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { keywords: mockUser.keywords } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserKeywords();
      expect(result).toEqual(mockUser.keywords);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('getUserDeliveryDay', () => {
    it('should return user delivery day', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { delivery_day: mockUser.delivery_day } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserDeliveryDay();
      expect(result).toBe(mockUser.delivery_day);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('getUserDeliveryStatus', () => {
    it('should return true if user has recent delivery', async () => {
      // Mock the current date to be a Wednesday
      const mockDate = new Date('2024-03-20T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      // Set delivered date to be after last Sunday
      const deliveredDate = new Date('2024-03-19T12:00:00Z').toISOString();
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { 
            delivered: deliveredDate,
            id: 1 
          } 
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserDeliveryStatus();
      expect(result).toBe(true);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);

      // Clean up
      jest.useRealTimers();
    });

    it('should return false if user has no recent delivery', async () => {
      // Mock the current date to be a Wednesday
      const mockDate = new Date('2024-03-20T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      // Set delivered date to be before last Sunday
      const oldDate = new Date('2024-03-10T12:00:00Z').toISOString();
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { delivered: oldDate } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserDeliveryStatus();
      expect(result).toBe(false);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);

      // Clean up
      jest.useRealTimers();
    });
  });

  describe('getUserAccountStatus', () => {
    it('should return user account status', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { active: mockUser.active } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserAccountStatus();
      expect(result).toBe(mockUser.active);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('getUserPlan', () => {
    it('should return user plan', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { plan: mockUser.plan } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserPlan();
      expect(result).toBe(mockUser.plan);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('getUserPodcasts', () => {
    it('should return user podcasts', async () => {
      const mockPodcasts = [
        { id: 1, title: 'Podcast 1', user_id: 1 },
        { id: 2, title: 'Podcast 2', user_id: 1 }
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockPodcasts })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getUserPodcasts();
      expect(result).toEqual(mockPodcasts);
      expect(supabase.from('podcasts').select().eq).toHaveBeenCalledWith('user_id', 1);
    });
  });

  describe('updatePodcastListenedStatus', () => {
    it('should update podcast listened status', async () => {
      const mockChain = {
        update: jest.fn().mockImplementation((values: any) => {
          expect(values).toEqual({ listened: true });
          return {
            eq: jest.fn().mockImplementation((column: string, value: any) => {
              expect(column).toBe('id');
              expect(value).toBe(1);
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: { id: 1, listened: true } })
              };
            })
          };
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await updatePodcastListenedStatus(1);
      expect(result).toEqual({ success: 'Podcast marked as listened.' });
    });

    it('should return error if podcast not found', async () => {
      const mockChain = {
        update: jest.fn().mockImplementation((values: any) => {
          expect(values).toEqual({ listened: true });
          return {
            eq: jest.fn().mockImplementation((column: string, value: any) => {
              expect(column).toBe('id');
              expect(value).toBe(999);
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ error: new Error('Not found') })
              };
            })
          };
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await updatePodcastListenedStatus(999);
      expect(result).toEqual({ error: 'Podcast not found.' });
    });
  });

  describe('getNewsletterStatus', () => {
    it('should return true if user is subscribed', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { 
            email: mockUser.email,
            id: 1 
          } 
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getNewsletterStatus();
      expect(result).toBe(true);
      expect(supabase.from('emails').select().eq).toHaveBeenCalledWith('email', mockUser.email);
    });

    it('should return false if user is not subscribed', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getNewsletterStatus();
      expect(result).toBe(false);
    });
  });

  describe('subscribeToNewsletter', () => {
    it('should successfully subscribe user', async () => {
      const mockChain = {
        insert: jest.fn().mockResolvedValue({ 
          data: { email: mockUser.email },
          error: null 
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await subscribeToNewsletter();
      expect(result).toEqual({ success: 'Successfully subscribed to newsletter.' });
      expect(supabase.from('emails').insert).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should handle subscription error', async () => {
      const mockChain = {
        insert: jest.fn().mockResolvedValue({ error: new Error('Subscription failed') })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await subscribeToNewsletter();
      expect(result).toEqual({ error: 'Failed to subscribe to newsletter.' });
    });
  });

  describe('getVerificationStatus', () => {
    it('should return user verification status', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { verified: mockUser.verified } })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getVerificationStatus();
      expect(result).toBe(mockUser.verified);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('getOnboardingStatus', () => {
    it('should return true if onboarding is complete', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            name: mockUser.name,
            occupation: mockUser.occupation,
            keywords: mockUser.keywords
          }
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getOnboardingStatus();
      expect(result).toBe(true);
      expect(supabase.from('users').select().eq).toHaveBeenCalledWith('id', 1);
    });

    it('should return false if onboarding is incomplete', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            name: '',
            occupation: '',
            keywords: []
          }
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await getOnboardingStatus();
      expect(result).toBe(false);
    });
  });
}); 
// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
})); 
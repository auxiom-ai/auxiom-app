// Enumerations for Storage Keys
export enum eStorageKey {
  PendingEmail = 'pending_email',
  OnboardingState = 'onboarding_state',
}

export enum eOnboardingState {
  Init = 'init',
  PendingEmailVerification = 'pending_email_verification',
  PrefOccupation = 'pref_occupation',
  PrefInterests = 'pref_interests',
  PrefDeliveryDay = 'pref_delivery_day',
  OnboardingCompleted = 'onboarding_completed'
}
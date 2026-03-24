export const COLORS = {
  background: '#F3F4F8',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  muted: '#667085',
  primary: '#7B2FF7',
  primaryDark: '#3A1C71',
  tabInactive: '#6B7280',
  shadow: '#0F172A'
};

export const GRADIENTS = {
  primary: ['#7B2FF7', '#3A1C71'] as const,
  checkout: ['#0B1635', '#1C2B55'] as const
};

export const STORAGE_KEYS = {
  authSession: 'bmate.auth.session',
  userProfile: 'bmate.auth.profile',
  authBypass: 'bmate.auth.bypass'
};

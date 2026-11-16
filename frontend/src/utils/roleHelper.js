/**
 * Role & Dashboard Navigation Helpers for StaySync
 * Determines primary portal URL and role badges according to user account.
 */

export const getRoleDashboardLink = (user) => {
  if (!user) return '/login';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return '/admin-dashboard';
  if (user.role === 'HOSTEL_OWNER' || (user.role === 'PROPERTY_OWNER' && user.propertyType === 'Hostel')) {
    return '/owner/hostel';
  }
  if (user.role === 'PG_OWNER' || (user.role === 'PROPERTY_OWNER' && user.propertyType === 'PG')) {
    return '/owner/pg';
  }
  if (user.role === 'ROOM_OWNER' || (user.role === 'PROPERTY_OWNER' && (user.propertyType === 'Room' || user.propertyType === 'Flat'))) {
    return '/owner/room';
  }
  if (user.role === 'TIFFIN_PROVIDER' || (user.role === 'PROVIDER' && user.providerType?.toLowerCase() !== 'cleaning')) {
    return '/provider/tiffin';
  }
  if (user.role === 'CLEANING_LAUNDRY_PROVIDER' || (user.role === 'PROVIDER' && user.providerType?.toLowerCase() === 'cleaning')) {
    return '/provider/services';
  }
  if (user.role === 'PROPERTY_OWNER') return '/provider-dashboard?type=property';
  if (user.role === 'PROVIDER') return '/provider-dashboard';
  return '/dashboard';
};

export const getRoleBadgeLabel = (user) => {
  if (!user) return '';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'Administrator';
  if (user.role === 'HOSTEL_OWNER' || (user.role === 'PROPERTY_OWNER' && user.propertyType === 'Hostel')) return 'Hostel Owner';
  if (user.role === 'PG_OWNER' || (user.role === 'PROPERTY_OWNER' && user.propertyType === 'PG')) return 'PG Owner';
  if (user.role === 'ROOM_OWNER' || (user.role === 'PROPERTY_OWNER' && (user.propertyType === 'Room' || user.propertyType === 'Flat'))) return 'Room Owner';
  if (user.role === 'TIFFIN_PROVIDER' || (user.role === 'PROVIDER' && user.providerType?.toLowerCase() !== 'cleaning')) return 'Tiffin Partner';
  if (user.role === 'CLEANING_LAUNDRY_PROVIDER' || (user.role === 'PROVIDER' && user.providerType?.toLowerCase() === 'cleaning')) return 'Cleaning & Laundry';
  if (user.role === 'PROPERTY_OWNER') return 'Property Owner';
  if (user.role === 'PROVIDER') return 'Service Partner';
  return 'Resident';
};

export const isProviderUser = (user) => {
  if (!user) return false;
  return (
    user.role === 'PROPERTY_OWNER' ||
    user.role === 'HOSTEL_OWNER' ||
    user.role === 'PG_OWNER' ||
    user.role === 'ROOM_OWNER' ||
    user.role === 'PROVIDER' ||
    user.role === 'TIFFIN_PROVIDER' ||
    user.role === 'CLEANING_LAUNDRY_PROVIDER'
  );
};

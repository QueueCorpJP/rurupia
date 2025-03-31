export interface BookingData {
  id: string;
  therapist_id: string;
  user_id: string;
  service_id: string;
  date: string;
  "status therapist": string;
  "status store": string;
  notes?: string;
  location?: string;
  price?: number;
  created_at: string;
}

export interface FormattedBooking extends Omit<BookingData, 'status therapist' | 'status store'> {
  status: string; // Combined status for display
  therapistStatus: string;
  storeStatus: string;
}

export const calculateCombinedStatus = (therapistStatus: string, storeStatus: string): string => {
  if (!therapistStatus || !storeStatus) return 'pending';
  if (therapistStatus === 'cancelled' || storeStatus === 'cancelled') return 'cancelled';
  if (therapistStatus === 'confirmed' && storeStatus === 'confirmed') return 'confirmed';
  if ((therapistStatus === 'completed' || storeStatus === 'completed') &&
      (therapistStatus === 'confirmed' || therapistStatus === 'completed') &&
      (storeStatus === 'confirmed' || storeStatus === 'completed')) return 'completed';
  return 'pending';
}; 

import { useState } from 'react';
import { Therapist } from '../utils/types';
import { toast } from 'sonner';
import BookingRequestForm from './BookingRequestForm';

interface BookingFormProps {
  therapist: Therapist;
  onClose?: () => void;
}

const BookingForm = ({ therapist, onClose }: BookingFormProps) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">セッションをリクエスト</h2>
        <BookingRequestForm therapist={therapist} onClose={onClose} />
      </div>
    </div>
  );
};

export default BookingForm;

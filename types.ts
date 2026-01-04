
export type Category = '航班' | '景點' | '美食' | '交通' | '住宿' | '購物' | '其他';

export interface ItineraryItem {
  id: string;
  name: string;
  category: Category;
  startTime: string;
  endTime: string;
  subSpots?: string[];
  price?: string;
  bookingLink?: string;
  openingHours?: string;
  notes?: string;
  lockerInfo?: string;
  transportMode?: 'walk' | 'car' | 'train' | 'plane';
  transportDetail?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

export interface DayPlan {
  date: string;
  weekday: string;
  itinerary: ItineraryItem[];
}

export type TabType = 'itinerary' | 'info' | 'currency' | 'map' | 'chat';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

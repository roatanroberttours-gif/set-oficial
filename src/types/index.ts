// Tipos para los datos de Google Sheets
export interface Tour {
  id: string;
  name: string;
  description: string;
  personPrice: number;
  price: number;
  image: string;
  duration?: string;
  included?: string[];
  requirements?: string;
  category?: string;
  max_personas?: number;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  rating?: number;
  testimonial?: string;
  author?: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  description?: string;
  category?: string;
  images?: string[];
}

// Tipos para el sistema de idiomas
export type Language = 'es' | 'en';

export interface Translations {
  nav: {
    home: string;
    services: string;
    gallery: string;
    contact: string;
    experiences: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    description: string;
  };
  services: {
    title: string;
    subtitle: string;
    viewDetails: string;
    bookNow: string;
    pricePerPerson: string;
    duration: string;
    included: string;
    requirements: string;
  };
  experiences: {
    title: string;
    subtitle: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    whatsapp: string;
    social: string;
    name: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  booking: {
    title: string;
    selectService: string;
    selectDate: string;
    numberOfPeople: string;
    customerInfo: string;
    fullName: string;
    email: string;
    phone: string;
    specialRequests: string;
    paymentMethod: string;
    paypal: string;
    total: string;
    book: string;
    cancel: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    next: string;
    previous: string;
    close: string;
  };
}

// Tipos para formularios
export interface BookingForm {
  serviceId: string;
  date: string;
  numberOfPeople: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Configuración de APIs
export interface APIConfig {
  googleSheets: {
    apiKey: string;
    spreadsheetId: string;
  };
  paypal: {
    clientId: string;
  };
}

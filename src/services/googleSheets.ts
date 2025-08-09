import axios from 'axios';
import { Tour, Experience, GalleryItem } from '../types';

const API_KEY = 'AIzaSyCEJHF8faiqlEzqDc-IKR9Xpsol9VMOFjI';
const SPREADSHEET_ID = '1wjVwbCJ8p3l-WAJ7s2fMqK5uHBEatodgVc6wJoW7ksg';

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// Función auxiliar para crear la URL de la API
const createSheetUrl = (sheetName: string, range: string = '') => {
  const fullRange = range ? `${sheetName}!${range}` : sheetName;
  return `${BASE_URL}/${fullRange}?key=${API_KEY}`;
};

// Función para procesar datos de productos/tours
const processToursData = (data: any[][]): Tour[] => {
  if (!data || data.length < 2) return [];
  
  const headers = data[0].map(h => h.toLowerCase());
  const rows = data.slice(1);
  
  return rows.map((row, index) => {
    const tour: Tour = {
      id: row[headers.indexOf('id')] || `tour-${index + 1}`,
      name: row[headers.indexOf('name')] || row[headers.indexOf('nombre')] || '',
      description: row[headers.indexOf('description')] || row[headers.indexOf('descripcion')] || '',
      personPrice: parseFloat(row[headers.indexOf('personprice')] || row[headers.indexOf('precioperpersona')] || '0'),
      price: parseFloat(row[headers.indexOf('price')] || row[headers.indexOf('precio')] || '0'),
      image: row[headers.indexOf('image')] || row[headers.indexOf('imagen')] || '',
      duration: row[headers.indexOf('duration')] || row[headers.indexOf('duracion')] || '',
      category: row[headers.indexOf('category')] || row[headers.indexOf('categoria')] || 'adventure',
    };
    
    // Procesar elementos incluidos si existe la columna
    const includedIndex = headers.indexOf('included') || headers.indexOf('incluye');
    if (includedIndex !== -1 && row[includedIndex]) {
      tour.included = row[includedIndex].split(',').map(item => item.trim());
    }
    
    tour.requirements = row[headers.indexOf('requirements')] || row[headers.indexOf('requisitos')] || '';
    
    return tour;
  }).filter(tour => tour.name); // Filtrar tours sin nombre
};

// Función para procesar datos de experiencias
const processExperiencesData = (data: any[][]): Experience[] => {
  if (!data || data.length < 2) return [];
  
  const headers = data[0].map(h => h.toLowerCase());
  const rows = data.slice(1);
  
  return rows.map((row, index) => ({
    id: row[headers.indexOf('id')] || `exp-${index + 1}`,
    title: row[headers.indexOf('title')] || row[headers.indexOf('titulo')] || '',
    description: row[headers.indexOf('description')] || row[headers.indexOf('descripcion')] || '',
    image: row[headers.indexOf('image')] || row[headers.indexOf('imagen')] || '',
    rating: parseFloat(row[headers.indexOf('rating')] || row[headers.indexOf('calificacion')] || '5'),
    testimonial: row[headers.indexOf('testimonial')] || row[headers.indexOf('testimonio')] || '',
    author: row[headers.indexOf('author')] || row[headers.indexOf('autor')] || '',
  })).filter(exp => exp.title);
};

// Función para procesar datos de galería
const processGalleryData = (data: any[][]): GalleryItem[] => {
  if (!data || data.length < 2) return [];
  
  const headers = data[0].map(h => h.toLowerCase());
  const rows = data.slice(1);
  
  return rows.map((row, index) => ({
    id: row[headers.indexOf('id')] || `gallery-${index + 1}`,
    image: row[headers.indexOf('image')] || row[headers.indexOf('imagen')] || '',
    title: row[headers.indexOf('title')] || row[headers.indexOf('titulo')] || '',
    description: row[headers.indexOf('description')] || row[headers.indexOf('descripcion')] || '',
    category: row[headers.indexOf('category')] || row[headers.indexOf('categoria')] || 'general',
  })).filter(item => item.image);
};

// API para obtener tours/productos
export const getTours = async (): Promise<Tour[]> => {
  try {
    const response = await axios.get(createSheetUrl('Productos'));
    const data = response.data.values;
    return processToursData(data);
  } catch (error) {
    console.error('Error fetching tours:', error);
    // Datos mock en caso de error
    return getMockTours();
  }
};

// API para obtener experiencias
export const getExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await axios.get(createSheetUrl('Experience'));
    const data = response.data.values;
    return processExperiencesData(data);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return getMockExperiences();
  }
};

// API para obtener elementos de galería
export const getGallery = async (): Promise<GalleryItem[]> => {
  try {
    const response = await axios.get(createSheetUrl('Gallery'));
    const data = response.data.values;
    return processGalleryData(data);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return getMockGallery();
  }
};

// Datos mock para desarrollo y fallback
export const getMockTours = (): Tour[] => [
  {
    id: 'mangrove-adventure',
    name: 'Aventura en Manglares',
    description: 'Explora los misteriosos manglares de Roatán en kayak y descubre la increíble vida silvestre.',
    personPrice: 45,
    price: 45,
    image: '/images/mangrove-kayaking.jpg',
    duration: '3 horas',
    included: ['Kayak', 'Guía certificado', 'Equipo de seguridad', 'Refrigerios'],
    requirements: 'Saber nadar básico',
    category: 'water-adventure',
  },
  {
    id: 'snorkeling-paradise',
    name: 'Paraíso del Snorkel',
    description: 'Sumérgete en las cristalinas aguas del Caribe y descubre el vibrante mundo submarino.',
    personPrice: 35,
    price: 35,
    image: '/images/snorkeling-adventure.webp',
    duration: '2.5 horas',
    included: ['Equipo de snorkel', 'Transporte', 'Guía marina', 'Agua y snacks'],
    requirements: 'Edad mínima 8 años',
    category: 'water-adventure',
  },
  {
    id: 'jungle-exploration',
    name: 'Exploración de la Selva',
    description: 'Aventúrate en la exuberante selva tropical y conoce la flora y fauna únicas.',
    personPrice: 40,
    price: 40,
    image: '/images/jungle-exploration.jpg',
    duration: '4 horas',
    included: ['Guía naturalista', 'Transporte', 'Almuerzo ligero', 'Repelente'],
    requirements: 'Condición física moderada',
    category: 'nature',
  },
  {
    id: 'sunset-cruise',
    name: 'Crucero al Atardecer',
    description: 'Disfruta de un romántico crucero mientras el sol se pone en el horizonte caribeño.',
    personPrice: 55,
    price: 55,
    image: '/images/sunset-boat-tour.jpg',
    duration: '2 horas',
    included: ['Bebidas', 'Aperitivos', 'Música en vivo', 'Capitán experimentado'],
    requirements: 'Sin restricciones',
    category: 'romantic',
  }
];

export const getMockExperiences = (): Experience[] => [
  {
    id: 'exp1',
    title: 'Una experiencia increíble',
    description: 'El tour de manglares fue absolutamente mágico. Nuestro guía fue muy conocedor y nos mostró lugares que nunca hubiéramos encontrado solos.',
    image: '/images/tropical-wildlife.jpg',
    rating: 5,
    testimonial: 'Una aventura que recordaré para siempre. El equipo fue profesional y la naturaleza, simplemente espectacular.',
    author: 'María González - España',
  },
  {
    id: 'exp2',
    title: 'Perfecto para familias',
    description: 'Llevé a mis hijos y todos disfrutamos muchísimo. Las actividades están perfectamente organizadas para todas las edades.',
    image: '/images/roatan-paradise.jpg',
    rating: 5,
    testimonial: 'Mis hijos no paran de hablar de los peces tropicales que vieron. ¡Definitivamente volveremos!',
    author: 'John Smith - Estados Unidos',
  },
  {
    id: 'exp3',
    title: 'Naturaleza pura',
    description: 'Como biólogo marino, quedé impresionado con la biodiversidad y el compromiso con la conservación.',
    image: '/images/aerial-beach-view.jpeg',
    rating: 5,
    testimonial: 'Roatan East Hidden Gem realmente cuida y respeta el ecosistema. Una empresa responsable.',
    author: 'Dr. Ana Rodríguez - México',
  }
];

export const getMockGallery = (): GalleryItem[] => [
  {
    id: 'gal1',
    image: '/images/hero-mangrove-tour.jpg',
    title: 'Explorando Manglares',
    description: 'Aventura en kayak por los manglares',
    category: 'mangroves',
  },
  {
    id: 'gal2',
    image: '/images/snorkeling-adventure.webp',
    title: 'Mundo Submarino',
    description: 'Snorkel en aguas cristalinas',
    category: 'underwater',
  },
  {
    id: 'gal3',
    image: '/images/jungle-exploration.jpg',
    title: 'Selva Tropical',
    description: 'Caminata por la selva',
    category: 'nature',
  },
  {
    id: 'gal4',
    image: '/images/sunset-boat-tour.jpg',
    title: 'Atardecer Caribeño',
    description: 'Crucero al atardecer',
    category: 'sunset',
  },
  {
    id: 'gal5',
    image: '/images/tropical-wildlife.jpg',
    title: 'Vida Silvestre',
    description: 'Fauna tropical de Roatán',
    category: 'wildlife',
  },
  {
    id: 'gal6',
    image: '/images/aerial-beach-view.jpeg',
    title: 'Vista Aérea',
    description: 'Playas paradisíacas desde el aire',
    category: 'aerial',
  }
];

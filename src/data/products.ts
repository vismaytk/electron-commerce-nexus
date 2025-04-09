
import { Product, Category } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ultra HD Smart TV 55\"",
    category: "tvs",
    price: 699.99,
    originalPrice: 899.99,
    description: "Experience breathtaking 4K resolution and vibrant colors with this smart TV. Features advanced voice control and a sleek, borderless design.",
    features: [
      "4K Ultra HD Resolution",
      "Smart TV with Voice Control",
      "120Hz Refresh Rate",
      "HDR10+ Support",
      "3 HDMI Ports"
    ],
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?q=80&w=1776&auto=format&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 125,
    stock: 15,
    isFeatured: true,
    specifications: {
      "Display": "55-inch 4K UHD",
      "Resolution": "3840 x 2160",
      "HDR": "HDR10+",
      "Refresh Rate": "120Hz",
      "Smart Features": "Voice Assistant, App Store",
      "Connectivity": "Wi-Fi, Bluetooth 5.0, 3x HDMI, 2x USB"
    }
  },
  {
    id: "2",
    name: "Pro Wireless Earbuds",
    category: "audio",
    subcategory: "earbuds",
    price: 149.99,
    originalPrice: 199.99,
    description: "Premium true wireless earbuds with active noise cancellation, crystal-clear sound, and 24-hour battery life.",
    features: [
      "Active Noise Cancellation",
      "24-hour Battery Life",
      "Wireless Charging Case",
      "Water and Sweat Resistant",
      "Touch Controls"
    ],
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1932&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=1770&auto=format&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 342,
    stock: 50,
    isFeatured: true,
    isNew: true,
    specifications: {
      "Driver Size": "11mm",
      "Connectivity": "Bluetooth 5.2",
      "Battery Life": "8 hours (24 with case)",
      "Charging": "USB-C and Wireless",
      "Water Resistance": "IPX4"
    }
  },
  {
    id: "3",
    name: "Ultra Slim Laptop Pro",
    category: "computers",
    subcategory: "laptops",
    price: 1299.99,
    originalPrice: 1499.99,
    description: "Powerful yet lightweight laptop with a stunning display, all-day battery life, and the latest processor.",
    features: [
      "Latest Gen Processor",
      "16GB RAM, 512GB SSD",
      "14-inch 4K Display",
      "Backlit Keyboard",
      "Fingerprint Reader"
    ],
    images: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop"
    ],
    rating: 4.9,
    reviewCount: 201,
    stock: 10,
    isFeatured: true,
    specifications: {
      "Processor": "Intel Core i7, 12th Gen",
      "Memory": "16GB DDR5",
      "Storage": "512GB NVMe SSD",
      "Display": "14-inch 4K IPS",
      "Graphics": "Intel Iris Xe",
      "Battery": "Up to 12 hours"
    }
  },
  {
    id: "4",
    name: "Smart Watch Series 5",
    category: "wearables",
    price: 299.99,
    description: "Advanced smartwatch with health monitoring, GPS, and a beautiful always-on display.",
    features: [
      "Heart Rate and ECG Monitoring",
      "GPS and Altimeter",
      "Always-On Retina Display",
      "Water Resistant to 50m",
      "18-hour Battery Life"
    ],
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=2027&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1772&auto=format&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 178,
    stock: 25,
    isNew: true,
    specifications: {
      "Display": "1.78\" OLED Retina",
      "Sensors": "Heart Rate, ECG, Accelerometer, Gyroscope",
      "Connectivity": "Bluetooth 5.0, Wi-Fi, GPS",
      "Battery": "Up to 18 hours",
      "Water Resistance": "50 meters"
    }
  },
  {
    id: "5",
    name: "Professional Camera Kit",
    category: "cameras",
    price: 1499.99,
    description: "Professional-grade digital camera with 4K video capability, advanced autofocus, and a versatile lens kit.",
    features: [
      "24.2MP Full-Frame Sensor",
      "4K 60fps Video Recording",
      "5-Axis Image Stabilization",
      "Dual Card Slots",
      "Weather-Sealed Body"
    ],
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1770&auto=format&fit=crop"
    ],
    rating: 4.9,
    reviewCount: 87,
    stock: 5,
    specifications: {
      "Sensor": "24.2MP Full-Frame CMOS",
      "Processor": "DIGIC X",
      "ISO Range": "100-51,200 (expandable)",
      "Autofocus": "Dual Pixel CMOS AF II",
      "Video": "4K 60p, Full HD 120p",
      "Storage": "Dual SD UHS-II Card Slots"
    }
  },
  {
    id: "6",
    name: "Premium Smartphone Pro",
    category: "phones",
    price: 999.99,
    description: "Flagship smartphone with an edge-to-edge display, pro-grade camera system, and all-day battery life.",
    features: [
      "6.7-inch Super Retina XDR Display",
      "Triple-Camera System with Night Mode",
      "A16 Bionic Chip",
      "Face ID",
      "5G Capable"
    ],
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 456,
    stock: 20,
    isFeatured: true,
    specifications: {
      "Display": "6.7\" Super Retina XDR",
      "Processor": "A16 Bionic",
      "Storage": "128GB / 256GB / 512GB",
      "Camera": "Triple 12MP (Wide, Ultra Wide, Telephoto)",
      "Battery": "Up to 29 hours talk time",
      "OS": "Latest Version"
    }
  }
];

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Smartphones",
    slug: "phones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?q=80&w=2080&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Laptops",
    slug: "computers",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Audio",
    slug: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "4",
    name: "TVs",
    slug: "tvs",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "5",
    name: "Wearables",
    slug: "wearables",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=2027&auto=format&fit=crop"
  },
  {
    id: "6",
    name: "Cameras",
    slug: "cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop"
  }
];

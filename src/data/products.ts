
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    images: ["/placeholder.svg", "/placeholder.svg"],
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
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Laptops",
    slug: "computers",
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Audio",
    slug: "audio",
    image: "/placeholder.svg"
  },
  {
    id: "4",
    name: "TVs",
    slug: "tvs",
    image: "/placeholder.svg"
  },
  {
    id: "5",
    name: "Wearables",
    slug: "wearables",
    image: "/placeholder.svg"
  },
  {
    id: "6",
    name: "Cameras",
    slug: "cameras",
    image: "/placeholder.svg"
  }
];

import type { MenuItem, Chef, Testimonial, Offer, ContactInfo } from "@/types";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Bruschetta al Pomodoro",
    description: "Grilled bread topped with fresh tomatoes, basil, garlic, and extra virgin olive oil.",
    price: 12,
    category: "starters",
    image: "/placeholder-dish.svg",
    calories: 180,
    tags: ["vegetarian"],
  },
  {
    id: "2",
    name: "Crispy Calamari",
    description: "Lightly breaded and fried squid rings served with lemon aioli and marinara.",
    price: 15,
    category: "starters",
    image: "/placeholder-dish.svg",
    calories: 320,
  },
  {
    id: "3",
    name: "French Onion Soup",
    description: "Slow-cooked caramelized onions in rich beef broth, topped with melted gruyere.",
    price: 14,
    category: "starters",
    image: "/placeholder-dish.svg",
    calories: 280,
  },
  {
    id: "4",
    name: "Grilled Herb Salmon",
    description: "Atlantic salmon fillet grilled with herbs, served with roasted vegetables and lemon butter.",
    price: 32,
    category: "mains",
    image: "/placeholder-dish.svg",
    calories: 420,
  },
  {
    id: "5",
    name: "Filet Mignon",
    description: "8oz prime beef tenderloin with truffle mashed potatoes and red wine reduction.",
    price: 45,
    category: "mains",
    image: "/placeholder-dish.svg",
    calories: 580,
  },
  {
    id: "6",
    name: "Mushroom Risotto",
    description: "Creamy arborio rice with wild mushrooms, parmesan, and truffle oil.",
    price: 26,
    category: "mains",
    image: "/placeholder-dish.svg",
    calories: 450,
    tags: ["vegetarian"],
  },
  {
    id: "7",
    name: "Roasted Chicken Supreme",
    description: "Free-range chicken breast with herb jus, seasonal greens, and dauphinoise potatoes.",
    price: 28,
    category: "mains",
    image: "/placeholder-dish.svg",
    calories: 520,
  },
  {
    id: "8",
    name: "Margherita Pizza",
    description: "Wood-fired pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
    price: 22,
    category: "mains",
    image: "/placeholder-dish.svg",
    calories: 680,
    tags: ["vegetarian"],
  },
  {
    id: "9",
    name: "Chocolate Lava Cake",
    description: "Warm molten chocolate cake with vanilla bean ice cream and raspberry coulis.",
    price: 14,
    category: "desserts",
    image: "/placeholder-dish.svg",
    calories: 520,
  },
  {
    id: "10",
    name: "Tiramisu",
    description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.",
    price: 13,
    category: "desserts",
    image: "/placeholder-dish.svg",
    calories: 380,
  },
  {
    id: "11",
    name: "Creme Brulee",
    description: "Vanilla custard with a caramelized sugar crust, served with fresh berries.",
    price: 12,
    category: "desserts",
    image: "/placeholder-dish.svg",
    calories: 340,
  },
  {
    id: "12",
    name: "Fresh Lemonade",
    description: "House-squeezed lemonade with mint and a touch of honey.",
    price: 6,
    category: "drinks",
    image: "/placeholder-dish.svg",
    calories: 120,
  },
  {
    id: "13",
    name: "Espresso Martini",
    description: "Freshly brewed espresso shaken with vodka and coffee liqueur.",
    price: 16,
    category: "drinks",
    image: "/placeholder-dish.svg",
    calories: 200,
  },
  {
    id: "14",
    name: "House Red Wine",
    description: "Selected Chianti Classico, medium-bodied with notes of cherry and spice.",
    price: 12,
    category: "drinks",
    image: "/placeholder-dish.svg",
    calories: 150,
  },
];

export const featuredDishes = menuItems.filter((item) =>
  ["4", "5", "9", "8"].includes(item.id)
);

export const chefs: Chef[] = [
  {
    id: "1",
    name: "Marco Bellini",
    role: "Executive Chef",
    image: "/placeholder-avatar.svg",
    bio: "With 20 years of culinary experience across Italy and France, Marco brings authentic Mediterranean flavors to every dish.",
  },
  {
    id: "2",
    name: "Sofia Reyes",
    role: "Pastry Chef",
    image: "/placeholder-avatar.svg",
    bio: "Trained at Le Cordon Bleu, Sofia crafts desserts that are as beautiful as they are delicious.",
  },
  {
    id: "3",
    name: "James Chen",
    role: "Sous Chef",
    image: "/placeholder-avatar.svg",
    bio: "James fuses Asian techniques with Western cuisine, creating unique flavor profiles our guests love.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "/placeholder-avatar.svg",
    text: "The ambiance is perfect and the food is absolutely divine. The grilled salmon was the best I've ever had. We'll definitely be coming back!",
    rating: 5,
  },
  {
    id: "2",
    name: "David Park",
    avatar: "/placeholder-avatar.svg",
    text: "Incredible dining experience from start to finish. The staff made us feel so welcome, and the chocolate lava cake was unforgettable.",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Johnson",
    avatar: "/placeholder-avatar.svg",
    text: "We celebrated our anniversary here and it was magical. Every dish was crafted with care, and the wine pairing was spot on.",
    rating: 5,
  },
];

export const offers: Offer[] = [
  {
    id: "1",
    title: "Weekday Lunch Special",
    description: "Enjoy a two-course lunch with a drink for an unbeatable price. Available Monday to Friday.",
    price: "$19.99",
    image: "/placeholder-dish.svg",
    badge: "Best Value",
  },
  {
    id: "2",
    title: "Family Feast",
    description: "Feed the whole family with our sharing platter, sides, and dessert combo.",
    price: "$59.99",
    image: "/placeholder-dish.svg",
    badge: "Popular",
  },
  {
    id: "3",
    title: "Date Night",
    description: "Three-course dinner for two with a bottle of house wine. Perfect for a special evening.",
    price: "$89.99",
    image: "/placeholder-dish.svg",
    badge: "Romantic",
  },
];

export const contactInfo: ContactInfo = {
  address: "123 Culinary Avenue, Downtown, NY 10001",
  phone: "+1 (555) 123-4567",
  email: "hello@restaurant.com",
  hours: [
    { days: "Monday", time: "Closed" },
    { days: "Tuesday - Friday", time: "11:30 AM - 10:00 PM" },
    { days: "Saturday", time: "10:00 AM - 11:00 PM" },
    { days: "Sunday", time: "10:00 AM - 9:00 PM" },
  ],
};

export const stats = [
  { label: "Years of Excellence", value: "15+" },
  { label: "Signature Dishes", value: "50+" },
  { label: "Happy Guests Monthly", value: "2,000+" },
  { label: "Culinary Awards", value: "12" },
];

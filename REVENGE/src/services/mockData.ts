import type {
  Category, ProviderProfile, Service, Experience, Review, Booking,
  Enquiry, SavedProvider, AppNotification, Report, VerificationRequest,
} from '../types';

// ---------------------------------------------------------------------------
// Demo/seed data. This stands in for the database until VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY are set (see .env.example). It intentionally covers
// enough variety — cities, categories, price bands, ratings — to make search,
// filtering and the AI fallback parser feel real in a live demo.
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  { id: 'cat-home', name: 'Home Services', slug: 'home-services', icon: 'Hammer', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-food', name: 'Food & Restaurants', slug: 'food-restaurants', icon: 'UtensilsCrossed', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-beauty', name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Sparkles', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-repair', name: 'Repair & Maintenance', slug: 'repair-maintenance', icon: 'Wrench', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-photo', name: 'Photographers', slug: 'photographers', icon: 'Camera', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-craft', name: 'Handicrafts', slug: 'handicrafts', icon: 'Palette', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-tutor', name: 'Tutors', slug: 'tutors', icon: 'BookOpen', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-events', name: 'Events & Weddings', slug: 'events-weddings', icon: 'PartyPopper', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-experience', name: 'Local Experiences', slug: 'local-experiences', icon: 'Compass', is_active: true, created_at: '2025-01-01' },
  { id: 'cat-artisan', name: 'Artisans', slug: 'artisans', icon: 'Brush', is_active: true, created_at: '2025-01-01' },
];

const catBySlug = (slug: string) => categories.find(c => c.slug === slug)!.id;

// city -> [lat, lng] approx centers, used for distance calc + fallback geocoding
export const cityCoords: Record<string, [number, number]> = {
  'Delhi': [28.6139, 77.2090],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Mumbai': [19.0760, 72.8777],
  'Bengaluru': [12.9716, 77.5946],
  'Varanasi': [25.3176, 82.9739],
  'Agra': [27.1767, 78.0081],
  'Amritsar': [31.6340, 74.8723],
  'Chandigarh': [30.7333, 76.7794],
};

export const providers: ProviderProfile[] = [
  {
    id: 'prov-1', user_id: 'user-p1', business_name: 'Rajesh Wood Crafts', slug: 'rajesh-wood-crafts',
    category_id: catBySlug('handicrafts'), description: 'Handcrafted wooden furniture and decor, made using traditional Rajasthani joinery techniques passed down three generations.',
    bio: '18 years carving heirloom furniture in Jaipur.', experience_years: 18, phone: '+91 98290 11223', email: 'rajesh@woodcrafts.example',
    address: 'Bapu Bazaar', city: 'Jaipur', state: 'Rajasthan', pincode: '302003', latitude: 26.9155, longitude: 75.8189,
    price_min: 1500, price_max: 45000, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'wood-carving-workshop', avatar_url: 'craftsman-portrait-1', rating_avg: 4.8, rating_count: 142,
    created_at: '2024-02-01', updated_at: '2026-06-01',
  },
  {
    id: 'prov-2', user_id: 'user-p2', business_name: 'Meera Handloom Studio', slug: 'meera-handloom-studio',
    category_id: catBySlug('handicrafts'), description: 'Naturally dyed handloom textiles — sarees, stoles and home linen woven on a pit loom.',
    bio: 'Second-generation weaver, trained under my mother in Varanasi.', experience_years: 12, phone: '+91 98765 22110', email: 'meera@handloom.example',
    address: 'Lallapura', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221010', latitude: 25.3312, longitude: 82.9739,
    price_min: 800, price_max: 12000, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'handloom-weaving', avatar_url: 'craftsman-portrait-2', rating_avg: 4.9, rating_count: 98,
    created_at: '2024-03-11', updated_at: '2026-05-20',
  },
  {
    id: 'prov-3', user_id: 'user-p3', business_name: 'Arjun Electrical Services', slug: 'arjun-electrical-services',
    category_id: catBySlug('repair-maintenance'), description: 'Licensed electrician for home wiring, appliance repair, and emergency call-outs across North Delhi.',
    bio: '9 years, ITI certified, same-day service.', experience_years: 9, phone: '+91 99110 44556', email: 'arjun@electrical.example',
    address: 'Rohini Sector 7', city: 'Delhi', state: 'Delhi', pincode: '110085', latitude: 28.7159, longitude: 77.1206,
    price_min: 200, price_max: 3000, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'electrician-at-work', avatar_url: 'craftsman-portrait-3', rating_avg: 4.6, rating_count: 210,
    created_at: '2023-11-05', updated_at: '2026-06-10',
  },
  {
    id: 'prov-4', user_id: 'user-p4', business_name: 'Sharma Home Repairs', slug: 'sharma-home-repairs',
    category_id: catBySlug('repair-maintenance'), description: 'Plumbing, carpentry and general home repair, one call for everything that needs fixing.',
    bio: 'Family business running since 1998.', experience_years: 20, phone: '+91 98112 33445', email: 'contact@sharmarepairs.example',
    address: 'Model Town', city: 'Delhi', state: 'Delhi', pincode: '110009', latitude: 28.7079, longitude: 77.1913,
    price_min: 150, price_max: 5000, is_verified: false, verification_status: 'pending', is_active: true,
    cover_image: 'home-repair-tools', avatar_url: 'craftsman-portrait-4', rating_avg: 4.2, rating_count: 67,
    created_at: '2025-01-20', updated_at: '2026-04-15',
  },
  {
    id: 'prov-5', user_id: 'user-p5', business_name: 'Priya Photography', slug: 'priya-photography',
    category_id: catBySlug('photographers'), description: 'Candid wedding and portrait photography with a documentary, unposed style.',
    bio: 'Shot 120+ weddings across North India.', experience_years: 7, phone: '+91 99887 66554', email: 'priya@photostudio.example',
    address: 'Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302017', latitude: 26.8544, longitude: 75.8044,
    price_min: 15000, price_max: 150000, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'wedding-photography', avatar_url: 'craftsman-portrait-5', rating_avg: 4.9, rating_count: 88,
    created_at: '2024-06-01', updated_at: '2026-05-30',
  },
  {
    id: 'prov-6', user_id: 'user-p6', business_name: 'Jaipur Pottery House', slug: 'jaipur-pottery-house',
    category_id: catBySlug('local-experiences'), description: 'Blue pottery workshops for individuals, couples and small groups — hand-throw and glaze your own piece.',
    bio: 'Fourth-generation blue pottery artisans.', experience_years: 30, phone: '+91 94141 55667', email: 'hello@jaipurpottery.example',
    address: 'Amer Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302002', latitude: 26.9855, longitude: 75.8513,
    price_min: 900, price_max: 3500, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'pottery-workshop', avatar_url: 'craftsman-portrait-6', rating_avg: 4.9, rating_count: 176,
    created_at: '2023-09-14', updated_at: '2026-06-12',
  },
  {
    id: 'prov-7', user_id: 'user-p7', business_name: 'Chandigarh Tutor Circle', slug: 'chandigarh-tutor-circle',
    category_id: catBySlug('tutors'), description: 'Maths and science tuition for grades 6-12, home visits or online.',
    bio: 'Ex-Kendriya Vidyalaya teacher, 15 years.', experience_years: 15, phone: '+91 98765 33221', email: 'tutor@chdcircle.example',
    address: 'Sector 22', city: 'Chandigarh', state: 'Chandigarh', pincode: '160022', latitude: 30.7381, longitude: 76.7767,
    price_min: 300, price_max: 800, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'tutor-classroom', avatar_url: 'craftsman-portrait-7', rating_avg: 4.7, rating_count: 53,
    created_at: '2024-08-19', updated_at: '2026-03-22',
  },
  {
    id: 'prov-8', user_id: 'user-p8', business_name: 'Amritsar Food Trails', slug: 'amritsar-food-trails',
    category_id: catBySlug('local-experiences'), description: 'Guided street-food walking tour through the old city — kulcha, lassi, and Partition-era stories.',
    bio: 'Local historian and food guide.', experience_years: 6, phone: '+91 99143 88990', email: 'trails@amritsarfood.example',
    address: 'Hall Bazaar', city: 'Amritsar', state: 'Punjab', pincode: '143001', latitude: 31.6250, longitude: 74.8768,
    price_min: 600, price_max: 1200, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'street-food-tour', avatar_url: 'craftsman-portrait-8', rating_avg: 4.8, rating_count: 231,
    created_at: '2023-12-02', updated_at: '2026-06-01',
  },
  {
    id: 'prov-9', user_id: 'user-p9', business_name: 'Bengaluru Beauty Bar', slug: 'bengaluru-beauty-bar',
    category_id: catBySlug('beauty-wellness'), description: 'At-home salon services — haircuts, facials, bridal packages.',
    bio: 'Certified stylist, ex-Lakme Salon.', experience_years: 5, phone: '+91 90080 12233', email: 'book@blrbeauty.example',
    address: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', latitude: 12.9719, longitude: 77.6412,
    price_min: 400, price_max: 8000, is_verified: false, verification_status: 'unverified', is_active: true,
    cover_image: 'salon-service', avatar_url: 'craftsman-portrait-9', rating_avg: 4.3, rating_count: 41,
    created_at: '2025-04-10', updated_at: '2026-05-01',
  },
  {
    id: 'prov-10', user_id: 'user-p10', business_name: 'Agra Marble Inlay Studio', slug: 'agra-marble-inlay-studio',
    category_id: catBySlug('artisans'), description: 'Pietra dura marble inlay work in the Taj Mahal tradition — tabletops, coasters, custom commissions.',
    bio: 'Trained by a family of Mughal-era craft descendants.', experience_years: 25, phone: '+91 98374 55123', email: 'studio@agrainlay.example',
    address: 'Taj Ganj', city: 'Agra', state: 'Uttar Pradesh', pincode: '282001', latitude: 27.1731, longitude: 78.0421,
    price_min: 500, price_max: 60000, is_verified: true, verification_status: 'approved', is_active: true,
    cover_image: 'marble-inlay-craft', avatar_url: 'craftsman-portrait-10', rating_avg: 4.9, rating_count: 119,
    created_at: '2023-07-07', updated_at: '2026-06-05',
  },
];

export const services: Service[] = [
  { id: 'svc-1', provider_id: 'prov-1', category_id: catBySlug('handicrafts'), name: 'Custom dining table', description: 'Solid sheesham wood, made to your dimensions.', price: 28000, price_type: 'starting_at', duration: '3-4 weeks', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-2', provider_id: 'prov-1', category_id: catBySlug('handicrafts'), name: 'Hand-carved jewellery box', description: 'Intricate jaali carving, brass inlay.', price: 2200, price_type: 'fixed', duration: '1 week', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-3', provider_id: 'prov-3', category_id: catBySlug('repair-maintenance'), name: 'Home wiring inspection', description: 'Full house electrical safety check.', price: 500, price_type: 'fixed', duration: '1-2 hours', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-4', provider_id: 'prov-3', category_id: catBySlug('repair-maintenance'), name: 'Emergency call-out', description: 'Same-day fault fixing.', price: 350, price_type: 'starting_at', duration: '30-60 min', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-5', provider_id: 'prov-5', category_id: catBySlug('photographers'), name: 'Wedding day coverage', description: 'Full day, two shooters, 500+ edited photos.', price: 65000, price_type: 'starting_at', duration: '1 day', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-6', provider_id: 'prov-9', category_id: catBySlug('beauty-wellness'), name: 'Bridal makeup package', description: 'HD makeup, hair styling, draping.', price: 6500, price_type: 'fixed', duration: '3 hours', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'svc-7', provider_id: 'prov-7', category_id: catBySlug('tutors'), name: 'Class 10 Maths tuition', description: 'CBSE board, home visit.', price: 500, price_type: 'hourly', duration: '1 hour', is_available: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
];

export const experiences: Experience[] = [
  {
    id: 'exp-1', provider_id: 'prov-6', title: 'Blue Pottery Workshop for Two', description: 'Learn the 400-year-old Jaipur blue pottery technique — throw, shape and glaze a piece to take home.',
    category_id: catBySlug('local-experiences'), location: 'Amer Road Studio', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9855, longitude: 75.8513,
    duration: '2.5 hours', price: 1800, max_people: 2, availability: 'Daily, 10am-6pm', cover_image: 'pottery-workshop',
    images: ['pottery-workshop', 'pottery-glazing', 'pottery-finished-pieces'], is_active: true, rating_avg: 4.9, rating_count: 176,
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  {
    id: 'exp-2', provider_id: 'prov-8', title: 'Old Amritsar Street Food Walk', description: 'A 3-hour guided walk through the old city\'s lanes, tasting kulcha, lassi, jalebi, and hearing Partition-era stories.',
    category_id: catBySlug('local-experiences'), location: 'Hall Bazaar', city: 'Amritsar', state: 'Punjab', latitude: 31.6250, longitude: 74.8768,
    duration: '3 hours', price: 900, max_people: 8, availability: 'Evenings, Tue-Sun', cover_image: 'street-food-tour',
    images: ['street-food-tour', 'punjabi-street-food', 'old-city-lanes'], is_active: true, rating_avg: 4.8, rating_count: 231,
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  {
    id: 'exp-3', provider_id: 'prov-2', title: 'Handloom Weaving Demonstration', description: 'Watch a Banarasi weaver at work on a pit loom and try a few passes of the shuttle yourself.',
    category_id: catBySlug('local-experiences'), location: 'Lallapura Weaving Cluster', city: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3312, longitude: 82.9739,
    duration: '1.5 hours', price: 700, max_people: 6, availability: 'Mornings, Mon-Sat', cover_image: 'handloom-weaving',
    images: ['handloom-weaving', 'silk-thread-dyeing', 'finished-saree'], is_active: true, rating_avg: 4.9, rating_count: 98,
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  {
    id: 'exp-4', provider_id: 'prov-10', title: 'Marble Inlay Craft Session', description: 'Try your hand at pietra dura stone inlay under an artisan trained in the Taj Mahal tradition.',
    category_id: catBySlug('artisans'), location: 'Taj Ganj Studio', city: 'Agra', state: 'Uttar Pradesh', latitude: 27.1731, longitude: 78.0421,
    duration: '2 hours', price: 1200, max_people: 4, availability: 'Daily, 11am-5pm', cover_image: 'marble-inlay-craft',
    images: ['marble-inlay-craft', 'inlay-tools', 'finished-inlay-piece'], is_active: true, rating_avg: 4.9, rating_count: 119,
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
];

export const reviews: Review[] = [
  { id: 'rev-1', customer_id: 'user-c1', provider_id: 'prov-6', booking_id: 'bk-past-1', rating: 5, review_text: 'Wonderful experience, our host was patient and the piece turned out beautifully.', is_visible: true, customer_name: 'Ananya S.', created_at: '2026-05-10', updated_at: '2026-05-10' },
  { id: 'rev-2', customer_id: 'user-c2', provider_id: 'prov-6', booking_id: 'bk-past-2', rating: 5, review_text: 'A must-do in Jaipur. Booked for our anniversary and loved it.', is_visible: true, customer_name: 'Rohit K.', created_at: '2026-04-22', updated_at: '2026-04-22' },
  { id: 'rev-3', customer_id: 'user-c3', provider_id: 'prov-3', booking_id: 'bk-past-3', rating: 4, review_text: 'Arrived on time, fixed the wiring issue quickly. Fair pricing.', is_visible: true, customer_name: 'Fatima N.', created_at: '2026-06-01', updated_at: '2026-06-01' },
  { id: 'rev-4', customer_id: 'user-c4', provider_id: 'prov-1', booking_id: 'bk-past-4', rating: 5, review_text: 'The table exceeded expectations, incredible joinery work.', is_visible: true, customer_name: 'Karan M.', created_at: '2026-03-15', updated_at: '2026-03-15' },
  { id: 'rev-5', customer_id: 'user-c5', provider_id: 'prov-8', booking_id: 'bk-past-5', rating: 5, review_text: 'Our guide knew every alley and every vendor by name. Best food tour we\'ve done.', is_visible: true, customer_name: 'Simran G.', created_at: '2026-06-15', updated_at: '2026-06-15' },
];

export const bookings: Booking[] = [
  { id: 'bk-1', customer_id: 'user-c1', provider_id: 'prov-6', experience_id: 'exp-1', booking_date: '2026-09-14', booking_time: '11:00', status: 'accepted', budget: 1800, message: 'Anniversary gift for my wife', created_at: '2026-09-01', updated_at: '2026-09-02' },
  { id: 'bk-2', customer_id: 'user-c1', provider_id: 'prov-3', service_id: 'svc-3', booking_date: '2026-09-06', booking_time: '15:00', status: 'pending', created_at: '2026-09-03', updated_at: '2026-09-03' },
];

export const enquiries: Enquiry[] = [
  { id: 'enq-1', customer_id: 'user-c1', provider_id: 'prov-1', service_id: 'svc-1', message: 'Looking for a 6-seater dining table in teak.', budget: 30000, preferred_date: '2026-10-01', status: 'pending', created_at: '2026-09-01', updated_at: '2026-09-01' },
];

export const savedProviders: SavedProvider[] = [
  { id: 'sp-1', customer_id: 'user-c1', provider_id: 'prov-6', created_at: '2026-08-20' },
  { id: 'sp-2', customer_id: 'user-c1', provider_id: 'prov-1', created_at: '2026-08-25' },
];

export const notifications: AppNotification[] = [
  { id: 'notif-1', user_id: 'user-c1', type: 'booking_accepted', title: 'Booking confirmed', message: 'Jaipur Pottery House accepted your booking for Sep 14.', related_id: 'bk-1', is_read: false, created_at: '2026-09-02' },
  { id: 'notif-2', user_id: 'user-p6', type: 'new_booking', title: 'New booking request', message: 'A customer booked Blue Pottery Workshop for Two.', related_id: 'bk-1', is_read: true, created_at: '2026-09-01' },
];

export const reports: Report[] = [
  { id: 'rep-1', reported_by: 'user-c2', provider_id: 'prov-9', reason: 'incorrect_information', description: 'Listed price does not match what was quoted.', status: 'pending', created_at: '2026-08-28', updated_at: '2026-08-28' },
];

export const verificationRequests: VerificationRequest[] = [
  { id: 'vr-1', provider_id: 'prov-4', document_type: 'business_license', document_url: 'demo://document', status: 'pending', submitted_at: '2026-08-15' },
  { id: 'vr-2', provider_id: 'prov-9', document_type: 'id_proof', document_url: 'demo://document', status: 'pending', submitted_at: '2026-08-30' },
];

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Calendar,
    Clock,
    Facebook,
    Heart,
    Instagram,
    Mail,
    Map,
    MapPin,
    Menu,
    Mountain,
    Phone,
    Search,
    Shield,
    Star,
    Twitter,
    Users,
    X,
    Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom styles for DatePicker
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker {
    font-family: inherit;
    border: none;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    background: white;
  }

  .react-datepicker__header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 12px 12px 0 0;
    padding: 16px;
  }

  .react-datepicker__current-month {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }

  .react-datepicker__day-names {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .react-datepicker__day-name {
    color: #6b7280;
    font-weight: 600;
    font-size: 14px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-datepicker__month {
    margin: 0;
  }

  .react-datepicker__month-container {
    padding: 16px;
  }

  .react-datepicker__week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .react-datepicker__day {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
    margin: 0;
  }

  .react-datepicker__day:hover {
    background-color: #238636 !important;
    color: white !important;
  }

  .react-datepicker__day--selected {
    background-color: #238636 !important;
    color: white !important;
    font-weight: 600;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: #238636 !important;
    color: white !important;
  }

  .react-datepicker__day--today {
    background-color: #238636 !important;
    color: white !important;
    font-weight: 600;
  }

  .react-datepicker__day--disabled {
    color: #d1d5db !important;
    cursor: not-allowed;
  }

  .react-datepicker__day--disabled:hover {
    background-color: transparent !important;
    color: #d1d5db !important;
  }

  .react-datepicker__navigation {
    top: 16px;
  }

  .react-datepicker__navigation--previous {
    left: 16px;
  }

  .react-datepicker__navigation--next {
    right: 16px;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #6b7280;
    border-width: 2px 2px 0 0;
  }

  .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: #238636;
  }
`;

interface Package {
    id: number;
    name: string;
    description: string;
    state: string;
    tags: string[];
    min_days: number;
    max_days: number;
    min_persons: number;
    max_persons: number;
    min_age: number;
    max_age?: string;
    base_price: string;
    meal_price?: string;
    hotel_price?: string;
    hotel_included: boolean;
    meal_included: boolean;
    meal_times: string;
    hotel_links?: string;
    travel_points: string;
    boarding_location: string;
    photos: string[];
    vehicles: any[];
    pickup_locations: any[];
}

interface Location {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
}

// Add Event interface (copied from events/index.tsx)
interface Event {
    id: number;
    name: string;
    state: string;
    days: number;
    itinerary: string[];
    meal_included: boolean;
    meal_times: string;
    meal_price: string;
    hotel_included: boolean;
    hotel_price: string;
    min_age: number;
    max_age?: string;
    photos: string[];
    available_slots: number;
    vehicle_id: number;
    vehicle_name: string;
    vehicle_model: string;
    activities: string[];
    boarding_point: string;
    pickup_location_id: number;
    pickup_location_name: string;
    pickup_location_city: string;
    base_price: string;
    created_at: string;
    updated_at: string;
}

export default function Welcome() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Location[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);

    // Date picker state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Package slider states
    const [currentSlide, setCurrentSlide] = useState(0);
    const [displayedPackages, setDisplayedPackages] = useState<Package[]>([]);

    // Event state
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);

    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
    }, []);

    // Update displayed packages when filtered packages change
    useEffect(() => {
        const packagesToShow = filteredPackages.slice(0, 6);
        setDisplayedPackages(packagesToShow);
        setCurrentSlide(0);
    }, [filteredPackages]);

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        setDisplayedEvents(events.slice(0, 6));
    }, [events]);

    // Handle scroll-based navigation visibility
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const heroHeight = window.innerHeight;

            // Show nav when scrolled past 80% of hero section
            if (scrollPosition > heroHeight * 0.8) {
                setIsNavVisible(true);
            } else {
                setIsNavVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch('/packages/list');
            const data = await response.json();
            setPackages(data.packages || []);
            setFilteredPackages(data.packages || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const response = await fetch('/events/list');
            const data = await response.json();
            if (data.success) {
                setEvents(data.events || []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            setEvents([]);
            console.error('Error fetching events:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    // Search locations
    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            setFilteredPackages(packages);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/pickup-locations/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.locations || []);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Error searching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter packages based on search
    const filterPackages = (query: string) => {
        if (!query.trim()) {
            setFilteredPackages(packages);
            return;
        }

        const filtered = packages.filter(
            (pkg) =>
                pkg.state.toLowerCase().includes(query.toLowerCase()) ||
                pkg.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
                pkg.name.toLowerCase().includes(query.toLowerCase()),
        );
        setFilteredPackages(filtered);
    };

    const handleLocationSelect = (location: Location) => {
        setSearchQuery(location.state);
        setShowSearchResults(false);
        filterPackages(location.state);
    };

    const handleSearchSubmit = () => {
        setShowSearchResults(false);
        filterPackages(searchQuery);
    };

    // Package slider functions
    const nextSlide = () => {
        const maxSlides = Math.ceil(displayedPackages.length / 3) - 1;
        if (currentSlide < maxSlides) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const bucketListActivities = [
        {
            title: 'Bungee Jumping',
            description: 'Experience the ultimate adrenaline rush',
            image: '/images/bungee.jpg',
            price: '₹2,500',
        },
        {
            title: 'Paragliding',
            description: 'Soar through the skies like a bird',
            image: '/images/paragliding.jpg',
            price: '₹3,500',
        },
        {
            title: 'White Water Rafting',
            description: 'Navigate thrilling rapids',
            image: '/images/rafting.jpg',
            price: '₹1,800',
        },
    ];

    const whyTravelWithUs = [
        {
            icon: Shield,
            title: 'Safe & Secure',
            description: 'Your safety is our top priority with certified guides and equipment',
        },
        {
            icon: Clock,
            title: '24/7 Support',
            description: 'Round the clock customer support for all your travel needs',
        },
        {
            icon: Award,
            title: 'Best Prices',
            description: 'Guaranteed best prices with no hidden costs',
        },
        {
            icon: Users,
            title: 'Expert Guides',
            description: 'Experienced local guides for authentic experiences',
        },
    ];

    const reviews = [
        {
            name: 'Sarah Johnson',
            rating: 5,
            comment: 'Amazing experience! The package was perfectly organized and the guides were fantastic.',
            avatar: '/images/avatar1.jpg',
        },
        {
            name: 'Michael Chen',
            rating: 5,
            comment: 'Best travel decision I ever made. Everything exceeded my expectations.',
            avatar: '/images/avatar2.jpg',
        },
        {
            name: 'Priya Sharma',
            rating: 5,
            comment: 'Incredible adventure! The team made sure we had the best experience possible.',
            avatar: '/images/avatar3.jpg',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head title="North Trippers - Adventure Awaits" />

            {/* Custom DatePicker Styles */}
            <style dangerouslySetInnerHTML={{ __html: datePickerStyles }} />

            {/* Scroll-Based Navigation Bar */}
            <nav
                className={`fixed top-0 right-0 left-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out dark:border-gray-800/50 dark:bg-black/95 ${
                    isNavVisible ? 'translate-y-0 opacity-100 shadow-lg' : '-translate-y-full opacity-0'
                }`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#238636]">
                                    <Mountain className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">North Trippers</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden items-center space-x-8 md:flex">
                            <Link href="/" className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300">
                                Home
                            </Link>
                            <Link href="/packages" className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300">
                                Packages
                            </Link>
                            <Link href="/vehicles" className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300">
                                Vehicles
                            </Link>
                            <Link
                                href="/pickup-locations"
                                className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300"
                            >
                                Locations
                            </Link>
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden items-center space-x-4 md:flex">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#238636] text-white hover:bg-[#1a6b2a]">Sign Up</Button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-700 dark:text-gray-300"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="border-t border-gray-200/50 bg-white/95 px-4 py-4 backdrop-blur-md dark:border-gray-800/50 dark:bg-black/95">
                            <div className="space-y-4">
                                {/* Mobile Navigation Links */}
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        href="/"
                                        className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/packages"
                                        className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Packages
                                    </Link>
                                    <Link
                                        href="/vehicles"
                                        className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Vehicles
                                    </Link>
                                    <Link
                                        href="/pickup-locations"
                                        className="font-medium text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Locations
                                    </Link>
                                </div>

                                {/* Mobile Auth Buttons */}
                                <div className="flex flex-col space-y-2 pt-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-gray-700 transition-colors hover:text-[#238636] dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-[#238636] text-white hover:bg-[#1a6b2a]">Sign Up</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-colors duration-300 dark:from-gray-900 dark:via-gray-800 dark:to-black">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#238636]/20 to-[#1a6b2a]/20" />
                    <div
                        className="absolute top-0 left-0 h-full w-full opacity-30"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-20 h-32 w-32 animate-pulse rounded-full bg-[#238636]/10 blur-xl" />
                <div className="absolute right-20 bottom-20 h-40 w-40 animate-pulse rounded-full bg-[#1a6b2a]/10 blur-xl delay-1000" />
                <div className="absolute top-1/2 left-10 h-24 w-24 animate-pulse rounded-full bg-white/5 blur-lg delay-500" />

                {/* Hero Content */}
                <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 text-center text-white">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                        <span className="text-sm font-medium">✨ Trusted by 10,000+ Travelers</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="mb-6 text-5xl leading-tight font-bold md:text-7xl lg:text-8xl">
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Adventure</span>
                        <br />
                        <span className="bg-gradient-to-r from-[#238636] to-[#1a6b2a] bg-clip-text text-transparent">Awaits</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl">
                        Discover the most exciting travel packages across India. From the Himalayas to the beaches of Goa, create unforgettable
                        memories with our expert-guided adventures.
                    </p>

                    {/* Enhanced Search Bar */}
                    <div className="mx-auto mb-12 max-w-4xl">
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
                            <div className="flex flex-col gap-4 p-6 md:flex-row">
                                {/* Destination Search */}
                                <div className="relative flex-1">
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 transform">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Where do you want to go?"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                        className="focus:ring-opacity-50 rounded-xl border-0 bg-white/95 py-4 pr-4 pl-12 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#238636] dark:text-gray-900"
                                    />
                                </div>

                                {/* Date Picker */}
                                <div className="relative flex-1">
                                    <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date: Date | null) => setSelectedDate(date)}
                                        placeholderText="When do you want to travel?"
                                        dateFormat="MMM dd, yyyy"
                                        minDate={new Date()}
                                        className="w-full cursor-pointer rounded-xl border-0 bg-white/95 py-4 pr-4 pl-12 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#238636] dark:text-gray-900"
                                        wrapperClassName="w-full"
                                        popperClassName="z-50"
                                        popperPlacement="bottom-start"
                                        showPopperArrow={false}
                                        calendarClassName="rounded-xl border border-gray-200 shadow-2xl"
                                        dayClassName={(date: Date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const checkDate = new Date(date);
                                            checkDate.setHours(0, 0, 0, 0);

                                            if (checkDate.getTime() === today.getTime()) {
                                                return 'bg-[#238636] text-white rounded-full hover:bg-[#1a6b2a]';
                                            }
                                            return 'hover:bg-[#238636] hover:text-white rounded-full';
                                        }}
                                        customInput={
                                            <Input
                                                readOnly
                                                className="cursor-pointer rounded-xl border-0 bg-white/95 py-4 pr-4 pl-12 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#238636] dark:text-gray-900"
                                            />
                                        }
                                    />
                                </div>

                                {/* Travelers */}
                                <div className="relative flex-1">
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 transform">
                                        <Users className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="How many travelers?"
                                        className="cursor-pointer rounded-xl border-0 bg-white/95 py-4 pr-4 pl-12 text-lg text-gray-900 placeholder:text-gray-500 dark:text-gray-900"
                                        readOnly
                                    />
                                </div>

                                {/* Search Button */}
                                <Button
                                    onClick={handleSearchSubmit}
                                    className="transform rounded-xl bg-[#238636] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1a6b2a] hover:shadow-xl"
                                >
                                    <Search className="mr-2 h-5 w-5" />
                                    Search Packages
                                </Button>
                            </div>
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border bg-white shadow-2xl">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-[#238636]"></div>
                                        Searching destinations...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((location) => (
                                        <button
                                            key={location.id}
                                            onClick={() => handleLocationSelect(location)}
                                            className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#238636]/10">
                                                <MapPin className="h-5 w-5 text-[#238636]" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{location.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {location.city}, {location.state}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                        No locations found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-[#238636]">500+</div>
                            <div className="text-gray-300">Adventure Packages</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-[#238636]">50+</div>
                            <div className="text-gray-300">Destinations</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-[#238636]">10K+</div>
                            <div className="text-gray-300">Happy Travelers</div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
                    <div className="flex flex-col items-center text-white/70">
                        <span className="mb-2 text-sm">Explore More</span>
                        <ArrowRight className="h-6 w-6 rotate-90" />
                    </div>
                </div>
            </section>

            {/* Events Section (NEW) */}
            <section className="bg-gradient-to-br from-[#f5f7fa] to-[#eaf6f6] px-4 py-20 dark:from-gray-900 dark:to-black">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 flex items-center justify-center gap-2 text-4xl font-bold md:text-5xl">
                            <Award className="mr-2 inline-block h-8 w-8 text-[#238636]" />
                            Upcoming Events
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Join our exclusive events for unforgettable adventures and memories
                        </p>
                    </div>
                    {loadingEvents ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-64 animate-pulse rounded-xl bg-white p-8 shadow-md" />
                            ))}
                        </div>
                    ) : displayedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {displayedEvents.map((event) => (
                                <Card key={event.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
                                    <div className="relative h-48 overflow-hidden">
                                        {event.photos && event.photos.length > 0 ? (
                                            <img
                                                src={event.photos[0]}
                                                alt={event.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                                <Calendar className="h-16 w-16 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-[#238636] text-white">{event.state}</Badge>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Award className="h-5 w-5 text-[#238636]" />
                                            {event.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {event.activities && event.activities.length > 0
                                                ? event.activities.slice(0, 3).join(', ')
                                                : 'Adventure event'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{event.days} days</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{event.available_slots} slots</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-bold text-[#238636]">
                                                    ₹{parseInt(event.base_price).toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-500">/person</span>
                                            </div>
                                            <Link href={`/events/${event.id}`}>
                                                <Button className="bg-[#238636] hover:bg-[#1a6b2a]">View Details</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <p className="text-lg text-gray-500">No events found</p>
                        </div>
                    )}
                    {/* See All Events Button */}
                    <div className="mt-12 text-center">
                        <Link href="/events/browse">
                            <Button size="lg" variant="outline" className="border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white">
                                See All Events
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Discover Amazing Packages</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Explore our curated collection of adventure packages designed to create unforgettable memories
                        </p>
                    </div>

                    {displayedPackages.length > 0 ? (
                        <div className="relative">
                            {/* Navigation Arrows */}
                            <div className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 transform md:-left-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 transform md:-right-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextSlide}
                                    disabled={displayedPackages.length <= 3 || currentSlide >= 1}
                                    className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Package Slider */}
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`,
                                    }}
                                >
                                    {/* First slide - First 3 packages */}
                                    <div className="grid w-full flex-shrink-0 grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {displayedPackages.slice(0, 3).map((pkg) => (
                                            <Card key={pkg.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
                                                <div className="relative h-48 overflow-hidden">
                                                    {pkg.photos && pkg.photos.length > 0 ? (
                                                        <img
                                                            src={pkg.photos[0]}
                                                            alt={pkg.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                                            <Mountain className="h-16 w-16 text-white" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                                                            <Heart className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4">
                                                        <Badge className="bg-[#238636] text-white">{pkg.state}</Badge>
                                                    </div>
                                                </div>

                                                <CardHeader>
                                                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                                    <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                                                </CardHeader>

                                                <CardContent>
                                                    <div className="mb-4 flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">4.8</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-500">
                                                                {pkg.min_days}-{pkg.max_days} days
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-2xl font-bold text-[#238636]">₹{pkg.base_price}</span>
                                                            <span className="text-sm text-gray-500">/person</span>
                                                        </div>
                                                        <Link href={`/packages/${pkg.id}`}>
                                                            <Button className="bg-[#238636] hover:bg-[#1a6b2a]">View Details</Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Second slide - Next 3 packages (if they exist) */}
                                    {displayedPackages.length > 3 && (
                                        <div className="grid w-full flex-shrink-0 grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                            {displayedPackages.slice(3, 6).map((pkg) => (
                                                <Card key={pkg.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
                                                    <div className="relative h-48 overflow-hidden">
                                                        {pkg.photos && pkg.photos.length > 0 ? (
                                                            <img
                                                                src={pkg.photos[0]}
                                                                alt={pkg.name}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                                                <Mountain className="h-16 w-16 text-white" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 right-4">
                                                            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                                                                <Heart className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4">
                                                            <Badge className="bg-[#238636] text-white">{pkg.state}</Badge>
                                                        </div>
                                                    </div>

                                                    <CardHeader>
                                                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                                        <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                                                    </CardHeader>

                                                    <CardContent>
                                                        <div className="mb-4 flex items-center gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-medium">4.8</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4 text-gray-500" />
                                                                <span className="text-sm text-gray-500">
                                                                    {pkg.min_days}-{pkg.max_days} days
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-2xl font-bold text-[#238636]">₹{pkg.base_price}</span>
                                                                <span className="text-sm text-gray-500">/person</span>
                                                            </div>
                                                            <Link href={`/packages/${pkg.id}`}>
                                                                <Button className="bg-[#238636] hover:bg-[#1a6b2a]">View Details</Button>
                                                            </Link>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* See All Button */}
                            <div className="mt-12 text-center">
                                <Link href="/packages/browse">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white"
                                    >
                                        See All Packages
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Mountain className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <p className="text-lg text-gray-500">No packages found</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Bucket List Section */}
            <section className="bg-gradient-to-br from-[#238636]/5 to-[#1a6b2a]/5 px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Complete Your Bucket List</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Experience the most thrilling adventures that will make your heart race
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {bucketListActivities.map((activity, index) => (
                            <Card key={index} className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
                                <div className="relative h-64 overflow-hidden">
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                        <Mountain className="h-16 w-16 text-white" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/90 font-semibold text-[#238636]">{activity.price}</Badge>
                                    </div>
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-xl">{activity.title}</CardTitle>
                                    <CardDescription>{activity.description}</CardDescription>
                                </CardHeader>

                                <CardFooter>
                                    <Button className="w-full bg-[#238636] hover:bg-[#1a6b2a]">Book Now</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Travel With Us Section */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Why Travel With Us</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            We're committed to providing you with the best travel experience possible
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {whyTravelWithUs.map((feature, index) => (
                            <div key={index} className="group text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#238636] transition-transform duration-300 group-hover:scale-110">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-gradient-to-br from-[#238636]/5 to-[#1a6b2a]/5 px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">What Our Travelers Say</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Don't just take our word for it - hear from our satisfied customers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {reviews.map((review, index) => (
                            <Card key={index} className="text-center">
                                <CardHeader>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#238636]">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="mb-2 flex justify-center gap-1">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <CardTitle className="text-lg">{review.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground italic">"{review.comment}"</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#238636] px-4 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 text-2xl font-bold">North Trippers</h3>
                            <p className="mb-4 text-white/80">Your gateway to unforgettable adventures across India</p>
                            <div className="flex gap-4">
                                <Facebook className="h-5 w-5 cursor-pointer hover:text-white/80" />
                                <Twitter className="h-5 w-5 cursor-pointer hover:text-white/80" />
                                <Instagram className="h-5 w-5 cursor-pointer hover:text-white/80" />
                                <Youtube className="h-5 w-5 cursor-pointer hover:text-white/80" />
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Packages
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Destinations
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 text-lg font-semibold">Support</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Safety Guidelines
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Terms & Conditions
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-white">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 text-lg font-semibold">Contact Info</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-white/80">+91 98765 43210</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-white/80">info@northtrippers.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Map className="h-4 w-4" />
                                    <span className="text-white/80">Delhi, India</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-white/20 pt-8 text-center">
                        <p className="text-white/80">© 2024 North Trippers. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

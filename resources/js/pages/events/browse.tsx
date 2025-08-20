import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Award, Calendar, MapPin, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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

export default function BrowseEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const eventsPerPage = 9;

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredEvents(events);
            setSearchLoading(false);
        } else {
            setSearchLoading(true);
            const timeoutId = setTimeout(() => {
                const filtered = events.filter(
                    (event) =>
                        event.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (event.activities && event.activities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))),
                );
                setFilteredEvents(filtered);
                setSearchLoading(false);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
        setCurrentPage(1);
    }, [searchQuery, events]);

    // Calculate total pages
    useEffect(() => {
        setTotalPages(Math.ceil(filteredEvents.length / eventsPerPage));
    }, [filteredEvents]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/events/list');
            const data = await response.json();
            setEvents(data.events || []);
            setFilteredEvents(data.events || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get current page events
    const getCurrentPageEvents = () => {
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        return filteredEvents.slice(startIndex, endIndex);
    };

    // Skeleton loading component
    const EventSkeleton = () => (
        <Card className="overflow-hidden">
            <div className="h-48 animate-pulse bg-gray-200" />
            <CardHeader>
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            <Head title="All Events - North Trippers" />
            <BackButton text="Back to Home" className="mb-6" onClick={() => (window.location.href = '/')} />

            {/* Header */}
            <div className="bg-gradient-to-r from-[#238636] to-[#1a6b2a] py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="text-center text-white">
                        <h1 className="mb-4 flex items-center justify-center gap-2 text-4xl font-bold md:text-5xl">
                            <Award className="mr-2 h-8 w-8" /> All Events
                        </h1>
                        <p className="mx-auto max-w-2xl text-xl text-gray-100">Browse all our upcoming and past adventure events across India</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="border-b bg-white py-8">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{filteredEvents.length} events found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <div className="mx-auto max-w-7xl px-4 py-12">
                {loading || searchLoading ? (
                    // Skeleton loading
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <EventSkeleton key={index} />
                        ))}
                    </div>
                ) : getCurrentPageEvents().length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {getCurrentPageEvents().map((event) => (
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
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{event.pickup_location_city}</span>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            onClick={() => setCurrentPage(page)}
                                            className="h-10 w-10 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No events found</h3>
                        <p className="text-gray-500">{searchQuery ? 'Try adjusting your search terms' : 'No events available at the moment'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Car, Edit, Hotel, MapPin, Plus, Search, Trash2, Users, Utensils } from 'lucide-react';
import { useState } from 'react';

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

export default function Events({ events: initialEvents }: { events: Event[] }) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchEvents();
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(`/events/search?search=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Search failed:', error);
            toast({
                title: 'Error',
                description: 'Failed to search events',
                variant: 'destructive',
            });
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/events/list');
            const data = await response.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch events',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            const response = await fetch(`/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setEvents(events.filter((event) => event.id !== eventId));
                toast({
                    title: 'Success',
                    description: 'Event deleted successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to delete event',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete event',
                variant: 'destructive',
            });
        }
    };

    const getMealTimesText = (mealTimes: string) => {
        switch (mealTimes) {
            case 'one':
                return 'One Time';
            case 'two':
                return 'Two Times';
            case 'three':
                return 'Three Times';
            default:
                return mealTimes;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Events - North Trippers" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Events Management</h1>
                            <p className="text-muted-foreground">Manage your adventure events</p>
                        </div>
                        <Link href="/events/create">
                            <Button className="bg-[#238636] hover:bg-[#1a6b2a]">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search events by name, state, or vehicle..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSearch} disabled={searchLoading}>
                            {searchLoading ? 'Searching...' : 'Search'}
                        </Button>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchEvents();
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                    {loading ? (
                        // Show skeleton loaders during loading (initial or search)
                        Array.from({ length: 3 }).map((_, index) => <EventSkeleton key={index} />)
                    ) : events.length > 0 ? (
                        events.map((event) => (
                            <Card key={event.id} className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold">{event.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{event.state}</span>
                                                <span>•</span>
                                                <Calendar className="h-4 w-4" />
                                                <span>{event.days} days</span>
                                                <span>•</span>
                                                <Users className="h-4 w-4" />
                                                <span>{event.available_slots} slots available</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/events/${event.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(event.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Car className="h-4 w-4" />
                                            <span>
                                                {event.vehicle_name} ({event.vehicle_model})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>
                                                {event.pickup_location_name}, {event.pickup_location_city}
                                            </span>
                                        </div>
                                        {event.hotel_included && (
                                            <div className="flex items-center gap-1">
                                                <Hotel className="h-4 w-4" />
                                                <span>Hotel included</span>
                                            </div>
                                        )}
                                        {event.meal_included && (
                                            <div className="flex items-center gap-1">
                                                <Utensils className="h-4 w-4" />
                                                <span>Meal included ({getMealTimesText(event.meal_times)})</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-[#238636]">₹{parseInt(event.base_price).toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">per person</div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Created: {new Date(event.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Calendar className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">No events found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first event.'}
                                    </p>
                                </div>
                                {!searchQuery && (
                                    <Link href="/events/create">
                                        <Button className="bg-[#238636] hover:bg-[#1a6b2a]">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Event
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <Toaster />
        </div>
    );
}

function EventSkeleton() {
    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </Card>
    );
}

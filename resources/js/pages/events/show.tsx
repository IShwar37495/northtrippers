import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, Car, Globe, Heart, Hotel, Mail, Map, MapPin, Phone, Shield, Tag, Users, Utensils } from 'lucide-react';
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
    vehicle_year: number;
    vehicle_image_url?: string;
    activities: string[];
    boarding_point: string;
    pickup_location_id: number;
    pickup_location_name: string;
    pickup_location_address: string;
    pickup_location_city: string;
    pickup_location_state: string;
    pickup_location_zip_code: string;
    pickup_location_phone?: string;
    pickup_location_email?: string;
    pickup_location_image_url?: string;
    base_price: string;
}

export default function EventDetail({ event: eventData }: { event: Event }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    const features = [
        {
            icon: Calendar,
            title: 'Duration',
            value: `${eventData.days} day${eventData.days !== 1 ? 's' : ''}`,
        },
        {
            icon: Users,
            title: 'Available Slots',
            value: `${eventData.available_slots} slots`,
        },
        {
            icon: MapPin,
            title: 'Destination',
            value: eventData.state,
        },
        {
            icon: Calendar,
            title: 'Age Range',
            value: `${eventData.min_age}+ years`,
        },
    ];

    const inclusions = [
        { icon: Car, title: 'Transportation', included: true },
        { icon: Hotel, title: 'Hotel Accommodation', included: eventData.hotel_included },
        { icon: Utensils, title: 'Meals', included: eventData.meal_included },
        { icon: Shield, title: 'Safety Equipment', included: true },
        { icon: Award, title: 'Expert Guide', included: true },
        { icon: Map, title: 'Travel Insurance', included: true },
    ];

    // Separate included and not included items
    const includedItems = inclusions.filter((item) => item.included);
    const notIncludedItems = inclusions.filter((item) => !item.included);

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
            <Head title={`${eventData.name} - North Trippers`} />
            <BackButton text="Back to Events" className="mb-6" />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/events/browse">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Events
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Photo Gallery */}
                <div className="mb-8">
                    <div className="relative mb-4 h-96 overflow-hidden rounded-lg md:h-[500px]">
                        {eventData.photos && eventData.photos.length > 0 ? (
                            <img src={eventData.photos[selectedPhoto]} alt={eventData.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                <Globe className="h-16 w-16 text-white" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute right-4 bottom-4 left-4">
                            <Badge className="mb-2 bg-[#238636] text-white">{eventData.state}</Badge>
                            <h1 className="text-3xl font-bold text-white md:text-4xl">{eventData.name}</h1>
                        </div>
                    </div>

                    {/* Photo Thumbnails */}
                    {eventData.photos && eventData.photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {eventData.photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedPhoto(index)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                                        selectedPhoto === index ? 'border-[#238636]' : 'border-transparent'
                                    }`}
                                >
                                    <img src={photo} alt={`${eventData.name} ${index + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#238636]/10">
                                                <feature.icon className="h-5 w-5 text-[#238636]" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{feature.title}</p>
                                                <p className="text-sm text-muted-foreground">{feature.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Itinerary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Itinerary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {eventData.itinerary.map((day, index) => (
                                        <div key={index} className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-[#238636]">Day {index + 1}</h4>
                                            <p className="text-muted-foreground">{day.replace(`Day ${index + 1}: `, '')}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activities */}
                        {eventData.activities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {eventData.activities.map((activity, index) => (
                                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {activity}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Vehicle */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transportation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    {eventData.vehicle_image_url ? (
                                        <img
                                            src={eventData.vehicle_image_url}
                                            alt={eventData.vehicle_name}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-[#238636]/10">
                                            <Car className="h-6 w-6 text-[#238636]" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{eventData.vehicle_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {eventData.vehicle_model} ({eventData.vehicle_year})
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pickup and Boarding */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pickup & Boarding</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 font-semibold">Pickup Location</h4>
                                        <div className="rounded-lg border p-4">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-1 h-5 w-5 text-[#238636]" />
                                                <div className="flex-1">
                                                    <h5 className="font-medium">{eventData.pickup_location_name}</h5>
                                                    <p className="text-sm text-muted-foreground">
                                                        {eventData.pickup_location_address}, {eventData.pickup_location_city},{' '}
                                                        {eventData.pickup_location_state} {eventData.pickup_location_zip_code}
                                                    </p>
                                                    {eventData.pickup_location_phone && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">{eventData.pickup_location_phone}</span>
                                                        </div>
                                                    )}
                                                    {eventData.pickup_location_email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">{eventData.pickup_location_email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold">Boarding Point</h4>
                                        <p className="text-muted-foreground">{eventData.boarding_point}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* What's Included Section */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Included Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        What's Included
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                                        {includedItems.length > 0 ? (
                                            includedItems.map((inclusion, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                        ✓
                                                    </div>
                                                    <inclusion.icon className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">{inclusion.title}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No items included</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Not Included Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-600">
                                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                        What's Not Included
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                                        {notIncludedItems.length > 0 ? (
                                            notIncludedItems.map((inclusion, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                        ✗
                                                    </div>
                                                    <inclusion.icon className="h-4 w-4 text-gray-400" />
                                                    <span className="text-muted-foreground">{inclusion.title}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">All items are included</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Pricing Card with Contact Info */}
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Event Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#238636]">₹{parseInt(eventData.base_price).toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">per person</div>
                                </div>

                                <div className="border-t border-border" />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span>₹{parseInt(eventData.base_price).toLocaleString()}</span>
                                    </div>
                                    {eventData.meal_price && eventData.meal_included && (
                                        <div className="flex justify-between">
                                            <span>Meals ({getMealTimesText(eventData.meal_times)})</span>
                                            <span>₹{parseInt(eventData.meal_price).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {eventData.hotel_price && eventData.hotel_included && (
                                        <div className="flex justify-between">
                                            <span>Hotel</span>
                                            <span>₹{parseInt(eventData.hotel_price).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border" />

                                <div className="space-y-3">
                                    <Link href={`/events/${eventData.id}/book`}>
                                        <Button className="w-full bg-[#238636] py-6 text-lg hover:bg-[#1a6b2a]">Book Now</Button>
                                    </Link>
                                    <Button variant="outline" className="w-full">
                                        Contact Us
                                    </Button>
                                </div>

                                {/* Contact Info - Part of the same card */}
                                <div className="border-t border-border pt-4">
                                    <div className="space-y-2 text-center">
                                        <p className="text-sm font-medium">Need Help?</p>
                                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                <span>+91 98765 43210</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <span>info@northtrippers.com</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

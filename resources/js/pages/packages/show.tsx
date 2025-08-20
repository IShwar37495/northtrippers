import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, Car, Clock, Globe, Heart, Hotel, Mail, Map, MapPin, Phone, Shield, Tag, Users, Utensils, X } from 'lucide-react';
import { useState } from 'react';

interface Vehicle {
    id: number;
    name: string;
    model: string;
    year: number;
    image_url?: string;
}

interface PickupLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone?: string;
    email?: string;
    image_url?: string;
}

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
    vehicles: Vehicle[];
    pickup_locations: PickupLocation[];
}

export default function PackageDetail({ package: packageData }: { package: Package }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        persons: packageData.min_persons,
        days: packageData.min_days,
        includeMeals: false,
        includeHotel: false,
    });

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get tomorrow's date for minimum selectable date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // Generate days options from min to max
    const daysOptions = [];
    for (let i = packageData.min_days; i <= packageData.max_days; i++) {
        daysOptions.push(i);
    }

    // Generate persons options from min to max
    const personsOptions = [];
    for (let i = packageData.min_persons; i <= packageData.max_persons; i++) {
        personsOptions.push(i);
    }

    // Calculate total price
    const calculateTotalPrice = () => {
        let total = parseInt(packageData.base_price) * bookingData.persons * bookingData.days;

        if (bookingData.includeMeals && packageData.meal_price) {
            total += parseInt(packageData.meal_price) * bookingData.persons * bookingData.days;
        }

        if (bookingData.includeHotel && packageData.hotel_price) {
            total += parseInt(packageData.hotel_price) * bookingData.persons * bookingData.days;
        }

        return total;
    };

    const handleBookingSubmit = () => {
        // Here you would typically send the booking data to your backend
        // For now, we'll just redirect to a payment page with the booking data
        const bookingInfo = {
            packageId: packageData.id,
            packageName: packageData.name,
            ...bookingData,
            totalPrice: calculateTotalPrice(),
        };

        // You can store this in localStorage or pass it to your payment page
        localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));

        // Redirect to payment page (you'll need to create this route)
        window.location.href = '/payment';
    };

    const resetBookingForm = () => {
        setBookingData({
            startDate: '',
            persons: packageData.min_persons,
            days: packageData.min_days,
            includeMeals: false,
            includeHotel: false,
        });
    };

    const INDIAN_STATES = [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
    ];

    const features = [
        {
            icon: Clock,
            title: 'Duration',
            value: `${packageData.min_days}-${packageData.max_days} days`,
        },
        {
            icon: Users,
            title: 'Group Size',
            value: `${packageData.min_persons}-${packageData.max_persons} persons`,
        },
        {
            icon: MapPin,
            title: 'Destination',
            value: packageData.state,
        },
        {
            icon: Calendar,
            title: 'Age Range',
            value: `${packageData.min_age}+ years`,
        },
    ];

    const inclusions = [
        { icon: Car, title: 'Transportation', included: packageData.vehicles.length > 0 },
        { icon: Hotel, title: 'Hotel Accommodation', included: packageData.hotel_included },
        { icon: Utensils, title: 'Meals', included: packageData.meal_included },
        { icon: Shield, title: 'Safety Equipment', included: true },
        { icon: Award, title: 'Expert Guide', included: true },
        { icon: Map, title: 'Travel Insurance', included: true },
    ];

    // Separate included and not included items
    const includedItems = inclusions.filter((item) => item.included);
    const notIncludedItems = inclusions.filter((item) => !item.included);

    return (
        <div className="min-h-screen bg-background">
            <Head title={`${packageData.name} - North Trippers`} />
            <BackButton text="Back to Home" className="mb-6" />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
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
                        {packageData.photos && packageData.photos.length > 0 ? (
                            <img src={packageData.photos[selectedPhoto]} alt={packageData.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#238636] to-[#1a6b2a]">
                                <Globe className="h-16 w-16 text-white" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute right-4 bottom-4 left-4">
                            <Badge className="mb-2 bg-[#238636] text-white">{packageData.state}</Badge>
                            <h1 className="text-3xl font-bold text-white md:text-4xl">{packageData.name}</h1>
                        </div>
                    </div>

                    {/* Photo Thumbnails */}
                    {packageData.photos && packageData.photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {packageData.photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedPhoto(index)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                                        selectedPhoto === index ? 'border-[#238636]' : 'border-transparent'
                                    }`}
                                >
                                    <img src={photo} alt={`${packageData.name} ${index + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Package</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-muted-foreground">{packageData.description}</p>
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Package Features</CardTitle>
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

                        {/* Travel Points */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Travel Points</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 font-semibold">Boarding Location</h4>
                                        <p className="text-muted-foreground">{packageData.boarding_location}</p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold">Travel Points</h4>
                                        <p className="text-muted-foreground">{packageData.travel_points}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicles */}
                        {packageData.vehicles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Vehicles</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {packageData.vehicles.map((vehicle) => (
                                            <div key={vehicle.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                {vehicle.image_url ? (
                                                    <img src={vehicle.image_url} alt={vehicle.name} className="h-12 w-12 rounded object-cover" />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-[#238636]/10">
                                                        <Car className="h-6 w-6 text-[#238636]" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{vehicle.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {vehicle.model} ({vehicle.year})
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pickup Locations */}
                        {packageData.pickup_locations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pickup Locations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {packageData.pickup_locations.map((location) => (
                                            <div key={location.id} className="rounded-lg border p-4">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="mt-1 h-5 w-5 text-[#238636]" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{location.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {location.address}, {location.city}, {location.state} {location.zip_code}
                                                        </p>
                                                        {location.phone && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground">{location.phone}</span>
                                                            </div>
                                                        )}
                                                        {location.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground">{location.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {packageData.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {tag}
                                        </Badge>
                                    ))}
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
                                <CardTitle>Package Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#238636]">₹{parseInt(packageData.base_price).toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">per person</div>
                                </div>

                                <div className="border-t border-border" />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span>₹{parseInt(packageData.base_price).toLocaleString()}</span>
                                    </div>
                                    {packageData.meal_price && (
                                        <div className="flex justify-between">
                                            <span>Meals</span>
                                            <span>₹{parseInt(packageData.meal_price).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {packageData.hotel_price && (
                                        <div className="flex justify-between">
                                            <span>Hotel</span>
                                            <span>₹{parseInt(packageData.hotel_price).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border" />

                                <div className="space-y-3">
                                    <Button className="w-full bg-[#238636] py-6 text-lg hover:bg-[#1a6b2a]" onClick={() => setIsBookingOpen(true)}>
                                        Book Now
                                    </Button>
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

            {/* Booking Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-background shadow-lg sm:max-w-lg">
                        <div className="flex items-center justify-between border-b p-6">
                            <h2 className="text-lg font-semibold">Book Package</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsBookingOpen(false);
                                    resetBookingForm();
                                }}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            <div className="space-y-6">
                                {/* Package Info */}
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <h3 className="font-semibold">{packageData.name}</h3>
                                    <p className="text-sm text-muted-foreground">{packageData.state}</p>
                                    <p className="text-sm font-medium text-[#238636]">
                                        ₹{parseInt(packageData.base_price).toLocaleString()} per person per day
                                    </p>
                                </div>

                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        min={minDate}
                                        value={bookingData.startDate}
                                        onChange={(e) => setBookingData((prev) => ({ ...prev, startDate: e.target.value }))}
                                        required
                                    />
                                    {bookingData.startDate === today && (
                                        <p className="text-xs text-red-600">For same-day bookings, please contact us directly at +91 98765 43210</p>
                                    )}
                                </div>

                                {/* Number of Persons */}
                                <div className="space-y-2">
                                    <Label htmlFor="persons">Number of Persons</Label>
                                    <Select
                                        value={bookingData.persons.toString()}
                                        onValueChange={(value) => setBookingData((prev) => ({ ...prev, persons: parseInt(value) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {personsOptions.map((num) => (
                                                <SelectItem key={num} value={num.toString()}>
                                                    {num} {num === 1 ? 'person' : 'persons'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Days */}
                                <div className="space-y-2">
                                    <Label htmlFor="days">Number of Days</Label>
                                    <Select
                                        value={bookingData.days.toString()}
                                        onValueChange={(value) => setBookingData((prev) => ({ ...prev, days: parseInt(value) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOptions.map((num) => (
                                                <SelectItem key={num} value={num.toString()}>
                                                    {num} {num === 1 ? 'day' : 'days'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Meal Option */}
                                {packageData.meal_included ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="includeMeals"
                                                checked={bookingData.includeMeals}
                                                onCheckedChange={(checked) =>
                                                    setBookingData((prev) => ({ ...prev, includeMeals: checked as boolean }))
                                                }
                                            />
                                            <Label htmlFor="includeMeals" className="flex items-center gap-2">
                                                <Utensils className="h-4 w-4" />
                                                Include Meals
                                                {packageData.meal_price && (
                                                    <span className="text-sm text-muted-foreground">
                                                        (+₹{parseInt(packageData.meal_price).toLocaleString()} per person per day)
                                                    </span>
                                                )}
                                            </Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-sm text-muted-foreground">
                                            Meals are not included in this package. Contact us if you need meal arrangements.
                                        </p>
                                    </div>
                                )}

                                {/* Hotel Option */}
                                {packageData.hotel_included ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="includeHotel"
                                                checked={bookingData.includeHotel}
                                                onCheckedChange={(checked) =>
                                                    setBookingData((prev) => ({ ...prev, includeHotel: checked as boolean }))
                                                }
                                            />
                                            <Label htmlFor="includeHotel" className="flex items-center gap-2">
                                                <Hotel className="h-4 w-4" />
                                                Include Hotel
                                                {packageData.hotel_price && (
                                                    <span className="text-sm text-muted-foreground">
                                                        (+₹{parseInt(packageData.hotel_price).toLocaleString()} per person per day)
                                                    </span>
                                                )}
                                            </Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-sm text-muted-foreground">
                                            Hotel accommodation is not included in this package. Contact us if you need hotel arrangements.
                                        </p>
                                    </div>
                                )}

                                {/* Total Price */}
                                <div className="rounded-lg bg-[#238636]/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">Total Price:</span>
                                        <span className="text-2xl font-bold text-[#238636]">₹{calculateTotalPrice().toLocaleString()}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        For {bookingData.persons} person(s) × {bookingData.days} day(s)
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    className="w-full bg-[#238636] py-3 text-lg hover:bg-[#1a6b2a]"
                                    onClick={handleBookingSubmit}
                                    disabled={!bookingData.startDate || bookingData.startDate === today}
                                >
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Car, Plus, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

interface PhotoFile {
    file: File;
    preview: string;
}

export default function CreateEvent() {
    const [form, setForm] = useState({
        name: '',
        state: '',
        days: 1,
        event_date: '',
        event_time: '',
        itinerary: [] as string[],
        meal_included: false,
        meal_times: 'one',
        meal_price: '',
        hotel_included: false,
        hotel_price: '',
        min_age: 0,
        max_age: '',
        available_slots: 1,
        vehicle_id: 0,
        activities: [] as string[],
        boarding_point: '',
        pickup_location_id: 0,
        base_price: '',
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState<PhotoFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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

    // Fetch vehicles and pickup locations
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                await Promise.all([fetchVehicles(), fetchPickupLocations()]);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load vehicles and pickup locations',
                    variant: 'destructive',
                });
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Generate itinerary when days change
    useEffect(() => {
        const newItinerary: string[] = [];
        for (let i = 1; i <= form.days; i++) {
            newItinerary.push(`Day ${i}: `);
        }
        setForm((prev) => ({ ...prev, itinerary: newItinerary }));
    }, [form.days]);

    const fetchVehicles = async () => {
        try {
            const response = await fetch('/vehicles/api', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });
            const data = await response.json();
            if (data.success) {
                setVehicles(data.vehicles);
                console.log('Vehicles loaded:', data.vehicles);
            } else {
                console.error('Failed to fetch vehicles:', data);
            }
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        }
    };

    const fetchPickupLocations = async () => {
        try {
            const response = await fetch('/pickup-locations/api', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });
            const data = await response.json();
            if (data.success) {
                setPickupLocations(data.pickup_locations);
                console.log('Pickup locations loaded:', data.pickup_locations);
            } else {
                console.error('Failed to fetch pickup locations:', data);
            }
        } catch (error) {
            console.error('Failed to fetch pickup locations:', error);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addPhotos(files);
    };

    const addPhotos = (files: File[]) => {
        if (files.length + photos.length > 5) {
            toast({
                title: 'Error',
                description: 'Maximum 5 photos allowed',
                variant: 'destructive',
            });
            return;
        }

        const newPhotos: PhotoFile[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => {
            const newPhotos = prev.filter((_, i) => i !== index);
            // Revoke the object URL to free memory
            URL.revokeObjectURL(prev[index].preview);
            return newPhotos;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length > 0) {
            addPhotos(imageFiles);
        }
    };

    const addActivity = () => {
        setForm((prev) => ({
            ...prev,
            activities: [...prev.activities, ''],
        }));
    };

    const removeActivity = (index: number) => {
        setForm((prev) => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index),
        }));
    };

    const updateActivity = (index: number, value: string) => {
        setForm((prev) => ({
            ...prev,
            activities: prev.activities.map((activity, i) => (i === index ? value : activity)),
        }));
    };

    const updateItinerary = (index: number, value: string) => {
        setForm((prev) => ({
            ...prev,
            itinerary: prev.itinerary.map((day, i) => (i === index ? value : day)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            // Add form fields
            Object.entries(form).forEach(([key, value]) => {
                if (key === 'itinerary' || key === 'activities') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            });

            // Add photos
            photos.forEach((photo) => {
                formData.append('photos[]', photo.file);
            });

            // Use Inertia router for form submission (handles CSRF automatically)
            router.post('/events', formData, {
                onSuccess: () => {
                    // Success is handled by redirect
                },
                onError: (errors) => {
                    console.error('Submit failed:', errors);
                    // Show validation errors
                    Object.keys(errors).forEach((key) => {
                        toast({
                            title: 'Validation Error',
                            description: errors[key],
                            variant: 'destructive',
                        });
                    });
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Submit failed:', error);
            toast({
                title: 'Error',
                description: 'Failed to create event',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
        };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Head title="Create Event - North Trippers" />

            <div className="mx-auto max-w-4xl space-y-8 p-6">
                <BackButton text="Back to Events" className="mb-6" />
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/events">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Events
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">Create New Event</h1>
                                <p className="text-muted-foreground">Add a new adventure event to your collection</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Event Name</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter event name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDIAN_STATES.map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="days">Number of Days</Label>
                                    <Input
                                        id="days"
                                        type="number"
                                        min="1"
                                        value={form.days}
                                        onChange={(e) => setForm((prev) => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Base Price (per person)</Label>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.base_price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, base_price: e.target.value }))}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="event_date">Event Date</Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={form.event_date}
                                        onChange={(e) => setForm((prev) => ({ ...prev, event_date: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event_time">Pickup Time</Label>
                                    <Input
                                        id="event_time"
                                        type="time"
                                        value={form.event_time}
                                        onChange={(e) => setForm((prev) => ({ ...prev, event_time: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="min_age">Minimum Age</Label>
                                    <Input
                                        id="min_age"
                                        type="number"
                                        min="0"
                                        value={form.min_age}
                                        onChange={(e) => setForm((prev) => ({ ...prev, min_age: parseInt(e.target.value) || 0 }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_age">Maximum Age (optional)</Label>
                                    <Input
                                        id="max_age"
                                        type="number"
                                        min="0"
                                        value={form.max_age}
                                        onChange={(e) => setForm((prev) => ({ ...prev, max_age: e.target.value }))}
                                        placeholder="No limit"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="available_slots">Available Slots</Label>
                                    <Input
                                        id="available_slots"
                                        type="number"
                                        min="1"
                                        value={form.available_slots}
                                        onChange={(e) => setForm((prev) => ({ ...prev, available_slots: parseInt(e.target.value) || 1 }))}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Itinerary */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Event Itinerary</CardTitle>
                            <p className="text-sm text-muted-foreground">Plan the activities for each day of the event</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.itinerary.map((day, index) => (
                                <div key={index} className="space-y-2">
                                    <Label htmlFor={`day-${index + 1}`}>Day {index + 1}</Label>
                                    <Textarea
                                        id={`day-${index + 1}`}
                                        value={day.replace(`Day ${index + 1}: `, '')}
                                        onChange={(e) => updateItinerary(index, `Day ${index + 1}: ${e.target.value}`)}
                                        placeholder={`Describe the activities for day ${index + 1}`}
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Vehicle Selection */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Vehicle Selection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Label htmlFor="vehicle">Select Vehicle</Label>
                                <Select
                                    value={form.vehicle_id ? form.vehicle_id.toString() : ''}
                                    onValueChange={(value) => setForm((prev) => ({ ...prev, vehicle_id: parseInt(value) }))}
                                    disabled={isLoadingData}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingData ? 'Loading vehicles...' : 'Choose a vehicle'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingData ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Loading vehicles...</div>
                                        ) : vehicles.length === 0 ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">No vehicles available</div>
                                        ) : (
                                            vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                    <div className="flex items-center gap-3">
                                                        {vehicle.image_url ? (
                                                            <img
                                                                src={vehicle.image_url}
                                                                alt={vehicle.name}
                                                                className="h-6 w-6 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#238636]/10">
                                                                <Car className="h-3 w-3 text-[#238636]" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{vehicle.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {vehicle.model} ({vehicle.year})
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activities */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Activities</CardTitle>
                            <p className="text-sm text-muted-foreground">Add the main activities included in this event</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.activities.map((activity, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={activity}
                                        onChange={(e) => updateActivity(index, e.target.value)}
                                        placeholder={`Activity ${index + 1}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeActivity(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addActivity}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Activity
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Pickup and Boarding */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Pickup & Boarding</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pickup_location">Pickup Location</Label>
                                <Select
                                    value={form.pickup_location_id ? form.pickup_location_id.toString() : ''}
                                    onValueChange={(value) => setForm((prev) => ({ ...prev, pickup_location_id: parseInt(value) }))}
                                    disabled={isLoadingData}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingData ? 'Loading pickup locations...' : 'Select pickup location'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingData ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Loading pickup locations...</div>
                                        ) : pickupLocations.length === 0 ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">No pickup locations available</div>
                                        ) : (
                                            pickupLocations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.name} - {location.city}, {location.state}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boarding_point">Boarding Point</Label>
                                <Input
                                    id="boarding_point"
                                    value={form.boarding_point}
                                    onChange={(e) => setForm((prev) => ({ ...prev, boarding_point: e.target.value }))}
                                    placeholder="Enter boarding point details"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal & Hotel Options */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Meal & Hotel Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Meal Options */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="meal_included"
                                        checked={form.meal_included}
                                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, meal_included: checked as boolean }))}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="meal_included">Meal Included</Label>
                                        <p className="text-sm text-muted-foreground">Include meals in the event</p>
                                    </div>
                                </div>

                                {form.meal_included && (
                                    <div className="space-y-4 pl-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="meal_times">Meal Times</Label>
                                            <Select
                                                value={form.meal_times}
                                                onValueChange={(value) => setForm((prev) => ({ ...prev, meal_times: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="one">One Time</SelectItem>
                                                    <SelectItem value="two">Two Times</SelectItem>
                                                    <SelectItem value="three">Three Times</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meal_price">Meal Price (per person per day)</Label>
                                            <Input
                                                id="meal_price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.meal_price}
                                                onChange={(e) => setForm((prev) => ({ ...prev, meal_price: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hotel Options */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hotel_included"
                                        checked={form.hotel_included}
                                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, hotel_included: checked as boolean }))}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="hotel_included">Hotel Included</Label>
                                        <p className="text-sm text-muted-foreground">Include hotel accommodation in the event</p>
                                    </div>
                                </div>

                                {form.hotel_included && (
                                    <div className="space-y-2 pl-6">
                                        <Label htmlFor="hotel_price">Hotel Price (per person per day)</Label>
                                        <Input
                                            id="hotel_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.hotel_price}
                                            onChange={(e) => setForm((prev) => ({ ...prev, hotel_price: e.target.value }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photos */}
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>Event Photos</CardTitle>
                            <p className="text-sm text-muted-foreground">Upload up to 5 photos for the event (max 5MB each)</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${
                                    isDragOver ? 'border-2 border-dashed border-blue-500 bg-blue-50' : ''
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* Photo Previews */}
                                {photos.map((photo, index) => (
                                    <div key={index} className="group relative">
                                        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25">
                                            <img src={photo.preview} alt={`Event photo ${index + 1}`} className="h-full w-full object-cover" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 border-red-500 bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:border-red-600 hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                            {photo.file.name}
                                        </div>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                {photos.length < 5 && (
                                    <div className="relative flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">Upload Photo</p>
                                            <p className="text-xs text-muted-foreground">or drag and drop</p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link href="/events">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" className="bg-[#238636] hover:bg-[#1a6b2a]" disabled={loading}>
                            {loading ? 'Creating Event...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>

            <Toaster />
        </div>
    );
}

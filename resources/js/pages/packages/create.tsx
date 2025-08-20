import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Car, DollarSign, Hotel, Image as ImageIcon, MapPin, Plus, Tag, Upload, X } from 'lucide-react';
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

export default function CreatePackage() {
    const [form, setForm] = useState({
        name: '',
        description: '',
        state: '',
        tags: [] as string[],
        min_days: 1,
        max_days: 1,
        min_persons: 1,
        max_persons: 1,
        min_age: 0,
        max_age: '',
        base_price: '',
        meal_price: '',
        hotel_price: '',
        hotel_included: false,
        meal_included: false,
        meal_times: 'one',
        hotel_links: '',
        travel_points: '',
        boarding_location: '',
        selected_vehicles: [] as number[],
        selected_pickup_locations: [] as number[],
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    // Fetch vehicles and pickup locations on component mount
    useEffect(() => {
        fetchVehicles();
        fetchPickupLocations();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch('/vehicles/paginate?per_page=100');
            const data = await response.json();
            setVehicles(data.vehicles.data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        }
    };

    const fetchPickupLocations = async () => {
        try {
            const response = await fetch('/pickup-locations/paginate?per_page=100');
            const data = await response.json();
            setPickupLocations(data.pickupLocations.data);
        } catch (error) {
            console.error('Failed to fetch pickup locations:', error);
        }
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

        if (photos.length + imageFiles.length > 5) {
            toast({
                title: 'Error',
                description: 'Maximum 5 photos allowed',
                variant: 'destructive',
            });
            return;
        }

        setPhotos((prev) => [...prev, ...imageFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imageFiles = files.filter((file) => file.type.startsWith('image/'));

            if (photos.length + imageFiles.length > 5) {
                toast({
                    title: 'Error',
                    description: 'Maximum 5 photos allowed',
                    variant: 'destructive',
                });
                return;
            }

            setPhotos((prev) => [...prev, ...imageFiles]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleVehicle = (vehicleId: number) => {
        setForm((prev) => ({
            ...prev,
            selected_vehicles: prev.selected_vehicles.includes(vehicleId)
                ? prev.selected_vehicles.filter((id) => id !== vehicleId)
                : [...prev.selected_vehicles, vehicleId],
        }));
    };

    const togglePickupLocation = (locationId: number) => {
        setForm((prev) => ({
            ...prev,
            selected_pickup_locations: prev.selected_pickup_locations.includes(locationId)
                ? prev.selected_pickup_locations.filter((id) => id !== locationId)
                : [...prev.selected_pickup_locations, locationId],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic client-side validation
        if (!form.name.trim()) {
            toast({
                title: 'Error',
                description: 'Package name is required',
                variant: 'destructive',
            });
            return;
        }

        if (!form.state) {
            toast({
                title: 'Error',
                description: 'Please select a state',
                variant: 'destructive',
            });
            return;
        }

        if (!form.base_price || parseFloat(form.base_price) <= 0) {
            toast({
                title: 'Error',
                description: 'Please enter a valid base price',
                variant: 'destructive',
            });
            return;
        }

        if (!form.travel_points.trim()) {
            toast({
                title: 'Error',
                description: 'Travel points are required',
                variant: 'destructive',
            });
            return;
        }

        if (!form.boarding_location.trim()) {
            toast({
                title: 'Error',
                description: 'Boarding location is required',
                variant: 'destructive',
            });
            return;
        }

        if (parseInt(form.max_persons.toString()) < parseInt(form.min_persons.toString())) {
            toast({
                title: 'Error',
                description: 'Maximum persons must be greater than or equal to minimum persons',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();

        // Debug: Log form data
        console.log('Form data being sent:', form);

        // Add all form fields
        Object.entries(form).forEach(([key, value]) => {
            if (key === 'tags') {
                formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (key === 'hotel_included' || key === 'meal_included') {
                // Handle boolean fields properly
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        // Add photos
        photos.forEach((photo, index) => {
            formData.append(`photos[${index}]`, photo);
        });

        try {
            const response = await fetch('/packages', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const responseData = await response.json();

            // Debug: Log response
            console.log('Response status:', response.status);
            console.log('Response data:', responseData);

            if (!response.ok) {
                // Extract detailed error message
                let errorMessage = 'Failed to create package';

                if (responseData.errors) {
                    // Handle validation errors - show all errors
                    const validationErrors = Object.values(responseData.errors).flat();
                    errorMessage = validationErrors.join(', ');
                } else if (responseData.error) {
                    errorMessage = responseData.error;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.details) {
                    errorMessage = responseData.details;
                }

                console.error('Server error response:', responseData);
                throw new Error(errorMessage);
            }

            toast({
                title: 'Success!',
                description: 'Package created successfully!',
                variant: 'success',
            });

            // Reset form
            setForm({
                name: '',
                description: '',
                state: '',
                tags: [],
                min_days: 1,
                max_days: 1,
                min_persons: 1,
                max_persons: 1,
                min_age: 0,
                max_age: '',
                base_price: '',
                meal_price: '',
                hotel_price: '',
                hotel_included: false,
                meal_included: false,
                meal_times: 'one',
                hotel_links: '',
                travel_points: '',
                boarding_location: '',
                selected_vehicles: [],
                selected_pickup_locations: [],
            });
            setPhotos([]);
        } catch (error) {
            console.error('Package creation error:', error);

            let errorMessage = 'Failed to create package';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            // Show error in console for debugging
            console.error('Error message to display:', errorMessage);

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
                duration: 5000, // Show for 5 seconds
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-6">
            <Head title="Create Package" />
            <BackButton text="Back to Packages" className="mb-6" />

            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Create New Package</h1>
                <p className="text-muted-foreground">Design an amazing travel experience for your customers</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <Tag className="h-5 w-5" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Package Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter package name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setForm((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="Describe your package..."
                                rows={3}
                                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tags for Searchability</Label>
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tags: prev.tags.filter((t) => t !== tag),
                                                }));
                                            }}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" onClick={addTag} size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Photos Upload */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <ImageIcon className="h-5 w-5" />
                            Package Photos (Max 5)
                        </h2>

                        <div
                            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-2 text-lg font-medium">Drag & drop photos here</p>
                            <p className="mb-4 text-sm text-muted-foreground">or click to browse</p>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                Choose Files
                            </Button>
                            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {photos.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                {photos.map((photo, index) => (
                                    <div key={index} className="group relative">
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt={`Photo ${index + 1}`}
                                            className="h-24 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Duration & Capacity */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <Calendar className="h-5 w-5" />
                            Duration & Capacity
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="min_days">Minimum Days *</Label>
                                <Input
                                    id="min_days"
                                    type="number"
                                    min="1"
                                    value={form.min_days}
                                    onChange={(e) => setForm((prev) => ({ ...prev, min_days: parseInt(e.target.value) }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_days">Maximum Days *</Label>
                                <Input
                                    id="max_days"
                                    type="number"
                                    min="1"
                                    value={form.max_days}
                                    onChange={(e) => setForm((prev) => ({ ...prev, max_days: parseInt(e.target.value) }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_persons">Minimum Persons *</Label>
                                <Input
                                    id="min_persons"
                                    type="number"
                                    min="1"
                                    value={form.min_persons}
                                    onChange={(e) => setForm((prev) => ({ ...prev, min_persons: parseInt(e.target.value) }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_persons">Maximum Persons *</Label>
                                <Input
                                    id="max_persons"
                                    type="number"
                                    min="1"
                                    value={form.max_persons}
                                    onChange={(e) => setForm((prev) => ({ ...prev, max_persons: parseInt(e.target.value) }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_age">Minimum Age</Label>
                                <Input
                                    id="min_age"
                                    type="number"
                                    min="0"
                                    value={form.min_age}
                                    onChange={(e) => setForm((prev) => ({ ...prev, min_age: parseInt(e.target.value) }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_age">Maximum Age</Label>
                                <Input
                                    id="max_age"
                                    type="number"
                                    min="0"
                                    value={form.max_age}
                                    onChange={(e) => setForm((prev) => ({ ...prev, max_age: e.target.value }))}
                                    placeholder="No limit"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Pricing */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <DollarSign className="h-5 w-5" />
                            Pricing
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="base_price">Base Price per Person *</Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-muted-foreground">₹</span>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.base_price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, base_price: e.target.value }))}
                                        className="pl-8"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Without meal and hotel</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meal_price">Meal Price (Optional)</Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-muted-foreground">₹</span>
                                    <Input
                                        id="meal_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.meal_price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, meal_price: e.target.value }))}
                                        className="pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hotel_price">Hotel Price (Optional)</Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-muted-foreground">₹</span>
                                    <Input
                                        id="hotel_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.hotel_price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, hotel_price: e.target.value }))}
                                        className="pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Vehicle Selection */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <Car className="h-5 w-5" />
                            Available Vehicles
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {vehicles.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                        form.selected_vehicles.includes(vehicle.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                    }`}
                                    onClick={() => toggleVehicle(vehicle.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                            {vehicle.image_url ? (
                                                <img src={vehicle.image_url} alt={vehicle.name} className="h-full w-full rounded-lg object-cover" />
                                            ) : (
                                                <Car className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{vehicle.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {vehicle.model} ({vehicle.year})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {vehicles.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">No vehicles available. Please add vehicles first.</p>
                        )}
                    </div>
                </Card>

                {/* Pickup Locations */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <MapPin className="h-5 w-5" />
                            Pickup Locations
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pickupLocations.map((location) => (
                                <div
                                    key={location.id}
                                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                        form.selected_pickup_locations.includes(location.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                    }`}
                                    onClick={() => togglePickupLocation(location.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                            {location.image_url ? (
                                                <img src={location.image_url} alt={location.name} className="h-full w-full rounded-lg object-cover" />
                                            ) : (
                                                <MapPin className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{location.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {location.city}, {location.state}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pickupLocations.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                No pickup locations available. Please add pickup locations first.
                            </p>
                        )}
                    </div>
                </Card>

                {/* Hotel & Meal Options */}
                <Card className="p-6">
                    <div className="space-y-6">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <Hotel className="h-5 w-5" />
                            Hotel & Meal Options
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hotel_included"
                                    checked={form.hotel_included}
                                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, hotel_included: checked as boolean }))}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="hotel_included">Hotel Included</Label>
                                    <p className="text-sm text-muted-foreground">Include hotel accommodation in the package</p>
                                </div>
                            </div>

                            {form.hotel_included && (
                                <div className="space-y-2">
                                    <Label htmlFor="hotel_links">Hotel Booking Links</Label>
                                    <textarea
                                        id="hotel_links"
                                        value={form.hotel_links}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setForm((prev) => ({ ...prev, hotel_links: e.target.value }))
                                        }
                                        placeholder="Enter hotel booking links (one per line)&#10;https://hotel.com&#10;https://oyorooms.com"
                                        rows={3}
                                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="meal_included"
                                    checked={form.meal_included}
                                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, meal_included: checked as boolean }))}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="meal_included">Meal Included</Label>
                                    <p className="text-sm text-muted-foreground">Include meals in the package</p>
                                </div>
                            </div>

                            {form.meal_included && (
                                <div className="space-y-2">
                                    <Label htmlFor="meal_times">Meal Times</Label>
                                    <Select value={form.meal_times} onValueChange={(value) => setForm((prev) => ({ ...prev, meal_times: value }))}>
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
                            )}
                        </div>
                    </div>
                </Card>

                {/* Travel Details */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <MapPin className="h-5 w-5" />
                            Travel Details
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="boarding_location">Boarding Location *</Label>
                                <Input
                                    id="boarding_location"
                                    value={form.boarding_location}
                                    onChange={(e) => setForm((prev) => ({ ...prev, boarding_location: e.target.value }))}
                                    placeholder="Enter boarding location"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="travel_points">Travel Points Covered *</Label>
                                <textarea
                                    id="travel_points"
                                    value={form.travel_points}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        setForm((prev) => ({ ...prev, travel_points: e.target.value }))
                                    }
                                    placeholder="List all travel points, one per line&#10;Point 1&#10;Point 2&#10;Point 3"
                                    rows={4}
                                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                Creating Package...
                            </>
                        ) : (
                            'Create Package'
                        )}
                    </Button>
                </div>
            </form>

            <Toaster />
        </div>
    );
}

import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Loader2, Mail, MapPin, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

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

interface PaginatedPickupLocations {
    data: PickupLocation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export default function PickupLocations({ pickupLocations: propPickupLocations }: { pickupLocations?: PaginatedPickupLocations }) {
    const page = usePage<{ pickupLocations?: PaginatedPickupLocations }>();
    const pickupLocationsData = propPickupLocations || page.props.pickupLocations;
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>(pickupLocationsData?.data || []);
    const [paginationInfo, setPaginationInfo] = useState(pickupLocationsData || null);
    const [originalPickupLocations, setOriginalPickupLocations] = useState<PickupLocation[]>(pickupLocationsData?.data || []);
    const [originalPaginationInfo, setOriginalPaginationInfo] = useState(pickupLocationsData || null);
    const [isInitialLoad, setIsInitialLoad] = useState(!pickupLocationsData?.data);
    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        email: '',
        image: null as File | null,
    });
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    // Function to handle navigation back to previous page
    const handleGoBack = () => {
        window.history.back();
    };

    const confirmDeleteLocation = (locationId: number) => {
        setDeleteLocationId(locationId);
    };

    const handleDeleteLocation = async () => {
        if (!deleteLocationId) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/pickup-locations/${deleteLocationId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to delete pickup location');

            // Remove from UI immediately after successful deletion
            setPickupLocations((prevLocations) => prevLocations.filter((l) => l.id !== deleteLocationId));

            toast({
                title: 'Success!',
                description: 'Pickup location deleted successfully!',
                variant: 'success',
                duration: 3000,
            });

            // Close dialog and reset state
            setDeleteLocationId(null);

            // Update pagination info if needed
            if (paginationInfo) {
                const newTotal = paginationInfo.total - 1;
                const newLastPage = Math.ceil(newTotal / paginationInfo.per_page);

                setPaginationInfo((prev) =>
                    prev
                        ? {
                              ...prev,
                              total: newTotal,
                              last_page: newLastPage,
                              to: Math.min(prev.to, newTotal),
                          }
                        : null,
                );

                // If current page becomes empty and not the first page, go to previous page
                const remainingLocations = pickupLocations.filter((l) => l.id !== deleteLocationId);
                if (remainingLocations.length === 0 && paginationInfo.current_page > 1) {
                    setTimeout(() => {
                        handlePageChange(paginationInfo.current_page - 1);
                    }, 500);
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete pickup location',
                variant: 'destructive',
                duration: 5000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePageChange = async (page: number) => {
        if (!page || page === paginationInfo?.current_page) return;

        setIsLoading(true);

        try {
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const response = await fetch(`/pickup-locations/paginate?page=${page}&per_page=${paginationInfo?.per_page || 2}${searchParam}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch pickup locations');

            const data = await response.json();
            setPickupLocations(data.pickupLocations.data);
            setPaginationInfo(data.pickupLocations);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load pickup locations',
                variant: 'destructive',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);

        try {
            // If search query is empty, restore original data
            if (!searchQuery.trim()) {
                setPickupLocations(originalPickupLocations);
                setPaginationInfo(originalPaginationInfo);
                setIsLoading(false);
                return;
            }

            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const response = await fetch(`/pickup-locations/paginate?page=1&per_page=${paginationInfo?.per_page || 2}${searchParam}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to search pickup locations');

            const data = await response.json();
            setPickupLocations(data.pickupLocations.data);
            setPaginationInfo(data.pickupLocations);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to search pickup locations',
                variant: 'destructive',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (page.props.pickupLocations) {
            setPickupLocations(page.props.pickupLocations.data || []);
            setPaginationInfo(page.props.pickupLocations);
            setOriginalPickupLocations(page.props.pickupLocations.data || []);
            setOriginalPaginationInfo(page.props.pickupLocations);
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    }, [page.props.pickupLocations]);

    // Set initial load to false after component mounts if we have data
    useEffect(() => {
        if (pickupLocationsData?.data) {
            setIsInitialLoad(false);
        }
    }, [pickupLocationsData]);

    // Debounced search effect
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Don't trigger search on initial load
        if (isInitialLoad) {
            return;
        }

        const timeout = setTimeout(() => {
            handleSearch();
        }, 500); // 500ms delay

        setSearchTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [searchQuery, isInitialLoad]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files) {
            setForm((f) => ({ ...f, image: files[0] }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('address', form.address);
        formData.append('city', form.city);
        formData.append('state', form.state);
        formData.append('zip_code', form.zip_code);
        formData.append('phone', form.phone);
        formData.append('email', form.email);
        if (form.image) formData.append('image', form.image);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/pickup-locations', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!res.ok) throw new Error('Failed to add pickup location');

            toast({
                title: 'Success!',
                description: 'Pickup location added successfully!',
                variant: 'success',
                duration: 5000,
            });

            setForm({ name: '', address: '', city: '', state: '', zip_code: '', phone: '', email: '', image: null });
            setIsDialogOpen(false);

            // Refresh current page data
            router.reload({ only: ['pickupLocations'] });
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Unknown error',
                variant: 'destructive',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const LocationSkeleton = () => (
        <Card className="h-full overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
                <Skeleton className="h-full w-full rounded-none" />
            </div>
            <div className="flex-1 space-y-3 p-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-4 pt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </Card>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <BackButton text="Back" className="mb-2" />

            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pickup Locations</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Manage your pickup locations</p>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                                onClick={() => {
                                    setSearchQuery('');
                                    // Immediately restore original data
                                    setPickupLocations(originalPickupLocations);
                                    setPaginationInfo(originalPaginationInfo);
                                }}
                            >
                                ×
                            </Button>
                        )}
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full gap-2 sm:w-auto">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Location</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-0 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Pickup Location</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Location Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter location name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="Enter state"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">ZIP Code</Label>
                                    <Input
                                        id="zip_code"
                                        name="zip_code"
                                        value={form.zip_code}
                                        onChange={handleChange}
                                        placeholder="Enter ZIP code"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone (Optional)</Label>
                                        <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email (Optional)</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Location Image</Label>
                                    <Input id="image" name="image" type="file" accept="image/*" onChange={handleChange} required />
                                </div>

                                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="order-2 flex-1 sm:order-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="order-1 flex-1 sm:order-2">
                                        {loading ? 'Adding...' : 'Add Location'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid min-h-[400px] gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: paginationInfo?.per_page || 2 }).map((_, i) => <LocationSkeleton key={i} />)
                ) : pickupLocations.length > 0 ? (
                    pickupLocations.map((location) => (
                        <Card key={location.id} className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                            <div className="relative aspect-[4/3] bg-muted">
                                {location.image_url ? (
                                    <img
                                        src={location.image_url}
                                        alt={location.name}
                                        className="h-full w-full object-cover"
                                        style={{ aspectRatio: '4/3' }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <MapPin className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => confirmDeleteLocation(location.id)}
                                    disabled={isDeleting && deleteLocationId === location.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-1 flex-col space-y-3 p-4">
                                <div className="flex-1">
                                    <h3 className="text-lg leading-tight font-semibold">{location.name}</h3>
                                    <p className="text-muted-foreground">{location.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {location.city}, {location.state} {location.zip_code}
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
                                    {location.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {location.phone}
                                        </div>
                                    )}
                                    {location.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            {location.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">No pickup locations found</h3>
                        <p className="mb-4 text-muted-foreground">Get started by adding your first pickup location</p>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Location
                        </Button>
                    </div>
                )}
            </div>

            {/* Simple Pagination */}
            {paginationInfo && paginationInfo.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(paginationInfo.current_page - 1)}
                        disabled={paginationInfo.current_page <= 1 || isLoading}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Page {paginationInfo.current_page} of {paginationInfo.last_page}
                    </span>

                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(paginationInfo.current_page + 1)}
                        disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoading}
                        className="flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteLocationId !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDeleteLocationId(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Pickup Location</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this pickup location? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setDeleteLocationId(null)} disabled={isDeleting} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteLocation} disabled={isDeleting} className="flex-1">
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    );
}

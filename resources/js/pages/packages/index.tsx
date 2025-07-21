import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Car, Edit, Hotel, MapPin, Plus, Search, Users, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    vehicles: Array<{
        id: number;
        name: string;
        model: string;
        year: number;
        image_url?: string;
    }>;
    pickup_locations: Array<{
        id: number;
        name: string;
        city: string;
        state: string;
        image_url?: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface PaginatedPackages {
    data: Package[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [originalPackages, setOriginalPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage] = useState(10);
    const { toast } = useToast();

    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
    }, [currentPage]);

    // Filter packages when search query changes
    useEffect(() => {
        if (!isInitialLoad) {
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, isInitialLoad]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/packages/paginate?page=${currentPage}&per_page=${perPage}`);
            const data: { packages: PaginatedPackages } = await response.json();

            setPackages(data.packages.data);
            setOriginalPackages(data.packages.data);
            setTotalPages(data.packages.last_page);
            setTotal(data.packages.total);
            setIsInitialLoad(false);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load packages',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setPackages(originalPackages);
            return;
        }

        try {
            setLoading(true);
            setIsInitialLoad(false);
            const response = await fetch(`/packages/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&per_page=${perPage}`);
            const data: { packages: PaginatedPackages } = await response.json();

            setPackages(data.packages.data);
            setTotalPages(data.packages.last_page);
            setTotal(data.packages.total);
        } catch (error) {
            console.error('Failed to search packages:', error);
            toast({
                title: 'Error',
                description: 'Failed to search packages',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (packageId: number) => {
        if (!confirm('Are you sure you want to delete this package?')) {
            return;
        }

        try {
            const response = await fetch(`/packages/${packageId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to delete package');

            toast({
                title: 'Success!',
                description: 'Package deleted successfully',
                variant: 'success',
            });

            // Refresh the list
            fetchPackages();
        } catch (error) {
            console.error('Failed to delete package:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete package',
                variant: 'destructive',
            });
        }
    };

    const formatPrice = (price: string) => {
        return `₹${parseFloat(price).toLocaleString()}`;
    };

    const getMealTimesText = (times: string) => {
        switch (times) {
            case 'one':
                return '1 Time';
            case 'two':
                return '2 Times';
            case 'three':
                return '3 Times';
            default:
                return times;
        }
    };

    // Skeleton loading component
    const PackageSkeleton = () => (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </Card>
    );

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6">
            <Head title="Packages" />

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Travel Packages</h1>
                    <p className="text-muted-foreground">Manage your travel packages and experiences</p>
                </div>
                <Link href="/packages/create">
                    <Button size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Package
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search packages by name, state, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    // Show skeleton loaders during loading (initial or search)
                    Array.from({ length: 3 }).map((_, index) => <PackageSkeleton key={index} />)
                ) : packages.length > 0 ? (
                    packages.map((pkg) => (
                        <Card key={pkg.id} className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">{pkg.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{pkg.state}</span>
                                            <span>•</span>
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {pkg.min_days}-{pkg.max_days} days
                                            </span>
                                            <span>•</span>
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {pkg.min_persons}-{pkg.max_persons} persons
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm">
                                            {formatPrice(pkg.base_price)}
                                        </Badge>
                                        <Link href={`/packages/${pkg.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-1 h-4 w-4" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(pkg.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {pkg.description && <p className="text-muted-foreground">{pkg.description}</p>}

                                {pkg.tags && pkg.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {pkg.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Car className="h-4 w-4" />
                                        <span>{pkg.vehicles?.length || 0} vehicles</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{pkg.pickup_locations?.length || 0} pickup locations</span>
                                    </div>
                                    {pkg.hotel_included && (
                                        <div className="flex items-center gap-1">
                                            <Hotel className="h-4 w-4" />
                                            <span>Hotel included</span>
                                        </div>
                                    )}
                                    {pkg.meal_included && (
                                        <div className="flex items-center gap-1">
                                            <Utensils className="h-4 w-4" />
                                            <span>Meal included ({getMealTimesText(pkg.meal_times)})</span>
                                        </div>
                                    )}
                                </div>

                                {pkg.photos && pkg.photos.length > 0 && (
                                    <div className="flex gap-2">
                                        {pkg.photos.slice(0, 3).map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`Package photo ${index + 1}`}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        ))}
                                        {pkg.photos.length > 3 && (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                                +{pkg.photos.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="p-12 text-center">
                        <div className="space-y-4">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <MapPin className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">No packages found</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first package.'}
                                </p>
                            </div>
                            {!searchQuery && (
                                <Link href="/packages/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Package
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} packages
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <Toaster />
        </div>
    );
}

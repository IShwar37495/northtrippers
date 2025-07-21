import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Clock, Heart, Mountain, Search, Star } from 'lucide-react';
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
    vehicles: any[];
    pickup_locations: any[];
}

export default function BrowsePackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const packagesPerPage = 9;

    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
    }, []);

    // Filter packages when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPackages(packages);
            setSearchLoading(false);
        } else {
            setSearchLoading(true);
            // Simulate search delay for better UX
            const timeoutId = setTimeout(() => {
                const filtered = packages.filter(
                    (pkg) =>
                        pkg.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        pkg.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()),
                );
                setFilteredPackages(filtered);
                setSearchLoading(false);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
        setCurrentPage(1);
    }, [searchQuery, packages]);

    // Calculate total pages
    useEffect(() => {
        setTotalPages(Math.ceil(filteredPackages.length / packagesPerPage));
    }, [filteredPackages]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await fetch('/packages/list');
            const data = await response.json();
            setPackages(data.packages || []);
            setFilteredPackages(data.packages || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get current page packages
    const getCurrentPagePackages = () => {
        const startIndex = (currentPage - 1) * packagesPerPage;
        const endIndex = startIndex + packagesPerPage;
        return filteredPackages.slice(startIndex, endIndex);
    };

    // Skeleton loading component
    const PackageSkeleton = () => (
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
            <Head title="All Packages - North Trippers" />

            {/* Header */}
            <div className="bg-gradient-to-r from-[#238636] to-[#1a6b2a] py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="text-center text-white">
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">All Adventure Packages</h1>
                        <p className="mx-auto max-w-2xl text-xl text-gray-100">Discover our complete collection of adventure packages across India</p>
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
                                placeholder="Search packages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{filteredPackages.length} packages found</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="mx-auto max-w-7xl px-4 py-12">
                {loading || searchLoading ? (
                    // Skeleton loading
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <PackageSkeleton key={index} />
                        ))}
                    </div>
                ) : getCurrentPagePackages().length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {getCurrentPagePackages().map((pkg) => (
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
                        <Mountain className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No packages found</h3>
                        <p className="text-gray-500">{searchQuery ? 'Try adjusting your search terms' : 'No packages available at the moment'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

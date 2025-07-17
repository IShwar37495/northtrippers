import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Car, Calendar, User, Loader2, Trash2, Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface Vehicle {
  id: number;
  name: string;
  model: string;
  year: number;
  image_url?: string;
  owner?: string;
}

interface PaginatedVehicles {
  data: Vehicle[];
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

export default function Vehicles({ vehicles: propVehicles }: { vehicles?: PaginatedVehicles }) {
  const page = usePage<{ vehicles?: PaginatedVehicles }>();
  const vehiclesData = propVehicles || page.props.vehicles;
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData?.data || []);
  const [paginationInfo, setPaginationInfo] = useState(vehiclesData || null);
  const [form, setForm] = useState({
    name: '',
    model: '',
    year: '',
    owner: '',
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Function to handle navigation back to previous page
  const handleGoBack = () => {
    window.history.back();
  };

  const confirmDeleteVehicle = (vehicleId: number) => {
    setDeleteVehicleId(vehicleId);
  };

  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/vehicles/${deleteVehicleId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) throw new Error('Failed to delete vehicle');

      // Remove from UI immediately after successful deletion
      setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== deleteVehicleId));

      toast({
        title: "Success!",
        description: "Vehicle deleted successfully!",
        variant: "success",
        duration: 3000,
      });

      // Close dialog and reset state
      setDeleteVehicleId(null);

      // Update pagination info if needed
      if (paginationInfo) {
        const newTotal = paginationInfo.total - 1;
        const newLastPage = Math.ceil(newTotal / paginationInfo.per_page);

        setPaginationInfo(prev => prev ? {
          ...prev,
          total: newTotal,
          last_page: newLastPage,
          to: Math.min(prev.to, newTotal),
        } : null);

        // If current page becomes empty and not the first page, go to previous page
        const remainingVehicles = vehicles.filter(v => v.id !== deleteVehicleId);
        if (remainingVehicles.length === 0 && paginationInfo.current_page > 1) {
          setTimeout(() => {
            handlePageChange(paginationInfo.current_page - 1);
          }, 500);
        }
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
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
      const response = await fetch(`/vehicles/paginate?page=${page}&per_page=${paginationInfo?.per_page || 2}${searchParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch vehicles');

      const data = await response.json();
      setVehicles(data.vehicles.data);
      setPaginationInfo(data.vehicles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);

    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(`/vehicles/paginate?page=1&per_page=${paginationInfo?.per_page || 2}${searchParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) throw new Error('Failed to search vehicles');

      const data = await response.json();
      setVehicles(data.vehicles.data);
      setPaginationInfo(data.vehicles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search vehicles",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (page.props.vehicles) {
      setVehicles(page.props.vehicles.data || []);
      setPaginationInfo(page.props.vehicles);
      setIsLoading(false);
    }
  }, [page.props.vehicles]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms delay

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('model', form.model);
    formData.append('year', form.year);
    formData.append('owner', form.owner);
    if (form.image) formData.append('image', form.image);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
      const res = await fetch('/vehicles', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (!res.ok) throw new Error('Failed to add vehicle');

      toast({
        title: "Success!",
        description: "Vehicle added successfully!",
        variant: "success",
        duration: 5000,
      });

      setForm({ name: '', model: '', year: '', owner: '', image: null });
      setIsDialogOpen(false);

      // Refresh current page data
      router.reload({ only: ['vehicles'] });

    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const VehicleSkeleton = () => (
    <Card className="overflow-hidden h-full">
      <div className="aspect-[4/3] relative bg-muted">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-4 space-y-3 flex-1">
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={handleGoBack} 
        className="flex items-center gap-2 mb-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your vehicle fleet</p>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery('');
                }}
              >
                ×
              </Button>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Vehicle</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-0 sm:max-w-md max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter vehicle name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Enter model"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="Enter year"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner (Optional)</Label>
                <Input
                  id="owner"
                  name="owner"
                  value={form.owner}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Vehicle Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-2">
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-h-[400px]">
        {isLoading ? (
          Array.from({ length: paginationInfo?.per_page || 2 }).map((_, i) => <VehicleSkeleton key={i} />)
        ) : vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="group overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className="aspect-[4/3] relative bg-muted">
                {vehicle.image_url ? (
                  <img
                    src={vehicle.image_url}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => confirmDeleteVehicle(vehicle.id)}
                  disabled={isDeleting && deleteVehicleId === vehicle.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight">{vehicle.name}</h3>
                  <p className="text-muted-foreground">{vehicle.model}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {vehicle.year}
                  </div>
                  {vehicle.owner && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {vehicle.owner}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first vehicle</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        )}
      </div>

      {/* Loading indicator for pagination */}
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading vehicles...</span>
        </div>
      )}

      {/* Simple Pagination */}
      {paginationInfo && paginationInfo.last_page > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
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
        open={deleteVehicleId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteVehicleId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteVehicleId(null)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteVehicle}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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



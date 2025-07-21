<?php

namespace App\Http\Controllers\Package;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Cloudinary as CloudinarySDK;

class PackageController extends Controller
{
    public function create()
    {
        return Inertia::render('packages/create');
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'state' => 'required|string|max:255',
            'tags' => 'nullable|json',
            'min_days' => 'required|integer|min:1',
            'max_days' => 'required|integer|min:1|gte:min_days',
            'min_persons' => 'required|integer|min:1',
            'max_persons' => 'required|integer|min:1',
            'min_age' => 'required|integer|min:0',
            'max_age' => 'nullable|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'meal_price' => 'nullable|numeric|min:0',
            'hotel_price' => 'nullable|numeric|min:0',
            'hotel_included' => 'nullable|boolean',
            'meal_included' => 'nullable|boolean',
            'meal_times' => 'nullable|string',
            'hotel_links' => 'nullable|string',
            'travel_points' => 'required|string',
            'boarding_location' => 'required|string|max:255',
            'selected_vehicles' => 'nullable|json',
            'selected_pickup_locations' => 'nullable|json',
            'photos.*' => 'nullable|image|max:5120', // 5MB max per photo
        ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Package validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors(),
                'message' => 'Please check your input and try again'
            ], 422);
        }

        // Debug: Check if packages table exists
        if (!DB::getSchemaBuilder()->hasTable('packages')) {
            Log::error('Packages table does not exist');
            return response()->json([
                'error' => 'Packages table does not exist. Please run migrations.',
                'details' => 'Database table missing'
            ], 500);
        }

        Log::info('Package creation started', [
            'data' => $request->all(),
            'files' => $request->hasFile('photos') ? 'Photos present' : 'No photos',
            'validation_passed' => true
        ]);

        try {
            DB::beginTransaction();

            // Upload photos to Cloudinary
            $photoUrls = [];
            if ($request->hasFile('photos')) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ]
                ]);

                foreach ($request->file('photos') as $photo) {
                    $result = $cloudinary->uploadApi()->upload($photo->getRealPath(), [
                        'folder' => 'packages',
                        'transformation' => [
                            'width' => 800,
                            'height' => 600,
                            'crop' => 'fill',
                            'gravity' => 'center',
                            'quality' => 'auto',
                            'format' => 'auto',
                        ]
                    ]);

                    if (isset($result['secure_url'])) {
                        $photoUrls[] = $result['secure_url'];
                    }
                }
            }

            // Create package
            $package = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'state' => $request->input('state'),
                'tags' => $request->input('tags'),
                'min_days' => $request->input('min_days'),
                'max_days' => $request->input('max_days'),
                'min_persons' => $request->input('min_persons'),
                'max_persons' => $request->input('max_persons'),
                'min_age' => $request->input('min_age'),
                'max_age' => $request->input('max_age') ?: null,
                'base_price' => $request->input('base_price'),
                'meal_price' => $request->input('meal_price') ?: null,
                'hotel_price' => $request->input('hotel_price') ?: null,
                'hotel_included' => $request->has('hotel_included') ? $request->boolean('hotel_included') : false,
                'meal_included' => $request->has('meal_included') ? $request->boolean('meal_included') : false,
                'meal_times' => $request->input('meal_times'),
                'hotel_links' => $request->input('hotel_links'),
                'travel_points' => $request->input('travel_points'),
                'boarding_location' => $request->input('boarding_location'),
                'photos' => json_encode($photoUrls),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            Log::info('Attempting to insert package', ['package' => $package]);

            try {
                $packageId = DB::table('packages')->insertGetId($package);
                Log::info('Package inserted successfully', ['package_id' => $packageId]);
            } catch (\Exception $insertError) {
                Log::error('Database insertion failed', [
                    'error' => $insertError->getMessage(),
                    'package' => $package
                ]);
                throw $insertError;
            }

            // Attach vehicles
            $selectedVehicles = json_decode($request->input('selected_vehicles', '[]'), true);
            if (!empty($selectedVehicles)) {
                $vehicleData = [];
                foreach ($selectedVehicles as $vehicleId) {
                    $vehicleData[] = [
                        'package_id' => $packageId,
                        'vehicle_id' => $vehicleId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('package_vehicle')->insert($vehicleData);
            }

            // Attach pickup locations
            $selectedPickupLocations = json_decode($request->input('selected_pickup_locations', '[]'), true);
            if (!empty($selectedPickupLocations)) {
                $locationData = [];
                foreach ($selectedPickupLocations as $locationId) {
                    $locationData[] = [
                        'package_id' => $packageId,
                        'pickup_location_id' => $locationId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('package_pickup_location')->insert($locationData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Package created successfully',
                'package_id' => $packageId
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Package creation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Failed to create package',
                'details' => $e->getMessage(),
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = DB::table('packages');

        // Apply search filter if provided
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('state', 'like', "%{$searchTerm}%")
                  ->orWhere('tags', 'like', "%{$searchTerm}%");
            });
        }

        $packages = $query->orderBy('created_at', 'desc')->paginate(9);

        // Decode JSON fields for each package
        foreach ($packages->items() as $package) {
            $package->tags = json_decode($package->tags, true) ?? [];
            $package->photos = json_decode($package->photos, true) ?? [];
        }

        return Inertia::render('packages/index', [
            'packages' => $packages,
            'search' => $request->search ?? '',
        ]);
    }

    public function list()
    {
        $packages = DB::table('packages')
            ->orderBy('created_at', 'desc')
            ->get();

        // Decode JSON fields
        foreach ($packages as $package) {
            $package->tags = json_decode($package->tags, true) ?? [];
            $package->photos = json_decode($package->photos, true) ?? [];
        }

        return response()->json([
            'packages' => $packages
        ]);
    }

    public function show($id)
    {
        try {
            $package = DB::table('packages')->where('id', $id)->first();

            if (!$package) {
                abort(404);
            }

            // Get related data
            $package->vehicles = DB::table('vehicles')
                ->join('package_vehicle', 'vehicles.id', '=', 'package_vehicle.vehicle_id')
                ->where('package_vehicle.package_id', $id)
                ->select('vehicles.id', 'vehicles.name', 'vehicles.model', 'vehicles.year', 'vehicles.image_url')
                ->get();

            $package->pickup_locations = DB::table('pickup_locations')
                ->join('package_pickup_location', 'pickup_locations.id', '=', 'package_pickup_location.pickup_location_id')
                ->where('package_pickup_location.package_id', $id)
                ->select('pickup_locations.id', 'pickup_locations.name', 'pickup_locations.address', 'pickup_locations.city', 'pickup_locations.state', 'pickup_locations.zip_code', 'pickup_locations.phone', 'pickup_locations.email', 'pickup_locations.image_url')
                ->get();

            $package->tags = json_decode($package->tags, true) ?? [];
            $package->photos = json_decode($package->photos, true) ?? [];

            return Inertia::render('packages/show', [
                'package' => $package,
            ]);
        } catch (\Exception $e) {
            Log::error('Package show failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load package details');
        }
    }

    public function edit($id)
    {
        $package = DB::table('packages')->where('id', $id)->first();

        if (!$package) {
            abort(404);
        }

        // Get related data
        $package->vehicles = DB::table('vehicles')
            ->join('package_vehicle', 'vehicles.id', '=', 'package_vehicle.vehicle_id')
            ->where('package_vehicle.package_id', $id)
            ->select('vehicles.id', 'vehicles.name', 'vehicles.model', 'vehicles.year', 'vehicles.image_url')
            ->get();

        $package->pickup_locations = DB::table('pickup_locations')
            ->join('package_pickup_location', 'pickup_locations.id', '=', 'package_pickup_location.pickup_location_id')
            ->where('package_pickup_location.package_id', $id)
            ->select('pickup_locations.id', 'pickup_locations.name', 'pickup_locations.city', 'pickup_locations.state', 'pickup_locations.image_url')
            ->get();

        $package->tags = json_decode($package->tags, true) ?? [];
        $package->photos = json_decode($package->photos, true) ?? [];

        // Get all vehicles and pickup locations for selection
        $allVehicles = DB::table('vehicles')->get();
        $allPickupLocations = DB::table('pickup_locations')->get();

        return Inertia::render('packages/edit', [
            'package' => $package,
            'allVehicles' => $allVehicles,
            'allPickupLocations' => $allPickupLocations,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        Log::info('Package update started', [
            'package_id' => $id,
            'request_data' => $request->all(),
            'files' => $request->hasFile('photos') ? 'Photos present' : 'No photos'
        ]);

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'state' => 'required|string|max:255',
                'tags' => 'nullable|json',
                'min_days' => 'required|integer|min:1',
                'max_days' => 'required|integer|min:1',
                'min_persons' => 'required|integer|min:1',
                'max_persons' => 'required|integer|min:1',
                'min_age' => 'required|integer|min:0',
                'max_age' => 'nullable|integer|min:0',
                'base_price' => 'required|numeric|min:0',
                'meal_price' => 'nullable|numeric|min:0',
                'hotel_price' => 'nullable|numeric|min:0',
                'hotel_included' => 'nullable|boolean',
                'meal_included' => 'nullable|boolean',
                'meal_times' => 'nullable|string',
                'hotel_links' => 'nullable|string',
                'travel_points' => 'required|string',
                'boarding_location' => 'required|string|max:255',
                'selected_vehicles' => 'nullable|json',
                'selected_pickup_locations' => 'nullable|json',
                'photos.*' => 'nullable|image|max:5120',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors(),
                'message' => 'Please check your input and try again'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Handle photo uploads if new photos are provided
            $photoUrls = [];
            if ($request->hasFile('photos')) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ]
                ]);

                foreach ($request->file('photos') as $photo) {
                    $result = $cloudinary->uploadApi()->upload($photo->getRealPath(), [
                        'folder' => 'packages',
                        'transformation' => [
                            'width' => 800,
                            'height' => 600,
                            'crop' => 'fill',
                            'gravity' => 'center',
                            'quality' => 'auto',
                            'format' => 'auto',
                        ]
                    ]);

                    if (isset($result['secure_url'])) {
                        $photoUrls[] = $result['secure_url'];
                    }
                }
            }

            // Get existing photos if no new photos uploaded
            $existingPackage = DB::table('packages')->where('id', $id)->first();
            $existingPhotos = json_decode($existingPackage->photos, true) ?? [];

            // Update package
            $packageData = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'state' => $request->input('state'),
                'tags' => $request->input('tags'),
                'min_days' => $request->input('min_days'),
                'max_days' => $request->input('max_days'),
                'min_persons' => $request->input('min_persons'),
                'max_persons' => $request->input('max_persons'),
                'min_age' => $request->input('min_age'),
                'max_age' => $request->input('max_age') ?: null,
                'base_price' => $request->input('base_price'),
                'meal_price' => $request->input('meal_price') ?: null,
                'hotel_price' => $request->input('hotel_price') ?: null,
                'hotel_included' => $request->has('hotel_included') ? $request->boolean('hotel_included') : false,
                'meal_included' => $request->has('meal_included') ? $request->boolean('meal_included') : false,
                'meal_times' => $request->input('meal_times'),
                'hotel_links' => $request->input('hotel_links'),
                'travel_points' => $request->input('travel_points'),
                'boarding_location' => $request->input('boarding_location'),
                'photos' => json_encode($request->hasFile('photos') ? $photoUrls : $existingPhotos),
                'updated_at' => now(),
            ];

            DB::table('packages')->where('id', $id)->update($packageData);

            // Update vehicle relationships
            DB::table('package_vehicle')->where('package_id', $id)->delete();
            $selectedVehicles = json_decode($request->input('selected_vehicles', '[]'), true);
            if (!empty($selectedVehicles)) {
                $vehicleData = [];
                foreach ($selectedVehicles as $vehicleId) {
                    $vehicleData[] = [
                        'package_id' => $id,
                        'vehicle_id' => $vehicleId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('package_vehicle')->insert($vehicleData);
            }

            // Update pickup location relationships
            DB::table('package_pickup_location')->where('package_id', $id)->delete();
            $selectedPickupLocations = json_decode($request->input('selected_pickup_locations', '[]'), true);
            if (!empty($selectedPickupLocations)) {
                $locationData = [];
                foreach ($selectedPickupLocations as $locationId) {
                    $locationData[] = [
                        'package_id' => $id,
                        'pickup_location_id' => $locationId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('package_pickup_location')->insert($locationData);
            }

            DB::commit();

            Log::info('Package updated successfully', ['package_id' => $id]);

            return response()->json([
                'message' => 'Package updated successfully',
                'package_id' => $id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Package update failed: ' . $e->getMessage(), [
                'exception' => $e,
                'package_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Failed to update package',
                'details' => $e->getMessage(),
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function paginate(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);

        $packages = DB::table('packages')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Get related data for each package
        $packagesWithRelations = $packages->getCollection()->map(function ($package) {
            $package->vehicles = DB::table('vehicles')
                ->join('package_vehicle', 'vehicles.id', '=', 'package_vehicle.vehicle_id')
                ->where('package_vehicle.package_id', $package->id)
                ->select('vehicles.id', 'vehicles.name', 'vehicles.model', 'vehicles.year', 'vehicles.image_url')
                ->get();

            $package->pickup_locations = DB::table('pickup_locations')
                ->join('package_pickup_location', 'pickup_locations.id', '=', 'package_pickup_location.pickup_location_id')
                ->where('package_pickup_location.package_id', $package->id)
                ->select('pickup_locations.id', 'pickup_locations.name', 'pickup_locations.city', 'pickup_locations.state', 'pickup_locations.image_url')
                ->get();

            $package->tags = json_decode($package->tags, true) ?? [];
            $package->photos = json_decode($package->photos, true) ?? [];

            return $package;
        });

        $packages->setCollection($packagesWithRelations);

        return response()->json([
            'packages' => $packages
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('query', '');
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);

        $packages = DB::table('packages')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('state', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('tags', 'like', "%{$query}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Get related data for each package
        $packagesWithRelations = $packages->getCollection()->map(function ($package) {
            $package->vehicles = DB::table('vehicles')
                ->join('package_vehicle', 'vehicles.id', '=', 'package_vehicle.vehicle_id')
                ->where('package_vehicle.package_id', $package->id)
                ->select('vehicles.id', 'vehicles.name', 'vehicles.model', 'vehicles.year', 'vehicles.image_url')
                ->get();

            $package->pickup_locations = DB::table('pickup_locations')
                ->join('package_pickup_location', 'pickup_locations.id', '=', 'package_pickup_location.pickup_location_id')
                ->where('package_pickup_location.package_id', $package->id)
                ->select('pickup_locations.id', 'pickup_locations.name', 'pickup_locations.city', 'pickup_locations.state', 'pickup_locations.image_url')
                ->get();

            $package->tags = json_decode($package->tags, true) ?? [];
            $package->photos = json_decode($package->photos, true) ?? [];

            return $package;
        });

        $packages->setCollection($packagesWithRelations);

        return response()->json([
            'packages' => $packages
        ]);
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Delete related records first
            DB::table('package_vehicle')->where('package_id', $id)->delete();
            DB::table('package_pickup_location')->where('package_id', $id)->delete();

            // Get package photos for deletion from Cloudinary
            $package = DB::table('packages')->where('id', $id)->first();
            if ($package && $package->photos) {
                $photos = json_decode($package->photos, true);
                if (!empty($photos)) {
                    $cloudinary = new CloudinarySDK([
                        'cloud' => [
                            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                            'api_key' => env('CLOUDINARY_API_KEY'),
                            'api_secret' => env('CLOUDINARY_API_SECRET'),
                        ]
                    ]);

                    foreach ($photos as $photoUrl) {
                        // Extract public ID from URL
                        $publicId = basename($photoUrl, '.' . pathinfo($photoUrl, PATHINFO_EXTENSION));
                        $publicId = 'packages/' . $publicId;

                        try {
                            $cloudinary->uploadApi()->destroy($publicId);
                        } catch (\Exception $e) {
                            Log::warning('Failed to delete photo from Cloudinary: ' . $e->getMessage());
                        }
                    }
                }
            }

            // Delete the package
            DB::table('packages')->where('id', $id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Package deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Package deletion failed: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to delete package',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}

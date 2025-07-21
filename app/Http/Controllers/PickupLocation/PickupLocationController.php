<?php

namespace App\Http\Controllers\PickupLocation;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Configuration\Configuration;

class PickupLocationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 2); // Default 2 locations per page
        $locations = DB::table('pickup_locations')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('pickup-locations', [
            'pickupLocations' => $locations,
        ]);
    }

    public function apiIndex(): JsonResponse
    {
        $pickup_locations = DB::table('pickup_locations')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'pickup_locations' => $pickup_locations,
        ]);
    }

    public function paginate(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 2);
        $search = $request->get('search');

        $query = DB::table('pickup_locations');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('address', 'LIKE', "%{$search}%")
                    ->orWhere('city', 'LIKE', "%{$search}%")
                    ->orWhere('state', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $locations = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'pickupLocations' => $locations,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('query', '');

        if (strlen($query) < 2) {
            return response()->json([
                'locations' => []
            ]);
        }

        $locations = DB::table('pickup_locations')
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                    ->orWhere('address', 'LIKE', "%{$query}%")
                    ->orWhere('city', 'LIKE', "%{$query}%")
                    ->orWhere('state', 'LIKE', "%{$query}%");
            })
            ->select('id', 'name', 'address', 'city', 'state')
            ->limit(10)
            ->get();

        return response()->json([
            'locations' => $locations
        ]);
    }

    public function destroy($id): JsonResponse
    {
        try {
            // Get location data before deletion for Cloudinary cleanup
            $location = DB::table('pickup_locations')->where('id', $id)->first();

            if (!$location) {
                return response()->json(['error' => 'Pickup location not found'], 404);
            }

            // Delete from database
            DB::table('pickup_locations')->where('id', $id)->delete();

            // Optional: Delete from Cloudinary (if you want to clean up cloud storage)
            if ($location->image_url) {
                try {
                    $cloudinary = new CloudinarySDK([
                        'cloud' => [
                            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                            'api_key' => env('CLOUDINARY_API_KEY'),
                            'api_secret' => env('CLOUDINARY_API_SECRET'),
                        ]
                    ]);

                    // Extract public_id from URL for deletion
                    $urlParts = explode('/', $location->image_url);
                    $filename = end($urlParts);
                    $publicId = 'pickup-locations/' . pathinfo($filename, PATHINFO_FILENAME);

                    $cloudinary->uploadApi()->destroy($publicId);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete image from Cloudinary: ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Pickup location deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Pickup location deletion failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete pickup location'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip_code' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'image' => 'required|image',
        ]);

        // Check file upload
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No image uploaded'], 400);
        }
        $image = $request->file('image');
        if (!$image->isValid()) {
            return response()->json(['error' => 'Invalid image upload'], 400);
        }

        // Upload image to Cloudinary with error handling
        $imageUrl = null;
        try {
            Log::info('Starting direct Cloudinary upload for pickup location...');

            // Initialize Cloudinary directly
            $cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key' => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ]
            ]);

            $result = $cloudinary->uploadApi()->upload($image->getRealPath(), [
                'folder' => 'pickup-locations',
                'transformation' => [
                    'width' => 800,
                    'height' => 600,
                    'crop' => 'fill',
                    'gravity' => 'center',
                    'quality' => 'auto',
                    'format' => 'auto',
                    'aspect_ratio' => '4:3'
                ]
            ]);

            Log::info('Direct Cloudinary upload result:', ['result' => $result]);

            if (isset($result['secure_url'])) {
                $imageUrl = $result['secure_url'];
            } else {
                throw new \Exception("No secure_url in Cloudinary response");
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Cloudinary upload failed',
                'details' => $e->getMessage(),
            ], 500);
        }

        $location = [
            'name' => $request->input('name'),
            'address' => $request->input('address'),
            'city' => $request->input('city'),
            'state' => $request->input('state'),
            'zip_code' => $request->input('zip_code'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'image_url' => $imageUrl,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        DB::table('pickup_locations')->insert($location);

        return response()->json(['message' => 'Pickup location added successfully', 'location' => $location], 201);
    }
}

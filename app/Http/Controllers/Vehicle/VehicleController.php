<?php

namespace App\Http\Controllers\Vehicle;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Configuration\Configuration;

class VehicleController extends Controller
{


    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 2); // Default 2 vehicles per page
        $vehicles = DB::table('vehicles')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('vehicles', [
            'vehicles' => $vehicles,
        ]);
    }

    public function paginate(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 2);
        $search = $request->get('search');

        $query = DB::table('vehicles');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('model', 'LIKE', "%{$search}%")
                    ->orWhere('owner', 'LIKE', "%{$search}%")
                    ->orWhere('year', 'LIKE', "%{$search}%");
            });
        }

        $vehicles = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'vehicles' => $vehicles,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        try {
            // Get vehicle data before deletion for Cloudinary cleanup
            $vehicle = DB::table('vehicles')->where('id', $id)->first();

            if (!$vehicle) {
                return response()->json(['error' => 'Vehicle not found'], 404);
            }

            // Delete from database
            DB::table('vehicles')->where('id', $id)->delete();

            // Optional: Delete from Cloudinary (if you want to clean up cloud storage)
            if ($vehicle->image_url) {
                try {
                    $cloudinary = new CloudinarySDK([
                        'cloud' => [
                            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                            'api_key' => env('CLOUDINARY_API_KEY'),
                            'api_secret' => env('CLOUDINARY_API_SECRET'),
                        ]
                    ]);

                    // Extract public_id from URL for deletion
                    $urlParts = explode('/', $vehicle->image_url);
                    $filename = end($urlParts);
                    $publicId = 'vehicles/' . pathinfo($filename, PATHINFO_FILENAME);

                    $cloudinary->uploadApi()->destroy($publicId);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete image from Cloudinary: ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Vehicle deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Vehicle deletion failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete vehicle'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {


        $request->validate([
            'name' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'image' => 'required|image',
            'owner' => 'nullable|string',
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
            Log::info('Starting direct Cloudinary upload...');

            // Initialize Cloudinary directly
            $cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key' => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ]
            ]);

            $result = $cloudinary->uploadApi()->upload($image->getRealPath(), [
                'folder' => 'vehicles',
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


        $vehicle = [
            'name' => $request->input('name'),
            'model' => $request->input('model'),
            'year' => $request->input('year'),
            'image_url' => $imageUrl,
            'owner' => $request->input('owner'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
        DB::table('vehicles')->insert($vehicle);

        return response()->json(['message' => 'Vehicle added successfully', 'vehicle' => $vehicle], 201);
    }
}

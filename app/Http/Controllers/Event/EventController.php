<?php

namespace App\Http\Controllers\Event;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Cloudinary as CloudinarySDK;

class EventController extends Controller
{
    public function create()
    {
        return Inertia::render('events/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'state' => 'required|string|max:255',
                'days' => 'required|integer|min:1',
                'event_date' => 'required|date',
                'event_time' => 'required|date_format:H:i',
                'itinerary' => 'nullable|json',
                'meal_included' => 'nullable|in:true,false,0,1',
                'meal_times' => 'nullable|string',
                'meal_price' => 'nullable|numeric|min:0',
                'hotel_included' => 'nullable|in:true,false,0,1',
                'hotel_price' => 'nullable|numeric|min:0',
                'min_age' => 'required|integer|min:0',
                'max_age' => 'nullable|integer|min:0',
                'available_slots' => 'required|integer|min:1',
                'vehicle_id' => 'required|integer|exists:vehicles,id',
                'activities' => 'nullable|json',
                'boarding_point' => 'required|string|max:255',
                'pickup_location_id' => 'required|integer|exists:pickup_locations,id',
                'base_price' => 'required|numeric|min:0',
                'photos.*' => 'nullable|image|max:5120', // 5MB max per photo
            ]);

            Log::info('Event creation started', [
                'data' => $validated,
                'files' => $request->hasFile('photos') ? 'Photos present' : 'No photos',
                'validation_passed' => true
            ]);

            // Handle photo uploads
            $photoUrls = [];
            if ($request->hasFile('photos')) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                foreach ($request->file('photos') as $photo) {
                    $result = $cloudinary->uploadApi()->upload($photo->getRealPath(), [
                        'folder' => 'events',
                        'public_id' => uniqid(),
                    ]);
                    $photoUrls[] = $result['secure_url'];
                }
            }

            // Prepare event data
            $eventData = [
                'name' => $validated['name'],
                'state' => $validated['state'],
                'days' => $validated['days'],
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'],
                'itinerary' => $validated['itinerary'] ?? '[]',
                'meal_included' => filter_var($validated['meal_included'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'meal_times' => $validated['meal_times'] ?? null,
                'meal_price' => $validated['meal_price'] ?? null,
                'hotel_included' => filter_var($validated['hotel_included'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'hotel_price' => $validated['hotel_price'] ?? null,
                'min_age' => $validated['min_age'],
                'max_age' => $validated['max_age'] ?? null,
                'photos' => json_encode($photoUrls),
                'available_slots' => $validated['available_slots'],
                'vehicle_id' => $validated['vehicle_id'],
                'activities' => $validated['activities'] ?? '[]',
                'boarding_point' => $validated['boarding_point'],
                'pickup_location_id' => $validated['pickup_location_id'],
                'base_price' => $validated['base_price'],
                'created_at' => now(),
                'updated_at' => now(),
            ];

            Log::info('Attempting to insert event', ['event' => $eventData]);

            $eventId = DB::table('events')->insertGetId($eventData);

            Log::info('Event inserted successfully', ['event_id' => $eventId]);

            return redirect()->route('events.index')->with('success', 'Event created successfully');

        } catch (\Exception $e) {
            Log::error('Event creation failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create event: ' . $e->getMessage()]);
        }
    }

    public function index()
    {
        try {
            $events = DB::table('events')
                ->leftJoin('vehicles', 'events.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('pickup_locations', 'events.pickup_location_id', '=', 'pickup_locations.id')
                ->select(
                    'events.*',
                    'vehicles.name as vehicle_name',
                    'vehicles.model as vehicle_model',
                    'pickup_locations.name as pickup_location_name',
                    'pickup_locations.city as pickup_location_city'
                )
                ->orderBy('events.created_at', 'desc')
                ->get();

            // Decode JSON fields
            foreach ($events as $event) {
                $event->itinerary = json_decode($event->itinerary, true) ?? [];
                $event->activities = json_decode($event->activities, true) ?? [];
                $event->photos = json_decode($event->photos, true) ?? [];
            }

            return Inertia::render('events/index', [
                'events' => $events,
            ]);
        } catch (\Exception $e) {
            Log::error('Events index failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load events');
        }
    }

    public function list(): JsonResponse
    {
        try {
            $events = DB::table('events')
                ->leftJoin('vehicles', 'events.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('pickup_locations', 'events.pickup_location_id', '=', 'pickup_locations.id')
                ->select(
                    'events.*',
                    'vehicles.name as vehicle_name',
                    'vehicles.model as vehicle_model',
                    'pickup_locations.name as pickup_location_name',
                    'pickup_locations.city as pickup_location_city'
                )
                ->orderBy('events.created_at', 'desc')
                ->get();

            // Decode JSON fields
            foreach ($events as $event) {
                $event->itinerary = json_decode($event->itinerary, true) ?? [];
                $event->activities = json_decode($event->activities, true) ?? [];
                $event->photos = json_decode($event->photos, true) ?? [];
            }

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            Log::error('Events list failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events'
            ], 500);
        }
    }

    public function paginate(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            $query = DB::table('events')
                ->leftJoin('vehicles', 'events.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('pickup_locations', 'events.pickup_location_id', '=', 'pickup_locations.id')
                ->select(
                    'events.*',
                    'vehicles.name as vehicle_name',
                    'vehicles.model as vehicle_model',
                    'pickup_locations.name as pickup_location_name',
                    'pickup_locations.city as pickup_location_city'
                );

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('events.name', 'like', "%{$search}%")
                      ->orWhere('events.state', 'like', "%{$search}%")
                      ->orWhere('vehicles.name', 'like', "%{$search}%");
                });
            }

            $total = $query->count();
            $events = $query->orderBy('events.created_at', 'desc')
                           ->offset(($page - 1) * $perPage)
                           ->limit($perPage)
                           ->get();

            // Decode JSON fields
            foreach ($events as $event) {
                $event->itinerary = json_decode($event->itinerary, true) ?? [];
                $event->activities = json_decode($event->activities, true) ?? [];
                $event->photos = json_decode($event->photos, true) ?? [];
            }

            return response()->json([
                'success' => true,
                'events' => $events,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Events paginate failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events'
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $search = $request->get('search', '');
            $state = $request->get('state', '');

            $query = DB::table('events')
                ->leftJoin('vehicles', 'events.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('pickup_locations', 'events.pickup_location_id', '=', 'pickup_locations.id')
                ->select(
                    'events.*',
                    'vehicles.name as vehicle_name',
                    'vehicles.model as vehicle_model',
                    'pickup_locations.name as pickup_location_name',
                    'pickup_locations.city as pickup_location_city'
                );

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('events.name', 'like', "%{$search}%")
                      ->orWhere('events.state', 'like', "%{$search}%")
                      ->orWhere('vehicles.name', 'like', "%{$search}%");
                });
            }

            if ($state) {
                $query->where('events.state', $state);
            }

            $events = $query->orderBy('events.created_at', 'desc')->get();

            // Decode JSON fields
            foreach ($events as $event) {
                $event->itinerary = json_decode($event->itinerary, true) ?? [];
                $event->activities = json_decode($event->activities, true) ?? [];
                $event->photos = json_decode($event->photos, true) ?? [];
            }

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            Log::error('Events search failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search events'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $event = DB::table('events')
                ->leftJoin('vehicles', 'events.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('pickup_locations', 'events.pickup_location_id', '=', 'pickup_locations.id')
                ->where('events.id', $id)
                ->select(
                    'events.*',
                    'vehicles.name as vehicle_name',
                    'vehicles.model as vehicle_model',
                    'vehicles.year as vehicle_year',
                    'vehicles.image_url as vehicle_image_url',
                    'pickup_locations.name as pickup_location_name',
                    'pickup_locations.address as pickup_location_address',
                    'pickup_locations.city as pickup_location_city',
                    'pickup_locations.state as pickup_location_state',
                    'pickup_locations.zip_code as pickup_location_zip_code',
                    'pickup_locations.phone as pickup_location_phone',
                    'pickup_locations.email as pickup_location_email',
                    'pickup_locations.image_url as pickup_location_image_url'
                )
                ->first();

            if (!$event) {
                abort(404);
            }

            $event->itinerary = json_decode($event->itinerary, true) ?? [];
            $event->activities = json_decode($event->activities, true) ?? [];
            $event->photos = json_decode($event->photos, true) ?? [];

            return Inertia::render('events/show', [
                'event' => $event,
            ]);
        } catch (\Exception $e) {
            Log::error('Event show failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load event details');
        }
    }

    public function edit($id)
    {
        try {
            $event = DB::table('events')->where('id', $id)->first();

            if (!$event) {
                abort(404);
            }

            $event->itinerary = json_decode($event->itinerary, true) ?? [];
            $event->activities = json_decode($event->activities, true) ?? [];
            $event->photos = json_decode($event->photos, true) ?? [];

            // Get all vehicles and pickup locations for selection
            $vehicles = DB::table('vehicles')->get();
            $pickupLocations = DB::table('pickup_locations')->get();

            return Inertia::render('events/edit', [
                'event' => $event,
                'allVehicles' => $vehicles,
                'allPickupLocations' => $pickupLocations,
            ]);
        } catch (\Exception $e) {
            Log::error('Event edit failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load event for editing');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'state' => 'required|string|max:255',
                'days' => 'required|integer|min:1',
                'itinerary' => 'nullable|json',
                'meal_included' => 'nullable|in:true,false,0,1',
                'meal_times' => 'nullable|string',
                'meal_price' => 'nullable|numeric|min:0',
                'hotel_included' => 'nullable|in:true,false,0,1',
                'hotel_price' => 'nullable|numeric|min:0',
                'min_age' => 'required|integer|min:0',
                'max_age' => 'nullable|integer|min:0',
                'available_slots' => 'required|integer|min:1',
                'vehicle_id' => 'required|integer|exists:vehicles,id',
                'activities' => 'nullable|json',
                'boarding_point' => 'required|string|max:255',
                'pickup_location_id' => 'required|integer|exists:pickup_locations,id',
                'base_price' => 'required|numeric|min:0',
                'photos.*' => 'nullable|image|max:5120',
            ]);

            Log::info('Event update started', [
                'event_id' => $id,
                'request_data' => $validated,
                'files' => $request->hasFile('photos') ? 'Photos present' : 'No photos'
            ]);

            // Handle photo uploads if new photos are provided
            $photoUrls = [];
            if ($request->hasFile('photos')) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                foreach ($request->file('photos') as $photo) {
                    $result = $cloudinary->uploadApi()->upload($photo->getRealPath(), [
                        'folder' => 'events',
                        'public_id' => uniqid(),
                    ]);
                    $photoUrls[] = $result['secure_url'];
                }
            } else {
                // Keep existing photos
                $existingEvent = DB::table('events')->where('id', $id)->first();
                $photoUrls = json_decode($existingEvent->photos, true) ?? [];
            }

            // Update event data
            $eventData = [
                'name' => $validated['name'],
                'state' => $validated['state'],
                'days' => $validated['days'],
                'itinerary' => $validated['itinerary'] ?? '[]',
                'meal_included' => filter_var($validated['meal_included'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'meal_times' => $validated['meal_times'] ?? null,
                'meal_price' => $validated['meal_price'] ?? null,
                'hotel_included' => filter_var($validated['hotel_included'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'hotel_price' => $validated['hotel_price'] ?? null,
                'min_age' => $validated['min_age'],
                'max_age' => $validated['max_age'] ?? null,
                'photos' => json_encode($photoUrls),
                'available_slots' => $validated['available_slots'],
                'vehicle_id' => $validated['vehicle_id'],
                'activities' => $validated['activities'] ?? '[]',
                'boarding_point' => $validated['boarding_point'],
                'pickup_location_id' => $validated['pickup_location_id'],
                'base_price' => $validated['base_price'],
                'updated_at' => now(),
            ];

            DB::table('events')->where('id', $id)->update($eventData);

            Log::info('Event updated successfully', ['event_id' => $id]);

            return redirect()->route('events.index')->with('success', 'Event updated successfully');

        } catch (\Exception $e) {
            Log::error('Event update failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update event: ' . $e->getMessage()]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $event = DB::table('events')->where('id', $id)->first();

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found'
                ], 404);
            }

            // Delete photos from Cloudinary if they exist
            $photos = json_decode($event->photos, true) ?? [];
            if (!empty($photos)) {
                $cloudinary = new CloudinarySDK([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key' => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                foreach ($photos as $photoUrl) {
                    try {
                        $publicId = basename($photoUrl, '.jpg');
                        $cloudinary->uploadApi()->destroy($publicId);
                    } catch (\Exception $e) {
                        Log::warning('Failed to delete photo from Cloudinary: ' . $e->getMessage());
                    }
                }
            }

            DB::table('events')->where('id', $id)->delete();

            Log::info('Event deleted successfully', ['event_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Event delete failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event: ' . $e->getMessage()
            ], 500);
        }
    }
}

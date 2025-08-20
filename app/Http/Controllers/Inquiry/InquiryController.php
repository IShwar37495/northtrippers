<?php

namespace App\Http\Controllers\Inquiry;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\InquiryReceived;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination' => 'required|string|max:255',
            'travel_date' => 'nullable|date',
            'travelers' => 'nullable|string|max:50',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            $inquiryId = DB::table('inquiries')->insertGetId([
                'destination' => $validated['destination'],
                'travel_date' => $validated['travel_date'] ?? null,
                'travelers' => $validated['travelers'] ?? null,
                'name' => $validated['name'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Get the created inquiry for email
            $inquiry = DB::table('inquiries')->where('id', $inquiryId)->first();

            // Send email notifications
            Mail::to('ishwarjhokhra2000@gmail.com')->send(new InquiryReceived($inquiry));

            return response()->json([
                'success' => true,
                'message' => 'Inquiry sent successfully! We will contact you soon.',
                'inquiry_id' => $inquiryId
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send inquiry. Please try again.'
            ], 500);
        }
    }

    public function index()
    {
        $inquiries = DB::table('inquiries')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('inquiries/index', [
            'inquiries' => $inquiries
        ]);
    }
}
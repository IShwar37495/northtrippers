import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Add global type declarations for Echo and Laravel
declare global {
    interface Window {
        Echo: any;
        Laravel: any;
    }
}

interface EventBooking {
    id: number;
    event_id: number;
    slot_id: number;
    users: Array<{ first_name: string; last_name: string; email: string; phone: string }>;
    payment_id: string;
    payment_status: string;
    payment_method: string;
    payment_details: any;
    created_at: string;
}

export default function AdminEventBookings() {
    const [bookings, setBookings] = useState<EventBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetch('/api/admin/event-bookings')
            .then((res) => res.json())
            .then((data) => {
                setBookings(data.bookings || []);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Listen for broadcast notifications for the current admin or superadmin user
        if (
            window.Echo &&
            window.Laravel &&
            window.Laravel.user &&
            window.Laravel.user.role &&
            (window.Laravel.user.role.name === 'admin' || window.Laravel.user.role.name === 'superadmin')
        ) {
            const userId = window.Laravel.user.id;
            window.Echo.private(`App.Models.User.${userId}`).notification((notification: any) => {
                if (notification.booking) {
                    toast({
                        title: 'New Event Booking',
                        description: `A new event has been booked (Event ID: ${notification.booking.event_id}).`,
                        variant: 'success',
                    });
                    // Optionally, refetch bookings or prepend the new one
                    setBookings((prev) => [notification.booking, ...prev]);
                }
            });
        }
        // Cleanup
        return () => {
            if (
                window.Echo &&
                window.Laravel &&
                window.Laravel.user &&
                window.Laravel.user.role &&
                (window.Laravel.user.role.name === 'admin' || window.Laravel.user.role.name === 'superadmin')
            ) {
                const userId = window.Laravel.user.id;
                window.Echo.private(`App.Models.User.${userId}`).stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            }
        };
    }, [toast]);

    const handleRefund = async (paymentId: string) => {
        // Implement refund logic here (API call)
        alert('Refund logic for payment ID: ' + paymentId);
    };

    return (
        <div className="p-8">
            <Head title="Admin Event Bookings" />
            <h1 className="mb-6 text-2xl font-bold">Event Bookings</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">ID</th>
                            <th className="border px-4 py-2">Event ID</th>
                            <th className="border px-4 py-2">Slot ID</th>
                            <th className="border px-4 py-2">Users</th>
                            <th className="border px-4 py-2">Payment ID</th>
                            <th className="border px-4 py-2">Status</th>
                            <th className="border px-4 py-2">Method</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="border px-4 py-2">{booking.id}</td>
                                <td className="border px-4 py-2">{booking.event_id}</td>
                                <td className="border px-4 py-2">{booking.slot_id}</td>
                                <td className="border px-4 py-2">
                                    {booking.users.map((u, i) => (
                                        <div key={i}>
                                            {u.first_name} {u.last_name} <br />
                                            {u.email} <br />
                                            {u.phone}
                                        </div>
                                    ))}
                                </td>
                                <td className="border px-4 py-2">{booking.payment_id}</td>
                                <td className="border px-4 py-2">{booking.payment_status}</td>
                                <td className="border px-4 py-2">{booking.payment_method}</td>
                                <td className="border px-4 py-2">
                                    <Button onClick={() => handleRefund(booking.payment_id)} disabled={booking.payment_status === 'refunded'}>
                                        Refund
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

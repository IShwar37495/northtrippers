import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function BookingSuccess() {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, 10000);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Head title="Booking Success" />
            <div className="rounded bg-white p-8 text-center shadow">
                <h1 className="mb-4 text-2xl font-bold text-green-600">Your booking was successful!</h1>
                <p className="mb-6">Thank you for booking. You will be redirected to the home page shortly.</p>
                <Button onClick={() => (window.location.href = '/')}>Go to Home</Button>
            </div>
        </div>
    );
}

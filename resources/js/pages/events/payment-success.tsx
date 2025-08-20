import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';

export default function PaymentSuccess() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Head title="Payment Success" />
            <div className="rounded bg-white p-8 text-center shadow">
                <h1 className="mb-4 text-2xl font-bold text-green-600">Thank you for your payment!</h1>
                <p className="mb-6">Your booking is being processed. You will receive a confirmation email soon.</p>
                <Button onClick={() => (window.location.href = '/')}>Return to Home</Button>
            </div>
        </div>
    );
}

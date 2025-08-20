import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface Event {
    id: number;
    name: string;
    state: string;
    days: number;
    base_price: string;
    available_slots: number;
    photos: string[];
}

interface PayPageProps {
    event: Event;
    slotId: number;
    totalAmount: number;
    persons: Array<{ first_name: string; last_name: string; email: string; phone: string }>;
}

export default function PayPage({ event, slotId, totalAmount, persons }: PayPageProps) {
    // Guard: if any required prop is missing, redirect to events browse
    useEffect(() => {
        if (!event || !slotId || !totalAmount || !persons || persons.length === 0) {
            window.location.href = '/events/browse';
        }
    }, [event, slotId, totalAmount, persons]);

    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'fail'>('idle');
    const [error, setError] = useState('');

    // Razorpay script loader
    function loadRazorpayScript(src: string) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.body.appendChild(script);
        });
    }

    // Razorpay payment handler
    const handleRazorpay = async () => {
        setLoading(true);
        setError('');
        try {
            await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
            // Create order on backend
            const orderRes = await fetch(`/api/events/${event.id}/razorpay-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot_id: slotId, amount: totalAmount, persons }),
            });
            const order = await orderRes.json();
            if (!order.id) throw new Error('Failed to create Razorpay order');
            // Open Razorpay checkout
            const options = {
                key: order.razorpayKey,
                amount: order.amount,
                currency: 'INR',
                name: event.name,
                description: 'Event Booking',
                order_id: order.id,
                handler: async function (response: any) {
                    setPaymentStatus('success');
                    // Do not redirect, just show thank you message
                    // router.visit('/events/payment-success');
                },
                prefill: {
                    name: persons[0]?.first_name + ' ' + persons[0]?.last_name,
                    email: persons[0]?.email,
                    contact: persons[0]?.phone,
                },
                notes: {
                    event_id: event.id.toString(),
                    slot_id: slotId.toString(),
                },
                theme: { color: '#238636' },
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            setError(err.message || 'Payment failed');
            setPaymentStatus('fail');
        } finally {
            setLoading(false);
        }
    };

    // Google Pay (UPI) fallback
    const handleGooglePay = () => {
        alert('Please scan the UPI QR or use Google Pay to pay. (Integrate UPI intent/QR here)');
    };

    const upiId = 'yourupiid@okicici'; // TODO: Replace with your real UPI ID
    const upiLink = `upi://pay?pa=${upiId}&pn=NorthTrippers&am=${totalAmount}&cu=INR&tn=Event+Booking`;

    return (
        <div className="min-h-screen bg-background">
            <Head title={`Pay for Event - ${event.name}`} />
            <BackButton text="Back to Event" className="mb-6" />
            <div className="mx-auto max-w-2xl px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Pay for <span className="text-[#238636]">{event.name}</span>
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge className="bg-[#238636] text-white">{event.state}</Badge>
                            <span className="text-sm text-gray-500">{event.days} days</span>
                            <span className="ml-4 text-sm text-gray-500">{event.available_slots} slots available</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {paymentStatus === 'success' ? (
                            <div className="p-6 text-center font-semibold text-green-600">
                                Thank you for your payment! Your booking is being processed. You will receive a confirmation email soon.
                                <br />
                                <Button className="mt-4" onClick={() => (window.location.href = '/')}>
                                    Return to Home
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex items-center justify-between text-lg font-semibold">
                                    <span>Total Amount:</span>
                                    <span className="text-[#238636]">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="mb-4 text-sm text-muted-foreground">
                                    <b>Razorpay</b> supports Credit/Debit Cards, UPI (including Google Pay), Netbanking, and Wallets.
                                    <br />
                                    Or use Google Pay UPI directly below.
                                </div>
                                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                                    <Button className="w-full bg-[#238636] text-white hover:bg-[#1a6b2a]" onClick={handleRazorpay} disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Pay with Card / UPI / Wallet (Razorpay)
                                    </Button>
                                    <Button
                                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => window.open(upiLink, '_blank')}
                                        disabled={loading}
                                    >
                                        Pay with Google Pay (UPI)
                                    </Button>
                                </div>
                                <div className="mt-6 flex flex-col items-center gap-2">
                                    <span className="text-sm font-medium">Or scan this QR with any UPI app:</span>
                                    <QRCodeCanvas value={upiLink} size={160} bgColor="#fff" fgColor="#238636" />
                                    <span className="text-xs text-muted-foreground">
                                        UPI ID: <b>{upiId}</b>
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    For Google Pay, use UPI ID: <b>yourupiid@okicici</b> (replace with your real UPI ID).
                                    <br />
                                    After payment, contact support if your booking is not confirmed automatically.
                                </div>
                                {error && <div className="mt-4 text-center text-red-600">{error}</div>}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

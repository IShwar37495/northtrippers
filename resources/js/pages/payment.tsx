import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookingInfo {
    packageId: number;
    packageName: string;
    startDate: string;
    persons: number;
    days: number;
    includeMeals: boolean;
    includeHotel: boolean;
    totalPrice: number;
}

export default function Payment() {
    const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
    const [paymentData, setPaymentData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardName: '',
    });

    useEffect(() => {
        const storedBooking = localStorage.getItem('bookingInfo');
        if (storedBooking) {
            setBookingInfo(JSON.parse(storedBooking));
        } else {
            // Redirect back to packages if no booking info
            window.location.href = '/packages/browse';
        }
    }, []);

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Here you would integrate with your payment gateway
        // For now, we'll just show a success message
        alert('Payment processed successfully! You will receive a confirmation email shortly.');

        // Clear booking data and redirect to home
        localStorage.removeItem('bookingInfo');
        window.location.href = '/';
    };

    if (!bookingInfo) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <p>Loading booking information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Head title="Payment - North Trippers" />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                        <h1 className="text-xl font-semibold">Complete Payment</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Payment Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Personal Information</h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name</Label>
                                                <Input
                                                    id="fullName"
                                                    value={paymentData.fullName}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, fullName: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={paymentData.email}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, email: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={paymentData.phone}
                                                onChange={(e) => setPaymentData((prev) => ({ ...prev, phone: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={paymentData.address}
                                                onChange={(e) => setPaymentData((prev) => ({ ...prev, address: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={paymentData.city}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, city: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    value={paymentData.state}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, state: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zipCode">ZIP Code</Label>
                                                <Input
                                                    id="zipCode"
                                                    value={paymentData.zipCode}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, zipCode: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Payment Details</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input
                                                id="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={paymentData.cardNumber}
                                                onChange={(e) => setPaymentData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardExpiry">Expiry Date</Label>
                                                <Input
                                                    id="cardExpiry"
                                                    placeholder="MM/YY"
                                                    value={paymentData.cardExpiry}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, cardExpiry: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardCvv">CVV</Label>
                                                <Input
                                                    id="cardCvv"
                                                    placeholder="123"
                                                    value={paymentData.cardCvv}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, cardCvv: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardName">Cardholder Name</Label>
                                                <Input
                                                    id="cardName"
                                                    value={paymentData.cardName}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, cardName: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-[#238636] py-3 text-lg hover:bg-[#1a6b2a]">
                                        Pay ₹{bookingInfo.totalPrice.toLocaleString()}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Package Info */}
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <h3 className="font-semibold">{bookingInfo.packageName}</h3>
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Start Date: {new Date(bookingInfo.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {bookingInfo.persons} person(s) × {bookingInfo.days} day(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span>₹{(bookingInfo.totalPrice / bookingInfo.persons / bookingInfo.days).toLocaleString()}</span>
                                    </div>

                                    {bookingInfo.includeMeals && (
                                        <div className="flex justify-between text-green-600">
                                            <span>✓ Meals Included</span>
                                            <span>₹{bookingInfo.totalPrice * 0.2} (estimated)</span>
                                        </div>
                                    )}

                                    {bookingInfo.includeHotel && (
                                        <div className="flex justify-between text-green-600">
                                            <span>✓ Hotel Included</span>
                                            <span>₹{bookingInfo.totalPrice * 0.3} (estimated)</span>
                                        </div>
                                    )}

                                    <div className="border-t border-border pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="text-2xl font-bold text-[#238636]">₹{bookingInfo.totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="mt-0.5 h-5 w-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">Secure Payment</h4>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect
                                                your data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

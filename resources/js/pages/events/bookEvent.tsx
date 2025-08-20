import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, router as inertiaRouter } from '@inertiajs/react';
import { Calendar, Users } from 'lucide-react';
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

interface BookEventPageProps {
    event: Event;
}

export default function BookEvent({ event }: BookEventPageProps) {
    const [slots, setSlots] = useState(1);
    const [persons, setPersons] = useState([{ first_name: '', last_name: '', email: '', phone: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setPersons(Array.from({ length: slots }, (_, i) => persons[i] || { first_name: '', last_name: '', email: '', phone: '' }));
    }, [slots]);

    const totalAmount = slots * parseFloat(event.base_price);

    const handlePersonChange = (idx: number, field: string, value: string) => {
        setPersons((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess(false);
        try {
            await inertiaRouter.post(
                `/events/${event.id}/book`,
                {
                    slots,
                    persons,
                    total_amount: totalAmount,
                },
                {
                    onSuccess: (page) => {
                        // If backend returns payEvent page, Inertia will handle navigation
                    },
                    onError: (errors) => setError(errors.message || 'Booking failed'),
                    onFinish: () => setSubmitting(false),
                },
            );
        } catch (err: any) {
            setError('Booking failed');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title={`Book Event - ${event.name}`} />
            <BackButton text="Back to Event" className="mb-6" />
            <div className="mx-auto max-w-2xl px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Book Your Slot for <span className="text-[#238636]">{event.name}</span>
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge className="bg-[#238636] text-white">{event.state}</Badge>
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{event.days} days</span>
                            <Users className="ml-4 h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{event.available_slots} slots available</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label className="mb-2 block font-medium">How many slots do you want to book?</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={event.available_slots}
                                    value={slots}
                                    onChange={(e) => setSlots(Math.max(1, Math.min(event.available_slots, parseInt(e.target.value) || 1)))}
                                    required
                                />
                            </div>
                            <div className="space-y-6">
                                {persons.map((person, idx) => (
                                    <div key={idx} className="rounded-lg border p-4">
                                        <div className="mb-2 font-semibold">Person {idx + 1}</div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Input
                                                placeholder="First Name"
                                                value={person.first_name}
                                                onChange={(e) => handlePersonChange(idx, 'first_name', e.target.value)}
                                                required
                                            />
                                            <Input
                                                placeholder="Last Name"
                                                value={person.last_name}
                                                onChange={(e) => handlePersonChange(idx, 'last_name', e.target.value)}
                                                required
                                            />
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                value={person.email}
                                                onChange={(e) => handlePersonChange(idx, 'email', e.target.value)}
                                                required
                                            />
                                            <Input
                                                placeholder="Phone Number"
                                                value={person.phone}
                                                onChange={(e) => handlePersonChange(idx, 'phone', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-lg font-semibold">
                                <span>Total Amount:</span>
                                <span className="text-[#238636]">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            {error && <div className="text-center text-red-600">{error}</div>}
                            <Button type="submit" className="w-full bg-[#238636] text-white hover:bg-[#1a6b2a]" disabled={submitting}>
                                {submitting ? 'Booking...' : 'Book Now'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

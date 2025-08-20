import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, MessageSquare, Phone, Mail, User, Clock } from 'lucide-react';
import { useState } from 'react';

interface Inquiry {
    id: number;
    destination: string;
    travel_date?: string;
    travelers?: string;
    name?: string;
    email?: string;
    phone?: string;
    status: 'pending' | 'contacted' | 'closed';
    created_at: string;
    updated_at: string;
}

interface InquiriesPageProps {
    inquiries: {
        data: Inquiry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inquiries', href: '/inquiries' },
];

export default function InquiriesIndex({ inquiries }: InquiriesPageProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'contacted':
                return 'bg-blue-100 text-blue-800';
            case 'closed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inquiries - North Trippers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Travel Inquiries</h1>
                        <p className="text-muted-foreground">Manage customer travel inquiries and follow-ups</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#238636]" />
                        <span className="text-sm font-medium">{inquiries.total} Total Inquiries</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">
                                    {inquiries.data.filter(i => i.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Contacted</p>
                                <p className="text-2xl font-bold">
                                    {inquiries.data.filter(i => i.status === 'contacted').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Closed</p>
                                <p className="text-2xl font-bold">
                                    {inquiries.data.filter(i => i.status === 'closed').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#238636]/10">
                                <MessageSquare className="h-5 w-5 text-[#238636]" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{inquiries.total}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Inquiries List */}
                <div className="space-y-4">
                    {inquiries.data.length > 0 ? (
                        inquiries.data.map((inquiry) => (
                            <Card key={inquiry.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-[#238636]" />
                                                <span className="font-semibold text-lg">{inquiry.destination}</span>
                                            </div>
                                            <Badge className={getStatusColor(inquiry.status)}>
                                                {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            {inquiry.travel_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {new Date(inquiry.travel_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {inquiry.travelers && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{inquiry.travelers} travelers</span>
                                                </div>
                                            )}

                                            {inquiry.name && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{inquiry.name}</span>
                                                </div>
                                            )}

                                            {inquiry.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{inquiry.email}</span>
                                                </div>
                                            )}

                                            {inquiry.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{inquiry.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Received {formatDate(inquiry.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {inquiry.email && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`mailto:${inquiry.email}`, '_blank')}
                                            >
                                                <Mail className="h-4 w-4 mr-2" />
                                                Email
                                            </Button>
                                        )}
                                        {inquiry.phone && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`tel:${inquiry.phone}`, '_blank')}
                                            >
                                                <Phone className="h-4 w-4 mr-2" />
                                                Call
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">No inquiries found</h3>
                                    <p className="text-muted-foreground">
                                        New travel inquiries will appear here when customers submit them.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {inquiries.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: inquiries.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/inquiries?page=${page}`}
                                className={`px-3 py-2 rounded-md text-sm ${
                                    page === inquiries.current_page
                                        ? 'bg-[#238636] text-white'
                                        : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
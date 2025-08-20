import { Alert } from '@/components/ui/alert';
import BackButton from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle, CreditCard, IndianRupee, Loader2, RefreshCcw, Search, User, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AdminEventPaymentsProps {
    payments: Array<any>;
}

// Loading skeleton for initial load
function PaymentsSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full rounded bg-muted" />
            ))}
        </div>
    );
}

export default function AdminEventPayments({ payments: initialPayments }: AdminEventPaymentsProps) {
    // Show skeleton if payments is null/undefined
    if (!initialPayments) {
        return (
            <div className="min-h-screen bg-background p-4">
                <Head title="Admin - Event Payments" />
                <BackButton text="Back to Dashboard" className="mb-6" />
                <Card className="mx-auto max-w-7xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                            <CreditCard className="h-6 w-6 text-[#238636]" /> Event Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentsSkeleton />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [eventFilter, setEventFilter] = useState('');
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [refundPayment, setRefundPayment] = useState<any>(null);
    const [loadingRefund, setLoadingRefund] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Filtered and paginated payments
    const filteredPayments = useMemo(() => {
        let data = initialPayments;
        if (search) {
            data = data.filter((p) => {
                const userNames = (p.slot?.users || []).map((u) => `${u.first_name} ${u.last_name}`).join(' ');
                return (
                    p.id.toString().includes(search) ||
                    (p.slot?.event?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                    userNames.toLowerCase().includes(search.toLowerCase())
                );
            });
        }
        if (statusFilter) {
            data = data.filter((p) => p.status === statusFilter);
        }
        if (eventFilter) {
            data = data.filter((p) => p.slot?.event?.id?.toString() === eventFilter);
        }
        return data;
    }, [initialPayments, search, statusFilter, eventFilter]);

    const paginatedPayments = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredPayments.slice(start, start + pageSize);
    }, [filteredPayments, page]);

    const handleRefund = async (payment: any) => {
        setLoadingRefund(true);
        try {
            await router.post(
                `/admin/event-payments/${payment.id}/refund`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast({
                            title: 'Refund successful',
                            description: 'Refund successful',
                        });
                        setShowRefundDialog(false);
                    },
                    onError: (errors) => {
                        toast({
                            title: 'Refund failed',
                            description: errors.message || 'Refund failed',
                            variant: 'destructive',
                        });
                    },
                    onFinish: () => setLoadingRefund(false),
                },
            );
        } catch (e) {
            toast({
                title: 'Refund failed',
                description: 'Refund failed',
                variant: 'destructive',
            });
            setLoadingRefund(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <Head title="Admin - Event Payments" />
            <BackButton text="Back to Dashboard" className="mb-6" />
            <Card className="mx-auto max-w-7xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                        <CreditCard className="h-6 w-6 text-[#238636]" /> Event Payments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="relative md:w-64">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                <Search className="h-4 w-4" />
                            </span>
                            <Input
                                placeholder="Search by ID, event, user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <select
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                            className="rounded border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="">All Events</option>
                            {Array.from(new Set(initialPayments.map((p) => p.slot?.event)))
                                .filter(Boolean)
                                .map((ev) => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold">Event</th>
                                    <th className="px-4 py-3 text-left font-semibold">User(s)</th>
                                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-background">
                                {paginatedPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                                            No payments found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono">{payment.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {payment.slot?.event?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(payment.slot?.users || []).map((u: any) => (
                                                    <div key={u.id} className="flex items-center gap-1">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {u.first_name} {u.last_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1 font-semibold text-[#238636]">
                                                    <IndianRupee className="h-4 w-4" />
                                                    {Number(payment.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.status === 'success' && (
                                                    <Badge className="flex items-center gap-1 bg-green-600 text-white">
                                                        <CheckCircle className="h-4 w-4" /> Success
                                                    </Badge>
                                                )}
                                                {payment.status === 'pending' && (
                                                    <Badge className="flex items-center gap-1 bg-yellow-500 text-white">
                                                        <RefreshCcw className="h-4 w-4" /> Pending
                                                    </Badge>
                                                )}
                                                {payment.status === 'refunded' && (
                                                    <Badge className="flex items-center gap-1 bg-gray-500 text-white">
                                                        <XCircle className="h-4 w-4" /> Refunded
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className="flex items-center gap-1 bg-blue-600 text-white">
                                                    <CreditCard className="h-4 w-4" />
                                                    {payment.method || 'Razorpay'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{new Date(payment.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                {payment.status === 'success' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                                        onClick={() => {
                                                            setRefundPayment(payment);
                                                            setShowRefundDialog(true);
                                                        }}
                                                    >
                                                        Refund
                                                    </Button>
                                                )}
                                                {payment.status === 'refunded' && (
                                                    <span className="text-xs text-muted-foreground">Already refunded</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredPayments.length > pageSize && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Previous
                            </Button>
                            <span className="px-2 text-sm">
                                Page {page} of {Math.ceil(filteredPayments.length / pageSize)}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={page >= Math.ceil(filteredPayments.length / pageSize)}
                                onClick={() => setPage((p) => Math.min(Math.ceil(filteredPayments.length / pageSize), p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refund Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to refund payment <span className="font-mono">#{refundPayment?.id}</span> for{' '}
                            <b>{refundPayment?.slot?.event?.name}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive" className="mt-4">
                        This action cannot be undone.
                    </Alert>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowRefundDialog(false)} disabled={loadingRefund}>
                            Cancel
                        </Button>
                        <Button className="ml-2 bg-red-600 text-white" disabled={loadingRefund} onClick={() => handleRefund(refundPayment)}>
                            {loadingRefund ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

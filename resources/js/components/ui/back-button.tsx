import { ArrowLeft } from 'lucide-react';

export default function BackButton({ text = 'Back', onClick, className = '' }: { text?: string; onClick?: () => void; className?: string }) {
    return (
        <button
            type="button"
            onClick={onClick || (() => window.history.back())}
            className={`fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 shadow-lg ring-1 ring-border transition-colors hover:bg-muted dark:bg-background/90 dark:hover:bg-muted ${className} md:static md:rounded md:bg-transparent md:shadow-none md:ring-0 md:hover:bg-muted-foreground/10`}
            style={{ backdropFilter: 'blur(8px)' }}
        >
            <ArrowLeft className="h-5 w-5 text-foreground" />
            <span className="hidden font-medium text-foreground sm:inline">{text}</span>
        </button>
    );
}

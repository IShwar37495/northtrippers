import type { route as routeFn } from 'ziggy-js';

declare global {
    var route: typeof routeFn;

    interface Window {
        Pusher: any;
        Echo: any;
    }
}

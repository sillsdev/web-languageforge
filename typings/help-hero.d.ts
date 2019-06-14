declare type EventKind = "tour_started" | "tour_completed" | "tour_advanced" | "tour_cancelled" | "tour_interrupted" | "error";
declare type Event = {
    kind: EventKind;
    details?: string;
    tourId?: string;
    stepId?: string;
};
declare type Step = {
    id: string;
    name: string;
};
declare type Tour = {
    id: string;
    name: string;
    steps: Step[];
};
declare type EventInfo = {
    tour?: Tour;
    step?: Step;
};
declare type Data = {
    [key: string]: boolean | number | string | undefined | null;
};
export declare type HelpHero = {
    startTour: (id: string, options?: {
        skipIfAlreadySeen: boolean;
    }) => void;
    advanceTour: () => void;
    cancelTour: () => void;
    identify: (id: string | number, data?: Data) => void;
    update: (data: Data | ((data: Data) => Data | null | undefined)) => void;
    anonymous: () => void;
    on: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
    off: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
    openLauncher: () => void;
    closeLauncher: () => void;
};
export {};

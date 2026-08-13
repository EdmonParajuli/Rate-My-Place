// Server timezone is UTC (src/config/instance.ts sets timezone: 'utc') - per
// docs/specs/phase-3-discovery.md, "open now" intentionally uses server
// timezone for this MVP, not each place's local timezone.
export const getCurrentServerDayAndTime = (): { dayOfWeek: number; time: string } => {
    const now = new Date();
    return {
        dayOfWeek: now.getUTCDay(),
        time: now.toISOString().substring(11, 19),
    };
};

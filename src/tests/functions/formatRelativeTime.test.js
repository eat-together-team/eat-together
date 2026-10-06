import formatRelativeTime from '../../utils/formatRelativeTime';

// Fixed reference point so every case is deterministic.
const NOW = new Date('2026-09-15T12:00:00Z');
const minutesAgo = (n) => new Date(NOW.getTime() - n * 60 * 1000);
const hoursAgo = (n) => minutesAgo(n * 60);
const daysAgo = (n) => hoursAgo(n * 24);

describe('formatRelativeTime.js tests', () => {
    it('should show "now" for anything under a minute', () => {
        expect(formatRelativeTime(NOW, NOW)).toBe('now');
        expect(formatRelativeTime(new Date(NOW.getTime() - 59_000), NOW)).toBe('now');
    });

    it('should format minutes', () => {
        expect(formatRelativeTime(minutesAgo(1), NOW)).toBe('1m');
        expect(formatRelativeTime(minutesAgo(59), NOW)).toBe('59m');
    });

    it('should format hours', () => {
        expect(formatRelativeTime(hoursAgo(1), NOW)).toBe('1h');
        expect(formatRelativeTime(hoursAgo(23), NOW)).toBe('23h');
    });

    it('should format days', () => {
        expect(formatRelativeTime(daysAgo(1), NOW)).toBe('1d');
        expect(formatRelativeTime(daysAgo(6), NOW)).toBe('6d');
    });

    it('should format weeks and years', () => {
        expect(formatRelativeTime(daysAgo(7), NOW)).toBe('1w');
        expect(formatRelativeTime(daysAgo(30), NOW)).toBe('4w');
        expect(formatRelativeTime(daysAgo(400), NOW)).toBe('1y');
    });

    it('should accept a Firestore Timestamp', () => {
        const timestamp = { toDate: () => daysAgo(1) };
        expect(formatRelativeTime(timestamp, NOW)).toBe('1d');
    });

    it('should accept a millisecond epoch', () => {
        expect(formatRelativeTime(daysAgo(2).getTime(), NOW)).toBe('2d');
    });

    it('should accept a unix seconds epoch', () => {
        expect(formatRelativeTime(Math.floor(daysAgo(3).getTime() / 1000), NOW)).toBe('3d');
    });

    it('should clamp future timestamps to "now" rather than going negative', () => {
        expect(formatRelativeTime(new Date(NOW.getTime() + 60_000), NOW)).toBe('now');
    });

    it('should return an empty string for unusable values', () => {
        expect(formatRelativeTime(null, NOW)).toBe('');
        expect(formatRelativeTime(undefined, NOW)).toBe('');
        expect(formatRelativeTime('', NOW)).toBe('');
        expect(formatRelativeTime(new Date('nope'), NOW)).toBe('');
    });
});

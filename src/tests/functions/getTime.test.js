import getTime from '../../utils/getTime'
describe('getTime.js tests', () => {
    it('should format the date correctly', () => {
        // create a new Date object to test with
        const date = new Date('2020-01-01T00:00:00');
        // perform the assertion within the test block
        expect(getTime(date)).toBe('12:00 am');
    });

    it('should handle 24-hour format time correctly', () => {
        const date = new Date('2020-01-01T15:30:00');
        expect(getTime(date)).toBe('3:30 pm');
    });

    it('should handle leap year date correctly', () => {
        const date = new Date('2020-02-29T12:00:00');
        expect(getTime(date)).toBe('12:00 pm');
    });

    it('should handle early morning times correctly', () => {
        const date = new Date('2020-01-01T05:15:00');
        expect(getTime(date)).toBe('5:15 am');
    });

    it('should format end of month dates correctly', () => {
        const date = new Date('2020-01-31T23:45:00');
        expect(getTime(date)).toBe('11:45 pm');
    });

    it('should handle dates from a different year correctly', () => {
        const date = new Date('2021-07-04T18:00:00');
        expect(getTime(date)).toBe('6:00 pm');
    });

    it('should include seconds in the formatted time', () => {
        const date = new Date('2020-01-01T13:15:30');
        expect(getTime(date)).toBe('1:15 pm');
    });
});
import moment from "moment";

const timeSlots = [
    {
        startTime: moment("07:00 AM", "hh:mm A"),
        endTime: moment("08:00 AM", "hh:mm A"),
        available: false,
    },
    {
        startTime: moment("08:00 AM", "hh:mm A"),
        endTime: moment("09:00 AM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("09:00 AM", "hh:mm A"),
        endTime: moment("10:00 AM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("10:00 AM", "hh:mm A"),
        endTime: moment("11:00 AM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("11:00 AM", "hh:mm A"),
        endTime: moment("12:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("12:00 PM", "hh:mm A"),
        endTime: moment("13:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("13:00 PM", "hh:mm A"),
        endTime: moment("14:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("14:00 PM", "hh:mm A"),
        endTime: moment("15:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("15:00 PM", "hh:mm A"),
        endTime: moment("16:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("16:00 PM", "hh:mm A"),
        endTime: moment("17:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("17:00 PM", "hh:mm A"),
        endTime: moment("18:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("18:00 PM", "hh:mm A"),
        endTime: moment("19:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("19:00 PM", "hh:mm A"),
        endTime: moment("20:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("20:00 PM", "hh:mm A"),
        endTime: moment("21:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("21:00 PM", "hh:mm A"),
        endTime: moment("22:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("22:00 PM", "hh:mm A"),
        endTime: moment("23:00 PM", "hh:mm A"),
        available: false
    },
    {
        startTime: moment("23:00 PM", "hh:mm A"),
        endTime: moment("24:00 AM", "hh:mm A"),
        available: false
    }
];

export default timeSlots;
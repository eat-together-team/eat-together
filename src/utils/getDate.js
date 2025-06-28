const getDate = (date, getDayOfWeek = true) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    if (getDayOfWeek) {
        return dayOfWeek + ", " + month.substr(0, 3) + "." + " " + day;
    }

    return month + " " + day;
}

export default getDate;
const getTime = time => {
    let hours = time.getHours();
    let ending = "am";
    let minutes = time.getMinutes();

    //Change hours for am and pm
    if (hours === 0) {
        hours = 12;
    } else if (hours === 12) {
        ending = "pm"
    } else if (12 < hours && hours <= 23) {
        hours = hours - 12;
        ending = "pm"
    }

    if (0 <= minutes && minutes < 10) {
        minutes = "0" + minutes.toString();
    }

    return hours + ":" + minutes + " " + ending;
}

export default getTime;
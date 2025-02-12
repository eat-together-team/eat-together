import profaneWords from "./profaneWords";

/**
 * Sorts an array of people by similarity to the current user.
 * @param {Array} newPeople Array of people to sort.
 * @returns Sorted array of people.
 */
export const sortBySimilarInterests = async (userInfo, newPeople) => {
    let result;
    let currTags = [[], [], []];
    userInfo.tags.forEach((tag) => {
        switch (tag.type) {
            case "school":
                currTags[0].push(tag.tag);
                break;
            case "hobby":
                currTags[1].push(tag.tag);
                break;
            case "food":
                currTags[2].push(tag.tag);
                break;
        }
    });

    await fetch("https://eat-together-match.uw.r.appspot.com/find_similarity", {
      method: "POST",
      body: JSON.stringify({
        currTags: currTags,
        otherTags: getPeopleTags(newPeople),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        let i = 0;
        newPeople.forEach((p) => {
          p.similarity = res[i];
          i++;
        });

        result = newPeople.sort((a, b) => b.similarity - a.similarity);
      })
      .catch((e) => {
        // If error, alert the user
        alert("An error occured, try again later :(");
        result = newPeople;
      });

    return result;
};

// Helper method for sortBySimilarInterests: get a list of everyone's tags
const getPeopleTags = (newPeople) => {
    let tags = [];
    newPeople.forEach((p) => {
        let currTags = [[], [], []];
        p.tags.forEach((tag) => {
            switch (tag.type) {
                case "school":
                    currTags[0].push(tag.tag);
                    break;
                case "hobby":
                    currTags[1].push(tag.tag);
                    break;
                case "food":
                    currTags[2].push(tag.tag);
                    break;
            }
        });
        tags.push(currTags);
    });

    return tags;
};
/**
 * Get the tags in common between two users.
 * @param {Object} currUser Current user.
 * @param {Object} otherUser Other user.
 * @returns Array of tags in common.
 */
export const getCommonTags = (currUser, otherUser) => {
    let commonTags = [];
    const otherTags = otherUser.tags.map((tag) => tag.tag);

    currUser.tags.forEach((tag) => {
      if (otherTags.includes(tag.tag)) {
        commonTags.push(tag);
      }
    });

    return commonTags;
  };

/**
 * Generates a random color.
 * @returns Hex value of random color.
 */
export const generateColor = () => {
    const colors = ["#5DB075", "#6DE2BF", "#62E286", "#31B87F", "#71D8AC", "#3DD671"];
    let random = Math.floor(Math.random() * colors.length);
    return colors[random];
};

/**
 * Determines if an event is in the morning, afternoon, or evening.
 * @param {Datetime Object} time Time of event.
 * @returns Time of day ("morning", "afternoon", "evening").
 */
export const getTimeOfDay = (time) => {
    let hour = time.getHours();
    if (hour < 12) {
        return "morning";
    } else if (hour < 17) {
        return "afternoon";
    } else {
        return "evening";
    }
}

/**
 * Check whether inappropriate words are used.
 * @param {String} word Word to check.
 * @returns True if inappropriate words are used, false otherwise.
 */
export const checkProfanity = word => {
    const profane = profaneWords.some(w => word.toLowerCase().includes(w));
    return profane;
}

/**
 * Determines if a user is available for a particular event/meal.
 * @param {Object} user User to check.
 * @param {Object} event Event/meal to check.
 * @returns True if user is available, false otherwise.
 */
export const isAvailable = (user, event) => {
    let startDate, endDate;
    if (event.startDate) {
        startDate = (event.startDate instanceof Date) ? event.startDate : event.startDate.toDate();
        endDate = (event.endDate instanceof Date) ? event.endDate : event.endDate.toDate();
    } else {
        startDate = (event.date instanceof Date) ? event.date : event.date.toDate();
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
    }

    switch (new Date(startDate).getDay()) { // Days of the week
        case 0: // Sunday
            return isMatch(startDate, endDate, user.availabilities.sunday);
        case 1: // Monday
            return isMatch(startDate, endDate, user.availabilities.monday);
        case 2: // Tuesday
            return isMatch(startDate, endDate, user.availabilities.tuesday);
        case 3: // Wednesday
            return isMatch(startDate, endDate, user.availabilities.wednesday);
        case 4: // Thursday
            return isMatch(startDate, endDate, user.availabilities.thursday);
        case 5: // Friday
            return isMatch(startDate, endDate, user.availabilities.friday);
        case 6: // Saturday
            return isMatch(startDate, endDate, user.availabilities.saturday);
    }
}

/**
 * Helper function to determine if a user's schedule matches with an event/meal.
 * @param {Datetime Object} startDate Start date of event/meal.
 * @param {Datetime Object} endDate End date of event/meal.
 * @param {Object} availabilities User's availabilities.
 * @returns True if match, false if not.
 */
const isMatch = (startDate, endDate, availabilities) => {
    let match = false;

    availabilities.forEach(availability => {
        // Set start and end times to same day as date
        let startTime = availability.startTime.toDate();
        startTime.setFullYear(startDate.getFullYear());
        startTime.setMonth(startDate.getMonth());
        startTime.setDate(startDate.getDate());
        startTime.setSeconds(0);

        let endTime = availability.endTime.toDate();
        endTime.setFullYear(endDate.getFullYear());
        endTime.setMonth(endDate.getMonth());
        endTime.setDate(endDate.getDate());
        endTime.setSeconds(59);

        if (startTime <= startDate && endDate <= endTime) {
            match = true;
            return;
        }
    });

    return match;
}

/**
 * Randomly chooses three elements from an array.
 * @param {Array} array Array to choose from.
 * @returns Array of three random elements.
 */
export const randomize3 = (array) => {
    let result = [];
    let copy = array.slice();
    for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * copy.length);
        result.push(copy[index]);
        copy.splice(index, 1);
    }

    return result;
}

/**
 * Compares two dates.
 * @param {Datetime Object} First date.
 * @param {Datetime Object} Second date.
 * @returns Integer representing if the first date is before (-), after (+), or equal (0) to the second date.
 */
export const compareDates = (a, b) => {
    let aSeconds;
    if (a.date) {
        aSeconds = a.date.seconds;
    } else {
        aSeconds = a.startDate.seconds;
    }

    let bSeconds;
    if (b.date) {
        bSeconds = b.date.seconds;
    } else {
        bSeconds = b.startDate.seconds;
    }

    return aSeconds - bSeconds;
}

/**
 * Given a list of events, return a list of free times for each of Monday to Sunday (multiple free times per day are possible)
 * @param {Array} events list of events
 * @returns {Array} list of free times
 */
export const getFreeTimes = (events) => {
    let freeTimes = [];

    // Do this for each day of the week
    for (let i = 1; i <= 7; i++) {
        let index = i;
        if (i === 7) {
            index = 0;
        }

        const currDayEvents = events.filter((e) => e.dayOfWeek === index).sort((a, b) => a.start - b.start);

        // Set the start and end times for the day
        let startTime, endTime;

        // If there are no events on this day, add the entire day to the list of free times
        if (currDayEvents.length === 0) {
            startTime = new Date();
            startTime.setHours(9);
            startTime.setMinutes(0);
            endTime = new Date();
            endTime.setHours(21);
            endTime.setMinutes(0);

            freeTimes.push({
                dayOfWeek: index,
                start: startTime,
                end: endTime
            });
        } else {
            startTime = new Date(currDayEvents[0].start);
            startTime.setHours(9);
            startTime.setMinutes(0);
            startTime.setSeconds(0);
            endTime = new Date(currDayEvents[0].start);
            endTime.setHours(21);
            endTime.setMinutes(0);
            endTime.setSeconds(0);

            let currIndex = 0;
            while (currIndex < currDayEvents.length) {
                const currEvent = currDayEvents[currIndex];

                // If the event starts after the current time, add the free time to the list
                if (currEvent.start > startTime) {
                    let end = currEvent.start;
                    end.setMinutes(currEvent.start.getMinutes() - 15);

                    freeTimes.push({
                        dayOfWeek: index,
                        start: startTime,
                        end: currEvent.start
                    });
                }

                // Set the start time to the end time of the event
                startTime = currEvent.end;
                startTime.setMinutes(currEvent.end.getMinutes() + 15);
                currIndex++;
            }

            // If the last event ends before the end of the day, add the free time to the list
            if (startTime < endTime) {
                freeTimes.push({
                    dayOfWeek: index,
                    start: startTime,
                    end: endTime
                });
            }
        }
    }

    return freeTimes;
}

/**
 * Given a moment date object, convert it to 1 week later if it's before the current date
 * @param {Object} date moment date object
 * @returns {Object} moment date object, 1 week later
 */
export const convertToFutureDate = (date) => {
    let currDate = new Date();
    if (date.toDate() < currDate) {
        date.add(1, 'week');
    }

    return date;
}
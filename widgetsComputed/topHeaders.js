function generateNextFourMondays() {
    const results = [];
    const format = 'MM/DD/YYYY';

    let currentDate = moment().day(1);  // Start with the next Monday

    // If today is Monday, keep it. Otherwise, find the next Monday.
    if (moment().day() !== 1) {
        currentDate = moment().day(8); // Skip to next Monday if today is not Monday
    }

    for (let i = 0; i < 4; i++) {  // Get next 4 Mondays
        const display = currentDate.format(format);
        const value = currentDate.valueOf();  // Unix timestamp in milliseconds

        results.push({ display, value, customProp: 'test' });
        currentDate.add(7, 'days');  // Move to the next Monday
    }

    return results;
}

const dateObjects = generateNextFourMondays();
console.log('date objects, ', dateObjects);
return dateObjects;

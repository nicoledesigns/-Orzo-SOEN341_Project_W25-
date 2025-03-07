function formatDate(date) {
    if (!(date instanceof Date)) {
        return "Invalid Date Input";
    }

    const month = date.toString().split(' ')[1];
    const day = date.toString().split(' ')[2];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${month} ${day} ${year} ${hours}:${minutes}`;
    return formattedDate;
}

module.exports = { formatDate };
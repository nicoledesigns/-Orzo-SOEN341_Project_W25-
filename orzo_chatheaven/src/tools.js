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

function analyzeString(string) {
    const pattern = /(?<!\w)@orzoAi(?!\w)/;
    return pattern.test(string);
}

async function generateAnswer(prompt) {
    try {
        console.log(prompt)
        const response = await fetch(`"http://localhost:8081/orzo_Ai/text?prompt=${prompt}"`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data)
    } catch (error) {
        console.error(error);
    }

}

module.exports = { formatDate };
module.exports = { analyzeString };
module.exports = { generateAnswer }; 
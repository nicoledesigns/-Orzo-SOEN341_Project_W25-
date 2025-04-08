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

function analyzeString(string, channelId) {
    const pattern = /(?<!\w)@orzoAi(?!\w)/;
    constImagePattern = /(?<!\w)@orzoAi generate an image(?!\w)/;
    if(pattern.test(string)){
        generateImage(string, channelId)
    }
    else if(pattern.test(string)){
        generateAnswer(string, channelId)
    }
    return pattern.test(string);
}

async function generateAnswer(prompt, channel_id) {
    try {
        prompt = prompt + " make your answer short and sweet"
        console.log(prompt)
        const response = await fetch(`http://localhost:8081/orzo_Ai/text?prompt=${prompt}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

         if (!response.ok) {
            const errorData = await response.json(); // Try to get more specific error info from the server
            throw new Error(`Error: ${response.status} - ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        const aiResponse = data.response;
        await sendAiMessage(channel_id, aiResponse);
        console.log(`this is the data ${JSON.stringify(data)}`)
    } catch (error) {
        console.error(error);
        throw error; 
    }

}

async function generateImage(prompt, channel_id) {
    try {
        console.log(`Image prompt: ${prompt}`);

        const response = await fetch(`http://localhost:8081/orzo_Ai/image?prompt=${encodeURIComponent(prompt)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${response.status} - ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const imageUrl = data.imageUrl; // assumes your Express API sends { imageUrl: "https://..." }

        await sendAiMessage(channel_id, imageUrl);
        console.log(`Image URL sent: ${imageUrl}`);
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}


async function sendAiMessage(channelId, message) {
    const aiUserId = 15; 
    const apiUrl = 'http://localhost:8081/sendMessage'; 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: aiUserId,
                channelId: channelId,
                message: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to send AI message to channel ${channelId}:`, errorData);
        } else {
            const result = await response.json();
            console.log(`AI message sent to channel ${channelId}:`, result.message);
        }
    } catch (error) {
        console.error(`Error sending AI message to channel ${channelId}:`, error);
    }
}

module.exports = {
    formatDate,
    analyzeString,
    generateAnswer
};
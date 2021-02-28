const generateMessage = (username, text) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, location) => {
    return {
        username: username,
        text: location,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocation
}
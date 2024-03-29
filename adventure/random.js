exports.getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


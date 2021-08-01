exports.formatedTimestamp = (dateTime = null)=> {
    const d = dateTime ? dateTime : new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date} ${time}`
}

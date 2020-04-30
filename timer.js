const moment = require('moment');

var timer;
var title;

exports.start = (name = '') => {
    timer = new moment();
    title = name;
}

exports.stop = () => {
    let end = new moment();
    let duration = moment.duration(end.diff(timer));
    timer = undefined;

    return getTitle() + getFormat(duration) + '.';
}

function getFormat(duration) {
    let hours = duration.hours() > 0
        ? duration.hours() + ':'
        : '';
    return hours + moment(duration._data).format('mm:ss');
}

function getTitle() {
    return title !== ''
        ? title + ' took: '
        : '';
}

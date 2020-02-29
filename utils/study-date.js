function getWhichWeek(startTime) {
    //哪一周
    const startTimeStamp = Math.round(startTime.getTime() / 1000);
    const nowTimeStamp = Math.round(new Date().getTime() / 1000);
    let weekNum = parseInt((nowTimeStamp - startTimeStamp) / 60 / 60 / 24 / 7) + 1;//度过了几个7天
    return weekNum;
}


const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}
const formatTimeNew = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [hour, minute].map(formatNumber).join(':')
}

export {
    getWhichWeek, formatTime, formatDate, formatTimeNew
}
function getWhichWeek(startTime) {
    //哪一周
    startTime = parseInt(startTime);
    let nowTime = Math.round(new Date().getTime() / 1000);
    let weekNum = parseInt((nowTime - startTime) / 60 / 60 / 24 / 7) + 1;//度过了几个7天
    return weekNum;
}

export {
    getWhichWeek
}
import moment from "moment";

export function getCurrentDate(separator='-'){

    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    
    return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date<10?`0${date}`:`${date}`}`
}

export function getCurrentDateTime(){

    let currentDateTime = moment().format("DD-MM-YYYY HH:mm:ss");
    
    return currentDateTime;
}

export function getCurrentTime(){

    let currentTime = moment().format("HH:mm:ss");
    
    return currentTime;
}
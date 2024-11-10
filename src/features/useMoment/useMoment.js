import moment from "moment/moment"
import 'moment/locale/he';
moment.locale('he');
export const getCurrentTimeStamp=(timeFormat)=>{
    return moment().format(timeFormat)
}
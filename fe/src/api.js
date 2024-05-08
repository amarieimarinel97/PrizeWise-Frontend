// import { browserName, isMobile } from 'react-device-detect';
// const API_ENDPOINT = browserName === 'WebKit' && isMobile ? 'http://192.168.0.136:8080/api' : 'http://localhost:8080/api';
const API_ENDPOINT = window.location.origin.replace('3000','8080/api');
alert(API_ENDPOINT);
export const SEARCH_ENDPOINT = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&apikey=5ZZAGO8AS4V9XCX&keywords=";
export default API_ENDPOINT;
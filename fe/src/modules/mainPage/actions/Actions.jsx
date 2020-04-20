import axios from "axios";
import API_ENDPOINT from "../../../api"

export const GET = (url, crossDomain = true) => {
    return axios
            .get(API_ENDPOINT + url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                crossDomain
            })
};

export const search = searchInput => GET(API_ENDPOINT + `/crawl/bi?stock=${searchInput}`)
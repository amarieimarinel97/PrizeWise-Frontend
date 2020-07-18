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

export const POST = (url, body, crossDomain = true) => {
    return axios
        .post(API_ENDPOINT + url,
            body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                crossDomain
            })
};

export const SEARCH = searchInput => GET(API_ENDPOINT + `/analyze?stock=${searchInput}&save=true`)
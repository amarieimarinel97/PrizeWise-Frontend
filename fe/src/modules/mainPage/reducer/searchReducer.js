import { combineReducers } from "redux";

const initialMainPageState = {
    searchInput: "",
    errors: {
        notFound: ""
    }
}

const mainPageReducer = (state = initialMainPageState, action) => {
    switch (action.type) {
        case "SEARCH":
            {
                return {
                    ...state,
                    searchInput: action.payload.searchInput
                }
            }
        default: {
            return state;
        }
    }
};




const searchReducer = combineReducers({
    mainPage: mainPageReducer
});

export default searchReducer;
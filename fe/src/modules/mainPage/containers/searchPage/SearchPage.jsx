import React from "react"

// eslint-disable-next-line
import styles from "./styles.css"

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
            errors: {
                notFound: ""
            }
        }

    }

    isFormValid = () => {
        if (this.state.errors.searchInput !== null && this.state.errors.searchInput !== "")
            return true;
        return false;
    }

    onChange = (event) =>
        this.setState({ searchInput: event.target.value })

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            console.log(this.state.searchInput);
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="content">
                    <div id="title">
                        PROJ
                </div>
                    <div id="main-container">
                        <div id="search-container">
                            <input placeholder="Search" id="search-input" onKeyDown={this.onKeyDown} onChange={this.onChange} type="text" spellCheck="false" autoFocus>
                            </input>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }


}
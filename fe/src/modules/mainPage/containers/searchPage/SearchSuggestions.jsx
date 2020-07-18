import Autosuggest from 'react-autosuggest';
import React from 'react';
import stocks from "../../fixtures/stocks";

const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : stocks.filter(stock =>
        stock.name.toLowerCase().slice(0, inputLength) === inputValue
    ).slice(0, 4);
};

const PLACEHOLDERS = [
    "Search",
    "Amazon",
    "Google",
    "Apple",
    "Tesla"
]



class SearchSuggestions extends React.Component {
    constructor() {
        super();
        this.state = {
            value: '',
            suggestions: [],
            placeholder: 'Search',
            placeholderIndex: 0,
            toAnimatePlaceholder: true,
            fade: false
        };
    }

    getSuggestionValue = suggestion => suggestion.name;

    renderSuggestion = suggestion => (
        <div>
            {`${suggestion.name}`}
        </div>
    );

    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
        this.props.onChange(newValue);
    };

    onSuggestionsFetchRequested = ({ value }) => this.setState({ suggestions: getSuggestions(value) })


    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    triggerPlaceholderAnimation = () => {
        if (this.state.toAnimatePlaceholder === true) {
            var animateTime = 1500;
            var visibleTime = 1000;
            setTimeout(() => {
               
                this.setState({
                    placeholder: PLACEHOLDERS[1],
                    toAnimatePlaceholder: false,
                    fade:true
                })
            }, animateTime);
            setTimeout(() => {
                this.setState({
                    fade:false
                })
            }, animateTime+visibleTime);

            setTimeout(() => {
                this.setState({
                    placeholder: PLACEHOLDERS[2],
                    fade:true
                })
            }, animateTime * 2);

            setTimeout(() => {
                this.setState({
                    fade:false
                })
            }, animateTime*2+visibleTime);

            setTimeout(() => {
                this.setState({
                    placeholder: PLACEHOLDERS[3],
                    fade:true
                })
            }, animateTime * 3);
            setTimeout(() => {
                this.setState({
                    fade:false
                })
            }, animateTime*3+visibleTime);

            setTimeout(() => {
                this.setState({
                    placeholder: PLACEHOLDERS[4],
                    fade:true
                })
            }, animateTime * 4);

            setTimeout(() => {
                this.setState({
                    fade:false
                })
            }, animateTime*4+visibleTime);

            setTimeout(() => {
                this.setState({
                    placeholder: PLACEHOLDERS[0],
                    fade:true
                })
            }, animateTime * 5);

            // setTimeout(() => {
            //     this.setState({
            //         toAnimatePlaceholder: true,
            //         fade:false
            //     })
            // }, animateTime * 10);
        }
    }

    render() {
        const fade = this.state.fade;
        this.triggerPlaceholderAnimation();
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: this.state.placeholder,
            value,
            onKeyDown: this.props.onKeyDown,
            onChange: this.onChange,
            spellCheck: false,
            autoFocus: true,
        };
        return (

            <div className={fade ? '' : 'fade'} >
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>

        );
    }
}

export default SearchSuggestions;
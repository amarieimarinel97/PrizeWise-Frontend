import Autosuggest from 'react-autosuggest';
import React from 'react';
import stocks from "../../fixtures/stocks";

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : stocks.filter(stock =>
        stock.name.toLowerCase().slice(0, inputLength) === inputValue
    ).slice(0,4);
};



class SearchSuggestions extends React.Component {
    constructor() {
        super();
        this.state = {
            value: '',
            suggestions: []
        };
    }

    getSuggestionValue = suggestion => suggestion.name.split(" ")[0];

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

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: 'Search',
            value,
            onKeyDown: this.props.onKeyDown,
            onChange: this.onChange,
            spellCheck: false,
            autoFocus: true,
        };

        // Finally, render it!
        return (
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps}
            />
        );
    }
}

export default SearchSuggestions;
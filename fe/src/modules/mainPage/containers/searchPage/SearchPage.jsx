import React from "react"
import { GET } from '../../actions/Actions';

// eslint-disable-next-line
import styles from "./styles.css"
import "../../../../styles/loading.css"
import SearchSuggestions from "./SearchSuggestions";

export const LoadingCircle = () => {
    return (
        <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    )
}


export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
            isLoading: false,
            isLoaded: false,

            companyName: "",
            companySymbol: "",
            stockLastUpdated: "",
            NOC: "",
            HOC: "",
            ERC: "",
            predictedChange: "",
            price: "",
            articles: [],

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

    onChange = (value) =>{
        this.setState({ searchInput: value });
    }

    showArticles = (noOfArticles = 4) => {

        if (this.state.isLoaded === true) {
            var result = [];
            this.state.articles.forEach((article, idx) => {
                if (idx >= noOfArticles) return;
                result.push(
                    <div className="info-card bad-article">
                        <a href={article.link}> <div id="article-title">{article.title}</div></a>
                        <div id="article-date">{Math.round(article.lastUpdated)}h ago</div>
                    </div>);
            });

            return (
                <React.Fragment>
                    {result}
                </React.Fragment>
            )
        }
    }

    showResults = (data) => {
        this.setState({
            isLoading: false,
            isLoaded: true,
            companyName: data.stock.company,
            companySymbol: data.stock.symbol,
            stockLastUpdated: new Date(1000 * data.stock.lastUpdated),
            NOC: data.stock.newsOptimismCoefficient.toFixed(2),
            HOC: data.stock.historyOptimismCoefficient.toFixed(2),
            ERC: data.stock.expertsRecommendationCoefficient.toFixed(2),
            predictedChange: data.stock.predictedChange.toFixed(2),
            price: data.stock.price,
            articles: data.articles,
        })

    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setState({ isLoaded: false, isLoading: true })
            GET(`/crawl/bi?stock=${this.state.searchInput}`).then(response => {
                this.showResults(response.data);
                this.setState({ isLoaded: true, isLoading: false })
                return ({
                    type: "SEARCH_RESULT",
                    payload: { searchResult: response.data }
                });
            })
                .catch(error => {
                    this.setState({ isLoaded: false, isLoading: false })
                    return ({
                        type: "SEARCH_ERROR",
                        payload: { errorMessage: error.toString() }
                    })
                }

                );
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
                            <SearchSuggestions onKeyDown={this.onKeyDown} onChange={this.onChange}/>

                            <input placeholder="Search" id="search-input" onKeyDown={this.onKeyDown} onChange={this.onChange} type="text" spellCheck="false" autoFocus>
                            </input>
                        </div>
                        {this.state.isLoading &&
                            <div id="loading-container">
                                {LoadingCircle()}
                            </div>
                        }
                        {this.state.isLoaded &&
                            <div id="result-container">

                                <div className="info-card" id="info-container">
                                    <div id="company-info">{this.state.companyName} ({this.state.companySymbol})</div>
                                    <div id="price">Price: {this.state.price} USD</div>
                                    <div id="coefficients">
                                        <div id="NOC">NOC:{this.state.NOC}</div>
                                        <div id="HOC">HOC:{this.state.HOC}</div>
                                        <div id="ERC">ERC:{this.state.ERC}</div>
                                    </div>
                                    <div id="predicted-change">
                                        Final predicted change: {this.state.predictedChange}%
                                </div>
                                </div>
                                <div className="info-card" id="graph-container">
                                    SOME GRAPH
                            </div>
                                {this.showArticles()}
                            </div>
                        }
                    </div>

                </div>

            </React.Fragment>
        )
    }


}
import React from "react"
import { GET } from '../../actions/Actions';
import LineGraph from "../graph/LineGraph";
import CircleGraph from "../graph/CircleGraph";
import OverralGraph from "../graph/OverralGraph";

// eslint-disable-next-line
import styles from "./styles.css"
import "../../../../styles/loading.css"
import SearchSuggestions from "./SearchSuggestions";

export const LoadingCircle = () => {
    return (
        <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    )
}
const BAD_ARTICLE_THRESHOLD = 0.15;
const GOOD_ARTICLE_THRESHOLD = 0.8;

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            searchInput: "",
            isLoading: false,
            isLoaded: false,

            companyName: "",
            companySymbol: "",
            stockLastUpdated: "",
            NOC: 5,
            HOC: 5,
            ERC: 5,
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

    onChange = (value) => {
        this.setState({ searchInput: value });
    }

    doesArrayContainArticle = (array, article) => {
        if (array.length == 0)
            return false;
        var i;
        for (i = 0; i < array.length; ++i)
            if (array[i].title === article.title)
                return true;
        return false;
    }

    shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    insertGoodArticles = (articles, noOfArticles) => {
        var result = [];
        var i, j;
        for (i = 0; i < noOfArticles; ++i) {
            for (j = 0; j < articles.length; ++j) {
                if (articles[j].sentimentAnalysis > GOOD_ARTICLE_THRESHOLD
                    && !this.doesArrayContainArticle(result, articles[j])
                    && (articles[j].title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase())
                        || articles[j].title.toLowerCase().includes(this.state.companySymbol.toLowerCase()))
                ) {
                    result.push(articles[j]);
                    break;
                }
            }
        }
        return result;
    }

    insertBadArticles = (articles, noOfArticles) => {
        var result = [];
        var i, j;
        for (i = 0; i < noOfArticles; ++i) {
            for (j = 0; j < articles.length; ++j) {
                if (articles[j].sentimentAnalysis < BAD_ARTICLE_THRESHOLD
                    && !this.doesArrayContainArticle(result, articles[j])
                    && (articles[j].title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase())
                        || articles[j].title.toLowerCase().includes(this.state.companySymbol.toLowerCase()))

                ) {
                    result.push(articles[j]);
                    break;
                }
            }
        }
        return result;
    }

    getFormattedLastUpdated = (article) => {
        if (article.lastUpdated > 24)
            return `${Math.round(article.lastUpdated / 24)}d ago`;
        else
            return `${Math.round(article.lastUpdated)}h ago`;
    }

    showArticles = (noOfArticles = 4) => {
        var articles = this.state.articles;
        if (this.state.isLoaded === true) {
            var articlesToShow = [];
            this.insertGoodArticles(articles, noOfArticles / 2).forEach(article => articlesToShow.push(
                <div className="info-card good-article">
                    <a href={article.link}> <div id="article-title">{article.title}</div></a>
                    <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                </div>
            ));
            this.insertBadArticles(articles, noOfArticles / 2).forEach(article => articlesToShow.push(
                <div className="info-card bad-article">
                    <a href={article.link}> <div id="article-title">{article.title}</div></a>
                    <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                </div>
            ));
            return (
                <React.Fragment>
                    {articlesToShow}
                </React.Fragment>
            )
        }
    }

    showResults = (data) => {
        this.setState({
            hasError: false,
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
            stockEvolution: data.stockEvolution
        })

    }

    hideErrorMessage = (seconds) => {
        setTimeout(() =>
            this.setState({
                hasError: false,
                errorMessage: ""
            })
            , seconds * 1000);
    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setState({ isLoaded: false, isLoading: true })
            GET(`/crawl/bi?stock=${this.state.searchInput}&save=true`).then(response => {
                this.showResults(response.data);
                return ({
                    type: "SEARCH_RESULT",
                    payload: { searchResult: response.data }
                });
            })
                .catch(error => {
                    var errorMessage = "";
                    if (error.toString().toLowerCase().includes("network"))
                        errorMessage = "Network error";
                    else
                        errorMessage = "Could not find what you were looking for";

                    this.hideErrorMessage(2);
                    this.setState({
                        isLoaded: false,
                        isLoading: false,
                        hasError: true,
                        errorMessage: errorMessage
                    })
                    return ({
                        type: "SEARCH_ERROR",
                        payload: { errorMessage: error.toString() }
                    })
                }

                );
        }
    }

    getNormalizedValue = (value, max, min) => (value - min) * 1 / (max - min);
    getUniformValues = (value, avg) => Math.sqrt(-2.0 * Math.log(avg)) * Math.cos(2.0 * Math.PI * value);

    getCoefficientsData = (state) => [state.NOC, state.ERC, state.HOC];


    getArticlesOptimismData = (state) => {
        var goodArticles = 0;
        var neutralArticles = 0;
        var badArticles = 0;
        var sentimentAnalysisResults = [];

        for (var i = 0; i < state.articles.length; i++)
            sentimentAnalysisResults.push(state.articles[i].sentimentAnalysis);

        var min = Math.min(...sentimentAnalysisResults);
        var max = Math.max(...sentimentAnalysisResults);
        const sum = sentimentAnalysisResults.reduce((a, b) => a + b, 0);
        const avg = (sum / sentimentAnalysisResults.length) || 0;

        for (var i = 0; i < sentimentAnalysisResults.length; i++) {
            // sentimentAnalysisResults[i] = this.getUniformValues(sentimentAnalysisResults[i], avg);
            if (sentimentAnalysisResults[i] < BAD_ARTICLE_THRESHOLD)
                badArticles++;
            if (sentimentAnalysisResults[i] >= BAD_ARTICLE_THRESHOLD && sentimentAnalysisResults[i] <= GOOD_ARTICLE_THRESHOLD)
                neutralArticles++;
            if (sentimentAnalysisResults[i] > GOOD_ARTICLE_THRESHOLD)
                goodArticles++;
        }
        return [badArticles, neutralArticles, goodArticles];
    }

    getHistoryPredictionData = (state) => {
        var stockEvolution = this.state.stockEvolution
        var result = [];
        var i;
        for (i = 0; i < stockEvolution.history.length - 1; ++i)
            result.push(stockEvolution.history[i].toFixed(2));
        for (i = 0; i < stockEvolution.prediction.length; ++i)
            result.push(stockEvolution.prediction[i].toFixed(2))
        return result;
    }

    getLabelDays = (state) => this.state.stockEvolution.historyDays;

    render() {
        return (
            <React.Fragment>
                <div id="content">
                    <div id="title">
                        WISE
                    </div>
                    <div id="nav-bar">
                        <div id="top-popular">Popular stocks
                        </div>
                        <div id="top-growing">Growing stocks
                        </div>
                        <div id="top-decreasing">Decreasing stocks
                        </div>
                    </div>
                    <div id="main-container">
                        <div id="search-container">
                            <SearchSuggestions onKeyDown={this.onKeyDown} onChange={this.onChange} />

                            <input placeholder="Search" id="search-input" onKeyDown={this.onKeyDown} onChange={this.onChange} type="text" spellCheck="false" autoFocus>
                            </input>
                            {this.state.hasError &&
                                <div id="error-container">{this.state.errorMessage}</div>
                            }
                        </div>
                        {this.state.isLoading &&
                            <div id="loading-container">
                                {LoadingCircle()}
                            </div>
                        }
                        {this.state.isLoaded &&
                            <div id="result-container">

                                <div className="info-card" id="company-card">
                                    <div id="card-title">Company info</div>

                                    <div id="inside-container">
                                        <div id="company-flex-container">
                                            <div id="company-info">{this.state.companyName} ({this.state.companySymbol})</div>
                                            <div id="price">Price: {this.state.price} USD</div>
                                            <div id="NOC">News coefficient - {this.state.NOC}</div>
                                            <div id="HOC">History coefficient - {this.state.HOC}</div>
                                            <div id="ERC">Experts coefficient - {this.state.ERC}</div>
                                            <div id="predicted-change">
                                                Final predicted change: {this.state.predictedChange}%
                                    </div>

                                        </div>
                                        <div id="coefficients">
                                            <div id="coefficients-graph">
                                                <OverralGraph input={this.getCoefficientsData(this.state)}></OverralGraph>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                <div className="info-card" id="graph-container">
                                    <div id="card-title">Stock evolution</div>
                                    <LineGraph input={this.getHistoryPredictionData(this.state)} labels={this.getLabelDays(this.state)}></LineGraph>
                                </div>
                                <div className="info-card" id="graph-container">
                                    <div id="card-title">News analysis</div>
                                    <CircleGraph input={this.getArticlesOptimismData(this.state)}></CircleGraph>
                                </div>
                                <div id="articles-subtitle">Some news about this company</div><div></div>
                                {this.showArticles()}
                            </div>
                        }
                    </div>

                </div>

            </React.Fragment>
        )
    }


}
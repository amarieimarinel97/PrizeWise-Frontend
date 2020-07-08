import React from "react"
import { GET } from '../../actions/Actions';
import LineGraph from "../graph/LineGraph";
import CircleGraph from "../graph/CircleGraph";
import OverralGraph from "../graph/OverralGraph";
import { faSearchMinus, faHistory, faQuestionCircle, faAngleDoubleUp, faAngleDoubleDown, faFire, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// eslint-disable-next-line
import styles from "./styles.css"
import "../../../../styles/loading.css"
import SearchSuggestions from "./SearchSuggestions";

export const LoadingCircle = () => {
    return (
        <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    )
}
const BAD_ARTICLE_THRESHOLD = 0.35;
const GOOD_ARTICLE_THRESHOLD = 0.65;
const COMPANY_INFO = "Something about company info";
const WATCHLIST_INFO = "Something about watchlist";
const STOCK_EVOLUTION_INFO = "Something about stock evolution";
const NEWS_ANALYSIS_INFO = "Something about news analysis";
const NEWS_ARTICLES_INFO = "Something about news articles"
const NOC_INFO = "Something about NOC"
const HOC_INFO = "Something about HOC"
const ERC_INFO = "Something about ERC"

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.triggerSearch = this.triggerSearch.bind(this);
        this.state = {
            showingTop: false,
            topStocks: null,
            isSearchingOnlyArticles: false,

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
            showingTop: false,
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
    searchOnlyArticles = () => {

    }

    onKeyDown = (e, input) => {
        if (input == null)
            input = this.state.searchInput;
        if (e.key === 'Enter') {
            if (this.state.isSearchingOnlyArticles) {
                this.searchOnlyArticles();
            } else {
                this.setState({ isLoaded: false, isLoading: true, showingTop: false })
                GET(`/analyze?stock=${input}&save=true`).then(response => {
                    this.showResults(response.data);
                    return ({
                        type: "SEARCH_RESULT",
                        payload: { searchResult: response.data }
                    });
                })
                    .catch(error => {
                        var errorMessage = "";
                        console.log(error.toString());
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
        for (i = 0; i < stockEvolution.pastEvolution.length - 1; ++i)
            result.push(stockEvolution.pastEvolution[i].toFixed(2));
        for (i = 0; i < stockEvolution.predictedEvolution.length; ++i)
            result.push(stockEvolution.predictedEvolution[i].toFixed(2))
        return result;
    }

    getLabelDays = (state) => this.state.stockEvolution.pastDays;

    getStockList = (type) => {
        this.setState({ isLoaded: false, isLoading: false })
        GET(`/${type}`).then(response => {
            this.setTopStocks(response.data, type);
            return ({
                type: "TOP_RESULT",
                payload: { topResult: response.data }
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

    setTopStocks = (data, type) => {
        if (this.state.showingTop == true) {
            const element = document.getElementById('top-stocks-list')
            element.classList.remove('animate-from-bottom');
            void element.offsetWidth;
            element.classList.add('animate-from-bottom');
        }
        var title = "";
        if (type === "popular" || type === "growing" || type === "decreasing")
            title = `Top ${type} stocks`
        if (type === "history" || type === "watchlist")
            title = `My ${type}`

        this.setState({
            topStocksTitle: title,
            showingTop: true,
            hasError: false,
            isLoading: false,
            isLoaded: false,
            topStocks: data
        })
    }

    triggerSearch = (input) => {
        this.setState({ searchInput: input });
        this.onKeyDown({ key: "Enter" }, input);
    }

    getTopStocksBody = () => {
        let result = this.state.topStocks.map(element =>
            <tr key={element.stock.symbol}>
                <td id="company-name-cell" onClick={() => this.triggerSearch(element.stock.symbol)}>{element.stock.company}</td>
                <td>{element.stock.price}</td>
                <td>{element.stock.newsOptimismCoefficient.toFixed(2)}</td>
                <td>{element.stock.historyOptimismCoefficient.toFixed(2)}</td>
                <td>{element.stock.expertsRecommendationCoefficient.toFixed(2)}</td>
                <td>{element.stock.predictedChange.toFixed(2) > 0 ? `+${element.stock.predictedChange.toFixed(2)}` : element.stock.predictedChange.toFixed(2)}%</td>

            </tr>
        );
        return result;
    }

    showTopStocks = () => {
        if (this.state.topStocks.length > 0) {
            return (
                <table id="top-stocks-table">
                    <thead>
                        <tr id="top-stocks-head">
                            <th>Company</th>
                            <th>Price</th>
                            <th><div className="info-icon">News<div className="dropdown-content">
                                {NOC_INFO}</div>
                            </div></th>
                            <th><div className="info-icon">History<div className="dropdown-content">
                                {HOC_INFO}</div>
                            </div></th>
                            <th><div className="info-icon">Experts<div className="dropdown-content">
                                {ERC_INFO}</div>
                            </div></th>
                            <th>Prediction</th>
                        </tr>
                    </thead>
                    <tbody id="top-stocks-body">
                        {this.getTopStocksBody()}
                    </tbody>
                </table >

            );
        } else {
            return (<div id="not-found">
                <div id="not-found-image"><FontAwesomeIcon icon={faSearchMinus} /></div>
                <div id="not-found-text">It looks like there is nothing to be seen here...</div>
            </div>);
        }

    }

    goHome = () => {
        this.setState({
            showingTop: false,
            hasError: false,
            isLoading: false,
            isLoaded: false,
        });
    }

    addStockToWatchlist = () => {
        GET(`/watchlist/add?stock=${this.state.companySymbol}`).then(response => {
            return ({
                type: "ADD_TO_WATCHLIST",
                payload: { topResult: response.data }
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

    onChangeSearchingOnlyArticles = (value) => this.setState({ isSearchingOnlyArticles: document.getElementById("slider-input").checked })

    render() {
        return (
            <React.Fragment>
                <div id="content">
                    <div id="title" onClick={() => this.goHome()}>
                        WISE
                    </div>
                    <div id="nav-bar">
                        <div id="top-popular" onClick={() => this.getStockList('popular')} ><FontAwesomeIcon icon={faFire} /> Popular stocks
                        </div>
                        <div id="top-growing" onClick={() => this.getStockList('growing')}><FontAwesomeIcon icon={faAngleDoubleUp} /> Growing stocks
                        </div>
                        <div id="top-decreasing" onClick={() => this.getStockList('decreasing')}><FontAwesomeIcon icon={faAngleDoubleDown} /> Decreasing stocks
                        </div>
                    </div>
                    <div id="main-container">
                        <div id="search-container">
                            <SearchSuggestions onKeyDown={this.onKeyDown} onChange={this.onChange} />

                            <input placeholder="Search" id="search-input" onKeyDown={this.onKeyDown} onChange={this.onChange} type="text" spellCheck="false" autoFocus>
                            </input>
                            <div id="slider-container">
                                <span id="slider-text">Search only news? </span>
                                <label class="switch">
                                    <input id="slider-input" onChange={this.onChangeSearchingOnlyArticles} type="checkbox"></input>
                                    <span class="slider round"></span>
                                </label>
                            </div>

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
                                    <div id="card-header">
                                        <div id="card-title">Company info
                                    <p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {COMPANY_INFO}</div>
                                            </p>
                                        </div>
                                        <div id="card-watchlist" > <div id="watchlist-text" onClick={() => this.addStockToWatchlist()}>Add to watchlist</div> <p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                            {WATCHLIST_INFO}</div>
                                        </p></div>
                                    </div>

                                    <div id="inside-container">
                                        <div id="company-flex-container">
                                            <div id="company-info">{this.state.companyName} ({this.state.companySymbol})</div>
                                            <div id="price">Price: {this.state.price} USD</div>
                                            <div id="NOC">
                                                <p className="info-icon">News coefficient<div className="dropdown-content">
                                                    {NOC_INFO}</div>
                                                </p>: {this.state.NOC}</div>
                                            <div id="HOC"><p className="info-icon">History coefficient<div className="dropdown-content">
                                                {HOC_INFO}</div>
                                            </p>: {this.state.HOC}</div>
                                            <div id="ERC"><p className="info-icon">Experts coefficient<div className="dropdown-content">
                                                {ERC_INFO}</div>
                                            </p>: {this.state.ERC}</div>
                                            <div id="predicted-change">
                                                Final predicted change: {this.state.predictedChange > 0 ? `+${this.state.predictedChange}` : this.state.predictedChange}%
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
                                    <div id="card-title">Stock evolution<p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                        {STOCK_EVOLUTION_INFO}</div>
                                    </p></div>
                                    <LineGraph input={this.getHistoryPredictionData(this.state)} labels={this.getLabelDays(this.state)}></LineGraph>
                                </div>
                                <div className="info-card" id="graph-container">
                                    <div id="card-title">News analysis<p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                        {NEWS_ANALYSIS_INFO}</div>
                                    </p></div>
                                    <CircleGraph input={this.getArticlesOptimismData(this.state)}></CircleGraph>
                                </div>
                                <div id="articles-subtitle">Some news about this company<p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                    {NEWS_ARTICLES_INFO}</div>
                                </p></div><div></div>
                                {this.showArticles()}
                            </div>
                        }


                        {this.state.showingTop &&
                            <React.Fragment>
                                <p id="top-stocks-title">{this.state.topStocksTitle}</p>
                                <div id="top-stocks-list" className="animate-from-bottom">
                                    {this.showTopStocks()}
                                </div>
                            </React.Fragment>}

                    </div>

                    <div id="footer">
                        <div onClick={() => this.getStockList('history')} ><FontAwesomeIcon icon={faHistory} /> My history
                        </div>
                        <div onClick={() => this.getStockList('watchlist')}><FontAwesomeIcon icon={faStar} /> My watchlist
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }


}
import React from "react"
import { GET, SEARCH, POST } from '../../actions/Actions';
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
const ARTICLE_RESULT_BEGINNING = "The analysis result of this article is "
const ARTICLE_RESULT_ENDING = "\nThe closer to 1 the value is, the more positive is the article."
const HISTORY_PREFIX = 'HIST-';
const WATCHLIST_PREFIX = 'WTLS-';

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.triggerSearch = this.triggerSearch.bind(this);
        this.suggestionsComponent = React.createRef();
        this.state = {
            showingTop: false,
            topStocks: null,
            isSearchingOnlyArticles: false,
            isDisplayingOnlyArticles: false,

            hasError: false,
            searchInput: "",
            investitionInput: 100,
            investitionResult: 0,
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

    componentDidMount = () => {
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
        if (article === null || article === undefined || article.title === null || article.title === undefined)
            return true;
        if (array.length === 0)
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

    insertGoodArticles = (articles, noOfArticles, prioritizeArticlesWithBody) => {
        var result = [];
        var i, j;
        for (i = 0; i < noOfArticles; ++i) {
            for (j = 0; j < articles.length; ++j) {
                if (articles[j].sentimentAnalysis > GOOD_ARTICLE_THRESHOLD && (prioritizeArticlesWithBody === true ? articles[j].body != null : true)
                    && !this.doesArrayContainArticle(result, articles[j])
                    && (prioritizeArticlesWithBody === true ? true : ((articles[j].title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase())
                        || articles[j].title.toLowerCase().includes(this.state.companySymbol.toLowerCase()))))
                ) {
                    result.push(articles[j]);
                    break;
                }
            }
        }

        if (result.length < noOfArticles) {
            result.push(...this.insertGoodArticles(articles, noOfArticles, false));
            return result.slice(0, noOfArticles);
        }
        return result;
    }

    insertBadArticles = (articles, noOfArticles, prioritizeArticlesWithBody) => {
        var result = [];
        var i, j;
        for (i = 0; i < noOfArticles; ++i) {
            for (j = 0; j < articles.length; ++j) {
                if (articles[j].sentimentAnalysis < BAD_ARTICLE_THRESHOLD && (prioritizeArticlesWithBody === true ? articles[j].body != null : true)
                    && !this.doesArrayContainArticle(result, articles[j])
                    && (prioritizeArticlesWithBody === true ? true : ((articles[j].title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase())
                        || articles[j].title.toLowerCase().includes(this.state.companySymbol.toLowerCase()))))
                ) {
                    result.push(articles[j]);
                    break;
                }
            }
        }
        if (result.length < noOfArticles) {
            result.push(...this.insertBadArticles(articles, noOfArticles, false));
            return result.slice(0, noOfArticles);
        }
        return result;
    }

    insertRelevantArticles = (articles, noOfArticles) => {
        var result = [...articles];

        result.sort((art1, art2) => {
            if (art1.body == null)
                return 1;
            if (art2.body == null)
                return -1;
            if (art1.lastUpdated < art2.lastUpdated)
                return 1;
            if (art1.body.length > art2.body.length)
                return 1
            return 1;
        });
        return result.slice(0, Math.min(noOfArticles, articles.length));
    }

    getFormattedLastUpdated = (article) => {
        if (article.lastUpdated > 24)
            return `${Math.round(article.lastUpdated / 24)}d ago`;
        else
            return `${Math.round(article.lastUpdated)}h ago`;
    }

    showArticles = (isShowingWithBody = false, noOfArticles = 4) => {
        var articles = this.state.articles;
        var articlesToShow = [];

        if (!isShowingWithBody) {
            if (this.state.isLoaded === true) {
                this.insertGoodArticles(articles, noOfArticles / 2, true).forEach(article => articlesToShow.push(
                    <div className="info-card article-card">
                        <a href={article.link}> <div id="article-title">{article.title}</div></a>
                        <div id="article-body">{article.body}</div>
                        <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                    </div>
                ));
                this.insertBadArticles(articles, noOfArticles / 2, true).forEach(article => articlesToShow.push(
                    <div className="info-card article-card">
                        <a href={article.link}> <div id="article-title">{article.title}</div></a>
                        <div id="article-body">{article.body}</div>
                        <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                    </div>
                ));

            }
        } else {
            if (this.state.isLoaded === true) {
                this.insertRelevantArticles(articles, noOfArticles).forEach(article => articlesToShow.push(
                    <div className="info-card article-card">
                        <a href={article.link}> <div id="article-title">{article.title}</div></a>
                        <div id="article-body">{article.body}</div>
                        <div id="article-footer">
                            <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                            <div id="article-analysis">Analysis result <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                {ARTICLE_RESULT_BEGINNING + article.sentimentAnalysis.toFixed(2) + ARTICLE_RESULT_ENDING}</div>
                            </div></div>
                        </div>
                    </div>
                ));
            }
        }
        return (
            <React.Fragment>
                {articlesToShow}
            </React.Fragment>
        )
    }

    showResults = (data) => {
        var predictedChange = data.stock.predictedChange == null ? null : data.stock.predictedChange.toFixed(2);
        this.setState({
            hasError: false,
            isLoading: false,
            showingTop: false,
            isLoaded: true,
            companyName: data.stock.company,
            companySymbol: data.stock.symbol,
            stockLastUpdated: new Date(1000 * data.stock.lastUpdated),
            NOC: data.stock.newsOptimismCoefficient == null ? null : data.stock.newsOptimismCoefficient.toFixed(2),
            HOC: data.stock.historyOptimismCoefficient == null ? null : data.stock.historyOptimismCoefficient.toFixed(2),
            ERC: data.stock.expertsRecommendationCoefficient == null ? null : data.stock.expertsRecommendationCoefficient.toFixed(2),
            predictedChange: predictedChange,
            price: data.stock.price,
            articles: data.articles,
            stockEvolution: data.stockEvolution,
            investitionResult: (100 * (Math.pow(1 + predictedChange / 100, 30))).toFixed(2),
            isStockOnWatchlist: this.isStockOnWatchlist(data.stock.symbol)
        })
        // document.cookie="HIST-NVDA=2020-07-18T11:48:59.3568139; Max-Age=80000; Expires=Sun, 19-Jul-2020 07:02:19 GMT";

    }

    hideErrorMessage = (seconds) => {
        setTimeout(() =>
            this.setState({
                hasError: false,
                errorMessage: ""
            })
            , seconds * 1000);
    }
    searchOnlyArticles = (input) => {
        this.setState({ isLoaded: false, isLoading: true, showingTop: false, isDisplayingOnlyArticles: true });
        GET(`/analyze_articles?stock=${input}&save=true`).then(response => {
            this.showResults(response.data);
            this.addToLocalStorage(HISTORY_PREFIX + this.state.companySymbol, this.getDateWithDaysAhead(1).toUTCString());

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

    addToLocalStorage = (name, value) => {
        window.localStorage.setItem(name, value);
    }

    getDateWithDaysAhead = (noOfDays = 1) => {
        var date = new Date();
        date.setTime(date.getTime() + (noOfDays * 86400000));
        return date;
    }

    onKeyDown = (e, input) => {
        if (input == null)
            input = this.state.searchInput;
        if (e.key === 'Enter') {
            if (this.state.isSearchingOnlyArticles) {
                this.searchOnlyArticles(input);
            } else {
                this.setState({ isLoaded: false, isLoading: true, showingTop: false, isDisplayingOnlyArticles: false });
                GET(`/analyze?stock=${input}&save=true`).then(response => {
                    this.showResults(response.data);
                    this.addToLocalStorage(HISTORY_PREFIX + this.state.companySymbol, this.getDateWithDaysAhead(1).toUTCString());

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

        for (i = 0; i < sentimentAnalysisResults.length; i++) {
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

    buildBody = (type) => {
        var result = [];
        var prefix = type === 'history' ? 'HIST-' : 'WTLS-';
        for (var i = 0; i < localStorage.length; i++) {
            var name = localStorage.key(i);
            var date = localStorage.getItem(name);
            if (name.startsWith(prefix) && (Date.parse(date) - new Date()) > 0) {
                result.push({ symbol: name.substring(prefix.length), date: date });
            }
        }
        return { symbols: result };
    }
    getStockList = (type) => {
        this.setState({ isLoaded: false, isLoading: false })
        if (type === 'history' || type === 'watchlist') {
            POST(`/${type}`, this.buildBody(type)).then(response => {
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
        } else {
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
    }

    setTopStocks = (data, type) => {
        var stocks = data;
        if (this.state.showingTop === true) {
            const element = document.getElementById('top-stocks-list')
            element.classList.remove('animate-from-bottom');
            void element.offsetWidth;
            element.classList.add('animate-from-bottom');
        }
        var title = "";
        if (type === "popular" || type === "growing" || type === "decreasing")
            title = `Top ${type} stocks`
        if (type === "history" || type === "watchlist") {
            stocks = [];
            data.forEach(el => { stocks.push(el.stockAnalysis) });
            title = `My ${type}`
        }

        this.setState({
            topStocksTitle: title,
            showingTop: true,
            hasError: false,
            isLoading: false,
            isLoaded: false,
            topStocks: stocks
        });
    }

    triggerSearch = (symbol, company) => {
        this.setState({ searchInput: symbol });
        this.suggestionsComponent.current.setState({ value: company });
        this.onKeyDown({ key: "Enter" }, symbol);

    }

    getTopStocksByTimestampBody = () => {
        let result = this.state.topStocks.map(element =>
            <tr key={element.stock.symbol}>
                <td id="company-name-cell" onClick={() => this.triggerSearch(element.stock.symbol, element.stock.company)}>{element.stock.company}</td>
                <td>{element.stock.price}</td>
                <td>{element.stock.newsOptimismCoefficient.toFixed(2)}</td>
                <td>{element.stock.historyOptimismCoefficient.toFixed(2)}</td>
                <td>{element.stock.expertsRecommendationCoefficient.toFixed(2)}</td>
                <td>{element.stock.predictedChange.toFixed(2) > 0 ? `+${element.stock.predictedChange.toFixed(2)}` : element.stock.predictedChange.toFixed(2)}%</td>

            </tr>
        );
        return result;
    }

    getTopStocksBody = () => {
        let result = this.state.topStocks.map(element =>
            <tr key={element.stock.symbol}>
                <td id="company-name-cell" onClick={() => this.triggerSearch(element.stock.symbol, element.stock.company)}>{element.stock.company}</td>
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
        this.suggestionsComponent.current.setState({ value: "" });
        this.setState({
            searchInput: "",
            showingTop: false,
            hasError: false,
            isLoading: false,
            isLoaded: false,
        });
    }

    addStockToWatchlist = (symbol) => {
        this.addToLocalStorage(WATCHLIST_PREFIX + symbol, this.getDateWithDaysAhead(1).toUTCString());
        this.setState({ isStockOnWatchlist: true });
    }

    isStockOnWatchlist = (symbol) => window.localStorage.getItem(WATCHLIST_PREFIX + symbol) == null

    removeStockFromWatchlist = (symbol) => {
        window.localStorage.removeItem(WATCHLIST_PREFIX + symbol);
        this.setState({ isStockOnWatchlist: false });
    }

    getStockWatchlist = () => !this.state.isStockOnWatchlist ?
        (<div id="watchlist-text" onClick={() => this.removeStockFromWatchlist(this.state.companySymbol)}>Remove from watchlist</div>) : (<div id="watchlist-text" onClick={() => this.addStockToWatchlist(this.state.companySymbol)}>Add to watchlist</div>)

    onChangeSearchingOnlyArticles = (e) => this.setState({ isSearchingOnlyArticles: document.getElementById("toggle-input").checked })
    onChangeInvestitionInput = (e) => {
        this.setState({ investitionInput: e.target.value })
    }

    computeInvestitionOutput = (e) => {
        if (e.key === 'Enter' && this.state.investitionInput >= 0) {
            var rate = this.state.predictedChange;
            var capital = this.state.investitionInput;
            this.setState({ investitionResult: (capital * (Math.pow(1 + rate / 100, 30))).toFixed(2) })
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="content">
                    <div id="header">
                        <div id="title" onClick={() => this.goHome()} >
                            WISE
                    </div>
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
                            <SearchSuggestions onKeyDown={this.onKeyDown} onChange={this.onChange} ref={this.suggestionsComponent} />

                            <div id="toggle-container">
                                <span id="toggle-text">Search only news? </span>
                                <label className="switch">
                                    <input id="toggle-input" onChange={this.onChangeSearchingOnlyArticles} type="checkbox"></input>
                                    <span className="toggle round"></span>
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
                                    <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {COMPANY_INFO}</div>
                                            </div>
                                        </div>
                                        <div id="card-watchlist" > {this.state.isStockOnWatchlist ?
                                            <div id="watchlist-text" onClick={() => this.addStockToWatchlist(this.state.companySymbol)}>Add to watchlist</div> :
                                            <div id="watchlist-text" onClick={() => this.removeStockFromWatchlist(this.state.companySymbol)}>Remove from watchlist</div>
                                        }
                                            <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {WATCHLIST_INFO}</div>
                                            </div></div>
                                    </div>

                                    <div id="inside-container">
                                        <div id="company-flex-container">
                                            <div id="company-info">{this.state.companyName} ({this.state.companySymbol})</div>
                                            <div id="price">Price: {this.state.price} USD</div>
                                            {!this.state.isDisplayingOnlyArticles &&
                                                <React.Fragment>
                                                    <div id="NOC">
                                                        <div className="info-icon">News coefficient<div className="dropdown-content">
                                                            {NOC_INFO}</div>
                                                        </div>: {this.state.NOC}</div>
                                                    <div id="HOC"><div className="info-icon">History coefficient<div className="dropdown-content">
                                                        {HOC_INFO}</div>
                                                    </div>: {this.state.HOC}</div>
                                                    <div id="ERC"><div className="info-icon">Experts coefficient<div className="dropdown-content">
                                                        {ERC_INFO}</div>
                                                    </div>: {this.state.ERC}</div>
                                                    <div id="predicted-change">
                                                        Final predicted change: {this.state.predictedChange > 0 ? `+${this.state.predictedChange}` : this.state.predictedChange}%
                                                    </div>
                                                </React.Fragment>}
                                            {this.state.isDisplayingOnlyArticles &&
                                                <React.Fragment>
                                                    <div id="good-articles">
                                                        <div className="info-icon">No. of good articles<div className="dropdown-content">
                                                            {NOC_INFO}</div>
                                                        </div>: {this.getArticlesOptimismData(this.state)[2]}
                                                    </div>
                                                    <div id="neutral-articles">
                                                        <div className="info-icon">No. of neutral articles<div className="dropdown-content">
                                                            {NOC_INFO}</div>
                                                        </div>: {this.getArticlesOptimismData(this.state)[1]}
                                                    </div>
                                                    <div id="bad-articles">
                                                        <div className="info-icon">No. of bad articles<div className="dropdown-content">
                                                            {NOC_INFO}</div>
                                                        </div>: {this.getArticlesOptimismData(this.state)[0]}
                                                    </div>
                                                    <div id="NOC">
                                                        <div className="info-icon">News coefficient<div className="dropdown-content">
                                                            {NOC_INFO}</div>
                                                        </div>: {this.state.NOC}</div>
                                                </React.Fragment>
                                            }

                                        </div>
                                        <div id="coefficients">
                                            <div id="coefficients-graph">
                                                {!this.state.isDisplayingOnlyArticles &&
                                                    <OverralGraph input={this.getCoefficientsData(this.state)}></OverralGraph>
                                                }
                                                {this.state.isDisplayingOnlyArticles &&
                                                    <CircleGraph input={this.getArticlesOptimismData(this.state)} options={{
                                                        animation: { animateScale: true },
                                                        legend: {
                                                            position: 'right',
                                                            labels: {
                                                                fontColor: "rgba(255,255,255,0.8)",
                                                                boxWidth: 15
                                                            }
                                                        },
                                                        devicePixelRatio: 2
                                                    }}></CircleGraph>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                {!this.state.isDisplayingOnlyArticles &&
                                    <React.Fragment>
                                        <div className="info-card" id="investition-card">
                                            <div id="card-title">Invest simulation<div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {STOCK_EVOLUTION_INFO}</div>
                                            </div></div>
                                            <div id="investition-container">
                                                <div id="investition-input">If you invest today US$
                                                <input type="number" onChange={this.onChangeInvestitionInput} onKeyUp={this.computeInvestitionOutput} defaultValue="100"></input>
                                                </div>
                                                <div id="investition-output">
                                                    <span>You are going to have</span>
                                                    <span id="investition-result"> {this.state.investitionResult}$ </span>
                                                    <span>in 30 days.</span></div>
                                            </div>
                                        </div>
                                        <div className="info-card" id="graph-container">
                                            <div id="card-title">Stock evolution<div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {STOCK_EVOLUTION_INFO}</div>
                                            </div></div>
                                            <LineGraph input={this.getHistoryPredictionData(this.state)} labels={this.getLabelDays(this.state)}></LineGraph>
                                        </div>
                                        <div className="info-card" id="graph-container">
                                            <div id="card-title">News analysis<div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {NEWS_ANALYSIS_INFO}</div>
                                            </div></div>
                                            <CircleGraph input={this.getArticlesOptimismData(this.state)}></CircleGraph>
                                        </div>
                                    </React.Fragment>
                                }
                                <div id="articles-subtitle">Some news about this company<p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                    {NEWS_ARTICLES_INFO}</div>
                                </p></div><div></div>
                                {this.showArticles(this.state.isDisplayingOnlyArticles, this.state.isDisplayingOnlyArticles ? 50 : 4)}

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
                        <div id="my-history" onClick={() => this.getStockList('history')} ><FontAwesomeIcon icon={faHistory} /> My history
                        </div>
                        <div id="my-watchlist" onClick={() => this.getStockList('watchlist')}><FontAwesomeIcon icon={faStar} /> My watchlist
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }


}
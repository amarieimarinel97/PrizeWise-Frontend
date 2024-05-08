import React from "react"
import { GET, POST } from '../../actions/Actions';
import LineGraph from "../graph/LineGraph";
import SmallLineGraph from "../graph/SmallLineGraph";
import SmallGraph from "../graph/SmallGraph";
import CircleGraph from "../graph/CircleGraph";
import SmallCircleGraph from "../graph/SmallCircleGraph";
import OverralGraph from "../graph/OverralGraph";
import SmallOverralGraph from "../graph/SmallOverralGraph";
import { faSearchMinus, faHistory, faQuestionCircle, faAngleDoubleUp, faAngleDoubleDown, faFire, faStar, faChartPie, faNewspaper, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import stocks from "../../fixtures/stocks";
import { quantum } from 'ldrs'
// eslint-disable-next-line
import styles from "./styles.css"
import "../../../../styles/loading.css"
import SearchSuggestions from "./SearchSuggestions";


export const LoadingCircle = () => {
    quantum.register()

    return (
        <l-quantum
            size="60"
            speed="3"
            color="#ffffff77"
        ></l-quantum>
    )
}
const BAD_ARTICLE_THRESHOLD = 0.35;
const GOOD_ARTICLE_THRESHOLD = 0.65;
const DEFAULT_FEED_LIMIT = 4;
const COMPANY_INFO = "This is the company you searched for and our prediction for it. All coefficients are between 0(worst) - 10(best).";
const COMPANY_INFO_ARTICLES = "This is the company you searched for and the result of articles and news analysis.";

const WATCHLIST_INFO = "You can add companies to your watchlist to be up to date with their evolution.";
const PORTFOLIO_INFO = "You can add stocks to your portfolio to follow your investments.";
const STOCK_EVOLUTION_INFO = "This graph presents the predicted evolution based on the history and sector performance of the company.";
const NEWS_ANALYSIS_INFO = "This graph shows the breakdown of analysed articles based on their positivity.";
const NEWS_ARTICLES_INFO = "A sample of analysed articles is presented here."
const SOCIAL_POSTS_INFO = "A sample of analysed social media posts."
const NOC_INFO = "News coefficient is computed by analyzing news and articles about this company."
const HOC_INFO = "History coefficient is based on the past evolution and trends of this company's stock price."
const ERC_INFO = "Experts coefficient is computed by analyzing brokers and experts opinion on this company."
const ARTICLE_RESULT_BEGINNING = "The analysis result of this article is "
const POST_RESULT_BEGINNING = "The analysis result of this post is "
const ARTICLE_RESULT_ENDING = "\nThe closer to 1 the value is, the more positive is the article."
const GOOD_ARTICLES_INFO = 'Number of articles from this sample that are considered to be positive.';
const NEUTRAL_ARTICLES_INFO = 'Number of articles from this sample that are considered to be neutral.';
const BAD_ARTICLES_INFO = 'Number of articles from this sample that are considered to be negative.';

const EVOLUTION_CHART = "evolution";
const OVERALL_CHART = "overall";
const ARTICLES_CHART = "articles";
const SMALL_CHART_TYPES = [OVERALL_CHART, ARTICLES_CHART, EVOLUTION_CHART];

const HISTORY_PREFIX = 'HIST-';
const WATCHLIST_PREFIX = 'WTLS-';
const PORTFOLIO_PREFIX = 'PORT-';


export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);

        this.triggerSearch = this.triggerSearch.bind(this);
        this.suggestionsComponent = React.createRef();
        this.state = {
            showingMyFeed: false,
            showingTop: false,
            showingPortfolio: false,
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
            posts: [],

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


    insertGoodArticles = (articles, noOfArticles) => {
        return articles.filter(ar => ar.sentimentAnalysis > GOOD_ARTICLE_THRESHOLD).sort((a1, a2) => {
            if (a1.body == null && a2.body == null) {
                if (a1.title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase()))
                    return 1;
                if (a2.title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase()))
                    return -1;
            }
            if (a1.body == null) return 1;
            return -1;
        }).slice(0, noOfArticles);
    }


    insertPosts = (posts, count) => {
        return posts.slice(0, count);
    }

    insertBadArticles = (articles, noOfArticles) => {
        return articles.filter(ar => ar.sentimentAnalysis < BAD_ARTICLE_THRESHOLD).sort((a1, a2) => {
            if (a1.body == null && a2.body == null) {
                if (a1.title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase()))
                    return 1;
                if (a2.title.toLowerCase().includes(this.state.companyName.split(/[,. ]+/)[0].toLowerCase()))
                    return -1;
            }
            if (a1.body == null) return -1;
            return 1;
        }).slice(0, noOfArticles);
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

    showArticles = (isShowingWithBody = false, noOfArticles = 10) => {
        var articles = this.state.articles;
        var articlesToShow = [];

        if (!isShowingWithBody) {
            if (this.state.isLoaded === true) {
                this.insertGoodArticles(articles, noOfArticles / 2).forEach(article => articlesToShow.push(
                    <div className="info-card article-card">
                        <a href={article.link}> <div id="article-title">{article.title}</div></a>
                        <div id="article-body">{article.body}</div>
                        <div id="article-date">{this.getFormattedLastUpdated(article)}</div>
                    </div>
                ));
                this.insertBadArticles(articles, noOfArticles / 2).forEach(article => articlesToShow.push(
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


    showPosts = (displayBody = true, count = 20) => {
        var posts = this.state.posts;
        var postsToShow = [];

        if (!displayBody) {
            if (this.state.isLoaded === true) {
                this.insertPosts(posts, count).forEach(post => postsToShow.push(
                    <div className="info-card post-card">
                        <div id="post-title">{post.title}</div>
                        <div id="post-body">{post.body}</div>
                    </div>
                ));
            }
        } else {
            if (this.state.isLoaded === true) {
                this.insertPosts(posts, count).forEach(post => postsToShow.push(
                    <div className="info-card post-card">
                        <div id="post-title">{post.title}</div>
                        <div id="post-body">{post.body}</div>
                        <div id="post-footer">
                            <div id="post-analysis">Analysis result <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} />
                                <div className="dropdown-content">
                                    {POST_RESULT_BEGINNING + post.sentimentAnalysis.toFixed(2) + ARTICLE_RESULT_ENDING}</div>
                            </div></div>
                        </div>
                    </div>
                ));
            }
        }
        return (
            <React.Fragment>
                {postsToShow}
            </React.Fragment>
        )
    }


    showResults = (data) => {
        var predictedChange = data.stock.predictedChange == null ? null : data.stock.predictedChange.toFixed(2);
        console.log(data.posts);
        this.setState({
            hasError: false,
            isLoading: false,
            showingTop: false,
            showingMyFeed: false,
            showingPortfolio: false,
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
            posts: data.posts,
            stockEvolution: data.stockEvolution,
            investitionResult: (100 * (Math.pow(1 + predictedChange / 100, 30))).toFixed(2),
            isStockOnWatchlist: this.isStockOnWatchlist(data.stock.symbol),
            isStockInPortfolio: this.isStockInPortfolio(data.stock.symbol)
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
    searchOnlyArticles = (input) => {
        this.setState({ isLoaded: false, isLoading: true, showingTop: false, showingMyFeed: false, showingPortfolio: false, isDisplayingOnlyArticles: true });
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
                if (error.toString().toLowerCase().includes("bad gateway"))
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
        if (FORBIDDEN_CHARS.includes(e.key)) {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
            return;
        }

        if (input == null)
            input = this.state.searchInput;
        if (e.key === 'Enter') {
            const preexistingStock = stocks.find(element => element.name === input);
            if (preexistingStock !== undefined && 'symbol' in preexistingStock)
                input = preexistingStock.symbol;
            if (this.state.isSearchingOnlyArticles) {
                this.searchOnlyArticles(input);
            } else {
                this.setState({ isLoaded: false, isLoading: true, showingTop: false, showingMyFeed: false, showingPortfolio: false, isDisplayingOnlyArticles: false });
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
                        if (error.toString().toLowerCase().includes("bad gateway"))
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

    getHistoryPredictionData = (stockEvolution) => {
        var result = [];
        var i;
        for (i = 0; i < stockEvolution.pastEvolution.length - 1; ++i)
            result.push(stockEvolution.pastEvolution[i].toFixed(2));
        for (i = 0; i < stockEvolution.predictedEvolution.length; ++i)
            result.push(stockEvolution.predictedEvolution[i].toFixed(2))
        return result;
    }

    getLabelDays = (stockEvolution) => stockEvolution.pastDays;

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
        if (type === 'history' || type === 'watchlist') {
            this.setState({ isLoaded: false, showingTop: false, showingMyFeed: false, showingPortfolio: false, isLoading: true });
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


    getMyFeed = () => {

        this.setState({ isLoaded: false, showingTop: false, showingMyFeed: false, showingPortfolio: false, isLoading: true });

        POST(`/dashboard`, this.buildMyFeedRequest()).then(response => {
            this.initFeedData(response.data);
            return ({
                type: "FEED_RESULT",
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

    buildMyFeedRequest = () => {

        var timestamp = new Date();
        var watchList = [];
        var date, name, i;

        for (i = 0; i < localStorage.length; i++) {

            name = localStorage.key(i);
            date = localStorage.getItem(name);
            if (name.startsWith(WATCHLIST_PREFIX) && (Date.parse(date) - timestamp) > 0) {
                watchList.push(name.substring(WATCHLIST_PREFIX.length));
            }
        }

        var history = [];
        for (i = 0; i < localStorage.length; i++) {

            name = localStorage.key(i);
            date = localStorage.getItem(name);
            if (name.startsWith(HISTORY_PREFIX) && (Date.parse(date) - timestamp) > 0) {
                history.push(name.substring(HISTORY_PREFIX.length));
            }
        }

        var portfolio = [];
        for (i = 0; i < localStorage.length; i++) {

            name = localStorage.key(i);
            date = localStorage.getItem(name);
            if (name.startsWith(PORTFOLIO_PREFIX)) {
                var parts = name.split("-");
                portfolio.push(parts[1]);
            }
        }

        return { portfolio: portfolio, history: history, watchList: watchList };
    }

    initFeedData = (data) => {

        console.log("FEED_DATA");
        console.log(data);
        if (this.state.showingMyFeed === true) {
            const element = document.getElementById('top-stocks-list')
            element.classList.remove('animate-from-bottom');
            void element.offsetWidth;
            element.classList.add('animate-from-bottom');
        }

        this.setState({
            topStocksTitle: "My Feed",
            showingTop: false,
            showingMyFeed: true,
            feedData: data,
            showingPortfolio: false,
            hasError: false,
            isLoading: false,
            isLoaded: false,
        });
    }

    getFeedNews = (type, limit) => {
        var result = [];
        var content = this.state.feedData[type];
        console.log(content);

        content.slice(0, limit+2).forEach(
            article => {
                result.push(
                    <React.Fragment>
                        <div className="feed-card">
                            <div className="feed-article">
                                <div className="feed-article-title">{article.title}</div>
                                {type === "recentPosts" && <div className="feed-article-body">{article.body}</div>}

                            </div></div>

                    </React.Fragment>

                )
            }
        )
        return result;
    }


    getFeedContent = (type, limit) => {
        var result = [];
        var index = 0;
        var stocks = this.state.feedData[type];
        stocks.slice(0, limit).forEach(
            stock => {
                result.push(
                    <React.Fragment>
                        <div className="feed-card">
                            <div className="feed-card-header">
                                <div className="feed-card-details">
                                    <div className="feed-card-title" onClick={() => this.triggerSearch(stock.stock.symbol, stock.stock.company)}>
                                        {stock.stock.company}</div>
                                    <div className="feed-card-price">{stock.stock.price}$</div>
                                    <div className="feed-card-prediction">Prediction {stock.stock.predictedChange.toFixed(2) > 0 ? `+${stock.stock.predictedChange.toFixed(2)}` : stock.stock.predictedChange.toFixed(2)}%</div>
                                </div>

                                <div className="feed-card-graph">{this.getFeedCardGraph(SMALL_CHART_TYPES[(index++) % 3], stock)}</div>
                            </div>
                            Articles
                            <div className="feed-card-article">{stock.articles[0].title}</div>
                            <div className="feed-card-article">{stock.articles[1].title}</div>
                            Social
                            <div className="feed-card-post">{stock.posts[0].title}</div>
                            <div className="feed-card-post">{stock.posts[1].title}</div>
                        </div>

                    </React.Fragment>

                )
            }
        )
        return result;
    }

    getFeedCardGraph = (type, stock) => {
        if (type === EVOLUTION_CHART) {
            return (<SmallLineGraph input={this.getHistoryPredictionData(stock.stockEvolution)} labels={this.getLabelDays(stock.stockEvolution)}></SmallLineGraph>);
        }

        if (type === ARTICLES_CHART) {
            return (<SmallCircleGraph input={this.getArticlesOptimismData(stock)}></SmallCircleGraph>);
        }

        if (type === OVERALL_CHART) {
            return (<SmallOverralGraph input={[stock.stock.newsOptimismCoefficient.toFixed(2), stock.stock.expertsRecommendationCoefficient.toFixed(2), stock.stock.historyOptimismCoefficient.toFixed(2)]}></SmallOverralGraph>);
        }
    }

    showMyFeed = () => {

        return (<div id="feed-container">

            <div id="popular-container">
                <div className="feed-title">
                    Popular
                </div>
                {this.getFeedContent("popular", DEFAULT_FEED_LIMIT)}
            </div>

            <div id="history-container">
                <div className="feed-title">
                    History
                </div>
                {this.getFeedContent("history", DEFAULT_FEED_LIMIT)}
            </div>

            <div id="portfolio-container">
                <div className="feed-title">
                    Portfolio
                </div>
                {this.getFeedContent("portfolio", DEFAULT_FEED_LIMIT)}
            </div>

            <div id="watchlist-container">
                <div className="feed-title">
                    Watchlist
                </div>
                {this.getFeedContent("watchlist", DEFAULT_FEED_LIMIT)}
            </div>

            <div id="recent-articles-container">
                <div className="feed-title">
                    Recent articles
                </div>
                {this.getFeedNews("recentArticles", DEFAULT_FEED_LIMIT)}
            </div>

            <div id="recent-posts-container">
                <div className="feed-title">
                    Recent social posts
                </div>
                {this.getFeedNews("recentPosts", DEFAULT_FEED_LIMIT)}
            </div>

        </div>);
    }

    getPortfolioStocks = () => {

        this.setState({ isLoaded: false, showingTop: false, showingMyFeed: false, isLoading: true });

        POST(`/portfolio`, this.buildPortfolioBody()).then(response => {
            this.getPortfolioState(response.data);
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

    //  `PORT`-`SYMBOL`-`STOCK_VALUE`-`INVESTED_SUM` e.g. PORT-AMZN-145.5-10000
    buildPortfolioBody = () => {
        var result = [];
        var prefix = 'PORT-';
        for (var i = 0; i < localStorage.length; i++) {
            var name = localStorage.key(i);
            var date = localStorage.getItem(name);
            if (name.startsWith(prefix) && (Date.parse(date) - new Date()) > 0) {

                var parts = name.split("-");
                result.push({ symbol: parts[1], date: date });
            }
        }
        return { symbols: result };
    }

    getPortfolioState = (data) => {

        if (this.state.showingPortfolio === true) {
            const element = document.getElementById('portfolio-list')
            element.classList.remove('animate-from-bottom');
            void element.offsetWidth;
            element.classList.add('animate-from-bottom');
        }
        var title = "My portfolio";
        var stocks = data;

        this.setState({
            topStocksTitle: title,
            showingTop: false,
            showingMyFeed: false,
            showingPortfolio: true,
            hasError: false,
            isLoading: false,
            isLoaded: false,
            topStocks: stocks
        });
    }

    showPortfolio = () => {
        if (this.state.topStocks.length > 0) {
            return (
                <table id="portfolio-table">
                    <thead>
                        <tr id="portfolio-head">
                            <th>Company</th>
                            <th>Price</th>
                            <th><div className="info-icon">Bought
                            </div></th>
                            <th><div className="info-icon">Shares
                            </div></th>
                            <th><div className="info-icon">Prediction
                            </div></th>
                            <th>History</th>
                        </tr>
                    </thead>
                    <tbody id="portfolio-body">
                        {this.getPortfolioBody()}
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

    getPortfolioBody = () => {
        let result = this.state.topStocks.map(element =>
            <tr key={element.stockAnalysis.stock.symbol}>
                <td id="company-name-cell" onClick={() => this.triggerSearch(element.stockAnalysis.stock.symbol, element.stockAnalysis.stock.company)}>{element.stockAnalysis.stock.company}</td>
                <td>{element.stockAnalysis.stock.price}</td>
                <td>{element.stockAnalysis.stock.newsOptimismCoefficient.toFixed(2)}</td>
                <td>{element.stockAnalysis.stock.expertsRecommendationCoefficient.toFixed(2)}</td>
                <td>{element.stockAnalysis.stock.predictedChange.toFixed(2) > 0 ? `+${element.stockAnalysis.stock.predictedChange.toFixed(2)}` : element.stockAnalysis.stock.predictedChange.toFixed(2)}%</td>
                <td id="portfolio-history"><SmallGraph input={this.getHistoryPredictionData(element.stockAnalysis.stockEvolution)} labels={this.getLabelDays(element.stockAnalysis.stockEvolution)} ></SmallGraph></td>

            </tr>
        );
        return result;
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
            showingMyFeed: false,
            showingPortfolio: false,
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
            showingMyFeed: false,
            showingPortfolio: false,
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

    addStockToPortfolio = (symbol) => {
        var price = document.getElementById("portfolio-price-input").value;
        var money = document.getElementById("portfolio-money-input").value;
        this.addToLocalStorage(PORTFOLIO_PREFIX + symbol + "-" + price + "-" + money, this.getDateWithDaysAhead(1).toUTCString());
        document.getElementById("portfolio-dialog").style.display = "none";
        this.setState({ isStockInPortfolio: true });
    }

    computePortfolioDialog = () => {
        var price = document.getElementById("portfolio-price-input").value;
        var money = document.getElementById("portfolio-money-input").value;
        if (price > 0 && money > 0) {
            document.getElementById("portfolio-shares-result").innerHTML = (money / price).toFixed(2);
            document.getElementById("portfolio-prediction-result").innerHTML = parseFloat(money) + money * this.state.predictedChange / 100;
        }
    }

    displayPortfolioDialog = () => {
        document.getElementById("portfolio-dialog").style.display = "inline-block";
        this.computePortfolioDialog();
    }

    isStockInPortfolio = (symbol) => {
        for (let index = 0; index < window.localStorage.length; index++) {
            const key = localStorage.key(index);
            if (key.startsWith(PORTFOLIO_PREFIX + symbol)) {
                return true;
            }
        }
        return false;
    }

    removeStockFromPortfolio = (symbol) => {
        for (let index = 0; index < window.localStorage.length; index++) {
            const key = localStorage.key(index);
            if (key.startsWith(PORTFOLIO_PREFIX + symbol)) {
                window.localStorage.removeItem(key);
                this.setState({ isStockInPortfolio: false });
            }
        }
    }

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

    computePortfolioValue = (e) => {
        if (e.key === 'Enter') {
            this.computePortfolioDialog();
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
                        <div id="top-newsfeed" onClick={() => this.getMyFeed()} ><FontAwesomeIcon icon={faUser} />  My Feed
                        </div>
                        <div id="top-popular" onClick={() => this.getStockList('popular')} ><FontAwesomeIcon icon={faFire} />  Popular
                        </div>
                        <div id="top-growing" onClick={() => this.getStockList('growing')}><FontAwesomeIcon icon={faAngleDoubleUp} />   Gainers
                        </div>
                        <div id="top-decreasing" onClick={() => this.getStockList('decreasing')}><FontAwesomeIcon icon={faAngleDoubleDown} />   Slowers
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
                            <React.Fragment>
                                <div className="info-card" id="company-card">
                                    <div id="card-header">
                                        <div id="card-title">Company info
                                            <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {this.state.isDisplayingOnlyArticles ? COMPANY_INFO_ARTICLES : COMPANY_INFO}</div>
                                            </div>
                                        </div>
                                        <div id="card-watchlist" > {this.state.isStockOnWatchlist ?
                                            <div id="watchlist-text" onClick={() => this.addStockToWatchlist(this.state.companySymbol)}>Add to watchlist</div> :
                                            <div id="watchlist-text" onClick={() => this.removeStockFromWatchlist(this.state.companySymbol)}>Remove from watchlist</div>
                                        }
                                            <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {WATCHLIST_INFO}</div>
                                            </div></div>



                                        <div id="card-portfolio" > {!this.state.isStockInPortfolio ?
                                            <div id="portfolio-text" onClick={() => this.displayPortfolioDialog()}>Add to portfolio
                                                <div className="dropdown-content" id="portfolio-dialog">
                                                    <div id="portfolio-price">Price <input id="portfolio-price-input" type="number" onKeyUp={this.computePortfolioValue} defaultValue={this.state.price}></input></div>
                                                    <div id="portfolio-money">Money <input id="portfolio-money-input" type="number" onKeyUp={this.computePortfolioValue} defaultValue="1000"></input></div>
                                                    <div id="portfolio-shares">Shares <div id="portfolio-shares-result">8</div></div>
                                                    <div id="portfolio-prediction">Prediction <div id="portfolio-prediction-result">-20$</div></div>
                                                    <div id="portfolio-add-button" onClick={() => this.addStockToPortfolio(this.state.companySymbol)}>Submit</div>
                                                </div>
                                            </div> :
                                            <div id="portfolio-text" onClick={() => this.removeStockFromPortfolio(this.state.companySymbol)}>Remove from portfolio
                                            </div>
                                        }


                                            <div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                {PORTFOLIO_INFO}</div>
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
                                                            {GOOD_ARTICLES_INFO}</div>
                                                        </div>: {this.getArticlesOptimismData(this.state)[2]}
                                                    </div>
                                                    <div id="neutral-articles">
                                                        <div className="info-icon">No. of neutral articles<div className="dropdown-content">
                                                            {NEUTRAL_ARTICLES_INFO}</div>
                                                        </div>: {this.getArticlesOptimismData(this.state)[1]}
                                                    </div>
                                                    <div id="bad-articles">
                                                        <div className="info-icon">No. of bad articles<div className="dropdown-content">
                                                            {BAD_ARTICLES_INFO}</div>
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


                                <div id="result-container">

                                    {!this.state.isDisplayingOnlyArticles &&
                                        <React.Fragment>
                                            <div className="info-card" id="investition-card">
                                                <div id="card-title">Invest simulation<div className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                                    {STOCK_EVOLUTION_INFO}</div>
                                                </div></div>
                                                <div id="investition-container">
                                                    <div id="investition-input">If you invest today US$
                                                        <input type="number" onChange={this.onChangeInvestitionInput} onKeyUp={this.computeInvestitionOutput} defaultValue="100" max="9999999"></input>
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
                                                <LineGraph input={this.getHistoryPredictionData(this.state.stockEvolution)} labels={this.getLabelDays(this.state.stockEvolution)}></LineGraph>
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
                                    {this.showArticles(this.state.isDisplayingOnlyArticles, this.state.isDisplayingOnlyArticles ? 50 : 10)}

                                    <div id="posts-subtitle">Social media posts<p className="info-icon">&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} /> <div className="dropdown-content">
                                        {SOCIAL_POSTS_INFO}</div>
                                    </p></div><div></div>
                                    {this.showPosts(true, 20)}
                                </div>
                            </React.Fragment>
                        }


                        {this.state.showingTop &&
                            <React.Fragment>
                                <p id="top-stocks-title">{this.state.topStocksTitle}</p>
                                <div id="top-stocks-list" className="animate-from-bottom">
                                    {this.showTopStocks()}
                                </div>
                            </React.Fragment>}

                        {this.state.showingPortfolio &&
                            <React.Fragment>
                                <p id="portfolio-title">My portfolio</p>
                                <div id="portfolio-list" className="animate-from-bottom">
                                    {this.showPortfolio()}
                                </div>
                            </React.Fragment>}

                        {this.state.showingMyFeed &&
                            <React.Fragment>
                                <div id="feed-list" className="animate-from-bottom">
                                    {this.showMyFeed()}
                                </div>
                            </React.Fragment>}

                    </div>

                    <div id="footer">
                        <div id="my-history" onClick={() => this.getStockList('history')} ><FontAwesomeIcon icon={faHistory} /> History
                        </div>
                        <div id="my-watchlist" onClick={() => this.getStockList('watchlist')}><FontAwesomeIcon icon={faStar} /> Watchlist
                        </div>
                        <div id="my-portfolio" onClick={() => this.getPortfolioStocks()}><FontAwesomeIcon icon={faChartPie} /> Portfolio
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }


}

const FORBIDDEN_CHARS = ";'\"][{}|:\\/!@#$%^*()_+=`~"
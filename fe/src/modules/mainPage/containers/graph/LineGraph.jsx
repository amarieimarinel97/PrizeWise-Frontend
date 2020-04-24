import React from 'react';
import { Line } from 'react-chartjs-2';

const PREDICTED_DAYS_NO = 3;
const HISTORY_DAYS_NO = 9;

class LineGraph extends React.Component {
    constructor() {
        super();
        this.state = {
            options: null,
            labels: [],
            datasets: [
                {
                    label: 'History',
                    fill: true,
                    lineTension: 0,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDashOffset: 0.0,
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 5,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [],
                },
                {
                    label: 'Prediction',
                    fill: true,
                    lineTension: 0,
                    backgroundColor: 'rgba(192,75,192,0.4)',
                    borderColor: 'rgba(192,75,192,1)',
                    borderCapStyle: 'butt',
                    borderDashOffset: 0.0,
                    pointBorderColor: 'rgba(192,75,192,1)',
                    pointBackgroundColor: "#fff",
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(192,75,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 5,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [],
                }
            ]
        };
    }

    adjustYAxisWithPercentage = (data, percentage) => {
        var min = Math.min(...data);
        var max = Math.max(...data);
        var suggestedMin = min - percentage * (max - min);
        var suggestedMax = max + percentage * (max - min);
        return {
            yAxes: [{
                display: true,
                ticks: {
                    suggestedMin: suggestedMin,
                    suggestedMax: suggestedMax,
                    maxTicksLimit: 5
                },
                scaleLabel: {
                    display: false,
                    labelString: 'USD'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: 'Date'
                }
            }]
        }
    }
    
    componentDidMount = () => {

        var historyDataset = this.state.datasets[0];
        historyDataset.data = this.props.input.slice(0, HISTORY_DAYS_NO + 1);
        var predictedDataset = this.state.datasets[1];
        var arr = [];
        predictedDataset.data = this.props.input;
        this.setState({
            labels: this.getLabels(HISTORY_DAYS_NO, PREDICTED_DAYS_NO),
            datasets: [
                historyDataset,
                predictedDataset],
            options: { scales: this.adjustYAxisWithPercentage(predictedDataset.data, 0.1) }
        })
    }
    getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    getShortMonthName = (date) => date.toLocaleString('default', { month: 'long' }).substring(0, 3)


    //final result contains e.g [29 Mar, 30, 31, 1 Apr, 2 ...] with size of history + predicted +1 (pres day)    
    getLabels = (historyDays, predictedDays) => {
        var labelsNo = historyDays + predictedDays + 1;
        var result = [];
        var currentDate = new Date();
        var todayDate = currentDate.getDate();
        if (todayDate > labelsNo) {
            for (var i = todayDate - historyDays; i <= todayDate + predictedDays; ++i)
                if (i === todayDate - historyDays)
                    result.push(i + " " + this.getShortMonthName(currentDate));
                else
                    result.push(i + "")
            return result;
        }
        var lastMonthDays = this.getDaysInMonth(currentDate.getMonth() - 1, currentDate.getFullYear());

        var remainingLastMonthDays = (historyDays - todayDate);
        currentDate.setMonth(currentDate.getMonth() - 1);
        for (var i = lastMonthDays - remainingLastMonthDays; i <= lastMonthDays; ++i)
            if (i === remainingLastMonthDays)
                result.push(i + " " + this.getShortMonthName(currentDate));
            else
                result.push(i + "")

        currentDate.setMonth(currentDate.getMonth() + 1);
        for (var i = 1; i < labelsNo - remainingLastMonthDays; ++i)
            if (i === 1)
                result.push(i + " " + this.getShortMonthName(currentDate));
            else
                result.push(i + "")
        return result;
    }

    getRandomData(noOfElements) {
        var result = [];
        for (var i = 0; i < noOfElements; ++i)
            result.push(Math.random() * 20 + 200);
        return result;
    }


    render() {
        return <Line data={this.state} options={this.state.options} />
    }
}

export default LineGraph;
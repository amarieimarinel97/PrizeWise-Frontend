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
            labels: this.getBetterLabels(HISTORY_DAYS_NO, PREDICTED_DAYS_NO),
            datasets: [
                historyDataset,
                predictedDataset],
            options: { scales: this.adjustYAxisWithPercentage(predictedDataset.data, 0.1) }
        })
    }
    getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    getShortMonthName = (date) => date.toLocaleString('default', { month: 'long' }).substring(0, 3)


    getNextBussinesDay = (input) => {
        var date = new Date(input);
        date.setDate(new Date(date).getDate() + 1);
        while (!this.isBusinessDay(date)) 
            date.setDate(new Date(date).getDate() + 1);
        return date;
    }

    getBetterLabels = (historyDays, predictedDays) => {
        var pastDays = this.props.labels;
        var pastDaysNo = this.props.labels.length;
        var i;
        for (i = 0; i < pastDays.length; ++i)
            pastDays[i] = new Date(Date.parse(pastDays[i]));
        for (i = pastDaysNo; i < pastDaysNo + predictedDays; ++i)
            pastDays.push(this.getNextBussinesDay(pastDays[pastDays.length-1]))

        pastDays[0] = `${pastDays[0].getDate()} ${this.getShortMonthName(pastDays[0])}`;
        for(i=1;i<pastDays.length;++i)
            pastDays[i]=pastDays[i].getDate();
        return pastDays;
    }

    isBusinessDay = (date) => {
        if (date.getDay() == 0 || date.getDay() == 6)
            return false;
        return true;
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
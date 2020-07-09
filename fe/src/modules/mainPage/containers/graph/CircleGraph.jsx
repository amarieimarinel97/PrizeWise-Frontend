import React from 'react';
import { Doughnut } from 'react-chartjs-2';


export default class CricleGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                animation: { animateScale: true },
                legend: { position: 'left' }
            },
            labels: [
                'Bad',
                'Neutral',
                'Good'
            ],
            datasets: []
        }
    }

    componentWillMount = () => {
        var datasetFromProps = [{
            data: this.props.input,
            borderWidth: 0,
            backgroundColor: [
                'rgba(195,20,20,0.6)',
                'rgba(255,200,0,0.6)',
                'rgba(75,195,75,0.6)'

            ],
            hoverBackgroundColor: [
                'rgba(195,20,20,0.4)',
                'rgba(255,200,0,0.4)',
                'rgba(75,195,75,0.4)'
            ]
        }]
        this.setState({
            datasets: datasetFromProps,
            options: this.props.options != null ? this.props.options : this.state.options
        });
    }

    render = () => {
        return (
            <div>
                <Doughnut data={this.state} options={this.state.options} />
            </div>
        );
    }
}
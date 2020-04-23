import React from 'react';
import { Radar } from 'react-chartjs-2';


export default class OverralGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            labels: ['News', 'Experts', 'History'],
            datasets: []
            ,
            options: {
                legend: {
                    display: false
                },
                scale: {
                    ticks: {
                       beginAtZero: true,
                       max:10,
                       maxTicksLimit:3,
                    }
                }
            }
        }
    }

    componentDidMount = () => {
        var datasetFromProps = [
            {
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(240,240,240,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.props.input
            }
        ]
        this.setState(
            { datasets: datasetFromProps }
        )
    }


    render() {
        return (
            <div>
                <Radar data={this.state} options={this.state.options} />
            </div>
        );
    }
}
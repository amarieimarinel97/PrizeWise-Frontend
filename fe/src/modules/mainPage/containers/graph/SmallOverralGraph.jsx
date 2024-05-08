import { plugins } from 'chart.js';
import React from 'react';
import { Polar } from 'react-chartjs-2';


export default class SmallOverralGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            labels: ['News', 'Experts', 'History'],
            datasets: [],

            options: {
                devicePixelRatio: 2,
                legend: {
                    display: false,
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                    fontColor:'#fff',

                    }
                },
                scale: {
                    ticks: {
                        backdropColor: 'rgba(0,0,0,0)',
                        fontColor:'rgba(50,50,50,0.4)',
                        beginAtZero: true,
                        max: 10,
                        maxTicksLimit: 3,
                    },
                    gridLines: {
                        color: 'rgba(50,50,50,0.4)',
                      },
                }
                
            }
        }
    }

    componentDidMount = () => {
        var datasetFromProps = [
            {
                backgroundColor: [
                    '#E27D60',
                    '#85DCBA',
                    '#C38D9E'
                ],
                borderColor: 'rgba(240,240,240,0)',
                pointBackgroundColor: 'rgba(179,181,198,0.4)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,0.4)',
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
                <Polar data={this.state} options={this.state.options} />
            </div>
        );
    }
}
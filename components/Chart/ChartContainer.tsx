import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import Web3 from 'web3';
import { useData } from '../../contexts/DataContext';

// Dynamically import Plotly with no SSR
const Plotly = dynamic(() => import('plotly.js-dist-min') as any, { ssr: false });

interface Props {
  questionId: string;
}

interface ChartData {
  time: Date[];
  amount: number[];
}

const ChartContainer: React.FC<Props> = ({ questionId }) => {
  const { polymarket } = useData();

  const fetchGraphData = async () => {
    const data = await polymarket.methods.getGraphData(questionId).call();
    const yesData: ChartData = { time: [], amount: [] };
    const noData: ChartData = { time: [], amount: [] };

    data["0"].forEach((item: any) => {
      const sum = yesData.amount.reduce((a, b) => a + b, 0);
      yesData.amount.push(sum + parseFloat(Web3.utils.fromWei(item[1], "ether")));
      yesData.time.push(new Date(parseInt(item[2] + "000")));
    });

    data["1"].forEach((item: any) => {
      const sum = noData.amount.reduce((a, b) => a + b, 0);
      noData.amount.push(sum + parseFloat(Web3.utils.fromWei(item[1], "ether")));
      noData.time.push(new Date(parseInt(item[2] + "000")));
    });

    const yes = {
      x: yesData.time,
      y: yesData.amount,
      mode: "lines+markers",
      name: "Yes",
    };

    const no = {
      x: noData.time,
      y: noData.amount,
      mode: "lines+markers",
      name: "No",
    };

    const chartData = [yes, no];
    const layout = {
      title: "YES / NO Graph",
    };

    // Type assertion for `newPlot`
    (Plotly as any).newPlot("myDiv", chartData, layout, { displayModeBar: false });
  };

  useEffect(() => {
    fetchGraphData();
  }, [questionId]);

  return <div id="myDiv" style={{ width: '100%', height: '100%' }} />;
};

export default ChartContainer;

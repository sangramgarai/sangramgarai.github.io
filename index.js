
var fetchedData = {
    crop : "Rice",
    state : "west Bengal",
    prices: {
        'January': 65,
        'February': 59,
        'March': 80,
        'April' : 81,
        'May': 56,
        'June': 55,
        'June': 44,
        'June': 40,
    }
}

const fetchCropData = () => {
    //fetch data from server
}
const SubmitCropData = () => {
    //submit data to server
}

let labels = Object.keys(fetchedData.prices)
const data = {
    labels: labels,
    datasets: [{
        label: fetchedData.crop + ", " + fetchedData.state,
        data: Object.values(fetchedData.prices),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};
const config = {
    type: 'line',
    data: data,
  };

const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
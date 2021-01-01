function bubble() {
  const data = d3.range(60).reverse();

for (let i = data.length; i; i--) {
  let j = Math.floor(Math.random() * i);
  [data[i - 1], data[j]] = [data[j], data[i - 1]];
}

let position = 0;
let pass = 0;

function iterate() {
  if (position === data.length - 1 - pass) {
    position = 0;
    pass++;
  }
  
  if (pass >= data.length - 1) {
    return;
  }
  
  if (data[position] > data[position + 1]) {
    [data[position], data[position + 1]] = [data[position + 1], data[position]];
  }
  
  position++;
}

// const svg = d3.select('svg');
const svg = d3.select("[id='bubble']");
const width = svg.attr('width');
const height = svg.attr('height');

const xScale = d3.scaleBand()
  .domain(d3.range(data.length))
  .rangeRound([50, width - 5])
  .paddingInner(0.5);

const yScale = d3.scaleLinear()
  .domain(d3.extent(data))
  .range([30, height - 30]);

svg.selectAll('rect')
  .data(data, (d) => d)
  .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(i))
    .attr('y', (d) => height - 10 - yScale(d))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => yScale(d));

setInterval(function () {
  iterate();

  svg.selectAll('rect')
    .data(data, (d) => d)
    .classed('active', (d, i) => i === position || i + 1 === position)
    .classed('completed', (d, i) => i >= data.length - pass)
    .transition()
    .duration(100)
    .attr('x', (d, i) => xScale(i));
}, 50);
}
function unshuffle() {
  let data = d3.range(60).reverse();

for (let di = data.length; di; di--) {
  let j = Math.floor(Math.random() * di);
  [data[di - 1], data[j]] = [data[j], data[di - 1]];
}

data = data.map((d) => [d]);

const data2 = [];

let pass = 0;
let n = 0;
let i = 0;
let j = 0;

function iterate() {
  if (Math.max(data.length, data2.length) === 1) {
    return;
  }

  const from = pass % 2 === 0 ? data : data2;
  const to = pass % 2 === 0 ? data2 : data;

  if (i === 0 && j === 0) {
    to.push([]);
  }
  
  const bucketA = from[n * 2];
  const bucketB = from[n * 2 + 1] || [];
  
  if (j >= bucketB.length || bucketA[i] < bucketB[j]) {
    to[to.length - 1].push(bucketA[i]);
    bucketA[i] = null;
    i++;
  } else {
    to[to.length - 1].push(bucketB[j]);
    bucketB[j] = null;
    j++;
  }
  
  if (i >= bucketA.length && j >= bucketB.length) {
    n++;
    
    if (n >= from.length / 2) {
      from.splice(0, from.length);
      pass++;
      n = 0;
    }

    i = j = 0;
  }
}

function flatten(ary) {
  return ary.reduce((newAry, item) => {
    return newAry.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

const svg = d3.select("[id='unshuffle']");
const width = svg.attr('width');
const height = svg.attr('height');

const xScale = d3.scaleBand()
  .domain(d3.range(data.length))
  .rangeRound([50, width - 5])
  .paddingInner(0.5);

const yScale = d3.scaleLinear()
  .domain(d3.extent(data, ([d]) => d))
  .range([30, height / 2 - 15]);

const displayAry = flatten(data).map((d, i) => ({ d, i, set: 0 }));

svg.selectAll('rect')
  .data(displayAry, ({ d }) => d)
  .enter()
    .append('rect')
    .attr('x', ({ i }) => xScale(i))
    .attr('y', ({ d, set }) => set === 0 ? height / 2 - yScale(d) - 1 : height / 2 + 1)
    .attr('width', xScale.bandwidth())
    .attr('height', ({ d }) => yScale(d));

setInterval(function () {
  iterate();
  
  const displayAry = flatten(data).map((d, i) => ({ d, i, set: 0 }))
    .concat(flatten(data2).map((d, i) => ({ d, i, set: 1 })))
    .filter(({ d }) => d !== null);

  svg.selectAll('rect')
    .data(displayAry, ({ d }) => d)
    .transition()
    .duration(100)
    .attr('class', pass === 5 ? 'completed' : '')
    .attr('x', ({ i }) => xScale(i))
    .attr('y', ({ d, set }) => set === 0 ? height / 2 - yScale(d) - 1 : height / 2 + 1)
}, 100);
}
// set the dimensions and margins of the graph
const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  };
  const width =
    window.innerWidth - margin.left - margin.right;
  const height =
    window.innerHeight - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  const svg = d3
    .select('#my_dataviz')
    .append('svg')
    .attr('width', width + margin.left + margin.right - 50)
    .attr('height', height + margin.top + margin.bottom - 50)
    .append('g')
    .attr(
      'transform',
      `translate(${margin.left},${margin.top})`,
    );
  
  // title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text('Average Math GPA of States over the Years');
  
  // Parse the Data
  d3.csv(
    'https://gist.githubusercontent.com/EricLYao/26deba1456c282ae284702c5c8e6293c/raw/16ebd89494e94577f63f0f8b10d6e58fbaf9d87c/satscores.csv',
  ).then((data) => {
    // Extract all unique state codes
    const stateCodes = Array.from(
      new Set(data.map((d) => d.StateCode)),
    );
  
    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.Year))
      .padding(0.1);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle');
  
    // Y axis
    const y = d3
      .scaleBand()
      .domain(stateCodes) // Include all unique state codes
      .range([0, height])
      .padding(0.1);
  
    svg.append('g').call(d3.axisLeft(y));
  
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, 4]);
  
    // Heatmap rectangles
    svg
      .selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.Year))
      .attr('y', (d) => y(d['StateCode']))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d) =>
        colorScale(+d.MathematicsAverageGPA),
      )
      .on('mouseover', function (d) {
        d3.select(this).style('opacity', 0.8);
        d3.select(this)
          .append('title')
          .text((d) => `${d.MathematicsAverageGPA}`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);
        d3.select(this).select('title').remove();
      });
  
    svg
      .append('g')
      .attr('class', 'legendSequential')
      .attr('transform', `translate(${width - 300}, -50)`);
  
    var legendSequential = d3
      .legendColor()
      .title('GPA')
      .cells(7)
      .shapeWidth(30)
      .orient('horizontal')
      .scale(colorScale);
  
    svg
      .select('.legendSequential')
      .call(legendSequential)
      .select('.legendTitle')
      .attr('x', 80);
  });
  
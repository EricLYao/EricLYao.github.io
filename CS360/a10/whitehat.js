// set the dimensions and margins of the graph
const margin2 = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  };
  const width2 =
    window.innerWidth - margin2.left - margin2.right;
  const height2 =
    window.innerHeight - margin2.top - margin2.bottom;
  
  // append the svg object to the body of the page
  const svg2 = d3
    .select('#whitehat')
    .append('svg')
    .attr('width', width2 + margin2.left + margin2.right - 50)
    .attr('height', height2 + margin2.top + margin2.bottom - 50)
    .append('g')
    .attr(
      'transform',
      `translate(${margin2.left},${margin2.top})`,
    );
  
  // title
  svg2
    .append('text')
    .attr('x', width2 / 2)
    .attr('y', -margin2.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text('Average Math GPA of States over the Years (White Hat)');

  svg2
    .append('text')
    .attr('x', width2 / 2)
    .attr('y', -margin2.top / 2 + 25) 
    .attr('text-anchor', 'middle')
    .style('font-size', '14px') 
    .text('Data found at: https://corgis-edu.github.io/corgis/csv/school_scores/');
  
  // Parse the Data
  d3.csv(
    'https://gist.githubusercontent.com/EricLYao/26deba1456c282ae284702c5c8e6293c/raw/16ebd89494e94577f63f0f8b10d6e58fbaf9d87c/satscores.csv',
  ).then((data2) => {
    const states2 = ['CA', 'FL', 'TX', 'NY'];
    const filteredData2 = data2.filter((d) =>
      ['CA', 'FL', 'TX', 'NY'].includes(d.StateCode),
    );
  
    // X axis
    const x2 = d3
      .scaleBand()
      .range([0, width2])
      .domain(data2.map((d) => d.Year))
      .padding(0.1);
    svg2
      .append('g')
      .attr('transform', `translate(0,${height2})`)
      .call(d3.axisBottom(x2))
      .selectAll('text')
      .style('text-anchor', 'middle');
  
    // x label
    svg2
      .append('text')
      .attr(
        'transform',
        `translate(${width2 / 2},${height2 + 50})`,
      )
      .style('text-anchor', 'middle')
      .text('Years');
  
    // Y axis
    const y2 = d3
      .scaleBand()
      .domain(states2)
      .range([0, height2])
      .padding(0.1);
  
    svg2.append('g').call(d3.axisLeft(y2));
  
    // y label
    svg2
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height2 / 2)
      .style('text-anchor', 'middle')
      .text('States');
  
    const colorScale2 = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([
        d3.min(
          filteredData2,
          (d) => +d.MathematicsAverageGPA,
        ) - 0.05,
        d3.max(
          filteredData2,
          (d) => +d.MathematicsAverageGPA,
        ) + 0.05,
      ]);
  
    // Heatmap rectangles
    svg2
      .selectAll()
      .data(filteredData2)
      .enter()
      .append('rect')
      .attr('x', (d) => x2(d.Year))
      .attr('y', (d) => y2(d['StateCode']))
      .attr('width', x2.bandwidth())
      .attr('height', y2.bandwidth())
      .style('fill', (d) =>
        colorScale2(+d.MathematicsAverageGPA),
      )
      .on('mouseover', function (d) {
        d3.select(this).style('opacity', 0.8); // Example: reduce opacity on hover
        // Show tooltip or additional information
        d3.select(this)
          .append('title')
          .text(
            (d) =>
              `${d['StateCode']} Average GPA in ${d.Year}: ${d.MathematicsAverageGPA}`,
          );
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1); // Example: restore opacity on mouseout
        // Hide tooltip or additional information
        d3.select(this).select('title').remove();
      });
  
    svg2
      .append('g')
      .attr('class', 'legendSequential')
      .attr('transform', `translate(${width2 - 300}, -50)`);
  
    var legendSequential2 = d3
      .legendColor()
      .title('GPA')
      .cells(7)
      .shapeWidth(30)
      .orient('horizontal')
      .cellFilter(function (d) {
        return d.label !== '2.9';
      })
      .scale(colorScale2);
  
    svg2
      .select('.legendSequential')
      .call(legendSequential2)
      .select('.legendTitle') // Select the title element within the legend
      .attr('x', 80);
  });

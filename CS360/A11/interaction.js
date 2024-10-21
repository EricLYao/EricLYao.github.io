// Define the CSS styles
var styles = `
  <style>
    .axis--x path {
      display: none;
    }

    .line {
      fill: none;
      stroke-width: 1.5px;
    }
  </style>
`;

// Append the styles to the document head
document.head.insertAdjacentHTML('beforeend', styles);

function A11interactiveLineChart() {
  var A11svg = d3.select('#A11interaction') 
    .append('svg')
    .attr('width', 960)
    .attr('height', 500),
    A11margin = {
      top: 20,
      right: 80,
      bottom: 30,
      left: 50,
    },
    A11width = A11svg.attr('width') - A11margin.left - A11margin.right,
    A11height = A11svg.attr('height') - A11margin.top - A11margin.bottom,
    A11g = A11svg
      .append('g')
      .attr(
        'transform',
        'translate(' +
          A11margin.left +
          ',' +
          A11margin.top +
          ')',
      );

  var A11parseTime = d3.timeParse('%Y%m%d');

  var A11x = d3
      .scaleTime()
      .range([0, A11width - A11margin.right]),
    A11y = d3.scaleLinear().range([A11height, 0]),
    A11z = d3.scaleOrdinal(d3.schemeCategory10);

  const A11makeLine = (xScale) =>
    d3
      .line()
      .curve(d3.curveBasis)
      .x(function (d) {
        return xScale(d.date);
      })
      .y(function (d) {
        return A11y(d.temperature);
      });

  var A11line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function (d) {
      return A11x(d.date);
    })
    .y(function (d) {
      return A11y(d.temperature);
    });

  d3.tsv('./A11/data.tsv', function (d) {
    return d;
  }).then(function (data) {
    let columns = ['date', 'New York', 'San Francisco', 'Austin'];
    for (d of data) {
      d.date = A11parseTime(d.date);
      for (var i = 1, n = columns.length, c; i < n; ++i)
        d[(c = columns[i])] = +d[c];
    }

    var A11cities = data.columns
      .slice(1)
      .map(function (id) {
        return {
          id: id,
          values: data.map(function (d) {
            return { date: d.date, temperature: d[id] };
          }),
        };
      });

    A11x.domain(
      d3.extent(data, function (d) {
        return d.date;
      }),
    );

    A11y.domain([
      d3.min(A11cities, function (c) {
        return d3.min(c.values, function (d) {
          return d.temperature;
        });
      }),
      d3.max(A11cities, function (c) {
        return d3.max(c.values, function (d) {
          return d.temperature;
        });
      }),
    ]);

    A11z.domain(
      A11cities.map(function (c) {
        return c.id;
      }),
    );

    const A11x_axis = A11g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('id', 'A11x_axis')
      .attr('transform', 'translate(0,' + A11height + ')')
      .call(d3.axisBottom(A11x));

    A11g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(A11y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', '#000')
      .text('Temperature, ºF');

    var A11city = A11g
      .selectAll('.A11city')
      .data(A11cities)
      .enter()
      .append('svg')
      .attr('class', 'A11city')
      .attr('width', A11width - A11margin.right);

    function A11hover(elem) {
      var id = elem.id.substring(0, 3).toUpperCase();
      var path = A11city.select('#' + id);
      if (path.attr('visibility') == 'hidden') {
        return;
      }
      A11city.selectAll('.line').style('stroke', '#ccc');
      path.style('stroke', function (d) {
        return A11z(d.id);
      });
    }

    function A11exit() {
      A11city.selectAll('.line').style('stroke', (d) => A11z(d.id));
    }

    function A11click(elem) {
      let id = elem.id.substring(0, 3).toUpperCase();
      let path = A11city.select('#' + id);
      let isVisible = path.attr('visibility') === 'visible';

      path.attr('visibility', isVisible ? 'hidden' : 'visible');
    }

    const A11xAxis = (g, x) =>
      g
        .attr('transform', `translate(0,${A11height})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(A11width / 80)
            .tickSizeOuter(0),
        );

    function A11zoomed(event) {
      const newX = event.transform.rescaleX(A11x);
      A11x_axis.call(d3.axisBottom(newX));
      A11city.selectAll('.line').attr('d', function (d) {
        return A11makeLine(newX)(d.values);
      });
    }

    const A11zoom = d3
      .zoom()
      .scaleExtent([1, 5])
      .extent([
        [A11margin.left, 0],
        [A11width - A11margin.right, A11height],
      ])
      .translateExtent([
        [A11margin.left, -Infinity],
        [A11width - A11margin.right, Infinity],
      ])
      .on('zoom', A11zoomed);

    A11svg
      .call(A11zoom)
      .transition()
      .duration(100)
      .call(A11zoom.scaleTo, 1, [A11x(Date.UTC(2012, 1, 1)), 0]);

    A11city
      .append('path')
      .attr('class', 'line')
      .attr('d', function (d) {
        return A11line(d.values);
      })
      .attr('id', (d) => d.id.substring(0, 3).toUpperCase())
      .attr('data-id', (d) => d.id.substring(0, 3).toUpperCase())
      .attr('visibility', 'visible')
      .style('stroke', function (d) {
        return A11z(d.id);
      })
      .on('mouseout', A11exit);

    A11svg
      .selectAll('.label')
      .data(A11cities)
      .enter()
      .append('text')
      .datum(function (d) {
        return {
          id: d.id,
          value: d.values[d.values.length - 1],
        };
      })
      .attr('class', 'label')
      .attr('transform', function (d) {
        return (
          'translate(' +
          A11x(d.value.date) +
          ',' +
          A11y(d.value.temperature) +
          ')'
        );
      })
      .attr('x', 55)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .attr(
        'id',
        (d) => d.id.substring(0, 3).toUpperCase() + '_label',
      )
      .style('font', '10px sans-serif')
      .text(function (d) {
        return d.id;
      })
      .on('mouseover', function (d) {
        A11hover(this);
      })
      .on('mouseout', function (d) {
        A11exit();
      })
      .on('click', function (d) {
        A11click(this);
      });
  });
}

// Call the function to execute the chart creation
A11interactiveLineChart();

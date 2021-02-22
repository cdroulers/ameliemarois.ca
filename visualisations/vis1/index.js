d3.json("../../oeuvres.json").then(function (json) {
  main(d3, json, 500, 500, drag(d3), Promise.resolve());
});

// Present in HTML.
var dialog = d3.select("dialog");
registerHandlers();

var text = null;

function main(d3, data, width, height, drag, invalidation) {
  const root = d3.hierarchy(data);
  const links = root.links();
  const nodes = root.descendants();

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => {
          var sourceCount = d.source.children ? d.source.children.length : 0;
          var targetCount = d.target.children ? d.target.children.length : 0;
          //sourceCount += d.source.data.children ? d.source.data.children.length * 3 : 0;
          targetCount += d.target.data.children ? d.target.data.children.length * 10 : 0;
          if (d.source.data.children) {
            console.log(d.source.data, d.target.data);
          }
          var sourceSize = Math.sqrt(d.source.data.size) / 5 || 2;
          var targetSize = Math.sqrt(d.target.data.size) / 5 || 2;

          return 20 + sourceCount + targetCount + sourceSize + targetSize;
        })
        .strength(1.5)
    )
    .force("charge", d3.forceManyBody().strength(-50))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  const svg = d3.create("svg").attr("viewBox", [-width / 2, -height / 2, width, height]);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("fill", (d) => (d.children ? null : color(d.data)))
    .attr("stroke", (d) => (d.children ? null : color(d.data)))
    .attr("r", (d) => Math.sqrt(d.data.size) / 5 || 3)
    .call(drag(simulation));

  node.append("title").text((d) => d.data.titre);

  node.on("click", showImage).on("mouseover", showText).on("mouseout", hideText);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  invalidation.then(() => simulation.stop());

  text = svg.append("svg:text").attr("class", "hovertxt");
  document.body.appendChild(svg.node());
}

function showText(e, d) {
  text
    //.attr("transform", `translate(${d.x}, ${d.y - 5 - (d.children ? 3.5 : Math.sqrt(d.size) / 2)})`)
    .attr("transform", `translate(${d.x}, ${d.y - 5 - 3.5})`)
    .text(`${d.data.titre}`)
    .style("display", null);
}

function hideText() {
  text.style("display", "none");
}

function showImage(e, d) {
  dialog.attr("open", true);
  var d = d.data;
  var title = d.titre;
  if (d.year) {
    title += " (" + d.year + ")";
  }
  dialog.select("dialog h1 .title").html(title);
  var content = dialog.select("dialog .content").html("");
  if (d.img) {
    content.append("img").attr("src", d.img);
  }
}

function drag(d3) {
  return (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  };
}

function registerHandlers() {
  d3.select("dialog a.close").on("click", function (e) {
    e.preventDefault();
    dialog.attr("open", null);
  });
}

function color(d) {
  if (d.year == "1999") return "#926844";
  if (d.year == "2003") return "#6f5564";
  if (d.year == "2004") return "#3e5e6f";
  if (d.year == "2005") return "#2e7572";
  if (d.year == "2006") return "#4b624b";
  if (d.year == "2007") return "#8a8537";
  if (d.year == "2009") return "#5b7855";
  if (d.year == "2012") return "#4e4656";
  if (d.year == "2015") return "#167378";
  if (d.year == "2016") return "#62704d";
  if (d.year == "2017") return "#6d6942";
  if (d.year == "2018") return "#287558";
  if (d.year == "2019") return "#936957";
}

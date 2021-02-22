// Amelie Official Title: Reverse Engineer

d3.select(window).on("resize", main);

// no shringaling
function responsiveReposition() {
  let currentWidth =
    innerWidth / 1 || document.documentElement.clientWidth / 1 || document.body.clientWidth / 1;

  let currentHeight =
    innerHeight / 1 || document.documentElement.clientHeight / 1 || document.body.clientHeight / 1;

  let xOffset = -(startingWidth - currentWidth) / 2;
  let yOffset = -(startingHeight - currentHeight) / 2;

  d3.select("body")
    .select("g")
    .style("transform", `translate(${xOffset}px, ${yOffset}px) scale(${1})`); // this uses a "template" string
  d3.select("svg").attr("width", currentWidth).attr("height", currentHeight);
}

registerHandlers();
main();

function main() {
  let svgtest = d3.select("body").select("svg");
  if (!svgtest.empty()) {
    svgtest.remove();
  }

  let width =
    innerWidth / 1 || document.documentElement.clientWidth / 1 || document.body.clientWidth / 1;

  let height =
    innerHeight / 1 || document.documentElement.clientHeight / 1 || document.body.clientHeight / 1;

  let root;

  let canvas = d3
    .select("body")
    .append("svg")
    .attr("width", width - 10)
    .attr("height", height - 10)
    .append("g")
    .style("transform", "translate(0, 0)");

  let force = d3.layout
    .force()
    .size([width, height])
    .charge(function (d) {
      return d._children ? -d.size / 100 : -innerWidth / 5;
    })
    .linkDistance(function (d) {
      return d.target._children ? 80 : 25 || innerHeight;
    })
    .on("tick", tick);

  let link = canvas.selectAll(".link");
  let node = canvas.selectAll(".node");

  d3.json("../oeuvres.json", function (error, json) {
    if (error) throw error;
    root = json;
    update();
  });

  function update() {
    // flatten the root (put all the node objects into an array)
    let nodes = flatten(root);
    // console.log(nodes);
    // generate links between nodes
    let links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force.nodes(nodes).links(links).start();

    // Update the links
    link = link.data(links, (d) => d.target.id);

    // Exit any old links.
    link.exit().remove();

    // Enter any new links.
    link
      .enter()
      .insert("line", ".node")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    // Update the nodes
    node = node.data(nodes, (d) => d.id).style("fill", color);

    // Exit any old nodes.
    node.exit().remove();

    // Enter any new nodes.
    node
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => Math.sqrt(d.size) / 3 || 10)
      .attr("fill", color)
      .on("click", toggleChildren)
      .on("mouseover", showImage)
      .on("mouseout", hideImage)
      .call(force.drag);

    canvas.append("svg:image").attr("class", "hoverimg");
    canvas.append("svg:text").attr("class", "hovertxt");
  }

  function showImage(d) {
    d3.select("text")
      .attr(
        "transform",
        `translate(${d.x}, ${d.y - 5 - (d.children ? 3.5 : Math.sqrt(d.size) / 2)})`
      )
      .text(`${d.titre}`)
      .style("display", null);
    //  d3.select("image")
    //    .attr('transform', 'translate(' + d.x + ',' + (d.y - 5 - (d.children ? 3.5 : Math.sqrt(d.size) / 2)) + ')')
    //  .attr("xlink:href", d.img)
    //.style('display', null);
  }

  function hideImage() {
    d3.select("text").style("display", "none");
    //  d3.select("image").style('display', 'none');
  }

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  // Color leaf nodes orange, and packages white or blue.
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

  // Toggle children on click.
  function toggleChildren(d) {
    dialog.attr("open", true);
    var title = d.titre;
    if (d.year) {
      title += " (" + d.year + ")";
    }
    dialog.select("dialog h1 .title").html(title);
    var content = dialog.select("dialog .content").html("");
    if (d.img) {
      content.append("img").attr("src", d.img);
    }
    // if (d.children) {
    //  d._children = d.children;
    // d.children = null;
    //} else {
    //d.children = d._children;
    //d._children = null;
    //}
    //update();
  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    let nodes = [];
    let i = 0;

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      if (node.img) {
        node.img = "../" + node.img;
      }

      nodes.push(node);
    }

    recurse(root);
    return nodes;
  }
}

var dialog = d3.select("dialog");

function registerHandlers() {
  d3.select("dialog a.close").on("click", function (e) {
    d3.event.preventDefault();
    dialog.attr("open", null);
  });
}

var visualisationName = "vis1";

var scriptElement = document.createElement("script");
scriptElement.src = "visualisations/" + visualisationName + "/index.js";
scriptElement.async = true;
document.body.appendChild(scriptElement);

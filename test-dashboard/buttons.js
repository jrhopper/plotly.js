'use strict';

var scrapeSVG = require('../image_server/server_app/lib/scrape-svg');

var plotlist = document.getElementById('plot-list');
var anchor = document.getElementById('embedded-graph');
var image = document.getElementById('embedded-image');

var gd = null;

anchor.style.position = 'relative';
anchor.style.top = '80px';
anchor.style.height = '600px';
anchor.style.width = '1000px';

function plotButtons(plots, figDir) {

    Object.keys(plots).forEach( function (plotname) {

        var button = document.createElement('button');

        button.style.cssFloat = 'left';
        button.style.width = '100px';
        button.style.height = '40px';

        button.innerHTML = plotname;

        plotlist.appendChild(button);

        button.addEventListener('click', function () {

            var myImage = new Image();
            myImage.src = figDir + plotname + '.png';

            image.innerHTML = '';
            image.appendChild(myImage);


            anchor.innerHTML = '';

            gd = document.createElement('div');
            anchor.appendChild(gd);

            var plot = plots[plotname];
            Plotly.plot(gd, plot.data, plot.layout);


        });
    });

    var snapshot = document.createElement('button');

    snapshot.style.cssFloat = 'left';
    snapshot.style.width = '100px';
    snapshot.style.height = '40px';
    snapshot.style.marginLeft = '25px';
    snapshot.innerHTML = 'snapshot';
    snapshot.style.background = 'blue';

    plotlist.appendChild(snapshot);

    snapshot.addEventListener('click', function () {

        /*
         * Grab the currently loaded plot and make an image - replacing the plot.
         */
        if (!gd) return;

        var layout = gd.layout;
        var data = gd.data;

        if (!layout || !data) return;

        Plotly.Plots.getSubplotIds(gd._fullLayout, 'gl3d').forEach( function (key) {
            var scene = gd._fullLayout[key]._scene;
            scene.destroy();
        });

        // create a fresh gd
        anchor.innerHTML = '';
        gd = document.createElement('div');
        anchor.appendChild(gd);

        /*
         * Replot with staticPlot
         */
        Plotly.plot(gd, data, layout, {staticPlot: true, plot3dPixelRatio: 2}).then( function () {
            Plotly.Plots.getSubplotIds(gd._fullLayout, 'gl3d').forEach( function (key) {
                  var scene = gd._fullLayout[key]._scene;
                  var dataURL = scene.toImage();

                  var myImage = new Image();
                  myImage.src = dataURL;

                  myImage.onload = function () {
                      myImage.height = scene.container.clientHeight;
                      myImage.width = scene.container.clientWidth;
                  };

                  image.innerHTML = '';
                  image.appendChild(myImage);
              });
        })
    });

    var pummelButton = document.createElement('button');
    pummelButton.style.cssFloat = 'left';
    pummelButton.style.width = '100px';
    pummelButton.style.height = '40px';
    pummelButton.style.marginLeft = '25px';
    pummelButton.innerHTML = 'pummel3d';
    pummelButton.style.background = 'blue';
    plotlist.appendChild(pummelButton);

    var i = 0;
    var mock = require('./testplots/marker-color.json');
    var statusDiv = document.getElementById('status-info');

    pummelButton.addEventListener('click', function () {
        setInterval(function () {
            var plotDiv = document.createElement('div');
            window.plotDiv = plotDiv;

            plotDiv.id = 'div' + i;
            document.body.appendChild(plotDiv);

            Plotly.plot(plotDiv, mock.data, mock.layout, {staticPlot: true}).then(function () {

                Plotly.Plots.getSubplotIds(plotDiv._fullLayout, 'gl3d').forEach( function (key) {
                    var scene = plotDiv._fullLayout[key]._scene;
                    scene.destroy();
                    i ++;
                    statusDiv.innerHTML = 'Created ' + i + ' webgl contexts.';
                });

                document.body.removeChild(plotDiv);
            });

        }, 500);
    });

    var scrapeButton = document.createElement('button');
    scrapeButton.style.cssFloat = 'left';
    scrapeButton.style.width = '100px';
    scrapeButton.style.height = '40px';
    scrapeButton.style.marginLeft = '25px';
    scrapeButton.innerHTML = 'scrape SVG';
    scrapeButton.style.background = 'blue';
    plotlist.appendChild(scrapeButton);

    scrapeButton.addEventListener('click', function () {
        scrapeSVG(Tabs.get());
        return;
    });

}

module.exports = plotButtons;

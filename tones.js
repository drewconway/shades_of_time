// Javascript code for the Shades of TIME project
// Author: Drew Conway
// Date: April 20, 2012
// Copyright (c) 2012, under the Simplified BSD License.  
// For more information on FreeBSD see: http://www.opensource.org/licenses/bsd-license.php
// All rights reserved.

// Set up global variables
var chart_width = 760,
    chart_height = 75000,
    margin = 50,
    p = [20, 15, 100, 4],
    cover_width = 400,
    cover_height = 527,
    
    // Our data are dates, so we need to be able to parse date strings
    parse = d3.time.format('%Y-%m-%d').parse,
    format = d3.time.format('%Y-%m-%d'),
    year_format = d3.time.format('%Y'),
    
    // The scales for the horizontol histogram, so axes are reversed from \
    // usual x- and y-axis construction
    x = d3.scale.linear().range([0, chart_width - p[2]]),
    y = d3.time.scale().rangeRound([p[0], chart_height - p[0]]),
    decades = ['1930', '1940','1950','1960','1970','1980','1990','2000','2010'],
    years = d3.range(0,11)
    
    // Add the base SVG for the histogram in the left panel
    chart = d3.select("#chart")
    .append('svg:svg')
    .attr('height', chart_height)
    .attr('width', chart_width);
    
    // Add the y-axis
    chart.append('svg:line')
     .attr('class', 'yaxis')
     .attr('x1', p[0] - p[3])
     .attr('y1', 0)
     .attr('x2', p[0] - p[3])
     .attr('y2', chart_height)
     .style('stroke', 'black')
     .style('stroke-width', 2);

// Add SVG for drawing the TIME magazine colors in right panel     
var cover = d3.select('#cover')
      .append('svg:svg')
      .attr('height', cover_height + p[0])
      .attr('width', cover_width + p[0]), 
      
    // Add initial image just as a holder
    cover_image = cover.append('svg:image')
      .attr('x', p[0] / 2)
      .attr('y', p[0] / 2)
      .attr('width', cover_width)
      .attr('height', cover_height)
      .attr('xlink:href', 'faces/base.jpg');
      
    // Add a line to impose separation among panels
    cover.append('svg:line')
        .attr('x1', 1)
        .attr('y1', 1)
        .attr('x2', 1)
        .attr('y2', cover_height + p[0])
        .style('stroke', 'black')
        .style('stroke-width', 2)

// Add base SVG for drawing the scatter plot of mean RGB values over time.      
var color = d3.select('#color')
    .append('svg:svg')
    .attr('height', 210)
    .attr('width', chart_width + p[0] + cover_width),
    
    // This chart requires a different set of axis scales because here the x- and y-axes
    // are in the typical horizontal configuration
    x_color = d3.time.scale().rangeRound([p[0], (chart_width + p[0] + cover_width) - p[0]]),
    y_color = d3.scale.linear().range([p[1], 200 - p[1]])

// A simple function for changing the TIME Magazine cover draw in the right panel    
function changeCover(cover_path) {
    cover_image.attr('xlink:href', cover_path);
}

// These functions handle the highlighting of tone cells in the histogram
// and color points in the scatter plot.  This is initiated by the user
// mousing over one of the cells.

function highlightTone(id) {
    var tone = d3.select('#tone_' + id)
        .style('stroke', '#00FF00');
        
    var color = d3.select('#color_' + id)
        .attr('r', 7)
        .style('fill', '#00FF00')
        .style('opacity', 1.0)
}

function deselectTone(id, hexcolor) {
    var tone = d3.select('#tone_' + id)
        .style('stroke', '#000');
        
    var color = d3.select('#color_' + id)
        .attr('r', 3)
        .style('fill', hexcolor)
        .style('opacity', .55)
}

// Let's draw some data!
d3.json('tones.json', function(data) {
    
    // First, set the domain of the axes in the histogram by calculating the extrema of both the number
    // of faces in a given color, and the min and max dates covered by the data.
    var face_counts = data.map(function(d) { return parseInt(d['num']); });
        all_dates = data.map(function(d) { return parse(d['year'] + '-' + d['month'] + '-' + d['day']); }),
    
    x.domain([0, d3.max(face_counts) + 1]),
    y.domain([d3.min(all_dates), d3.max(all_dates)]),
    
    // We need to create a new data object that contains the mean RGB value for each skin ton observed. This 
    // object contains mostly duplicate data from our primary source, but this is done for conveinience
    // so we can focus on a single data object when plotting.
    rgb_data = data.map(function(d, i) {
           return {'mean_rgb' : d3.mean([d['rgbcolor']['R'], d['rgbcolor']['G'], d['rgbcolor']['B']]), 'index': i, 'date': d['date'], 'hexcolor': d['hexcolor']}
       }),
       
    // The extrama of this data must also be calculated to set the domain of the axes of the scatter plot
    rgb_means = rgb_data.map(function(d) { return d['mean_rgb']; }),
    x_color.domain([d3.min(all_dates), d3.max(all_dates)]),
    y_color.domain([d3.min(rgb_means), d3.max(rgb_means)]);
    
    // Next, we add a bunch of labels and notation for out plots so the reader can understand where 
    // each data point is in the data (chronologically, and value), and how they relate to each other.
    // Labels are key!
    
    // In our plots we add ticks at all years, but we highlight decades in a more
    // significant way than each year.  As a result, we must create a 'good_years'
    // array that contains all of the years in out data except new decades. This
    // prevents us from re- and over-plotting date marks.
    var year_marks = y.ticks(d3.time.years),
        decade_marks = d3.range(1,80,10),
        bad_years = decade_marks.map(function(d) { return year_marks[d]; }),
        good_years = year_marks.filter(function(d) { return bad_years.indexOf(d) < 0});
    
    // Decade lines in the histogram
    var decade_marks = chart.selectAll('line.decades')
        .data(decades)
        .enter().append('svg:line')
        .attr('class', 'decades')
        .attr('x1', p[0] - p[3])
        .attr('y1', function(d) { return y(parse(d + '-01-01')); })
        .attr('x2', chart_width)
        .attr('y2', function(d) { return y(parse(d + '-01-01')); })
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .style('stroke-dasharray','5 2'),
    
    // Decade labels in the histogram
    decade_text = chart.selectAll('text.decades')
         .data(decades)
      .enter().append('svg:text')
         .attr('class', 'decades')
         .attr('x', chart_width - p[2])
         .attr('y', function(d) { return y(parse(d + '-01-01')) - 5; })
         .text(function(d) { return d + "'s"; });
         
     // Add yearly lines to histogram
     var years = chart.selectAll('line.years')
         .data(good_years)
       .enter().append('svg:line')
         .attr('class', 'years')
         .attr('x1', p[0] - p[3])
         .attr('y1', function(d) { return y(d); })
         .attr('x2', chart_width)
         .attr('y2', function(d) { return y(d); })
         .style('stroke', 'grey')
         .style('stroke-width', 1)
         .style('stroke-dasharray','2 5');
         
    // Add year lables to histogram
    var years = chart.selectAll('text.years')
         .data(good_years)
       .enter().append('svg:text')
         .attr('class', 'years')
         .attr('x', chart_width - (p[2] / 2))
         .attr('y', function(d) { return y(d) - 5; })
         .text(function(d) { return year_format(d); })
     
     // Adding the tone cells to the histogram    
     var tones = chart.selectAll('rect')
         .data(data)
       .enter().append('svg:rect')
         .attr('x', function(d) { return x(parseInt(d['num']) + 1); })
         .attr('y', function(d) { return y(parse(d['year'] + '-' + d['month'] + '-' + d['day'])); })
         .attr('width', p[1])
         .attr('height', p[1])
         .attr('id', function(d, i) { return 'tone_' + i; })
         .style('fill', function(d) { return d['hexcolor']; })
         .style('stroke', '#000')
         .style('stroke-width', 1)
         // All of the interactivity is handled here
         .on('click', function(d) { changeCover(d['face_path']); })
         .on('mouseover', function(d, i) { highlightTone(i); })
         .on('mouseout', function(d, i) { deselectTone(i, d['hexcolor']); });
    
    // Adding points to our scatter plot     
    var colors = color.selectAll('circle')
      .data(rgb_data)
     .enter().append('svg:circle')
     .attr('cx', function(d) { return x_color(parse(d['date'])); })
     .attr('cy', function(d) { return y_color(d['mean_rgb']); })
     .attr('r', 3)
     .attr('id', function(d, i) { return 'color_' + i; })
     .style('fill', function(d) { return d['hexcolor']; })
     .style('stroke', 'grey')
     .style('stroke-width', 1)
     .style('opacity', 0.55);
     
    // Add top line
    color.append('svg:line')
        .attr('x1', 1)
        .attr('y1', 1)
        .attr('x2', (chart_width + p[0] + cover_width))
        .attr('y2', 1)
        .style('stroke', 'black')
        .style('stroke-width', 2);
        
     // Add x-axis
     color.append('svg:line')
        .attr('x1', p[3])
        .attr('y1', 200 - p[3])
        .attr('x2', (chart_width + p[0] + cover_width))
        .attr('y2', 200 - p[3])
        .attr('id', 'color_xaxis')
        .style('stroke', 'black')
        .style('stroke-width', 1);
        
    // Add decade marks to color x-axis
    color.selectAll('line.decade_marks')
        .data(decades)
        .enter().append('svg:line')
        .attr('class', 'decade_marks')
        .attr('x1', function(d) { return x_color(parse(d + '-01-01')); })
        .attr('y1', 200 - p[3])
        .attr('x2', function(d) { return x_color(parse(d + '-01-01')); })
        .attr('y2', 185)
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .style('stroke-dasharray','5 2');
    
    // Add year makes to color x-axis
    color.selectAll('line.year_marks')
        .data(good_years)
        .enter().append('svg:line')
        .attr('class', 'year_marks')
        .attr('x1', function(d) { return x_color(d); })
        .attr('y1', 200 - p[3])
        .attr('x2', function(d) { return x_color(d); })
        .attr('y2', 190)
        .style('stroke', 'grey')
        .style('stroke-width', 2)
        .style('stroke-dasharray','3 5');
        
    // Add decade text to color x-axis
    color.selectAll('text.years')
        .data(decades)
        .enter().append('svg:text')
        .attr('class', 'years')
        .attr('x', function(d) { return x_color(parse(d + '-01-01')); })
        .attr('y', 208)
        .text(function(d) { return d; })
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('stroke', 'black')
});

// Everything beyond this point is adding text copy to the left-most panel of the plot.

var title = d3.select('#text_copy')
    .append('svg:svg')
    .attr('height', 75)
    .attr('width', 200),
    
    shades = title.append('svg:text')
        .attr('class', 'title_copy')
        .attr('x', 20)
        .attr('y', 20)
        .text('The Shades of')
        .style('font-size', '24px')
    
    time_logo = title.append('svg:image')
        .attr('x', 25)
        .attr('y', 30)
        .attr('width', 150)
        .attr('height', 48)
        .attr('xlink:href', '200px-Time_Magazine_logo.png'),
        
    instructions = d3.select('#text_copy');
        
    para_1 = instructions.append('p')
        .attr('id', 'para_1')
        .attr('class', 'text_copy')
        .text('Given a new data set one is often left wondering, "What can I ask of this data?" I was faced with a similar dilemma when I downloaded the ')
        
    para_1.append('a')
        .attr('href', 'http://www.reddit.com/r/datasets/comments/s0fld/all_time_magazine_covers_march_1923_to_march_2012/')
        .attr('target', '_blank')
        .text('corpus of TIME Magazine covers, from 1923 to 2012.'),
        
    para_2 = instructions.append('p')
        .attr('id', 'para_2')
        .attr('class', 'text_copy')
        .text("What I came up with was: \"Have the faces of those on the cover become more diverse over time?\" To adress this questions I chose to answer something more specific: Has the color values of skin tones in faces on the covers changed over time?"),
        
    para_3 = instructions.append('p')
        .attr('id', 'para_3')
        .attr('class', 'text_copy')
        .text('I developed the Shades of TIME tool at the right to explore the answer.')
        .style('font-weight', 'bold')
        
    para_4 = instructions.append('p')
        .attr('id', 'para_3')
        .attr('class', 'text_copy')
        .text('The first panel is a horizontal histogram of cover chronology, where each cell represents the dominant skin tone from each face detected on a given TIME Magazine cover. The number of cells in each row corresponds to the number of faces detected.')
        
    para_5 = instructions.append('p')
        .attr('id', 'para_3')
        .attr('class', 'text_copy')
        .text('If you place the cursor over a cell it will highlight, and its corrsponding point in the scatter plot below will highlight as well. This plot is also ordered chronologically, but the vertical axis is the mean color value of the skin tone; ordered from lightest to darkest.')
        
    para_6 = instructions.append('p')
        .attr('id', 'para_3')
        .attr('class', 'text_copy')
        .text('Finally, if you click on a cell, the cover will appear in the right panel with the detected face highlighted. All pure white cells correspond to detected faces for which no skin tone colors were found.')
        
    para_7 = instructions.append('p')
        .attr('id', 'para_3')
        .attr('class', 'text_copy')
        .text('Enjoy exploring the data!')
        .style('font-weight', 'bold')
        
    credit = instructions.append('a')
        .attr('href', 'http://www.drewconway.com')
        .attr('target', '_blank')
        .text('Created by Drew Conway, 2012')
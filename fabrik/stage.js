import {
  pointsDistance,
  pointAtSegmentDistance
} from "./helpers";

import {
  extendByInteractivePoints
} from "./snapExtensions";

// CREATE SAMPLE
const start = [100, 500];
const finish = [500, 100];
const length = pointsDistance(start, finish)/5;

const points = [start];
const lines = [];

// make points
for(let i=1; i<5; i++){
  points.push(
    pointAtSegmentDistance(points[i-1], finish, length) 
  )
}

points.push(finish);

// make lines
points.forEach( (point, i, all) => {

  if(lines[i-1]){
    lines[i-1].push(point);
  }

  if(i+1 == all.length) return;

  lines.push([point])

});

// FABRIK IMPLEMENTATION

// Adjust point's x,y coordinates using Forward and Backward Reaching Inverse Kinematics 
function adjustMiddlePoints(points, mountstart=true, mountfinish=true){

  const step = function(mount, point, length){
    // adjust point against 'mount point' 
    // by drawing a line from a mount point to an old point's position
    // and measuring segment length on it
    const projectedPoint = pointAtSegmentDistance( mount, point, length );

    // apply calculated values to mutable point array
    point[0] = projectedPoint[0];
    point[1] = projectedPoint[1];
  }

  const round = function(){
    // run step function 
    // though every, but first and last points in the slice

    // start to finish
    for (let i = 1; i < points.length-1; i++) {
      step( points[i-1], points[i], length )
    }
    // include end point unless omitted
    if(!mountfinish){
      step( points[points.length-2], points[points.length-1], length )
    }

    // finish to start
    for (let i = points.length-2; i > 0; i--) {
      step( points[i+1], points[i], length )
    }
    // include start point unless omited
    if(!mountstart){
      step( points[1], points[0], length )
    }
  }
  
  // invoke round
  round();

}

// Invoke FABRIK adjustment function according given setup
const onFrame = function(point){ 
  // reseives point that was dragged by user
  // corresponds to point array object in points collection

  // find out index of dragged point in the collection
  const index = points.indexOf(point);

  // split points collection into slices before and after moved point
  const startSlice = points.slice(0,index+1);
  const endSlice = points.slice(index);

  // adjust middle points x,y values directly
  // if any of the slices contain more then dragged point
  // keep dragged point mounted (untouched) for each instance
  if(startSlice.length > 1){
    adjustMiddlePoints(startSlice, false, true);
  }

  if(endSlice.length > 1){
    adjustMiddlePoints(endSlice, true, false);
  }
  
}

// HOOK SCALE
const getScale = function(){
  const svg = document.getElementsByTagName('svg')[0];
  const viewBox = svg.getAttribute('viewBox').split(/\s/g);
  
  const bcr = svg.getBoundingClientRect();

  return bcr.width > bcr.height 
    ? bcr.height / viewBox[3] * 1 // fit by height;
    : bcr.width / viewBox[2] * 1 // fit by width;
}

const params = {
  scale: getScale() 
};

window.onresize = function(){
  params.scale = getScale();
};

// HOOK SNAP TO SVG ELEMENT ON WINDOW LOAD,
// DRAW LINES AND POINTS
// CALL ONFRAME with point on EVERY POINT DRAG  
window.onload = function(){
  const paper = Snap('svg');

  const onDrag = function(point){
    onFrame(point);

    linesG.clear();
    drawLines();

    pointsGroup.clear();
    drawPoints();
  }

  // -- lines
  const linesG = paper.group().attr({id: 'lines'});

  const drawLines = () => lines.map( ([p0, p1]) => 

    linesG.line(...p0,...p1).attr({stroke: 'blue'})

  );

  drawLines();

  // -- points
  const pointsGroup = extendByInteractivePoints(paper.group().attr({id: 'draggable-points'}));

  const drawPoints = function(){
    points.map(point => 
    pointsGroup.interactivePoint(point, 10)
      .addClass('draggable')
      .attr({ stroke: '#3289ff', fill: '#3289ff' })
      .onDrag((point) => {
        onDrag(point);
      })
      .setParams(params)
    ); 
  }

  drawPoints();
  
}

/*

  Object.entries({
    lines,
    start,
    finish,
    length,
    points,

    paper,
    params,
    linesG,
    pointsGroup

  }).forEach(([name, value]) => {
    window[name] = value;
  })*/

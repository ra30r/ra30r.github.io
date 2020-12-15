// this adds an interactivePoint type of object to passed paper or group
export const extendByInteractivePoints = (paperGroup) => {
  
  // interactive point creates a draggable circle and 
  // adds onDrag, onDraged, setParams methods
  // uses _onDrag, _onDraged, _params.scale property names

  paperGroup.interactivePoint = (point, radius) => {
    let x, y;

    const pointObject = paperGroup
      .circle(...point, radius);
    
    pointObject._onDrag = [];

    pointObject.onDrag = (fn) => {
      if(typeof fn == 'function'){
        pointObject._onDrag.push(fn);
      }
      return pointObject;
    };

    pointObject._onDraged = [];

    pointObject.onDraged = (fn) => {
      if(typeof fn == 'function'){
        pointObject._onDraged.push(fn);
      }
      return pointObject;
    };

    pointObject._params = {};

    pointObject.setParams = function(obj){
      pointObject._params = obj;
      return pointObject;
    }

    pointObject  
      .drag(
        (changeX, changeY) => {
          const scale = pointObject._params && pointObject._params.hasOwnProperty('scale') 
            ? pointObject._params.scale
            : 1;

          point[0] = x + changeX * 1/scale;
          point[1] = y + changeY * 1/scale;

          pointObject.attr({
            cx: point[0],
            cy: point[1] });

          pointObject._onDrag.forEach(fn => fn(point));
        },
        () => {
          x = pointObject.attr('cx')*1;
          y = pointObject.attr('cy')*1;
        },
        () => {
          pointObject._onDraged.forEach(fn => fn(point));
        }
      );

    return pointObject;
  }

  return paperGroup;
} 
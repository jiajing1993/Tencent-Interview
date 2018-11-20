var isObject = function(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
};

var css = function(el, obj) {
  var style = el.style;
  if (el) {
      if (obj === undefined) {
          return window.getComputedStyle(el);
      } else {
          if (isObject(obj)) {
              for (var prop in obj) {
                  if (!(prop in style)) {
                      prop = "-webkit-" + prop;
                  }
                  el.style[prop] = obj[prop] + (typeof obj[prop] === "string" ? "" : prop === "opacity" ? "" : "px");
              }
          }
      }
  }
};

class Selectable {
  constructor() {
    this.items = document.querySelectorAll(".item")
    this.selectableArea = document.querySelectorAll(".container")[0]
    this.mouseup = false
    this.lasso = this.createLasso()

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    console.log(this.lasso)
    this.init()
  }

  init() {
    this.selectableArea.addEventListener('mousedown', this.handleMouseDown)

    this.selectableArea.addEventListener('mousemove', this.handleMouseMove)

    this.selectableArea.addEventListener('mouseup', this.handleMouseUp)
  };

  createLasso(){
    let lasso = document.createElement('div');
    lasso.className = "lasso";
    css(lasso, {
      border: '1px solid #DBDBDB',
      backgroundColor: 'rgba(#555555, 0.8)',
      position: "absolute",
      opacity: 0, // border will show even at zero width / height
    });
    console.log(lasso)
    return lasso
    
  }
}

Selectable.prototype.handleMouseDown = function(e){
  console.log("mouse down")
  this.mouseup = true;
  this.selectableArea.appendChild(this.lasso);
  this.origin = {
    x: e.pageX,
    y: e.pageY,
  };
}


Selectable.prototype.handleMouseMove = function(e){
  if (this.mouseup) {
    console.log("mouse moving");
    this.current = {
      x1: this.origin.x,
      y1: this.origin.y,
      x2: e.pageX,
      y2: e.pageY,
    };
    var tmp;
    if (this.current.x1 > this.current.x2) {
      tmp = this.current.x2;
      this.current.x2 = this.current.x1;
      this.current.x1 = tmp;
    }

    // flip lasso y
    if (this.current.y1 > this.current.y2) {
      tmp = this.current.y2;
      this.current.y2 = this.current.y1;
      this.current.y1 = tmp;
    }

    this.coords = {
      x1: this.current.x1,
      x2: (this.current.x2) - (this.current.x1),
      y1: this.current.y1,
      y2: (this.current.y2) - (this.current.y1),
    };

    css(this.lasso, {
      left: this.coords.x1,
      top: this.coords.y1,
      width: this.coords.x2,
      height: this.coords.y2,
      opacity: 1,
    });
  }
}

Selectable.prototype.handleMouseUp = function(e){
  this.mouseup = false
  this.selectableArea.removeChild(this.lasso);
  console.log("mouseup")
}

let a = new Selectable()

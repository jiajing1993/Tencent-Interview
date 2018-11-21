let css = function(el, obj) {
  for (var prop in obj) {
    el.style[prop] = obj[prop] + (typeof obj[prop] === "string" ? "" : prop === "opacity" ? "" : "px");
  }
};

let rect = function(item) {
  var rect = item.getBoundingClientRect()
  return {
      x1: rect.left,
      x2: rect.left + rect.width,
      y1: rect.top,
      y2: rect.top + rect.height,
      height: rect.height,
      width: rect.width
  };
};

class Selectable {
  constructor() {
    this.setup();
    this.initEventListener();
  }

  bindEvent(){
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  initEventListener(){
    this.bindEvent();
    this.selectableArea.addEventListener('mousedown', this.handleMouseDown);
    this.selectableArea.addEventListener('mousemove', this.handleMouseMove);
    this.selectableArea.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('dragstart', this.handleDragStart);
    document.addEventListener('dragend', this.handleDragEnd);
    this.droppableArea.addEventListener('dragenter', this.handleDragEnter);
    this.droppableArea.addEventListener('dragleave', this.handleDragLeave);
    this.droppableArea.addEventListener('dragover', this.handleDragOver);
  }

  setup() {
    this.items = document.querySelectorAll(".item");
    for(let i = 0; i < this.items.length; i ++){
      this.items[i].setAttribute('draggable', 'true');
    }
    this.selectableArea = document.querySelectorAll(".container")[0];
    this.droppableArea = document.querySelector(".droppable-container");
    this.highlightedItem = []
    this.mouseup = false;
    this.isDroppableArea = false;
    this.lasso = this.createLasso();
  }

  createLasso(){
    let lasso = document.createElement('div');
    lasso.className = "lasso";
    css(lasso, {
      border: '1px solid #DBDBDB',
      backgroundColor: 'rgba(85,85,85, 0.3)',
      position: "absolute",
      opacity: 0
    });
    return lasso 
  }

  resetLasso(){
    css(this.lasso, {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 0,
    });
  }
}

Selectable.prototype.handleMouseDown = function(e){
  this.isDroppableArea = false;
  if (e.target.classList.contains("item")){
    // prepare to drag ? 
    this.highlightedItem.push(e.target);
    console.log("preapring to drag")
  } else {
    this.highlightedItem = []
    this.mouseup = true;
    this.selectableArea.appendChild(this.lasso);
    this.origin = {
      x: e.pageX,
      y: e.pageY,
    };
    this.current = {
      x1: this.origin.x,
      y1: this.origin.y,
      x2: e.pageX,
      y2: e.pageY,
    };
  }
  
}


Selectable.prototype.handleMouseMove = function(e){
  if (this.mouseup) {
    this.highlightedItem = []

    this.current = {
      x1: this.origin.x,
      y1: this.origin.y,
      x2: e.pageX,
      y2: e.pageY,
    };

    let tmp;

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

    for (var i = 0; i < this.items.length; i++) {
      this.highlight(this.items[i]);
    };

    let highlightedItem = document.querySelectorAll(".highlighter");
    for (let i = 0; i < highlightedItem.length; i++) {
      this.highlightedItem.push(highlightedItem[i]);
    };
  }
}

Selectable.prototype.handleMouseUp = function(e){
  

  if (this.mouseup) {
    this.mouseup = false
    this.selectableArea.removeChild(this.lasso);
    this.resetLasso()
  }
}

Selectable.prototype.highlight = function(item){
  let isOver = false;
  let itemCoordinate = rect(item);
  let cursorCoordinate = this.current
  let left = Math.max(itemCoordinate.x1, cursorCoordinate.x1);
  let right = Math.min(itemCoordinate.x2, cursorCoordinate.x2);
  let bottom = Math.max(itemCoordinate.y1, cursorCoordinate.y1);
  let top = Math.min(itemCoordinate.y2, cursorCoordinate.y2);

  isOver = (right > left) && (bottom < top)
  if (isOver) {
    item.style.backgroundColor = "#F4F4F4"
    item.classList.add("highlighter");
  }else {
    item.style.backgroundColor = ""
    item.classList.remove("highlighter");
  }
}

Selectable.prototype.handleDragStart = function(e){
  console.log("drag start");
}

Selectable.prototype.handleDragEnter = function(e){
  this.isDroppableArea = true;
  console.log("drag enter");
}

Selectable.prototype.handleDragLeave = function(e){
  if (e.target == this.droppableArea) {
    this.isDroppableArea = true;
  }
  console.log("drag leave")
}

Selectable.prototype.handleDragOver= function(e){
  if (this.highlightedItem.length) {
    e.preventDefault();
  }
}

Selectable.prototype.handleDragEnd= function(e){
  console.log(this.isDroppableArea)
  if (this.isDroppableArea) {
    console.log("drag released")
    for(let i = 0; i < this.highlightedItem.length; i ++) {
      this.droppableArea.appendChild(this.highlightedItem[i]);
    }
  }
  
}

new Selectable()

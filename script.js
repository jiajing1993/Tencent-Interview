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
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDragging = this.handleDragging.bind(this);
  }

  initEventListener(){
    this.bindEvent();
    this.selectableArea.addEventListener('mousedown', this.handleMouseDown);
    this.selectableArea.addEventListener('mousemove', this.handleMouseMove);
    this.selectableArea.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('dragstart', this.handleDragStart);
    document.addEventListener('dragend', this.handleDragEnd);
    document.addEventListener("drag", this.handleDragging);
    this.droppableArea.addEventListener('dragenter', this.handleDragEnter);
    this.droppableArea.addEventListener('dragleave', this.handleDragLeave);
    this.droppableArea.addEventListener('dragover', this.handleDragOver);
  }

  setup() {
    this.items = document.querySelectorAll(".item");
    for(let i = 0; i < this.items.length; i ++){
      this.items[i].setAttribute('draggable', 'true');

      // can be removed later.
      this.items[i].childNodes[3].innerHTML = "File " + i;
    }
    this.rotateAngle = [0, 5, 10, -5, -10]
    this.selectableArea = document.querySelectorAll(".container")[0];
    this.droppableArea = document.querySelector(".droppable-container");
    this.highlightedItem = []
    this.cloneHighlightedItem = []
    this.mouseup = false;
    this.isDroppableArea = false;
    this.lasso = this.createLasso();
    this.fakeGhostImage = "";
    this.realGhostImage = "";
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

  pushHighlightedItem(items){
    this.cloneHighlightedItem = []
    if ( items.constructor.name === 'NodeList' ) {
      for (let i = 0; i < items.length; i++) {
        this.highlightedItem.push(items[i])
        this.clonedHighlightedItem(items[i])
      };
    } else {
      this.highlightedItem.push(items)
      this.clonedHighlightedItem(items)
    }
  }

  clonedHighlightedItem(item){
    let temp = item.cloneNode(true)
    temp.classList.add("copied")
    this.cloneHighlightedItem.push(temp)
  }
}

Selectable.prototype.handleMouseDown = function(e){
  
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

  this.isDroppableArea = false;

  if (e.target.classList.contains("item")){
    if ( this.highlightedItem.length ){
      this.highlightedItem = []
    }
    this.highlightedItem.push(e.target);
    this.originalPosition = {
      left: rect(e.target).x1 -5 ,
      top: rect(e.target).y1 - 5
    }
  } else {
    this.highlightedItem = []
    this.mouseup = true;
    this.selectableArea.appendChild(this.lasso);
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
    this.pushHighlightedItem(highlightedItem)
  }
}

Selectable.prototype.handleMouseUp = function(e){
  console.log(this.cloneHighlightedItem.length)
  if (this.mouseup) {
    this.mouseup = false
    this.selectableArea.removeChild(this.lasso);
    this.resetLasso()
  } 
  console.log(this.highlightedItem)
  console.log(this.cloneHighlightedItem)
  if (this.cloneHighlightedItem.length){
    for (let i = 0; i < this.cloneHighlightedItem.length; i++) {
      css(this.cloneHighlightedItem[i], {
        position: 'absolute',
        top: rect(this.highlightedItem[i]).y1 - 5,
        left: rect(this.highlightedItem[i]).x1 - 5,
        zIndex: 5,
        transition: 'all 0.5s',
        transitionDelay: '14.25ms',
      })
      
      this.selectableArea.appendChild(this.cloneHighlightedItem[i]);
    };
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

  // create a fake ghost
  this.fakeGhostImage = e.target.cloneNode(true);
  css(this.fakeGhostImage, {
    position: 'fixed',
    top: '-100px',
    left: '-100px',
    opacity: 0
  })
  document.body.appendChild(this.fakeGhostImage);
  e.dataTransfer.setDragImage(this.fakeGhostImage, 0, 0);

  // create a real ghost
  this.realGhostImage = document.createElement('div');
  this.realGhostImage.classList.add('ghost-wrapper')
  css(this.realGhostImage, {
    position: 'fixed',
    top: this.originalPosition.top,
    left: this.originalPosition.left,
    padding: '10px',
  })
  document.body.appendChild(this.realGhostImage);
  if (this.cloneHighlightedItem.length){
    for (let i = 0; i < this.cloneHighlightedItem.length; i++) {
      this.realGhostImage.appendChild(this.cloneHighlightedItem[i])
      let x = e.pageX - rect(this.cloneHighlightedItem[i]).x1
      let y = e.pageY - rect(this.cloneHighlightedItem[i]).y1
      if ( i < 5){
        css(this.cloneHighlightedItem[i], {
          transform: `translate(${x}px, ${y}px) rotate(${this.rotateAngle[i]}deg)`,
        })
      }else {
        css(this.cloneHighlightedItem[i], {
          transform: `translate(${x}px, ${y}px) rotate(0deg)`,
        })
      }

      
    };
  }

  
}

Selectable.prototype.handleDragging = function(e){
  console.log("dragging");
  let x = e.pageX - this.originalPosition.left - 20
  let y = e.pageY - this.originalPosition.top
  console.log(x)
  console.log(y)
  css(this.realGhostImage, {
    transform: `translate(${x}px, ${y}px)`
  })
}



Selectable.prototype.handleDragEnter = function(e){
  this.isDroppableArea = true;
}

Selectable.prototype.handleDragLeave = function(e){
  if (e.target == this.droppableArea) {
    this.isDroppableArea = true;
  }
}

Selectable.prototype.handleDragOver= function(e){
  if (this.highlightedItem.length) {
    e.preventDefault();
  }
}

Selectable.prototype.handleDragEnd= function(e){
  document.body.removeChild(this.fakeGhostImage);
  document.body.removeChild(this.realGhostImage);
  
  if (this.isDroppableArea) {
    for(let i = 0; i < this.highlightedItem.length; i ++) {
      this.droppableArea.appendChild(this.highlightedItem[i]);
    }
  }
}

new Selectable()

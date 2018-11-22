let css = function(el, obj) {
  for (var prop in obj) {
    el.style[prop] = obj[prop] + (typeof obj[prop] === "string" ? "" : prop === "opacity" ? "" : "px");
  }
};

let getElementInfo = function(item) {
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

let loop = function(items, fn) {
  for (var i = 0; i < items.length; i++) {
    fn(items[i])
  };
}

let isItem = function(item){
  return item.classList.contains("item")
}

let isSelected = function(item){ 
  return item.classList.contains("copied")
}

class Selectable {

  constructor(){
    this.setting = {
      rotatedAngle: [0, 5, 10, -5, -10]
    } 
    this.init()
  }

  init(){
    // section
    this.selectableArea = document.querySelector(".container");
    this.droppableArea = document.querySelector(".droppable-container");

    // items
    this.items = []
    this.highlightedItem = []
    this.cloneHighlightedItem = []

    let items = document.querySelectorAll(".item");
    for(let i = 0; i < items.length; i ++){
      this.initializeItem(items[i], i)
    }

    this.click = {
      initial: ""
    }

    this.control = {
      allowLasso: false,
      isDroppableArea: false,
    }
    this.lasso = new Lasso();

    this.ghostImage = {
      fake: document.createElement('div'),
      real: "",
    }


    this.initEventListener()
  }

  initializeItem(item, index){
    item.setAttribute('draggable', 'true');
    item.setAttribute('aria-disabled', false);
    item.setAttribute('aria-selected', false);
    // can be removed
    item.childNodes[3].innerHTML = "File " + index;
    this.items.push({
      element: item, 
      ...getElementInfo(item)
    })
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
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('dragstart', this.handleDragStart);
    document.addEventListener('dragend', this.handleDragEnd);
    document.addEventListener("drag", this.handleDragging);
    this.droppableArea.addEventListener('dragenter', this.handleDragEnter);
    this.droppableArea.addEventListener('dragleave', this.handleDragLeave);
    this.droppableArea.addEventListener('dragover', this.handleDragOver);
  }

  reset(){
    loop(this.items, function(item){
      item.element.classList.remove('highlighted')
    })
  }

  selected(item) {
    item.element.classList.add('highlighted')
    item.element.setAttribute('aria-selected', true);
  }

  deselected(item){
    item.element.classList.remove("highlighted");
    item.element.setAttribute('aria-selected', false);
  }

  addToSeledtedList(){
    this.highlightedItem = []
    this.cloneHighlightedItem = []
    let that = this;
    let highlightedItems = document.querySelectorAll(".highlighted");
    if (highlightedItems.length){
      loop(highlightedItems, function(item){
        that.highlightedItem.push({
          element: item, 
          ...getElementInfo(item)
        })
        let cloneItem = item.cloneNode(true);
        cloneItem.classList.remove('highlighted')
        that.cloneHighlightedItem.push({
          element: cloneItem, 
          ...getElementInfo(item)
        })
      })
    }
  
    if (this.cloneHighlightedItem.length) {
      console.log("add")
      mountCloneItemToDOM(this);
    } else {
      console.log("remove")
      document.body.removeChild(this.ghostImage.fake);
    }

    function mountCloneItemToDOM(that){
      console.log("mounted")
      that.ghostImage.fake.classList.add('ghost-wrapper')
      document.body.appendChild(that.ghostImage.fake)
      loop(that.cloneHighlightedItem, function(item){
        that.ghostImage.fake.appendChild(item.element);
        item.element.classList.add('copied')
        css(item.element, {
          position: 'absolute',
          top: item.y1 - 5,
          left: item.x1 - 5,
          zIndex: 10,
          transition: 'all 0.5s',
          transitionDelay: '14.25ms',
        })
      })
    }
  }

  drawLasso(e){
    this.current = {
      x1: this.click.initial.x,
      y1: this.click.initial.y,
      x: e.pageX,
      y: e.pageY,
    };

    let tmp;

    if (this.current.x1 > this.current.x) {
      tmp = this.current.x;
      this.current.x = this.current.x1;
      this.current.x1 = tmp;
    }

    if (this.current.y1 > this.current.y) {
      tmp = this.current.y;
      this.current.y = this.current.y1;
      this.current.y1 = tmp;
    }

    this.coords = {
      x1: this.current.x1,
      x2: (this.current.x) - (this.current.x1),
      y1: this.current.y1,
      y2: (this.current.y) - (this.current.y1),
    };

    this.lasso.update( this.coords.x1, this.coords.y1, this.coords.x2, this.coords.y2)
  }
}

// ====================  Mouse Event ====================  
Selectable.prototype.handleMouseDown = function(e){
  // check if click on item or droppableArea
  let target = e.target
  this.click.initial = {
    x: e.pageX,
    y: e.pageY
  }

  if (target == this.selectableArea){
    this.control.allowLasso = true
    this.selectableArea.appendChild(this.lasso.element);
    

  } else if ( isItem(target) ) {
    console.log(isSelected(target))
    if ( isSelected(target) ) {
    } else {
      this.control.allowLasso = false
      this.reset()
      target.classList.add('highlighted')
      target.setAttribute('aria-selected', true);
      this.addToSeledtedList()
    }
  } else {
    this.control.allowLasso = false
    return false;
  }
}

Selectable.prototype.handleMouseMove = function(e){
  if (this.control.allowLasso && (e.target == this.selectableArea || isItem(e.target)) ) {
    this.drawLasso(e)

    for (var i = 0; i < this.items.length; i++) {
      this.highlight(this.items[i]);
    };
  }
}

Selectable.prototype.handleMouseUp = function(e){
  if (this.control.allowLasso) {
    this.addToSeledtedList()
  }
  this.control.allowLasso = false
  this.lasso.reset()
}

Selectable.prototype.highlight = function(item){
  let isOver = false;
  let cursorCoordinate = this.current
  let left = Math.max(item.x1, cursorCoordinate.x1);
  let right = Math.min(item.x2, cursorCoordinate.x);
  let bottom = Math.max(item.y1, cursorCoordinate.y1);
  let top = Math.min(item.y2, cursorCoordinate.y);

  isOver = (right > left) && (bottom < top)
  if (isOver) {
    this.selected(item)
  }else {
    this.deselected(item)
  }
}

// ====================  Drag Event ====================  
Selectable.prototype.handleDragStart = function(e){
  console.log(this.highlightedItem)
  console.log(this.cloneHighlightedItem)
  this.ghostImage.real = e.target.cloneNode(true);
  css(this.ghostImage.real, {
    position: 'fixed',
    top: '-100px',
    left: '-100px',
    opacity: 0
  })
  document.body.appendChild(this.ghostImage.real);
  e.dataTransfer.setDragImage(this.ghostImage.real, 0, 0);

  loop(this.cloneHighlightedItem, function(item){
    let x = e.pageX - item.x1
    let y = e.pageY - item.y1
    css(item.element, {
      zIndex: 100,
      transform: `translate(${x}px, ${y}px)`,
    })
  })
}

Selectable.prototype.handleDragging = function(e){
  console.log("dragging");
  console.log(this.ghostImage.fake)
  let x = e.pageX - this.click.initial.x
  let y = e.pageY - this.click.initial.y
  console.log(x)
  console.log(y)
  css(this.ghostImage.fake, {
    transform: `translate(${x}px, ${y}px)`
  })
}

Selectable.prototype.handleDragEnter = function(e){
}

Selectable.prototype.handleDragLeave = function(e){
}

Selectable.prototype.handleDragOver= function(e){
}

Selectable.prototype.handleDragEnd= function(e){
}


class Lasso {
  constructor(settings = {} ){

    this.border = '1px solid #DBDBDB';
    this.backgroundColor = 'rgba(85,85,85, 0.3)';
    if (Object.keys(settings).length !== 0 ) {
      this.border = settings.border;
      this.backgroundColor = settings.backgroundColor;
    }
    this.create();
  }

  create(){
    this.element = document.createElement('div');
    this.element.className = "lasso";
    css(this.element, {
      border: this.border,
      backgroundColor: this.backgroundColor,
      position: "absolute",
      opacity: 0
    });
  }

  reset(){
    css(this.element, {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 0,
    });
  }

  update(left, top, width, height){
    css(this.element, {
      left: left,
      top: top,
      width: width,
      height: height,
      opacity: 1,
    });
  }
}
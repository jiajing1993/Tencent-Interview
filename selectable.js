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

class Selectable {

  constructor(){
    this.setting = {
      rotatedAngle: [0, 5, 10, -5, -10]
    }
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
      initializeItem(item[i], i)
    }

    this.control = {
      mouseupL: false,
      isDroppableArea: false,
    }
    
  }

  initializeItem(item, index){
    
    item.setAttribute('draggable', 'true');
    item.setAttribute('aria-disabled', false);
    item.setAttribute('aria-selected', false);
    
    // can be removed
    item.childNodes[3].innerHTML = "File " + index;

    //
    this.items.push({
      element: item, 
      ...getElementInfo(item)
    })
  }
  
}

class Lasso {
  constructor(settings){
    this.border = '1px solid #DBDBDB';
    this.backgroundColor = 'rgba(85,85,85, 0.3)';
    if (Object.keys(settings).length !== 0 ) {
      this.border = settings.border;
      this.backgroundColor = settings.backgroundColor;
    }
    this.create();
  }

  create(){
    this.lasso = document.createElement('div');
    this.lasso.className = "lasso";
    css(this.lasso, {
      border: this.border,
      backgroundColor: this.backgroundColor,
      position: "absolute",
      opacity: 0
    });
  }

  reset(){
    css(this.lasso, {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 0,
    });
  }

  update(left, top, width, height){
    css(this.lasso, {
      left: left,
      top: top,
      width: width,
      height: height,
      opacity: 1,
    });
  }
}
## Highlight, Select and Drag. 
We can higlight the div with mouse movement, to draw a rectangular to select the items. and Drag and drop it to other folder or section.

## Todo
- [x] Lasso can be drawn on section
- [x] Items under Lasso can be selected
- [x] Selected Items can be dragged
- [x] Selected Items can be dropped
- [ ] Selected Items Dragging Animation
- [ ] Better File Organization
- [ ] Testing

## Screenshot
![alt text](https://i.imgur.com/bvT6Mrw.png "Highlight to select div")
![alt text](https://i.imgur.com/ydYJhVd.png "Selected Div Animate to Cursor when dragging")

## Plan to do 
1. **Mouse Down to Higlight**
  - when mouseDown on item, that item will be selected.
  - when mouseDown on `draggableArea`, the lasso will be appended.
  - when mouseDown on any other places, nothing will happended. 

2. **How to store selected item**
  - when the item is being cover by Lasso, `highligted` class will be added.
  - These elements will be stored in `selectedItem` array. They will be used when these elements being dropped to the `droppable area`. By using `appendChild`
  - Beside that, These elements will also be cloned and store in `cloneSelectedItem` array, together with its original positon. It is used to perform the dragging animation. Noticed that when the selected elements is being drag, the 
`cloneSelectedItem` will be following the cursor, whereby the `selectedItem` will be staying where they are with an overlay.

3. **Draw a Lasso**
  - to draw a lasso, we need 2 points. Initial Cursor mouse down point (which i store in `click.initial`) and current mouse moving point.
  - second, you need to calculate if the mouse if moving to left or right, up or down.
  - Lasso is just a normal div, that keep changing the attribute (top, left, height, and width) which can be calculated from 
the mouse cursor moving points

4. **Detroy Lasso**
  - Lasso will not be destroyed. When it is not being used. the width and height will be 0, and opacity is also 0. It is there, but we can't see.

5. **Custom Ghost Image on Dragging event**
  - Native Drag and Drop can only see single file image on dragging. To hide it, my plan is to create a hidden div to replace the image by `e.dataTransfer.setDragImage`. 
  - and I will create another element (which can be anything or any style I want) just to follow the cursor when dragging.
  - set the element to `position absolute` and `transform translate X and Y` it to the cursor point. 

6. **Selected Items Animation to Cursor on Drag Start**
  - when the `cloneSelectedItems` are first cloned, they are being added to the DOM which is on the position of their original element. 
  - It is like each `selectedItems` and `cloneSelectedItems` are stacking together. 
  - when the items is being dragged, all the `cloneSelectedItems` will be moving to cursor point by `translate X and Y`

7. **Animate Items back to original position when Dragging cancel**
  - when dragging process is cancel, `cloneSelectedItems` will be animated back to original position by `transform: translate(0px, 0px)`. 
  - and when the mouseUp or dragEnd event, remove the element from DOM. 

## Issue
1. I not sure if the way of faking dragImage is correct. 
2. Wrap the selected div into ghost-wrapper ? Then it will be easier to follow cursor during Ondrag event. I will just need to translate one element instead of multiple clonedItems
2. Ghost Wrapper doesnt animate (transfrom: translate) with cursor.?
3. Should I set Ghost Wrapper to fixed or absolute? 

## Reference
1. [Setting a custom ghost image when using HTML5 drag and drop](https://kryogenix.org/code/browser/custom-drag-image.html)
2. https://www.sitepoint.com/accessible-drag-drop/
3. https://www.html5rocks.com/en/tutorials/dnd/basics/

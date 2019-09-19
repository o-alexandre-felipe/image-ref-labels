function Editor(canvas){
  this.canvas = canvas;
  var ctx = this.context = canvas.getContext('2d');
  this.foontSize = 12;
  this.selectedIndex = 0;
  this.notes = [];
  this.circleRadius = 8;
  this.circleColor = 'orange';
  this.borderColor = 'orange';
  this.textColor = 'black';
  this.fontFamily = 'serif';
  this.fontSize = 14;
  createImage = (source) => {
    var pastedImage = new Image();
    
    pastedImage.onload = () => {
      //resize
      canvas.width = pastedImage.width;
      canvas.height = pastedImage.height;
      this.image = pastedImage;
      this.notes = [];
      this.repaint();
    };
    pastedImage.src = source;
  }
  var clickedNote = (e) => {
    
      // remove the closest point
      var clientRect = e.target.getBoundingClientRect();
      // https://caniuse.com/#feat=getboundingclientrect
      // Some browsers return clientRect without x&y.
      var clickX = e.clientX - (clientRect.x || clientRect.left || 0);
      var clickY = e.clientY - (clientRect.y || clientRect.top || 0);
      for(let ii = this.notes.length-1; ii>=0; --ii){
        var dx = clickX - this.notes[ii].x;
        var dy = clickY - this.notes[ii].y;
        if(dx * dx + dy * dy < this.circleRadius * this.circleRadius){
          return ii;
        }
      }
      return null;
  }
  var movePoint = (e) => {
    if(!(this.image && this.canvas && this.context)){
      return;
    }
    if(e.buttons != 1)return;
    if(this.selectedIndex < this.notes.length && this.selectedIndex >= 0){
      var clientRect = e.target.getBoundingClientRect();
      var clickX = e.clientX - (clientRect.x || clientRect.left || 0);
      var clickY = e.clientY - (clientRect.y || clientRect.top || 0);
      this.notes[this.selectedIndex] = {x: clickX, y: clickY};
      this.repaint();
    }
  }
  canvas.addEventListener('mouseup', (e) => {
    movePoint(e);
    this.selectedIndex = -1;
  });
  canvas.addEventListener('mousemove', movePoint);
  canvas.addEventListener('mousedown', (e) => {
    if(!(this.image && this.canvas && this.context)){
      return;
    }
    var sel = clickedNote(e);
    if(e.shiftKey){
      if(sel != null){
        this.notes.splice(sel, 1);
        this.repaint();
      }
    }else{
      if(sel == null){
        this.selectedIndex = this.notes.length;
        this.notes.splice(this.selectedIndex, 0, {x:null, y:null});
        movePoint(e);
      }else{
        this.selectedIndex = sel;
      }
    }
  });
  
  window.addEventListener("paste", (e) => {
    e.preventDefault();
    e.stopPropagation();
    for(let i = 0; i < e.clipboardData.items.length; ++i){
      let item = e.clipboardData.items[i];
      if(item.type.indexOf('image') != -1){
        let file = item.getAsFile();
        if(file != null){
          let URLObj = window.URL || window.webkitURL;
          let objectUrl = URLObj.createObjectURL(file);
          createImage(objectUrl);
          return;
        }
      }
      
    }
    let html = e.clipboardData.getData('text/html');
    if(html){
        let el = document.createElement('div');
        el.innerHTML = html;
        let img = el.querySelector('img');
        let url = img.src;
        if(url){
          createImage(url);
          return;
        }
    }
  });
}

Editor.prototype.repaint = function() {
  if(!(this.image && this.canvas && this.context)){
    return;
  }
  var ctx = this.context;
  this.canvas.width = this.image.width;
  this.canvas.height = this.image.height;
  ctx.drawImage(this.image, 0, 0);
  for(var ii = 0; ii < this.notes.length; ++ii){
    note = this.notes[ii];
    ctx.beginPath();
    ctx.arc(note.x, note.y, this.circleRadius, 0, 2*Math.PI);
    ctx.fillStyle = this.circleColor;
    ctx.fill();
    
    ctx.fillStyle = this.textColor;
    ctx.font = this.textSize + 'px ' + this.fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ii + 1, note.x, note.y);
  }
}

var editor;

window.addEventListener('load', () => {
  let canvas = document.querySelector('canvas#editor')
  let textColorEl = document.querySelector('#tools #text-color');
  let textSizeEl = document.querySelector('#tools #text-size');
  let circleColorEl = document.querySelector('#tools #circle-color');
  let circleRadiusEl = document.querySelector('#tools #circle-radius');

  editor = new Editor(canvas);
  
  setParameters = () => {
    editor.circleRadius = circleRadiusEl.value;
    editor.circleColor = circleColorEl.value;
    editor.textColor = textColorEl.value;
    editor.textSize = textSizeEl.value;
    editor.repaint();
  };
  
  textColorEl.addEventListener('input', setParameters);
  textSizeEl.addEventListener('input', setParameters);
  circleRadiusEl.addEventListener('input', setParameters);
  circleColorEl.addEventListener('input', setParameters);
  
});

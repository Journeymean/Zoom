/*Author: Sergei Illarionov 2020 copyright ©*/

window.onload = function () {
  if ("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
  } else {
    document.body.classList.add("no-touch");
  }

  const mapNode = document.querySelector(".image-container-js");
  const frameNode = document.querySelector(".frame-container-js");
  const zoomInNode = document.querySelector(".zoom-in");
  const zoomOutNode = document.querySelector(".zoom-out");

  /*Setups start*/

  let settings = new Object();
  settings.scaleScope = new Object();
  settings.scaleScope.initial = Math.min(frameNode.clientWidth / mapNode.clientWidth, frameNode.clientHeight / mapNode.clientHeight);
  settings.scaleScope.min = settings.scaleScope.initial / 2; /*min zoom availible*/
  settings.scaleScope.max = 5;                               /*max zoom availible*/
  settings.autoscroll = true;                                /*autoscroll to frame flag*/
  settings.smoothScroll = true;                              /*smooth scroll flag*/
  settings.scrollspeed = 12;                                 /*smootn scroll speed*/

  /*Setups end*/

  let state = new Object();
  state.moving = false;
  state.scaling = false;
  state.click = new Object();
  state.click.left = null;
  state.click.top = null;
  state.checkBorders = new Object();
  state.checkBorders.x = null;
  state.checkBorders.y = null;
  state.autoscaling = null;
  state.autoscaleFlag = null;
  state.touchDist = null;
  state.scale = settings.scaleScope.initial;

  mapNode.style.transform = `scale(${settings.scaleScope.initial})`;

  mapNode.addEventListener("mousedown", (event) => {
    state.moving = true;
    state.click.left = event.pageX;
    state.click.top = event.pageY;
    state.checkBorders.x = event.pageX;
    state.checkBorders.y = event.pageY;
    mapNode.classList.add("grabbing");
    event.preventDefault();
  });

  mapNode.addEventListener("touchstart", (event) => {
    if (event.touches.length == 1) {
      state.moving = true;
      state.click.left = event.touches[0].pageX;
      state.click.top = event.touches[0].pageY;
      state.checkBorders.x = event.touches[0].pageX;
      state.checkBorders.y = event.touches[0].pageY;
      event.preventDefault();
    }

    if (event.touches.length == 2) {
      state.scaling = true;
      state.touchDist = Math.sqrt((event.touches[0].pageX - event.touches[1].pageX) * (event.touches[0].pageX - event.touches[1].pageX) + (event.touches[0].pageY - event.touches[1].pageY) * (event.touches[0].pageY - event.touches[1].pageY));
      event.preventDefault();
    }
  });

  document.addEventListener("mouseup", () => {
    state.moving = false;
    mapNode.classList.remove("grabbing");
  });

  document.addEventListener("touchcancel", () => {
    state.moving = false;
    state.scaling = false;
  });

  document.addEventListener("touchend", () => {
    state.moving = false;
    state.scaling = false;
  });

  document.addEventListener("mousemove", (event) => {
    if (state.moving === true) {
      let check = checkBordersOut();

      if (check != false) {
        switch (check) {
          case "left":
            if (event.pageX < state.checkBorders.x) {
              event.preventDefault();
              return;
            }
            break;
          case "right":
            if (event.pageX > state.checkBorders.x) {
              event.preventDefault();
              return;
            }
            break;
          case "top":
            if (event.pageY < state.checkBorders.y) {
              event.preventDefault();
              return;
            }
            break;
          case "bottom":
            if (event.pageY > state.checkBorders.y) {
              event.preventDefault();
              return;
            }
            break;
        }
      }

      mapNode.style.left = parseInt(window.getComputedStyle(mapNode).left) + (event.pageX - state.click.left) + "px";
      mapNode.style.top = parseInt(window.getComputedStyle(mapNode).top) + (event.pageY - state.click.top) + "px";
      state.click.left = event.pageX;
      state.click.top = event.pageY;
    }
  });

  function checkBordersOut() {
    let flag = false;
    if (mapNode.getBoundingClientRect().height + (mapNode.getBoundingClientRect().top - frameNode.getBoundingClientRect().top) < 200) {
      flag = "top";
    }
    if (frameNode.getBoundingClientRect().height - (mapNode.getBoundingClientRect().top - frameNode.getBoundingClientRect().top) < 200) {
      flag = "bottom";
    }
    if (mapNode.getBoundingClientRect().width + (mapNode.getBoundingClientRect().left - frameNode.getBoundingClientRect().left) < 200) {
      flag = "left";
    }
    if (frameNode.getBoundingClientRect().width - (mapNode.getBoundingClientRect().left - frameNode.getBoundingClientRect().left) < 200) {
      flag = "right";
    }
    return flag;
  }

  function sizeIn(step) {
    if (state.scale + step > settings.scaleScope.max) {
      return;
    }
    state.scale = state.scale + step;
    mapNode.style.transform = `scale(${state.scale})`;
  }

  function sizeOut(step) {
    if (state.scale - step < settings.scaleScope.min) {
      return;
    }
    state.scale = state.scale - step;
    mapNode.style.transform = `scale(${state.scale})`;
  }

  mapNode.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      sizeIn(0.05);
    } else {
      sizeOut(0.05);
    }
  });

  zoomInNode.addEventListener("click", (event) => {
    if (!state.autoscaleFlag) {
      event.preventDefault();
      sizeIn(0.05);
    }
    state.autoscaleFlag = false;
  });

  zoomInNode.addEventListener("mousedown", (event) => {
    state.autoscaling = setInterval(() => {
      sizeIn(0.002);
      state.autoscaleFlag = true;
    }, 0);
    event.preventDefault();
  });

  zoomInNode.addEventListener("mouseup", (event) => {
    clearInterval(state.autoscaling);
    event.preventDefault();
  });

  zoomInNode.addEventListener("touchstart", (event) => {
    event.preventDefault();
    zoomInNode.classList.add("hovered");
    state.autoscaling = setInterval(() => {
      sizeIn(0.002);
      state.autoscaleFlag = true;
    }, 0);
  });

  zoomInNode.addEventListener("touchend", (event) => {
    clearInterval(state.autoscaling);
    zoomInNode.classList.remove("hovered");
    event.preventDefault();
  });

  zoomOutNode.addEventListener("click", (event) => {
    if (!state.autoscaleFlag) {
      event.preventDefault();
      sizeOut(0.05);
    }
    state.autoscaleFlag = false;
  });

  zoomOutNode.addEventListener("mousedown", (event) => {
    state.autoscaling = setInterval(() => {
      sizeOut(0.002);
    }, 0);
    event.preventDefault();
  });

  zoomOutNode.addEventListener("mouseup", (event) => {
    clearInterval(state.autoscaling);
    event.preventDefault();
  });

  zoomOutNode.addEventListener("touchstart", (event) => {
    event.preventDefault();
    zoomOutNode.classList.add("hovered");
    state.autoscaling = setInterval(() => {
      sizeOut(0.002);
      state.autoscaleFlag = true;
    }, 0);
  });

  zoomOutNode.addEventListener("touchend", (event) => {
    clearInterval(state.autoscaling);
    zoomOutNode.classList.remove("hovered");
    event.preventDefault();
  });

  document.addEventListener("touchmove", (event) => {
    if (state.moving === true) {
      let check = checkBordersOut();
      if (check != false) {
        switch (check) {
          case "left":
            if (event.touches[0].pageX < state.checkBorders.x) {
              event.preventDefault();
              return;
            }
            break;
          case "right":
            if (event.touches[0].pageX > state.checkBorders.x) {
              event.preventDefault();
              return;
            }
            break;
          case "top":
            if (event.touches[0].pageY < state.checkBorders.y) {
              event.preventDefault();
              return;
            }
            break;
          case "bottom":
            if (event.touches[0].pageY > state.checkBorders.y) {
              event.preventDefault();
              return;
            }
            break;
        }
      }
      mapNode.classList.add("grabbing");
      mapNode.style.left = parseInt(window.getComputedStyle(mapNode).left) + (event.touches[0].pageX - state.click.left) + "px";
      mapNode.style.top = parseInt(window.getComputedStyle(mapNode).top) + (event.touches[0].pageY - state.click.top) + "px";
      state.click.left = event.touches[0].pageX;
      state.click.top = event.touches[0].pageY;
    }

    if (state.scaling === true) {
      let dist = Math.sqrt((event.touches[0].pageX - event.touches[1].pageX) * (event.touches[0].pageX - event.touches[1].pageX) + (event.touches[0].pageY - event.touches[1].pageY) * (event.touches[0].pageY - event.touches[1].pageY));
      if (dist - state.touchDist > 10) {
        sizeIn(0.05);
        state.touchDist = dist;
      } else if (dist - state.touchDist < -10) {
        sizeOut(0.05);
        state.touchDist = dist;
      }
    }
  });

  if (settings.autoscroll === true) {
    let y = frameNode.offsetTop - parseInt(window.getComputedStyle(frameNode).marginTop);
    if (settings.smoothScroll === true) {
      let speed = (y / 1000) * settings.scrollspeed;
      function smoothScroll(target, current) {
        let smooth = setInterval(function () {
          window.scroll(0, current);
          current = current + speed;
          target = target - speed;
          if (target <= 0) {
            clearInterval(smooth);
          }
        }, 0.5);
      }
      smoothScroll(y, 0);
    } else {
      window.scroll(0, y);
    }
  }
};

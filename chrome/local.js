document.addEventListener("DOMContentLoaded", function(event) {

    let text;

    const modal = document.getElementById('modal-box');
    const objective = document.getElementById('etObj');
    const todo = document.getElementById('todo');
    const setswitch = document.getElementById('btnSet');
    const close = document.getElementById('btnClose');


    chrome.windows.getAll({populate: true}, function(allWindows){
      if (allWindows[0].tabs.length === 1) {
        modal.style.display = "block";
      }
    });

    chrome.storage.sync.get(['myobj'], function(result) {
      text = result.myobj;
      todo.innerText = text;
    });

    setswitch.onclick = function(){

      if (objective.value !== "") {
          modal.style.display = "none";
          text = objective.value;
          chrome.storage.sync.set({ "myobj": text }, function(){
              console.log("objective stored in chrome : "+text);
          });
          todo.innerText=text;
      }else {
        swal("Enter an objective");
      }

    }

    objective.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        setswitch.click();
      }
    });

    todo.onclick = function(){
      modal.style.display = "block";
    }

    close.onclick = function() {
      modal.style.display = "none";
    }

    // window.onclick = function(event) {
    //     if (event.target !== modal) {
    //         modal.style.display = "none";
    //     }
    // }



});

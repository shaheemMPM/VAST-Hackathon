const ele = document.getElementById('btn-setTime');
const hr = document.getElementById('etHr');
const min = document.getElementById('etMn');
ele.onclick = function() {
  var hrTime = hr.value;
  var mnTime = min.value;
  var timeSeconds = hrTime*3600000+mnTime*60000;
  chrome.storage.sync.set({ "myTime": timeSeconds }, function(){
      console.log("running time : "+timeSeconds);
  });
}

setTimeout(function(){
  var x = document.getElementsByClassName('stream');
  var y = getRandomInt(0, 9);
  x[0].innerHTML="<h1 style=\"margin: 20px 0px 0px 20px; line-height: 1.2;\">"+quotes[y]+"</h1>";
},5000);

var quotes = [
  "Better three hours too soon, than one minute too late.<br> - William Shakespeare",
  "Time is the wisest counselor of all.<br> - Pericles",
  "Time is the school in which we learn, time is the fire in which we burn.<br> - Delmore Schwartz",
  "Nothing is a waste of time if you use the experience wisely.<br> - Rodin",
  "Time as he grows old teaches many lessons.<br> - Rodin",
  "Time as he grows old teaches many lessons.<br> - Aeschylus",
  "Histories make men wise.<br> - Francis Bacon",
  "Time is what we want most, but what we use worst.<br> - William Penn",
  "The common man is not concerned about the passage of time, the man of talent is driven by it.<br> - Shoppenhauer",
  "Time = life; therefore, waste your time and waste of your life, or master your time and master your life.<br> - Alan Lakein"
];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

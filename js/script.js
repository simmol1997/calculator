/* A dictionary that makes it easy to call specific functions when btns are clicked */
var btnToFunc = {
  undefined: inputBtn, // The number and operator btns dont have ids so they all go under the undefined category
  "ac": eraseAll,
  "ce": eraseCurrent,
  "sign": changeSign,
  "equals": generateAnswer
};

// Contains links between string-operators and functions
var opToFunc = {
  "×": multiply,
  "+": add,
  "-": subtract,
  "÷": divide
};

$(document).ready(function() {

  $(".input-btn").on("click", function() {
    var id = $(this).attr("id");
    btnToFunc[id](this);
  });
});

function multiply(num1, num2) {
  return num1*num2;
}
function divide(num1, num2) {
  return num1/num2;
}
function add(num1, num2) {
  return num1+num2;
}
function subtract(num1, num2) {
  return num1-num2;
}

function inputBtn(btn) {
  /* appends the btns inner text to the secondary-output and replaces the main-outputs text with it */
  var btnTxt = btn.innerText;
  var mainTxt = $("#main-output").text();

  if (/\./.test(mainTxt) && /\./.test(btnTxt))
    // If one decimal point already exists then another should not be added
    return;

  if ( /\d/.test(mainTxt) && (/\d/.test(btnTxt) || /\./.test(btnTxt)) ) {
    //If a number has previously been inputed than the next number is a continuation and so is a decimal point
    if (mainTxt == "0" && !/\./.test(btnTxt))
      //However we dont want a zero in front of another number (if it isn't a floating point number)
      $("#main-output").text("");

    $("#main-output").append(btnTxt);
  }
  else if (!/\d/.test(btnTxt) && !/\d/.test(mainTxt))
    /* If mainTxt is not a number than it is an operator. In that case the user should not be able to press another operator btn (aka not a number btn) */
    return;
  else
    $("#main-output").text(btnTxt);

  $("#secondary-output").append(btnTxt);
}

function eraseAll() {
  /* Erases all user inputs */
  $("#main-output").text("0");
  $("#secondary-output").text("");
}

function eraseCurrent() {
  /* Only erases the last input the user made */
  var currentLen = $("#main-output").text().length;
  var secondary = $("#secondary-output").text();
  secondary = secondary.substr(0, secondary.length - currentLen); //Removes the current
  $("#secondary-output").text(secondary);
  $("#main-output").text("0");
}

function changeSign() {
  /* Changes the sign of the current input */
  var mainTxt = $("#main-output").text();
  var mainLen = mainTxt.length;
  var secondaryTxt = $("#secondary-output").text();

  if (mainLen == 1 && !/\d/.test(mainTxt))
    //Is an operator and therefore cannot change the sign
    return;
  else if (mainLen > 1 && !/\d/.test(mainTxt[0])) {
    //If mainTxt is more than one character and the first char is not a number than it must be a minus sign
    mainTxt = mainTxt.substr(1);
    $("#main-output").text(mainTxt);
    secondaryTxt = secondaryTxt.substr(0, secondaryTxt.length - (mainLen + 2)); // Have to add two because of the parantheses
    $("#secondary-output").text(secondaryTxt + mainTxt);
  }
  else {
    //Else all we have to do is add the minus sign
    $("#main-output").text("-" + mainTxt);
    secondaryTxt = secondaryTxt.substr(0, secondaryTxt.length - mainLen);
    $("#secondary-output").text(secondaryTxt + "(-" + mainTxt + ")");
  }
}

function generateAnswer() {
  /* generates an answer for the user */
  if (!/\d/.test($("#main-output").text())) // Current is an operator and therefore it is impossible to cumpute
    return;

  var input = $("#secondary-output").text();
  var answer = calculate(input);

  $("#main-output").text(answer);
  $("#secondary-output").text(answer);
}

function calculate(str) {
  /* Recursive function that calculates an expression */
  var indexOfPrioOp = str.search(/[^\d\.\-()\+]/); //First occurence of divide or multiply symbol
  var num1, num2, ans, iL, iR; // used in the while loop
  while (indexOfPrioOp != -1) { // Calculates the priority operations first

    iL = indexOfPrioOp-1;
    if (str[iL] == ")") { // If it is a parantheses then it is a negative number and we should count "-" symbols as well
      iL--; //Passes the parantheses
      while(/[\d\.\-]/.test(str[iL])) {
        iL--;
      }
      iL--; // The above while loop stops iL on the parantheses, now it is on the operator before
    }
    else {
      while(/[\d\.]/.test(str[iL])) {
        iL--;
      }
    }
    // Now iL is the index of the operator before the first prio operator
    num1 = Number(str.substring(iL+1, indexOfPrioOp).split(/[()]/).join(""));

    // Now do the same for the next number
    iR = indexOfPrioOp+1;
    if (str[iR] == "(") { // If it is a parantheses then it is a negative number and we should count "-" symbols as well
      iR++;//Passes the parantheses
      while(/[\d\.\-]/.test(str[iR])) {
        iR++;
      }
      iR++; // The above while loop stops iR on the parantheses, now it is on the operator after
    }
    else {
      while(/[\d\.]/.test(str[iR])) {
        iR++;
      }
    }
    //Now iR is the index of the operator after the first prio operator
    num2 = Number(str.substring(indexOfPrioOp+1, iR).split(/[()]/).join(""));
    ans = opToFunc[str[indexOfPrioOp]](num1, num2);
    str = str.substring(0, iL+1) + ans + str.substr(iR);
    indexOfPrioOp = str.search(/[^\d\.\-()\+]/); //First occurence of divide or multiply symbol
  }
  //No priority operators are left
  var numStr = getNextNumberStr(str);
  str = str.substr(numStr.length);
  ans = Number(numStr.split(/[()]/).join("")); // Removes parantheses and turns into number

  while(str.length >= 1) {

    var operator = str[0];
    str = str.substr(1);
    numStr = getNextNumberStr(str);
    str = str.substr(numStr.length);
    ans = opToFunc[operator](ans, Number(numStr.split(/[()]/).join("")));
  }

  return ans;
}

function getNextNumberStr(str) {
  /* returns the number as a string and WITH parantheses */
  var len = str.length;
  var i = 0;
  var parantheses = 0;

  if (str[i] == "(") {
    // If it is a parantheses then we just have to go past the "-" symbol
    i+=2; // i is now the index of the first digit
    parantheses = 1;
  }
  while(/[\d\.]/.test(str[i])) {
    i++;
  }
  i+= parantheses; // i is now definately the index of the next operator

  return str.substr(0,i);
}

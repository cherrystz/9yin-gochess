$(document).ready(function () {
  var weiqisolutions = undefined;
  var life_qipu = undefined;
  var names = undefined;

  loadList();

  var grids = [
    {
      img: "weiqi_grid1",
      qipan: 0,
      size: 9,
      xoffset: -19,
      yoffset: -19,
      black: "weiqi_hei1",
      white: "weiqi_bai1",
      stonesize: 57,
    },
    {
      img: "weiqi_grid2",
      qipan: 1,
      size: 13,
      xoffset: -8,
      yoffset: -8,
      black: "weiqi_hei2",
      white: "weiqi_bai2",
      stonesize: 37 + 1 /*images are 1px too small*/,
    },
    {
      img: "weiqi_grid3",
      qipan: 2,
      size: 19,
      xoffset: 1,
      yoffset: 1,
      black: "weiqi_hei3",
      white: "weiqi_bai3",
      stonesize: 25,
    },
  ];

  var selectedGame = undefined;
  var qipanIndex = 0;

  var playerMoves = [];
  var robotMoves = [];

  //setup slider
  $("#maxslidervalue").html($("#slider").attr("max"));
  $(document).on("input", "#slider", function () {
    $("#slidervalue").html($(this).val());
    //for each slider change, reset the game then simulate the game up until the slider's value
    loadInitialGame($("#select option:selected").val());
    simulateGame($(this).val());
  });

  //upon selecting a game
  $("#select").change(function () {
    var option = $("#select option:selected").val();
    loadInitialGame(option);
    //setup slider
    resetSlider(option);
  });

  //allow control over displaying undefined chess games
  $("#undefined").change(function () {
    loadList();
  });

  function loadInitialGame(value) {
    //reset board
    $("#game").empty();
    playerMoves = [];
    robotMoves = [];
    selectedGame = value;

    //first find out what type of grid the game has
    qipanIndex = weiqisolutions[value].qipanType;

    var info = "";

    info += "เวลาในการเล่น: " + weiqisolutions[value].time + " วินาที<br />";
    info +=
      "จำนวนที่ผิดพลาดได้: " + weiqisolutions[value].errorTime + " ครั้ง<br />";
    info +=
      "ลำดับเริ่มเล่น: " +
      (weiqisolutions[value].firstTurn == 1 ? "ผู้เล่น" : "NPC") +
      "<br />";

    $("#info").html(info);

    //setup grid
    $("#game").css(
      "background-image",
      "url('images/" + grids[qipanIndex].img + ".png')"
    );

    //place pre-existing stones
    placeStones(weiqisolutions[value].blackPos, "black");
    placeStones(weiqisolutions[value].whitePos, "white");

    //parse player and robot moves
    playerMoves = weiqisolutions[value].playerPos.split(",");
    if (weiqisolutions[value].robotPos != undefined)
      robotMoves = weiqisolutions[value].robotPos.split(",");
  }

  function resetSlider(value) {
    $("#slider").val(0);
    var max = getAmountOfMoves(value);
    $("#maxslidervalue").text(max);
    $("#slidervalue").text("0");
    $("#slider").attr("max", max);
  }

  function getAmountOfMoves(value) {
    var pos = weiqisolutions[value].playerPos.split(",").length;
    var pos2 = 0;
    if (weiqisolutions[value].robotPos != undefined)
      var pos2 = weiqisolutions[value].robotPos.split(",").length;
    return pos + pos2;
  }

  function simulateGame(moveNumberInitial) {
    for (var i = 0; i < moveNumberInitial; i++) {
      var moveNumber = i;
      //moveNumber -= 1;
      var turn = moveNumber % 2;
      moveNumber = Math.floor(moveNumber / 2);

      if (weiqisolutions[selectedGame].firstTurn == 1) {
        //player moves first
        if (turn == 0) {
          //player's turn
          playTurn(playerMoves[moveNumber], i, "black");
        } //bot's turn
        else {
          playTurn(robotMoves[moveNumber], i, "white");
        }
      } //if(weiqisolutions[selectedGame].firstTurn == 2) //bot moves first
      else {
        if (turn == 1) {
          //player's turn
          playTurn(playerMoves[moveNumber], i, "black");
        } //bot's turn
        else {
          playTurn(robotMoves[moveNumber], i, "white");
        }
      }
    }
  }

  function playTurn(playerMove, moveNumberInitial, stonetype) {
    var move = playerMove;

    if (move.indexOf("|") != -1) {
      var stoneEater = move.split("|");
      placeStoneWithMoveNumber(stoneEater[0], stonetype, moveNumberInitial);
      for (var i = 1; i < stoneEater.length; i++) {
        eatStone(stoneEater[i]);
      }
    } else placeStoneWithMoveNumber(move, stonetype, moveNumberInitial);
  }

  function eatStone(position) {
    $("img[data-position='" + position + "']").remove();
  }

  function placeStoneWithMoveNumber(position, type, moveNumber) {
    placeStone(position, type);
    placeNumber(position, moveNumber);
  }

  function placeNumber(position, moveNumber) {
    moveNumber++; //there aint no move 0!
    var g = grids[qipanIndex];
    var top = Math.floor(position / g.size) * g.stonesize + g.yoffset;
    var left = (position % g.size) * g.stonesize + g.xoffset;

    var img = $('<img data-position="' + position + '">');
    img.attr("src", "images/number" + g.stonesize + "/" + moveNumber + ".png");
    img.css({ position: "absolute", top: top + "px", left: left + "px" });
    img.appendTo("#game");
  }

  function placeStone(position, type) {
    var g = grids[qipanIndex];
    var top = Math.floor(position / g.size) * g.stonesize + g.yoffset;
    var left = (position % g.size) * g.stonesize + g.xoffset;

    var img = $('<img data-position="' + position + '">');
    if (type == "black") img.attr("src", "images/" + g.black + ".png");
    else img.attr("src", "images/" + g.white + ".png");
    img.css({ position: "absolute", top: top + "px", left: left + "px" });

    img.appendTo("#game");
  }

  function placeStones(positions, type) {
    if (positions == undefined)
      //in case the board contains ONLY black or white stones at the start
      return;
    if (positions.indexOf(",") == -1) {
      //in case the data contains literally only one stone
      var pos = positions;
      placeStone(pos, type);
    } else {
      var pos = positions.split(",");
      for (var i = 0; i < pos.length; i++) {
        placeStone(pos[i], type);
      }
    }
  }

  //populate list of weiqi games
  function loadList() {
    $("#select").empty();
    try {
      $.ajax({
        url: "life_qipu.ini",
        dataType: "text",
        success: function (data) {
          life_qipu = parseINIString(data);
          $.ajax({
            url: "name.ini",
            dataType: "text",
            success: function (data) {
              names = parseINIString(data);
              $.ajax({
                url: "weiqigame.ini",
                dataType: "text",
                success: function (data) {
                  //populate select list
                  weiqisolutions = parseINIString(data);
                  //var amount = 0;
                  var list = $("#select");
                  list.attr("size", 25);
                  $.each(life_qipu, function (life_qipu_key, life_qipu_value) {
                    var option = $("<option></option>");
                    option.attr("value", life_qipu_value.MiniGame);
                    $.each(names, function (names_key, names_value) {
                      if (names_key == life_qipu_key) {
                        option.text(names_value.Name);
                      }
                    });
                    list.append(option);
                    //amount++;
                  });

                  //I'm lazy so I'll just copypaste the sorting from here https://stackoverflow.com/a/12073377
                  var options = $("#select option");
                  var arr = options
                    .map(function (_, o) {
                      return { t: $(o).text(), v: o.value };
                    })
                    .get();
                  arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                  });
                  options.each(function (i, o) {
                    o.value = arr[i].v;
                    $(o).text(arr[i].t);
                  });
                },
              });
            },
          });
        },
      });
    } catch (e) {
      alert("Could not load essential data. Chances are this page won't work.");
      console.log(e);
    }
  }

  //parse weiqi data
  //https://stackoverflow.com/a/12452845
  function parseINIString(data) {
    var regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
      comment: /^\s*;.*$/,
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function (line) {
      if (regex.comment.test(line)) {
        return;
      } else if (regex.param.test(line)) {
        var match = line.match(regex.param);
        if (section) {
          value[section][match[1]] = match[2];
        } else {
          value[match[1]] = match[2];
        }
      } else if (regex.section.test(line)) {
        var match = line.match(regex.section);
        value[match[1]] = {};
        section = match[1];
      } else if (line.length == 0 && section) {
        section = null;
      }
    });
    return value;
  }

  // searchbar
  $("#gochess-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#select option").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

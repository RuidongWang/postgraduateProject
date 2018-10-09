var hello;
var BlackJackinstance;

//一下均为21所使用的值
//初始化计算所有牌的坐标，用时只取，显得简洁。
var porkerPos = new Array();
var blackjack = 0;
var scale = 1;
var over = 0;
var porker = new Array();
var account;
var players;
var cardNumber = 0;
var Mycards = new Array();
var myID;
var ContractAddress;
var initOver = 1;
var zeroAddress = 0x0000000000000000000000000000000000000000;
var winner;
var start = 1;
var firstCard = 1;

App = {
      web3Provider: null,
      contracts: {},
  
      init: function() {
          return App.initWeb3();
      },
      initWeb3: function() {
  
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        //绑定http的地址。IP地址需要根据实际情况修改
        App.web3Provider = new Web3.prviders.HttpProvider("https://rinkeby.infura.io/v3/fd37c11c05964d05a62ce21071c708a3");//连接rinkeby所使用的
        // App.web3Provider = new Web3.prviders.HttpProvider("https://127.0.0.1");//连接本地测试链所使用的
      }
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    },
    //合约初始化 初始化导入的合约json文件需要根据实际情况修改
    initContract: function() {
      $.getJSON('./BlackJack.json', function(data) {  //修改json文件
        var blackjackArtifact = data;   //获取从json文件中读取到的数据
        App.contracts.BlackJack = TruffleContract(blackjackArtifact); // 合约初始化
        App.contracts.BlackJack.setProvider(App.web3Provider);  //设置provider
        return App.test();
      });
    },
  
    test: function() {
      App.contracts.BlackJack.deployed().then(function(instance){
        BlackJackinstance = instance;
        App.GetAccounts();
        return BlackJackinstance.getContractAddress.call();
      }).then(function(address){
          ContractAddress = address;
          console.log("smart contract address :"+address);
          //通过合约将自己的address发给合约存储到区块链
          BlackJackinstance.addplayer().then(function (result){
              players = result.logs[0].args.players;
              myID = result.logs[0].args.id;
              console.log("players : ", players + " myID : " + myID);
              if(myID == 0)
              {
                  alert("you are the bank");
              }
              //监听event.
              eventWatching();
              initOver = 1;
          });
      });
    },
    GetAccounts: function() {
        web3.eth.getAccounts(function(error, accounts){
             account = accounts[0];
            $("#account").text("your account: "+account);
            console.log(account);
            web3.eth.getBalance(account, function(error, balances){
                var balance = Math.floor((balances["c"][0]/10000.0) * 100) / 100 + "ETH";
                $(".point").text(balance);
                $(".point").css("color","red");
                console.log(balance);
            });
        });
    },
};  

$(function() {
  init();
  initUI();
  App.init();
    // $("#logo").click(function(){  
    //   var account = App.test();
    //   alert($(window).width() + ":" + $(window).height());
    // });
    for (var i = 0; i < 52; ++i) {
    porkerPos[porker[i].suit.toString() + porker[i].value.toString()] = {
        X: -61.7 * (porker[i].value - 1),
        Y: 85.3 * (porker[i].suit - 1)
    }
  }

});

function initUI(){
  var tableX = $(window).width()/4;//使用$(window).width()获得显示器的宽，并算出对应的Div离左边的距离  
  var tableY = $(window).height()/4 - $(window).height()/10;//使用$(window).height()获得显示器的高，并算出相应的Div离上边的距离  
  $("#table").height($(window).height()/2);
  $("#table").width($(window).width()/2);
  $("#table").css("top", tableY).css("left", tableX);  
}
       
function realSend(id, suit, value, owner) {

        var card = getPorker(suit, value);
        var cardp = getPorkerPos(card);

        var pos = cardp.X + 'px ' + cardp.Y + 'px';
        var node = document.getElementById('p_' + id);
        var newNode = document.createElement('div');
        //发暗牌
        if (firstCard && myID != 0) {
           /* 庄家第二章暗牌 通过属性k, v来实现明牌和计算 */
           firstCard = 0;
            newNode.className = "send-card" + id + " card-hidden";
            newNode.setAttribute('k', pos);
            newNode.result = function() {
                this.className = "card";
                this.style.backgroundPosition = this.getAttribute('k');
                console.log("getAttribute:" + this.getAttribute('k'));
            }
        } else {
            newNode.className = "send-card" + id + " card";
            newNode.style.backgroundPosition = pos;
            // console.log("pos:  "+pos);
        }
        if (owner == account)
            newNode.setAttribute('v', card.value);
            node.appendChild(newNode);





}

var begain = 0; //防止没开始游戏直接点击要牌和亮牌的按钮

/* sendCard()
 * 函数功能：1.利用num来实现第一次发牌为一人两张，第二次开始皆为一张。
 *         2.使用setTimeout函数来实现一次性的定时操作：
 *           使得在动画结束后的已设定的时刻，依次调用realSend()函数以衔接发牌动作。
 *         3.实现了防止未开始游戏便点击亮牌的错误逻辑：
 *             新游戏开始调用sendCard(id)则begain++，
 *             若未执行此处，则要牌和亮牌均无法执行。
 */
function sendCard(id, suit, value, owner) {

    var id = getID(owner);
    console.log("id : " + id);
    for (var i = 0; i < 1; ++i) {
        setTimeout(function() {
            realSend(id, suit, value, owner);
        }, 1 * 150 + i * 100);
        setTimeout(function() {
            var n = document.getElementById('p_' + id).getElementsByClassName('send-card' + id);
            if (n.length > 0)
                n[0].classList.remove('send-card' + id);
        }, 1 * 150 + i * 100 + 800);
    }

}
// SUITS：枚举，根据图片分配好4行，低下就是方便循环赋值
var SUITS = {
    HEARTS: 2,
    CLUBS: 1,
    DIAMONDS: 0,
    SPADES: 3,
}
var SUITS_TRANS = {
    0: SUITS.HEARTS,
    1: SUITS.CLUBS,
    2: SUITS.DIAMONDS,
    3: SUITS.SPADES,
}

/* getPorker()
 * 函数功能：1.抽牌函数。
 *         2.每次从开局时定义好的52个数的数组中不放回（porker.pop();）抽牌。
 *         3.返回tmp关联数组供getPorkerPos调用。
 */
function getPorker(suit, value) {
    if (porker.length > 0) {
        var i = Math.floor(Math.random() * porker.length);
        var tmp = {
            suit,
            value
        };
        porker[i].suit = suit;
        porker[i].value = value;
        porker.pop();
        return tmp;
    }
}
// 获取背景坐标
function getPorkerPos(tmp) {
    console.log("getPorkerPos, tmp: " + tmp.suit.toString() + ","+tmp.value.toString());
    return porkerPos[tmp.suit.toString() + tmp.value.toString()];
    
}
/* init()
 * 1.初始化游戏，将候牌区的清空并替换成玩家编号提示。
 * 2.重置blackjack，scale，over值。
 */
function init() {
    for (var i = 0; i < 52; ++i)
        porker[i] = {
            value: i % 13 + 1,
            suit: SUITS_TRANS[Math.floor(i / 13)]
        };
    blackjack = 0;
    scale = 1;
    over = 0;
}
// 玩家操作按钮:
// 给［新局］按钮 添加点击初始化（洗牌）并发牌功能
var btnSend = document.getElementById("btnSend");
    btnSend.onclick = function() {
        // init();
        // sendCard();
        begain = 1;
        BlackJackinstance.StartGame({from:account, gas:6654755});

    }

// 给［要牌］按钮 添加点击发牌功能
var addCard = document.getElementById("addCard");
    addCard.onclick = function() {
        if (begain == 0) {} else {
            getCard();
        }
    }

// 给［亮牌］按钮 添加亮牌并比较的功能
var StandBtn = document.getElementById("showCard");
    StandBtn.onclick = function() {
        if (begain == 0) {} else {
            var sum = getSum();
            BlackJackinstance.Stand(sum, {from:account, gas:6654755});
        }
    }

// 给［退出］按钮 退出游戏返回到开始界面
var exit = document.getElementById("exit");
    exit.onclick = function() {
        BlackJackinstance.exit(myID, {from:account, gas:6654755});
        begain = 0;
        window.history.back(-1);
    }

var logo = document.getElementById("logo");
    logo.onclick = function() {
        BlackJackinstance.getAllstate.call().then(function(players){
            console.log(players);
            console.log("myId : " + myID);
            console.log("initOver : " + initOver);
            console.log("winner: " + winner);
        });
    }

function getID(owner){
    var CardId;
    for(i = 0; i < players.length; i++){
        if(owner == players[i]){
            CardId = i;
            break;
        }
    }
    return (players.length +  CardId - myID) % players.length + 1;
}

function getCard(){
    BlackJackinstance.setCard({from:account}).then(function(result){
        var card;
        start = 0;
        suit = result.logs[0].args.suit.c[0];
        value = result.logs[0].args.number.c[0];
        owner = result.logs[0].args.owner;
        id = getID(owner);
        card = {
            suit: suit,
            value: value,
            owner: owner
        };
        // Mycards.push(card);
        // for (var i = 0; i < Mycards.length; i++){
        //     console.log("值为： " + Mycards[i].value);
        // }
        sendCard(id, suit, value, owner);
    }).catch(function(err) {
        console.log(err.message);
    }); 
}

/* getSum()
 * 
 */

function getSum() {
    var sum = 0;
    var countOfA = 0;
    for (var i = 0; i < Mycards.length; ++i) {
        if (Mycards[i].value > 10){
            sum += 10;
        }
        else if (Mycards[i].value == 1){
            countOfA++;
        } else{
            sum += Mycards[i].value;
        }
    }
    for(i = 0; i < countOfA; i++){
        if (sum + 11 <= 21){
            sum += 11;
        } else {
            sum += 1;
            countOfA--;
        }
    }
    if (sum > 21 && countOfA >= 1 ){
        sum -= 11;
        sum += 1;
    }
    return sum;
}
//事件监听
function eventWatching() {
    getPlayers();
    GameOver();
    cardChange();
}

/** getPlayers()
 *  一旦有新的用户接入，更新事件
 */
function getPlayers(){
    BlackJackinstance.getPlayers(function(error, result) {
            console.log("result : " + result.args.players);
            players = result.args.players;
            alert("Now, we have " + players.length + " players");
    });
}
/** cardChange()
 *  监听新的牌发出，并在合适的位置显示
 */
function cardChange(){
    BlackJackinstance.cardChange(function(error, result) {
            console.log("result : " + result.args.number + " "+ result.args.suit);
            suit = result.args.suit.c[0];
            value = result.args.number.c[0];
            owner = result.args.owner;
            card = {
                suit : suit,
                value : value,
                owner : owner,
            }
            var id = getID(result.args.owner);
            console.log(card);
            if(owner != account || start){
                sendCard(id, suit, value, owner);
            }
            if (owner == account){
                Mycards.push(card);
                var sum = getSum();
                alert("sum : " + sum);
                if (sum == 21){
                    BlackJackinstance.Stand(sum, {from:account, gas:6654755});
                }
                if (sum > 21){
                    var sum = 0;
                    BlackJackinstance.Stand(sum, {from:account, gas:6654755});
                }
            }
    });
}

/** GameOver()
 * 
 */
function GameOver(){
    BlackJackinstance.GameOverEvent(function(error, result){
            var winner = result.args.winer;
            alert("GAME OVER winner is " + winner);
            BlackJackinstance.exit(myID, {from:account, gas:6654755});
            window.history.back(-1);
    });
}
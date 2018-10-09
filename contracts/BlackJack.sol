pragma solidity ^0.4.16;

import "./owned.sol";

contract BlackJack is owned {
    
    
    // uint256 costToPlay;
    uint i;
    event cardChange(uint8 suit, uint8 number, address owner);
    event getPlayers(address[] players, uint8 id);
    event GameOverEvent(address winer);
    event StandEvent(uint8 sum, address owner);

    
    struct Card {
        uint8 suit;
        uint8 number;
        address owner;
    }
    // struct players

    Card[52] public card;
    address zeroAddress = 0x0000000000000000000000000000000000000000;
    // mapping (address => uint) public PlayersToUint;
    // mapping (uint => address) public uintToPlayers;
    address[] players;
    uint8 NumberofWinner = 0;
    struct Winner{
        uint8 num;
        address winner;
    }
    Winner winner;

    // function blackjack() payable public {
    //     costToPlay = .1 ether;
    // }

    // function () payable public {}
    
    function getContractAddress() public  view returns (address){
        return this;
    }

    function setCard() public {
        uint8 randNonce = 0;
        uint8 tmp = randomNumber(randNonce);
        while(card[tmp].owner != zeroAddress){
            randNonce++;
            tmp = randomNumber(randNonce);
        }
        card[tmp].suit = tmp % 4;
        card[tmp].number = tmp % 13 + 1;
        card[tmp].owner = msg.sender;

        emit cardChange(card[tmp].suit, card[tmp].number, card[tmp].owner);
    }

    function getAllCard() public view returns (uint8[52], uint8[52], address[52]){
        uint8[52] memory suits;
        uint8[52] memory numbers;
        address[52] memory owners;

        for(uint8 i; i < 52; i++){
            suits[i] = card[i].suit;
            numbers[i] = card[i].number;
            owners[i] = card[i].owner;
        }
        return (suits, numbers, owners);
    }
    //随机数重要
    function randomNumber(uint8 num) internal returns (uint8 result) {
        uint8 cardNumber = uint8(keccak256(block.blockhash(block.number), num, now));
        return cardNumber % 52;
    }

    function clearAllCard() public{
        delete card;
    }

    function addplayer() public {
        uint8 a = 0;
        uint8 id;
        for(uint8 i = 0; i < players.length; i++){
            if(players[i] == msg.sender){
                a = 1;
            }
        }
        if(a == 0){
            players.push(msg.sender);
        }
        for(i = 0; i < players.length; i++){
            if(players[i] == msg.sender){
                id = i;         
            }
        }
        emit getPlayers(players, id);
    }
    function getPlayersNoGas() public view returns (address[]){
        return (players);
    }

    function Stand(uint8 num) public {
        // msg.sender.transfer(1 ether);
        // delete players;
        if (NumberofWinner == 0){
            winner.winner = msg.sender;
            winner.num = num;
        }else {
            if(winner.num < num){
                winner.winner = msg.sender;
                winner.num = num;
            }else if(winner.num == num){
                delete players;
                NumberofWinner = 0;
                emit GameOverEvent(zeroAddress);
                return;
            }
        }
        NumberofWinner++;
        if(NumberofWinner == players.length){
            delete players;
            NumberofWinner = 0;
            emit GameOverEvent(winner.winner);
            return;
        }
    }

    function exit(uint8 _index) public {
        uint len = players.length;
        if (_index >= len) {
            return;
        }
        for(uint8 i = _index; i < len - 1; i++){
            players[i] = players[i+1];
        }
        players.length--;
    }

    function getAllstate() public view returns (address[], uint8){
        return (players, NumberofWinner);
    }

    function StartGame() public {
        delete card;
        NumberofWinner = 0;
        for(uint j = 0; j < 2; j++){
            for (uint i = 0; i < players.length; i++){
                uint8 randNonce = 0;
                uint8 tmp = randomNumber(randNonce);
                while(card[tmp].owner != zeroAddress){
                    randNonce++;
                    tmp = randomNumber(randNonce);
                }
                card[tmp].suit = tmp % 4;
                card[tmp].number = tmp % 13 + 1;
                card[tmp].owner = players[i];
                emit cardChange(card[tmp].suit, card[tmp].number, card[tmp].owner);
            }
        }
    }
}
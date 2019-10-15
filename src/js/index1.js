var config = {
    contianer : document.getElementsByClassName('container')[0],
    start : document.getElementsByClassName('start')[0],
    gameover : document.getElementsByClassName('gameover')[0],
    size : 10,
    maxX : 39,
    maxY : 39
}

//链表
//蛇的每一个小部分
function SnakeItem(x,y){
    this.x = x;
    this.y = y;
    this.elem = document.createElement('div');
    config.contianer.appendChild(this.elem);
    this.elem.className = 'size';
    this.next = null;
    this.previous = null;
    this.show();
}

//把蛇的每个小部分呈现出来
SnakeItem.prototype.show = function (){
    this.elem.style.left = this.x * config.size + 'px';
    this.elem.style.top = this.y * config.size + 'px';
}

//把蛇的每个小部分的前后链接起来
SnakeItem.prototype.previousElement = function (elem) {
    this.previous = elem;
    elem.next = this;
}

SnakeItem.prototype.nextElement = function (elem) {
    this.next = elem;
    elem.previous = this;
}


//把蛇的运动分解
//其实就是蛇的每个身体部分跟随头部，向前走，每个部分移动到他们自己前面的那个方块的位置
SnakeItem.prototype.itemMove = function (){
    if(this.next){
        this.next.itemMove();
    }
    if(this.previous){
        this.setPosition(this.previous.x,this.previous.y);
    }
}

//往头部方向的蛇的小部分往前移的本质就是把他前面的小方块的位置赋值到自己的原来的位置坐标
SnakeItem.prototype.setPosition = function (x,y){
    this.x = x;
    this.y = y;
    this.show();
}

//创建蛇的初始身体
function InitialSnake (length){
    this.length = length;
    this.direction = 'right';//初始化蛇的方向，默认为向右
    this.timer = null;//给定时器赋一个值，防止之前有其他定时器影响效果
    var cuurElement = null;//在没有创造出蛇的任何一部分时，值为null
    for(var i = 0; i < length; i ++){
        var item = new SnakeItem(i,0);//在蛇的运动范围的左上角开始一个接着一个创建舍得身体，连成一条蛇的身体
        if(cuurElement !== null){
            cuurElement.previousElement(item);//把创造出来的身体一个一个向头部方向连
        }
        cuurElement = item;
        if(i === length - 1){//当转到最后一圈，就是蛇的头部了，要做好标记
            this.head = item;
            this.head.elem.style.backgroundColor = 'red';
        }
    }
}

//加身体
InitialSnake.prototype.addItem = function (){
    this.length ++;
    var tail = this.head;
    var item = new SnakeItem(-1,-1);
    while(tail.next){
        tail = tail.next;
    }
    tail.nextElement(item);
}


InitialSnake.prototype.stop = function () {
    clearInterval(this.timer);
}
//要知道蛇的头部下一个位置是哪
InitialSnake.prototype.getNextPositon = function (){
    var pos = {
        x : this.head.x,
        y : this.head.y,
    }
    switch(this.direction){
        case 'right' :
            pos.x ++;
            break;
        case 'left' :
            pos.x --;
            break;
        case 'down' :
            pos.y ++;
            break;
        case 'up' :
            pos.y --;
            break;
    }
    return pos;
}

//判断蛇还能不能运动，两种情况，一是撞上了边界，二是撞上了自己的身体
InitialSnake.prototype.isCanMove = function (pos){
    if(pos.x < 0 || pos.y < 0 || pos.x > config.maxX || pos.y >config.maxY ){
        return false;
    }
    var item = this.head;
    while(item.previous){
        console.log(111)
        if(pos.x == item.x && pos.y == item.y){
            console.log(222)
            return false;
        }
    }
    return true;
}

//方向的限制以及方向的改变
InitialSnake.prototype.changeDiection = function (newDirection){
    var allows = [];
    if(this.direction === 'right' ||this.direction === 'left'){
        allows = ['up','down'];
    }else{
        allows = ['right','left'];
    }
    if(allows.includes(newDirection)){
        this.direction = newDirection;
    }
}

InitialSnake.prototype.stop = function (){
    clearInterval(this.timer);
}

function Food(x,y){
    this.x = x;
    this.y = y;
    this.elem = document.createElement('div');
    config.contianer.appendChild(this.elem);
    this.elem.className = 'size1';
    this.show();
}

Food.prototype.show = function (){
    this.elem.style.left = this.x * config.size + 'px';
    this.elem.style.top = this.y * config.size + 'px';
}


//吃掉食物
Food.prototype.remove = function (){
    this.elem.remove();
}

function Game (){
    this.snake = new InitialSnake(8);
    this.creatFood();
    this.autoMove();
}

//蛇的整体运动，注意蛇的运动是依靠判断头部的方向，来带动后面蛇的身体的运动
Game.prototype.moveForward = function (){
    var pos = this.snake.getNextPositon();
    if(!this.snake.isCanMove(pos)){
        gameOver();
        this.snake.stop();
        return;
    }else{
        this.snake.head.itemMove();
        this.snake.head.setPosition(pos.x,pos.y);
        if(pos.x === this.food.x && pos.y === this.food.y){
            this.snake.addItem();
            this.food.remove();
            this.creatFood();
        }
    }
}


// 蛇的自动运动
Game.prototype.autoMove = function () {
    clearInterval(this.snake.timer);
    var that = this;
    this.timer = setInterval(function (){
        that.moveForward();
    },300)
}
config.start.addEventListener('click',playGame,false);

function playGame(){
    var game = new Game();
    window.onkeydown = function (e){
        switch (e.key) {
            case 'ArrowUp':
                game.snake.changeDiection('up');
                game.moveForward();
                break;
            case 'ArrowDown':
                game.snake.changeDiection('down');
                game.moveForward();
                break;
            case 'ArrowRight':
                game.snake.changeDiection('right');
                game.moveForward();
                break;
            case 'ArrowLeft':
                game.snake.changeDiection('left');
                game.moveForward();
                break;
            default:
                break;
        }
    }
}

Game.prototype.creatFood = function (){
    var pos = this.getPosition();
    this.food = new Food(pos.x,pos.y);
} 

//食物出现的位置
Game.prototype.getPosition = function (){
    var pos = [];
    for(var x = 0; x < config.maxX; x ++){
        for(var y = 0; y < config.maxY; y ++){
            pos.push({x,y});
        }
    }
    var num = Math.floor(Math.random() * pos.length);
    return pos[num];
}


function gameOver(){
    config.gameover.style.display = 'block';
    config.start.removeEventListener('click',playGame,false);
    window.onkeydown = false;
}



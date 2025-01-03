let myButton = document.querySelector('button');
let myHeading = document.querySelector('h1');
let ifAngry = false;
let preventTimes = 0;

document.querySelector('img').onclick = function() {
    alert("戳我干嘛");
    if(ifAngry) {
        if(preventTimes>0){ alert("戳我我也不理你！"); preventTimes -= 1; }
        else{
            alert("哼！看你这么诚恳了...");
            alert("允许你啦")
        }
    }
    else {
        alert("看我把你名字删了");
        if (!localStorage.getItem('name')) {
            alert("阿勒？？没有你的名字？")
            alert("那就勉强原谅你一次啦...")
        }
        else {
            myHeading.textContent = "哼哼哼";
            localStorage.clear();
        }
    }
}
function setUserName() {
    let UserName = prompt("该怎么称呼您？\n-ps:莫名有种养成类游戏的感觉");
    if (!UserName || UserName === null) {
        alert("不是说好了要改称呼的吗？！");
        myHeading.textContent = "哼，不理你了！";
        ifAngry = true;
        preventTimes = Math.floor(Math.random()*(9-4+1))+4;
        
    }
    else {
        localStorage.setItem('name', UserName);
        myHeading.textContent = "欢迎回来，" + UserName;
    }
    
}

if(localStorage.getItem('name')) {
    myHeading.textContent = '欢迎回来，' + localStorage.getItem('name');
}


myButton.onclick = function()
{
    if(ifAngry) {
        if(preventTimes>0){ alert("哼，就不理你！"); preventTimes -= 1; }
        else{
            alert("哼！看在你的诚意上啦...");
            setUserName();
        }
    }
    else {
        alert("要设置称呼吗？");
        setUserName();
    }
    
}
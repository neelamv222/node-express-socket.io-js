var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var lodash = require("lodash");

app.use(express.static("public"));
var port = 8080;
var messageCollection = [];
var userNameList = [];

// launch our backend into a port
server.listen(port, () => console.log(`LISTENING ON PORT ${port}`));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(client){
    console.log("client connected");

    client.on("saveUserName", function(name) {
        client.nickName = name;
        userNameList.push(client.nickName);
        //If onload there is only one user the clear the msgs
        var msgCollection = userNameList.length <= 1 ? [] : messageCollection;
        client.emit("broadcastMsg", msgCollection.concat({name: client.nickName, data: "joined", recent: true}));
        client.broadcast.emit("broadcastMsg", msgCollection.concat({name: client.nickName, data: "joined", recent: true}));
        client.broadcast.emit("broadcastMsgToLeft", userNameList);
        client.emit("broadcastMsgToLeft", userNameList); 
    });

    client.on("userMsg", function(data) {
        console.log("data in server", data);
        var sendFinalData = {name: client.nickName, data};
        client.broadcast.emit("broadcastMsg", sendFinalData);
        client.emit("broadcastMsg", sendFinalData);
        messageCollection.push(sendFinalData);
    });
    client.on("disconnect", function() {
        userNameList = lodash.filter(userNameList, (user) => (user !== client.nickName));
        client.broadcast.emit("broadcastMsg", {name: client.nickName, data: "left", recent: true});
        client.broadcast.emit("broadcastMsgToLeft", userNameList);
    });
});

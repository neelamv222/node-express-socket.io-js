var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

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

    var nickName = "";
    client.on("saveUserName", function(name) {
        client.nickName = name;
        userNameList.push(client.nickName);
        client.emit("broadcastMsg", messageCollection);
        client.broadcast.emit("broadcastMsgToLeft", userNameList);
        client.emit("broadcastMsgToLeft", userNameList); 
    });

    client.on("userMsg", function(data) {
        console.log("data in server", data);
        var sendFinalData = client.nickName + ": " + data;
        client.broadcast.emit("broadcastMsg", sendFinalData);
        client.emit("broadcastMsg", sendFinalData);
        messageCollection.push(sendFinalData);
    });
});

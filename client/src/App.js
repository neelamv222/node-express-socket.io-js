import React, { Component } from 'react';
import openSocket from "socket.io-client";
import './App.css';

const socket = openSocket("http://localhost:8080");

class App extends Component {
  constructor(props) {
    super(props);
    var self = this;
    this.state = {
      inputValue: "neel",
      name: "",
      msgList: [],
      userList: []
    }
    const name = prompt("Please enter your name: ");

    // Listen to broadcast server when someone send the msg and display msg in the chat
    socket.on("broadcastMsg", (data) => {
      self.setState({msgList: self.state.msgList.concat(data)});
    });

    // Listen to broadcast server when someone join the chat and display the user name on left panel
    socket.on("broadcastMsgToLeft", (data) => {
      self.setState({userList: data});
    });

    self.setState({name});
    socket.emit("saveUserName", name || "Guest");
  }

  onChange = (e) => {
    this.setState({inputValue: e.target.value});
  };

  // On enter key press below code will send the msg to server
  onKeyPress = (e) => {
    const {inputValue} = this.state;
    if(e.key === "Enter") {
      socket.emit("userMsg", inputValue);
      this.setState({inputValue: ""});
    }
  };

  // On send button click below code will send the msg to server
  sendMsg = () => {
    const {inputValue} = this.state;
    socket.emit("userMsg", inputValue);
    this.setState({inputValue: ""});
  };

  displayUser = () => {
    const {userList} = this.state;
    return userList.map(user => <p>{user}</p>);
  }

  displayMsg = () => {
    const {msgList} = this.state;
    return Array.isArray(msgList) ? msgList.map(msg => <p>{msg}</p>) : <p>{msgList}</p>;
  }

  render() {
    return (
      <div className="container">
        <h1> Welcome to Chat App</h1>
        <div className="row">
            <div className="col-16 chat-container">
                <div id="chat-left" className="col-4 chat-left">
                  {this.displayUser()}
                </div>
                <div className="col-12 chat-right">
                    <div id="log" className="chat-top">
                    {this.displayMsg()}
                    </div>
                    <input id="input" value={this.state.inputValue} onKeyPress={this.onKeyPress}
                      placeholder="Type..." className="search" onChange={this.onChange} />
                    <button onClick={this.sendMsg}>Send</button>
                </div>
            </div>
        </div> 
      </div>
    );
  }
}

export default App;

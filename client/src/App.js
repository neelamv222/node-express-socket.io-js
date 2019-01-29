import React, { Component } from 'react';
import openSocket from "socket.io-client";
import './App.css';
import {times} from "lodash";

const socket = openSocket("http://localhost:8080");

class App extends Component {
  constructor(props) {
    super(props);
    var self = this;
    this.state = {
      inputValue: "",
      name: "",
      msgList: [],
      userList: [],
      showEmojiWrapper: false
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
    const displayArr = msgList.map(msg => {
    const subStr = msg.slice(
        msg.indexOf("[") + 1, 
        msg.indexOf("]")
    );
    const remainingStr = msg.slice(
      msg.indexOf("]") + 1, msg.length
    );
      // Till now it will display emoji only when we select emoji first and then some other text
      // or in case when we slect only emoji and write no text.
      //TODO: Need to make emoji work with text wrapping it from both sides and also if more than one emoji is selected.
      if (msg.includes(".gif")) {
      return (<span><img src={`emoji/${subStr}`} alt="emoji"/><p>{remainingStr}</p></span>);
      }
      return <p>{msg}</p>;
    });
    return Array.isArray(msgList) ? displayArr : <p>{msgList}</p>;
  }

  sendEmoji = (id) => () => {
    this.setState({inputValue: `${this.state.inputValue} [${id}.gif]`});
    document.getElementById("input").focus();
    this.setState({showEmojiWrapper: false});
  }

  onEmojiClick = () => {
    this.setState({showEmojiWrapper: !this.state.showEmojiWrapper});    
  }

  displayAllEmojis  = () => {
    const emojis = times(68, String);
   return emojis.map(emoji => {
      return <img src={`emoji/${emoji}.gif`} alt="emoji" id={`emoji${emoji}`} onClick={this.sendEmoji(emoji)}/>
    });
  }

  render() {
    const {inputValue, showEmojiWrapper} = this.state;
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
                    <input id="input" value={inputValue} onKeyPress={this.onKeyPress}
                      placeholder="Type..." className="search" onChange={this.onChange} />
                    <button onClick={this.sendMsg}>Send</button>
                    <button onClick={this.onEmojiClick}>Emoji</button>
                    {
                      showEmojiWrapper && (
                        <div className="emojiWrapper">
                        {this.displayAllEmojis()}
                        </div>
                      )
                    }
                </div>
            </div>
        </div> 
      </div>
    );
  }
}

export default App;

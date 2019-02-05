import React, { Component } from 'react';
import openSocket from "socket.io-client";
import ReactHtmlParser from "react-html-parser";
import './App.css';
import {times} from "lodash";

const socket = openSocket("http://localhost:8080");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      name: "",
      msgList: [],
      userList: [],
      showEmojiWrapper: false
    }
  }

  
  componentDidMount(){
    const name = prompt("Please enter your name: ");

    // Listen to broadcast server when someone send the msg and display msg in the chat
    socket.on("broadcastMsg", (data) => {
      this.setState({msgList: this.state.msgList.concat(data)});
    });

    // Listen to broadcast server when someone join the chat and display the user name on left panel
    socket.on("broadcastMsgToLeft", (data) => {
      this.setState({userList: data});
    });

    this.setState({name});
    socket.emit("saveUserName", name || "Guest");
    document.getElementById("input").focus();
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
    inputValue && socket.emit("userMsg", inputValue);
    this.setState({inputValue: ""});
  };

  displayUser = () => {
    const {userList} = this.state;
    return userList.map(user => <p>{user}</p>);
  }

  replaceAt = (index, replacement, msg, g) => {
    return msg.substr(0, index) + replacement + msg.substr(index + g.length);
  };

  displayMsg = () => {
    return this.displayArr();
  }

  displayArr = () =>  {
    const {msgList} = this.state;
    return msgList.map(msg => {
      const matchSubStr = msg.data.match(/\[(\d){1,2}.gif]/g) || [];
      let finalStr = msg.data;
      matchSubStr.forEach(g => {
        var imgIndex = finalStr.indexOf(g);
        var src = `emoji/${g.slice(g.indexOf("[") + 1, g.indexOf("]"))}`;
        const getReplacedVal = this.replaceAt(imgIndex, `<img src=${src} alt="emoji" />`, finalStr, g);
        finalStr = getReplacedVal;
      });
      if (msg && msg.data.indexOf(".gif") >= 0) {
        return (<span><p>{msg.name} : {ReactHtmlParser(finalStr)}</p></span>);
        }
        return <p  className={msg.data}>{msg.name} : {msg.data}</p>;
      });
  }; 

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
                <div id="chat-left" className="col-3 chat-left">
                  {this.displayUser()}
                </div>
                <div className="col-13 chat-right">
                    <div id="log" className="chat-top">
                    {this.displayMsg()}
                    </div>
                    <input id="input" value={inputValue} onKeyPress={this.onKeyPress}
                      placeholder="Type..." className="search" onChange={this.onChange} />
                    <button className="btn btn-primary" onClick={this.sendMsg}>Send</button>
                    <button className="btn btn-secondary"onClick={this.onEmojiClick}>Emoji</button>
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

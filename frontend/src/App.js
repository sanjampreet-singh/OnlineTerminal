import React, { Component } from "react";
import "./App.css";
import "xterm/dist/xterm.css";
import { Terminal } from "xterm";
import * as attach from "xterm/lib/addons/attach/attach";
import * as fit from "xterm/lib/addons/fit/fit";

class App extends Component {
  async componentDidMount() {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    let socketURL =
      protocol +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "") +
      "/terminals/";
      
    const term = new Terminal();
    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);

    term.open(this.termElm);
    term.fit(this.termElm);

    let res = await fetch(
      "/terminals?cols=" + term.cols + "&rows=" + term.rows,
      { method: "POST" }
    );

    let processId = await res.text();

    // const pid = processId;
    socketURL += processId;
    const socket = new WebSocket(socketURL);

    socket.onopen = () => {
      term.attach(socket);
      term._initialized = true;
    };
    this.term = term;
    window.addEventListener("resize", async function () {
      term.resize(term.cols, term.rows);
      term.clear();
      term.fit(this.termElm);

      await fetch("/terminals?cols=" + term.cols + "&rows=" + term.rows, {
        method: "POST",
      });

      this.term = term;
    });
  }

  render() {
    return (
      <div className="App">
        <div style={{width:"100%", height:"100%"}}>
          <div ref={(ref) => (this.termElm = ref)}></div>
        </div>
      </div>
    );
  }
}

export default App;

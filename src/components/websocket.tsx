import React from 'react';

const socket = new WebSocket(
    "wss://hdkt3jtq6c.execute-api.ap-northeast-1.amazonaws.com/dev"
);

function WebSocketComponent() {
    let message = "";
    React.useEffect(() => {
        socket.onopen = (event) => {
            // クライアント接続時
            console.log("onopen", event);
        };

        socket.onmessage = (event) => {
            // サーバーからのメッセージ受信時
            console.log("onmessgae", event);
            message = event.data;
        };

        socket.onclose = (event) => {
            // クライアント切断時
            console.log("onclose", event);
        };

        return () => {
            // if (socket.readyState === 1) {
            //     socket.close();
            // }
        };
    });

    return (
        <div>
            <p>WebSocketComponent { message }</p>
        </div>
    );
}

export default WebSocketComponent;
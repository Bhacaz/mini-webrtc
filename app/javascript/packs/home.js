import consumer from "../channels/consumer"

let myVideo;
let remoteVideo;
let peerConnection;
const sessionId = Math.random().toString();
const webrtcConfiguration = {
    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
};

const webrtcChannel = consumer.subscriptions.create({ "channel": "WebrtcChannel", "room": "video_call" }, {
    connected() {
    },

    disconnected() {
    },

    received(data) {
        if ( data.sessionId === sessionId) { return }
        switch(data.event) {
            case "offer":
                handleOffer(data.offer, data.sessionId);
                break;
            case "answer":
                handleAnswer(data.answer, data.sessionId);
                break;
            case "candidate":
                handleCandidate(data.candidate, data.sessionId);
                break;
            default:
                break;
        }
    }
});

function getStreamHandler(stream) {
    myVideo.srcObject = stream;
    peerConnection = new RTCPeerConnection(webrtcConfiguration);
    peerConnection.addStream(stream);
    peerConnection.onaddstream = (e) => remoteVideo.srcObject = stream
    peerConnection.onicecandidate =  (event) => {
        if (event.candidate) {
            webrtcChannel.send({ event: 'candidate', candidate: event.candidate, sessionId: sessionId })
        }
    };
}

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

//when we got an answer from a remote user
function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
};

function handleOffer(offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        peerConnection.createAnswer((answer) => {
            peerConnection.setLocalDescription(answer);
            webrtcChannel.send({ event: 'answer', answer: answer, sessionId: sessionId });
        }, (error) => alert("Error when creating an answer"));
};

function sendOffer() {
    peerConnection.createOffer((offer) => {
        webrtcChannel.send({ event: 'offer', offer: offer, sessionId: sessionId })
        peerConnection.setLocalDescription(offer);
    }, (error) => alert("Error when creating an offer"));
}

document.addEventListener("DOMContentLoaded", () => {
    myVideo = document.getElementById('myVideo');
    remoteVideo = document.getElementById('remoteVideo');

    document.getElementById('askForCameraPermission').onclick = () => {
        navigator.getUserMedia({ video: true, audio: false }, getStreamHandler, (error) => {});
    }

    document.getElementById('sendOffer').onclick = sendOffer
});

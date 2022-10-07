
const recordbtn = document.getElementById('recordbtn')
const video = document.getElementById("recording")
const recordedVid = document.getElementById("recorded")
recordedVid.hidden = true

let mediaRecorder
let videoUrl
let recordedBlob 

async function init() {

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: {exact: true}
              },
            video: true
        });
        
        startWebcam(stream);

    } catch (err) {

        console.log('error retriveing media devices.');
        console.log(err);
    }

}

function startWebcam(stream) {
    window.stream = stream;
    video.srcObject = stream;
}

recordbtn.onclick = async () => {
    
    switch (recordbtn.innerText) {
        case 'Start Recording':
            startRecording();
            recordbtn.innerText = 'Stop Recording';
            break;

        case 'Stop Recording':
            recordbtn.innerText = 'Start Recording';
            stopRecording();
            break;
        
        case 'Upload':
            recordbtn.innerText = 'Uploading ...';
            recordbtn.disabled = true
            await uploadVideo(recordedBlob);
            break;
    }

}

function startRecording() {
    if (video.srcObject === null) {
        video.srcObject = window.stream;
    }
    
    mediaRecorder = new MediaRecorder(window.stream, {mimeType: 'video/webm;codecs=vp9,opus'});
    mediaRecorder.start();
    mediaRecorder.ondataavailable = recordVideo;
    recordbtn.innerText = 'Stop Recording';

    setTimeout(() => {
        stopRecording()
    }, 30000);
}

function recordVideo(event) {
    if (event.data && event.data.size > 0) {
        video.srcObject = null;
        recordedBlob = []
        recordedBlob.push(event.data)

        videoUrl = URL.createObjectURL(event.data);
        recordedVid.hidden = false
        video.hidden = true
        recordbtn.innerText = 'Upload';
        recordedVid.src = videoUrl;
        recordedVid.controls = true
        recordedVid.play()
        
    }
}

function stopRecording() {
    mediaRecorder.stop();
    recordPreview.removeAttribute("muted")
    recordbtn.innerText = 'Start Recording';
}

async function uploadVideo(recordedBlobs){    
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});

    
    const formdata = new FormData()
    formdata.append('upl', blob, `video${Math.random()}.mp4`)
    console.log(formdata)
    /**
     * Upload the video to the backend service 
     * 
     * @url localhost:3000
     */
      
      fetch("http://localhost:3000/api/v1/submit", {
        method: "POST",
        body: formdata
      })
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
   
    

    // recordbtn.innerText = 'Start Recording';
}



init();
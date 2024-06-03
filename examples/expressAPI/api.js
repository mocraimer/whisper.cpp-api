const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
app.use(express.json());
const port = 3000;

app.post('/transcribe', async (req, res) => {
    console.log(req.body)
    const { file, language, model, options } = req.body;
    
    // Validate input
    if (!file || !language || !model) {
        console.log("in top")
        return res.status(400).send('Missing required parameters');
    }
    
    // Create a temporary directory for the audio file
    // const tmpDir = fs.mkdtempSync('whisper-');
    // const filePath = `${tmpDir}/${file.name}`;
    
    // Write the audio file to disk
    //   await file.mv(filePath);
    
    // Build the command line arguments for whisper.cpp
    const args = [
        '-m',
        model,
        '-f',
        file.name,
        '-l',
        language,
        ...(options || []),
    ];
    
    // Spawn the whisper.cpp process from terminal
    // const child = spawn('../../main', args);
    // Spawn the whisper.cpp process from docker
    const child = spawn('/app/main', args);
    
    // Capture the output of the process
    let output = '';
    child.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    //   Handle errors
    child.stderr.on('data', (data) => {
        console.error(`Error: ${data.toString()}`);
        // console.log("in error")
        // res.status(500).send('Internal server error');
    });
    
    // Send the response when the process exits
    child.on('close', (code) => {
        if (code === 0) {
            console.log("in close")
            res.send(output);
        } else {
              res.status(500).send({1:'Internal server error', 2:output});
        }
    });
    
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

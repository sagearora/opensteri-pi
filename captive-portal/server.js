const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = 8080;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the Wi-Fi selection page
app.get("/", (req, res) => {
    exec("nmcli -t -f SSID dev wifi", (error, stdout) => {
        if (error) {
            return res.send("<h1>Error fetching Wi-Fi networks</h1>");
        }

        const networks = stdout
            .split("\n")
            .filter(line => line)
            .map(ssid => `<option value="${ssid}">${ssid}</option>`)
            .join("");

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Wi-Fi Configuration</title>
            </head>
            <body>
                <h1>Configure Wi-Fi</h1>
                <form action="/submit" method="POST">
                    <label for="ssid">SSID:</label>
                    <select id="ssid" name="ssid" required>
                        ${networks}
                    </select><br>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required><br>
                    <button type="submit">Connect</button>
                </form>
            </body>
            </html>
        `);
    });
});

app.post("/submit", (req, res) => {
    const { ssid, password } = req.body;
    const connectionId = `wifi-connection`; // Unique ID for the connection

    // Prevent multiple responses
    let responseSent = false;

    // Create a temporary connection profile
    const createCmd = `
        nmcli connection add type wifi con-name "${connectionId}" ifname wlan0 ssid "${ssid}" &&
        nmcli connection modify "${connectionId}" wifi-sec.key-mgmt wpa-psk wifi-sec.psk "${password}"
    `;

    exec(createCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating connection: ${stderr}`);
            if (!responseSent) {
                responseSent = true;
                return res.send(`
                    <h1>Error Configuring Wi-Fi</h1>
                    <p>${stderr}</p>
                    <a href="/">Try Again</a>
                `);
            }
        }

        console.log(`Connection profile created: ${stdout}`);

        // Test the connection with a timeout
        const testCmd = `nmcli connection up "${connectionId}"`;
        const child = exec(testCmd);

        let timeout = setTimeout(() => {
            if (!responseSent) {
                console.error("Connection attempt timed out.");
                responseSent = true;
                child.kill(); // Terminate the nmcli command
                exec(`nmcli connection delete "${connectionId}"`); // Clean up the temporary connection
                res.send(`
                    <h1>Connection Timed Out</h1>
                    <p>Unable to connect to SSID "${ssid}". Please check the credentials and try again.</p>
                    <a href="/">Back</a>
                `);
            }
        }, 10000); // 10-second timeout

        child.on("exit", (code) => {
            if (!responseSent) {
                clearTimeout(timeout); // Clear the timeout if the process completes
                responseSent = true; // Ensure only one response is sent
                if (code === 0) {
                    console.log("Connection verified successfully.");
                    res.send(`
                        <h1>Wi-Fi Configured</h1>
                        <p>Connected successfully to SSID "${ssid}".</p>
                    `);
                    // Disconnect from the AP after a successful connection
                    exec(`nmcli connection down MyAP`);
                } else {
                    console.error(`Error activating connection: Exit code ${code}`);
                    exec(`nmcli connection delete "${connectionId}"`); // Clean up the temporary connection
                    res.send(`
                        <h1>Invalid Wi-Fi Credentials</h1>
                        <p>Failed to connect to SSID "${ssid}". Please check the credentials and try again.</p>
                        <a href="/">Back</a>
                    `);
                }
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

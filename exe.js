
    const { exec } = require("child_process");

    let start = 1;

    let end = 2;

    exec("node index.js \${start} \${end}", (error, stdout) => {

        if (error) {

            console.error(`Error: \${error.message}`);

            return;

        }

        console.log(stdout);

    });

    
const { exec } = require('child_process');
let en = 0;
let nextEn = 1;

const codeString = `
const { exec } = require("child_process");\n
let start = ${en};\n
let end = ${nextEn};\n
exec("node index.js \\\${start}\ \\\${end}\", (error, stdout) => {\n
    if (error) {\n
        console.error(\`Error: \\\${error.message}\`);\n
        return;\n
    }\n
    console.log(stdout);\n
});\n
`;

console.log(codeString);
const Faker = require("@faker-js/faker");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const { inspect } = require("util");
const ejs = require("ejs");
let faker = Faker.faker;
const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fake Info</title>
    
<link href="https://cdn.jsdelivr.net/npm/daisyui@2.51.6/dist/full.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- table -->
    <div class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
          <div class="max-w-2xl">
            <h1 class="text-5xl font-bold pb-10">Table of ALL the info from this data</h1>
            <div class="overflow-x-auto">
                <table class="table w-full">
                  <!-- head -->
                  <thead>
                    <tr>
                      <th></th>
                   <th>key</th>
                   <th>value</th>
                      <!-- <th>Name</th>
                      <th>Job</th>
                      <th>Favorite Color</th> -->
                    </tr>
                  </thead>
                  <tbody>
                  
                  
                   <% Object.entries(data).forEach(([key, value], index) => { %>
                    <tr class="hover">
                        <th><%=index%></th>
                        <td><%=key%></td>
                        <td><%=value%></td>
                      </tr>
                    <% }); %>
                   
                  </tbody>
                </table>
              </div>
          </div>
        </div>
      </div>
</body>
</html>`;
const questions = [
  {
    type: "input",
    name: "uselang",
    message: "What language do you want to use?",
    default: "en",
  },
  {
    type: "confirm",
    name: "writefiles",
    message: "Write to this Folder? (" + process.cwd() + path.sep + ")",
    default: false,
  },
];
const runProgram = (answers) => {
  if (!Faker.allLocales[answers.uselang]) {
    console.log(
      `The language ${answers.uselang} is not supported or does not exist`
    );
    console.log(
      "Did you mean " +
        Object.keys(Faker.allLocales).find((e) =>
          e.startsWith(answers.uselang[0])
        )
    );
    console.log(" You can use the following languages: ");
    console.log("-\t" + Object.keys(Faker.allLocales).join("\n-\t"));
    process.exit(1);
  } else {
    if (answers.uselang !== "en") {
      faker = Faker["faker" + answers.uselang.toUpperCase()];

      console.log("Using language: " + "faker" + answers.uselang);
    }
  }

  let str = "";
  let data = {};
  Object.entries(faker.person).forEach(([key, value]) => {
    if (key !== "faker") {
      const v = value();
      data[key] = typeof v === "object" ? inspect(v) : v;
    }
  });
  Object.entries(faker.finance).forEach(([key, value]) => {
    if (key !== "faker") {
      const v = value();
      data[key] = typeof v === "object" ? inspect(v) : v;
    }
  });

  Object.entries(faker.internet).forEach(([key, value]) => {
    if (key !== "faker") {
      const v = value();
      data[key] = typeof v === "object" ? inspect(v) : v;
    }
  });
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "faker") {
      str += `${key} \t\t=\t\t ${value}\n`;
    }
  });
  console.log(str);
  if (answers.writefiles) {
    const parser = new Parser({});
    console.log(
      "Writing .json, .html, .csv, .txt files to " + process.cwd() + path.sep
    );
    fs.writeFileSync(
      process.cwd() + path.sep + "faker.json",
      JSON.stringify(data, null, 2)
    );
    fs.writeFileSync(process.cwd() + path.sep + "faker.txt", str);
    fs.writeFileSync(
      process.cwd() + path.sep + "faker.html",
      ejs.render(template, { data })
    );
    fs.writeFileSync(
      process.cwd() + path.sep + "faker.csv",
      parser.parse(data)
    );
    console.log("\nDone\n");
  }
};
if (process.argv.includes("--no-interactive")) {
  const writeFiles = process.argv.includes("--write-files");
  runProgram({ uselang: "en", writefiles: writeFiles });
} else {
  inquirer.prompt(questions).then((answers) => {
    // console.log(answers, Faker.allLocales)
    runProgram(answers);
  });
}

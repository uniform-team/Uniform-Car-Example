Uniform Car Example Interative Repository
==========================

This example will show you how to:
* Create a new NodeJS server
* Set up a simple form
* Install Uniform
* Use uniform to validate that form

This is an interactive Git repository, so you can pull the code and follow along with each step.
Let's get started.

TODO: Insert picture / explanation of final product here?

Prerequisites
==========================

This example expects basic comprehension of web development, understanding the difference between the client and server, some general HTML and JavaScript, as well as some knowledge of NodeJS as a server-side language. 

You will also need to download NodeJS and Git onto your machine if you have not already.

Install NodeJS: https://nodejs.org/en/download/  
Install Git: https://git-scm.com/  
  
We will also be using express as a server, but as long as you have nodejs, the express setup process will be explained.

First, clone the repository by opening a command prompt and running:

```bash
$ git clone https://github.com/uniform-team/Uniform-Car-Example.git uniform-car-example
$ cd uniform-car-example
```
Note: All command line commands can be executed on any operating system.

To preview what we will be building in this tutorial, you can install the finished product with the command `$ npm install` and run it with `$ node server.js`. Then open your browser and navigate to `http://localhost:8000` to view the web page. Play around with the form to get a feel for what the objective is. Reset to an empty project to get started by running:

```bash
$ git checkout -f step-1
```

There will be several checkponts throughout this tutorial, and if you ever get lost, you can always return to a previous step using the above command and the desired setp number.

Creating a NodeJS Server
==========================

First step is to install dependencies. This example will use the `express` framework to simplify the server-side code, though `express` is not required for Uniform to function.

Express setup: http://expressjs.com/en/starter/installing.html

Make sure you have NodeJs installed and run
```bash
$ npm init
```
Either change the default settings or keep hitting enter until you get to 
```bash 
entry point: (index.js)
```
and type "server.js".

Accept the remaining defaults and then use the following command to install express:
```bash
$ npm install express --save
```

Start off by creating a simple NodeJS Express server which serves all the client files and exposes one form submission API. Create and edit the file `server.js` with your preferred text editor.

server.js:
--------------------------

```javascript
// Load Express framework
var express = require("express");
var app = express();

// Serve the www/ directory to clients
app.use(express.static("www"));

// On POST to /submit, validate the form
app.post("/submit", function (req, res) {
    //there is no validator yet, so any submit is valid for now
    res.end("I guess it's valid?");
});

// Listen on port 8000
app.listen(8000, function () {
    console.log("Started server. View it at http://localhost:8000");
});
```

Also take a look at `www/index.html` provided with the repository to understand how the client is set up. The client includes `jQuery`, which is required for Uniform to run on it. It also has a form which submits with a `POST` request to the `/submit` URL.

You can run this server with the command `$ node server.js` and browse to `http://localhost:8000` to view the page. The form should be visible and can be submitted, but at this stage, there is no validation. The client makes no attempt to verify the information input by the user and the server can only assume it is given correct information. The next step is to incorporate Uniform to easily validate them.

To skip to this step or reset your project to a more stable state, run:

```bash
$ git checkout -f step-2
```

Server Validation
==========================

The Uniform language can be installed via NPM with the command:

```bash
$ npm install uniform-validation --save
```

To set up Uniform on the server, update the server's submission handler to use Uniform.

server.js
--------------------------

```javascript
// ...

var validator = require("uniform-validation");

// On POST to /submit, validate the form
app.post("/submit", validator("www/car.ufm"), function (req, res) {
    res.end("Valid :)");
}, function (err, req, res, next) {
    res.end("Invalid :(");
    console.error(err);
});

// ...
```

Note: Those familiar with JavaScript may want to simplify the error function `function (err, req, res, next) { ... }` by omitting some parameters. DO NOT DO SO because Express requires all four parameters to be declared in order to recognize the function as an error handler. TODO: Link

This will validate any `POST` requests to `/submit` against the Uniform code in `www/car.ufm`. The next step is to write the Uniform code itself. Add the following line to `www/car.ufm`.

www/car.ufm
--------------------------

```javascript
valid: true;
```

Note: You must restart the server by rerunning `$ node server.js` to see any changes to Uniform code applied.

This is the simplest Uniform program. It simply marks the form as valid under any conditions. Restart the server and submit the form to see the message "Valid :)" regardless of what data is input. Similarly, change it to the line:

www/car.ufm
--------------------------

```javascript
valid: false;
```

so any input data is rejected. Restart the server and resubmit the form to see the message "Invalid :(" regardless of what data is input.

Now its time to implement tha form's actual logic. To begin with, let's ignore the checkbox and just validate the text boxes.

www/car.ufm
--------------------------

```javascript
// Declare HTML <input /> elements by name
string: make;
string: model;
string: year;

// The form is valid when make, model, and year are all valid
valid: make.valid and model.valid and year.valid;

make {
    // make is valid when it is filled
    valid: not make equals "";
}

model {
    // model is valid when it is filled
    valid: not model equals "";
}

year {
    // year is valid when it is exactly four digits
    valid: year matches /[0-9]{4}/x;
}
```

The code begins by declaring the inputs and their types. In this case, there are 3 input fields and all of them are strings. These names should align with the `name` attribute of their respective `<input />` tags in the HTML code client-side. This code then states the all three inputs must be valid to accept the form. Make and model are each valid if they are not empty and year is valid when it matches a regex which requires exactly 4 digits.

Restart the server to see these changes reflected in the form. The client still knows nothing about Uniform or how to determine if the form is valid or not, but the server is able to correctly distinguish between a valid car and an invalid one. However, so far we have only considered the text boxes, let's take a look at incorporating the checkbox, so users can submit that they do not own a car.

The best way of doing this is to add a little abstraction. The three text fields yield the information for a single car, while the checkbox determines whether or not form should expect a car at all. We can separate the textboxes into a _subform_ leaving our existing logic unchanged. Then simply look at the checkbox before verifying the subform. This can be done like so:

www/car.ufm
--------------------------

```javascript
// Declare HTML <input /> elements by name
boolean: hasCar;
string: make;
string: model;
string: year;

// The entire form is valid if the user
// 1) does not have a car or
// 2) they correctly entered their vehicle's information
valid: not hasCar or @carForm.valid;

// Define the car information as a subform
@carForm {
    // The subform is valid when make, model, and year are all valid
    valid: make.valid and model.valid and year.valid;
    
    make {
        // make is valid when it is filled
        valid: not make equals "";
    }
    
    model {
        // model is valid when it is filled
        valid: not model equals "";
    }

    year {
        // year is valid when it is exactly four digits
        valid: year matches /[0-9]{4}/x;
    }
}
```

A few things were done here:

1. `boolean: hasCar;` was added to declare the checkbox input to Uniform.
2. The text boxes validation was placed underneath the `@carForm`. This is essentially a variable which represents a subform on the page. It has its own self-contained logic to determine what conditions must be met for it to be valid. In this case, all three text boxes must be appropriately filled in.
3. An extra `valid` statement was added to validate the entire form. Now, the server will accept the request if the user does not have a car, _or_ if the subform is correctly filled in.

Restart the server once more and resubmit the form. Claiming you do not have a car will be accepted by the server regardless of what information you enter for the car. However, if you claim you do have a car, then the car's information must be filled out correctly for the server to accept it.

To skip to this step or reset your project to a more stable state, run:

```bash
$ git checkout -f step-3
```

Client Validation
==========================

At this point, the server is capable of distinguishing between valid requests and invalid ones. However, the user experience can definitely be improved by applying the same Uniform logic on the client side. This can be accomplished with only a few lines. Start by adding to the server:

server.js
--------------------------

```javascript
// Serve the client-side library to /uniform.js
app.get("/uniform.js", function (req, res) {
    validator.getClientLib().then(function (lib) {
        res.end(lib);
    });
});

```

This will expose the client-side library at `/uniform.js` for the browser to use. All that needs to be done is add the following two lines to the HTML.

www/index.html
--------------------------

```html
<script src="/uniform.js"></script>
<script>uniform.options.href("car.ufm");</script>
```

Note: These lines must after jQuery's `<script></script>` tag.

This will make the browser load the Uniform library and then request `car.ufm` and apply its logic to the page. Restart the server and try to submit the form again. If you try to submit an invalid form, the client will now stop you with a popup informing you of the error _before_ redirecting and sending the information to the server. Notice that no Uniform code needed to be altered to apply this logic to the client, the code is completely shared!

This improves the user experience somewhat, but we can do better. It is still far to easy for the user to input their car's information and then accidentally check that they do _not_ have a car. This can be addressed by disabling the text boxes if the user indicates that they do not own a car. This will only require a couple extra lines of Uniform:

www/car.ufm
--------------------------

```javascript
@carForm {
    // ...
    
    selector: "#subForm";
    enabled: hasCar;

    // ...
}
```

Note: In the current build of Uniform, the `selector` tag must come _before_ the `enabled` tag. This is a known bug and should not be a requirement in the future.

The `selector` tag is a jQuery selector which references the DOM element to alter for this subform. In this case, we are referring to the `<div id="subForm">` element. See (TODO: jQuery link) for more information on selectors.

The `enabled` tag says the the subform should be enabled only when the user has a car. This means that the subform and all inputs underneath it will be enabled when the user indicates that they have a car and disabled otherwise.

Try it out! Restart the server once more and play with the checkbox to see the textboxes enable and disable themselves accordingly. This will help prevent the user from claiming they do not have a car while also inputting a car's information.

You can also hide the form instead of disabling it if you prefer the user experience that provides. Simply replace the `enabled` line with:

www/car.ufm
--------------------------

```javascript
visible: hasCar;
```

To skip to this step or reset your project to a more stable state, run:

```bash
$ git checkout -f step-4
```

One last thing can be done to take full advantage of Uniform. Currently on the server the request data is stored in `req.body` but it is in the format of a normal HTTP request sent by the browser.

```javascript
{
    hasCar: "on",
    make: "Mitsubishi",
    model: "Eclipse",
    year: "2006"
}
```

This has a few problems:

1. The browser decided to send the string `"on"` to identify that the checkbox was checked. It would not send that key at all if the checkbox were not checked. This is inconvenient because the server would find it easier to work with a boolean true / false value than "on" / undefined.
2. The hierarchy has been lost. In Uniform, we created an abstraction of a subform for entering the car's information with a checkbox indicating whether or not to expect a car. That information is lost to the server and the hierarchy has been flattened.

We can address these issues with the `result` tag in Uniform. Add the following `result` tags to the Uniform code:

www/car.ufm
--------------------------

```javascript
// ...

// The entire form returns an object listing whether the user has a car and the car's data
result: {
    hasCar: hasCar;
    car: @carForm.result;
};

// ...

@carForm {
    // ...

    // The car is an object containing the make, model, and year.
    result: {
        myMake: make;
        myModel: model;
        myYear: year;
    };
    
    // ...
}
```

Then update the server to use this new data. The `result` objects from Uniform are stored in `req.ufmResult`.

server.js
--------------------------

```javascript
// On POST to /submit, validate with Uniform
app.post("/submit", validator("www/car.ufm"), function (req, res) {
    var result = req.ufmResult;
    var output;
    
    if (!result.hasCar) {
        output = "User does not own a car."
    } else {
        var car = result.car;
        output = "User owns a " + car.myYear + " " + car.myMake
            + " " + car.myModel + ".";
    }
    
    console.log(output);
    res.end("Valid :)");
}, function (err, req, res, next) {
    res.end("Invalid :(");
    console.error(err);
});
```

Now the server can easily check if the user has a car by checking against the value returned by Uniform. Since it was declared as a boolean in Uniform's code, it is a boolean here, so no more awkward type conversions!

The car's information was also stored underneath the `car` key with its three values. This removes the need for complicated data rearrangement server-side.

Restart the server one last time and submit a form, both with a car and without. The server will print to the console what data it received from the user.

To skip to this step or reset your project to a more stable state, run:

```bash
$ git checkout -f step-5
```

That's the complete example! Hopefully this explained how Uniform works and how you can get started incorporating it into your own project. Notice a typo or have some suggestions? Feel free to provide feedback about this example or the language in general. TODO: How to contact us.

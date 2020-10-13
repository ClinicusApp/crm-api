const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const jsonwebtoken = require("jsonwebtoken");
const Users = require("../models/user_schema");
const jwt = require("../utils/jwt");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const AWS = require("aws-sdk");
// AWS.config.loadFromPath(".aws/credentials.json");

// Wellcome
router.get("/", (req, res) => {
  res.send("Wellcome");
});

// Get User
router.get("/profile/id/:id", (req, res) => {
  let doc = Users.findOne({ _id: req.params.id });
  res.json(doc);
  res.send("Wellcome");
});

// Loging a User
router.post("/login", async (req, res) => {
  let doc = await Users.findOne({ email: req.body.email });
  if (doc) {
    if (bcrypt.compareSync(req.body.password, doc.password)) {
      if (doc.status != "not_activated") {
        const payload = {
          id: doc._id,
          level: doc.level,
          email: doc.email,
        };

        let token = jwt.sign(payload);
        console.log(token);
        res.json({ result: "success", token, message: "Login successfully" });
      } else {
        return res.json({
          result: "error",
          message: "Your need to activate account first",
        });
      }
    } else {
      // Invalid password
      res.json({ result: "error", message: "Invalid password" });
    }
  } else {
    // Invalid username
    res.json({
      result: "error",
      message: "Invalid username",
      sended: req.body,
    });
  }
  window.localStorage.setItem("profile", doc);
  console.log(window.localStorage);
});

// Registering a User
router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const { first_name, last_name, email } = req.body;
    const token = jsonwebtoken.sign(
      { first_name, last_name, email },
      "process.env.JWT_ACCOUNT_ACTIVATION",
      { expiresIn: "365d" }
    );
    // const emailData = {
    //   from: "admin@basicpos.io",
    //   to: email,
    //   subject: `Account activation link`,
    //   html: `
    //       <h1>Please use the following link to activate your account</h1>
    //       <p><a href="localhost:8080/activation/${token}">Activation link</p>
    //       <hr />
    //       <p>This email may contain sensetive information</p>
    //       <p>and link will  expired in 365 days</p>
    //   `
    // };
    req.body.activated_token = token;
    let user = await Users.create(req.body);
    res.json({ result: "success", message: "Register successfully" });
    // sgMail
    //   .send(emailData)
    //   .then(sent => {
    //     // console.log('SIGNUP EMAIL SENT', sent)
    //     return res.json({
    //       result: "success",
    //       message: `Email has been sent to ${email}. Follow the instruction to activate your account`
    //     });
    //   })
    //   .catch(err => {
    //     // console.log('SIGNUP EMAIL SENT ERROR', err)
    //     return res.json({
    //       result: "error",
    //       message: err.message
    //     });
    //   });
  } catch (err) {
    res.json({ result: "error", message: err.errmsg });
  }
});

// Activation User
router.get("/activation/:token", async (req, res) => {
  let token = req.params.token;

  if (token) {
    jsonwebtoken.verify(token, "process.env.JWT_ACCOUNT_ACTIVATION", function (
      err,
      decoded
    ) {
      if (err) {
        console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
        return res.redirect("http://localhost:3000/login/error");
      }
    });
    let updatedFields = {
      status: "active",
      activated_token: "",
    };
    let doc = await Users.findOneAndUpdate(
      { activated_token: token },
      updatedFields
    );
    return res.redirect("http://localhost:3000/login/success");
  }
});

// End of Registering User
router.post("/profile", async (req, res) => {
  try {
    await Users.create(req.body);
    res.json({ result: "success", message: "Register successfully" });
  } catch (err) {
    res.json({ result: "error", message: err.errmsg });
  }
});

uploadImage = async (files, doc) => {
  if (files.avatars != null) {
    var fileExtention = files.avatars.name.split(".").pop();
    doc.avatars = `${Date.now()}+${doc.username}.${fileExtention}`;
    var newpath =
      path.resolve(__dirname + "/uploaded/images/") + "/" + doc.avatars;

    if (fs.exists(newpath)) {
      await fs.remove(newpath);
    }
    await fs.move(files.avatars.path, newpath);

    // Update database
    await Users.findOneAndUpdate({ _id: doc.id }, doc);
  }
};

// Update User
router.put("/profile", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      let doc = await Users.findOneAndUpdate({ _id: fields.id }, fields);
      await uploadImage(files, fields);
      res.json({ result: "success", message: "Update Successfully" });
    });
  } catch (err) {
    res.json({ result: "error", message: err.errmsg });
  }
});

// Password
// Create a Password
router.post("/password/reset", async (req, res) => {
  let expired_time = "60m";
  const { email } = req.body;
  Users.findOne({ email }, (err, user) => {
    console.log(user);
    if (err || !user) {
      return res.json({
        result: "error",
        message:
          "Email digitado incorreto ou não há nenhuma conta vinculado a ele. Confira o email digitado.",
      });
    }

    const token = jsonwebtoken.sign(
      { _id: user._id, name: user.first_name },
      "process.env.JWT_RESET_PASSWORD",
      {
        expiresIn: expired_time,
      }
    );

    console.log(token, "token");


    const emailData = {
      from: "clinicus.suporte@gmail.com",
      to: email,
      subject: `Password Reset link`,
      html: `
                <h1>Please use the following link to reset your password</h1>
                <a href="http://localhost:3000/recuperarsenha/${token}"><p>Reset passord link</p></a>
                <hr />
                <p>This link will expired in 60 minutes</p>

            `,
    };


    // AWS Transactional Email
    // const ses = new AWS.SES({ apiVersion: "2010-12-01" });

    // const params = {
    //   Destination: {
    //     ToAddresses: [email], // Email address/addresses that you want to send your email
    //   },
    //   // ConfigurationSetName: <<ConfigurationSetName>>,
    //   Message: {
    //     Body: {
    //       Html: {
    //         // HTML Format of the email
    //         Charset: "UTF-8",
    //         Data: `
    //           <html>
    //             <body>
    //             <h1>Clinicus - Recuperação de Senha</h1>
    //             <hr/>
    //             <p>Para recuperar senha de sua conta acesse o link abaixo.</p>
    //             <a href="http://localhost:3000/recuperarsenha/${token}"><p>Criar Nova Senha</p></a>
    //             <hr />
    //             <p>O link vai espirar em 60 minutes.</p>
    //             </body>
    //           </html>
    //         `,
    //       },
    //       Text: {
    //         Charset: "UTF-8",
    //         Data: "Clinicus - Email de Recuperação de Senha",
    //       },
    //     },
    //     Subject: {
    //       Charset: "UTF-8",
    //       Data: "Clinicus - Email de Recuperação de Senha",
    //     },
    //   },
    //   Source: "00.braian.dev@gmail.com",
    // };

    // const sendEmail = ses.sendEmail(params).promise();

    // sendEmail
    //   .then((data) => {
    //     console.log("/////");
    //     console.log("AWS SES email submitted with success!", data);
    //     console.log("/////");
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    // 
    // 

    user.updateOne({ resetPasswordToken: token }, (err, success) => {
      if (err) {
        console.log("RESET PASSWORD LINK ERROR", err);
        return res.status(400).json({
          result: "error",
          message: "Database connection error on user password forgot request"
        });
      } else {
        sgMail
          .send(emailData)
          .then(response => {
            return res.json({
              result: "success",
              message: `Email has been sent to ${email}. Follow the instruction to activate your account`
            });
          })
          .catch(err => {
            console.log(err)
            return res.json({ result: "error", message: err.message });
          });
      }
    });
  });
});

// Update Password
router.put("/password/reset", async (req, res) => {
  const { password } = req.body;
  let resetPasswordToken = req.query.token;
  console.log(resetPasswordToken, "AQUI")
  if (resetPasswordToken) {
    jsonwebtoken.verify(
      resetPasswordToken,
      "process.env.JWT_RESET_PASSWORD",
      function (err, decoded) {
        if (err) {
          return res.json({
            result: "error",
            message: "Expired link. Try again",
          });
        }
      }
    );
    let encrypt_pass = await bcrypt.hash(password, 8);
    let updatedFields = {
      password: encrypt_pass,
      resetPasswordToken: "",
    };
    await Users.findOneAndUpdate(
      { resetPasswordToken: resetPasswordToken },
      updatedFields
    ).then((responses) => {
      return res.json({
        result: "success",
        message: "Password update succesfully your can try login again",
      });
    });
  } else {
    return res.json({
      result: "error",
      message: "No Found Token",
    });
  }
});

module.exports = router;

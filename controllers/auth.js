const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f4aa2b9e158ed7",
    pass: "6c349b51ba2ce8",
  },
});

const { validationResult } = require("express-validator");

// const transporter = nodemailer.createTransport(transport);

const User = require("../models/user");

exports.getLogin = (request, response, next) => {
  let message = request.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  response.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  }); //use default template engine
};

exports.postLogin = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;

  const errors = validationResult(request);

  if (!errors.isEmpty())
    return response.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return response.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [{ param: "email", param: "password" }],
        });
      }

      bcrypt
        .compare(password, user.password) //compare only goes to catch if something went wrong, not when passwords hashes doesnt match.
        .then((doMatch) => {
          if (doMatch) {
            request.session.isLoggedIn = true; //session cookie that will identify you to the server (connect.sid)
            request.session.user = user;
            return request.session.save((err) => {
              console.log(err);
              return response.redirect("/");
            }); //need to be sure that the session is created
          }
          return response.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [{ param: "email", param: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          response.redirect("/");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignup = (request, response, next) => {
  const errors = validationResult(request);
  let message = request.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  response.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: errors.array(),
  }); //use default template engine
};

exports.postSignup = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;
  const errors = validationResult(request);

  if (!errors.isEmpty())
    return response.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: request.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });

      return user.save();
    })
    .then((result) => {
      response.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "shop@node-complete.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (request, response, next) => {
  request.session.destroy((err) => {
    console.log(err);
    response.redirect("/");
  });
};

exports.getReset = (request, response, next) => {
  let message = request.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  response.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: message,
  }); //use default template engine
};

exports.postReset = (request, response, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return response.redirect("/reset");
    }

    const token = buffer.toString("hex"); //hexadecimal values

    User.findOne({ email: request.body.email })
      .then((user) => {
        if (!user) {
          request.flash("error", "No account with that email found");
          return response.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now();
        +3600000; //1 hour in miliseconds
        return user.save();
      })
      .then((result) => {
        response.redirect("/");
        transporter.sendMail({
          to: request.body.email,
          from: "shop@node-complete.com",
          subject: "Password Reset",
          html: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="http//localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (request, response, next) => {
  const token = request.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = request.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      response.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      }); //use default template engine
    })
    .catch((err) => console.error(err));
};

exports.postNewPassword = (request, response, next) => {
  const newPassword = request.body.password;
  const userId = request.body.userId;
  const passwordToken = request.body.passwordToken;

  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      resetUser.save();
    })
    .then((result) => {
      response.redirect("/login");
    })
    .catch((err) => console.error(err));
};

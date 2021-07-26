const User = require("../models/user");

exports.getLogin = (request, response, next) => {
  response.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  }); //use default template engine
};

exports.postLogin = (request, response, next) => {
  User.findById("60f9aa195214cb63985e2956")
    .then((user) => {
      request.session.isLoggedIn = true; //session cookie that will identify you to the server (connect.sid)
      request.session.user = user;
      request.session.save((err) => {
        console.log(err);
        response.redirect("/");
      }); //need to be sure that the session is created
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignup = (request, response, next) => {
  response.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  }); //use default template engine
};

exports.postSignup = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;
  const confirmPassword = request.body.confirmPassword;
};

exports.postLogout = (request, response, next) => {
  request.session.destroy((err) => {
    console.log(err);
    response.redirect("/");
  });
};

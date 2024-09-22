$(function () {
  "use strict";

  // init the validator
  // validator files are included in the download package
  // otherwise download from http://1000hz.github.io/bootstrap-validator

  $("#contact-form").validator();

  $("#contact-form").on("submit", function (e) {
    e.preventDefault();

    var sendToEmail = "hostforshihab@gmail.com";  // Fixed email address
    var name = $("#contact-form").find("[name='InputName']").val();
    var email = $("#contact-form").find("[name='InputEmail']").val();
    var subject = $("#contact-form").find("[name='InputSubject']").val();
    var message = $("#contact-form").find("[name='InputMessage']").val();

    // Construct mailto URL with proper encoding for line breaks
    var body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    var mailtoUrl = `mailto:${sendToEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;

    // Create a hidden link and trigger a click
    var mailtoLink = $('<a>').attr('href', mailtoUrl).attr('target', '_blank').hide();
    $('body').append(mailtoLink);
    mailtoLink[0].click();  // Simulate a click on the hidden link
    mailtoLink.remove();  // Remove the link after clicking
  });
});

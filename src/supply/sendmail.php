<?php
//Простой sendmail для форм сайта

include_once "config.php";

if ($test == false) {
  $recepient = $test_mail;
} else {
  $recepient = $prod_mail;
}

$sitename = "";

$name = trim($_POST["name"]);
$phone = trim($_POST["tel"]);

$message = "Имя: $name \nТелефон: $phone";

$pagetitle = "Заявка с сайта $sitename";
mail($recepient, $pagetitle, $message, "Content-type: text/plain; charset=\"utf-8\"\n From: $recepient");

?>

import { ViewController } from "@site/controllers";

// TODO он делается не аналогии с другими сервисами. это не экземпляр класса, объект а функция - helper

// TODO provide dto
export const onErrorHelper = (ctx) => {
  const { error, code } = ctx;
  console.log(error);
  return ViewController.getErrorPage({
    errorMessage: error.clientMessage,
    errorCode: code,
  });
};
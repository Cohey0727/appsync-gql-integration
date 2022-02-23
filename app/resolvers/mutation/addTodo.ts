import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context, callback) => {
  console.log({ event, context, callback });
  console.log("Hello Lambda!");
  callback(null, { id: "ID", name: "hello addTodo" });
};

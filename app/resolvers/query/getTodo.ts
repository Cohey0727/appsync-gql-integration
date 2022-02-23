import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context, callback) => {
  console.log({ event, context, callback });
  console.log(event.identity?.resolverContext);
  console.log(event.request.headers);
  console.log("Hello Lambda!");
  callback(null, { id: "ID", name: "hello getTodo" });
};

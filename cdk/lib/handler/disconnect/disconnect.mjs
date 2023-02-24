import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });

export async function handler(event) {
  console.log(`onDisconnect ${JSON.stringify(event)}`);

  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

  // DynamoDBテーブルに保存する
  const result = await ddbDocClient
    .send(new DeleteCommand({
      TableName: process.env.TABLE_NAME || "",
      Key: { [process.env.TABLE_KEY || ""]: event.requestContext.connectionId },
    }));

  console.log(`delete result ${JSON.stringify(result)}`);

  return {
    statusCode: 200,
    body: "onDisconnect.",
  };
}
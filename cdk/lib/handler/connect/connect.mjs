import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";
const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });

export async function handler(event) {
  console.log(`onConnect ${JSON.stringify(event)}`);

  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

  // DynamoDBテーブルに保存する
  const result = await ddbDocClient
    .send(new PutCommand({
      TableName: process.env.TABLE_NAME || "",
      Item: {
        connectionId: event.requestContext.connectionId,
        date: new Date().toISOString()
      },
    }));

  console.log(`put result ${JSON.stringify(result)}`);

  return {
    statusCode: 200,
    body: "onConnect.",
  };
}

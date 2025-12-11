import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import dotenv from "dotenv";

dotenv.config();

const snsClient = new SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export async function enviarCorreoSNS(asunto, mensaje) {
    try {
        const params = {
            TopicArn: process.env.AWS_SNS_TOPIC,
            Subject: asunto,
            Message: mensaje
        };

        await snsClient.send(new PublishCommand(params));
        console.log("📧 SNS: Mensaje enviado correctamente");

    } catch (error) {
        console.error("❌ Error al enviar mensaje SNS:", error);
    }
}

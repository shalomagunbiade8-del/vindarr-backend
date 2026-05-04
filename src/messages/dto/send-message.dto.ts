// send-message.dto.ts

export class SendMessageDto {
  receiverUsername: string; // ✅ REQUIRED now
  text?: string;
  attachmentUrl?: string;
  attachmentType?: string;
}